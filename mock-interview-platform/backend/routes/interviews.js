const express = require('express');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Feedback = require('../models/Feedback');
const Progress = require('../models/Progress');
const aiService = require('../services/aiService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Start new interview
router.post('/start', authMiddleware, async (req, res) => {
  try {
    console.log('Start interview request received');
    console.log('User:', req.user);
    const { type, mode, domain, numQuestions = 5 } = req.body;
    console.log('Request body:', { type, mode, domain, numQuestions });

    if (!type || !mode || !domain) {
      console.error('Missing required fields:', { type, mode, domain });
      return res.status(400).json({ message: 'Missing required fields: type, mode, and domain are required' });
    }

    const userId = req.user.userId;

    const interview = new Interview({
      userId,
      type,
      mode,
      domain,
      status: 'in-progress',
      questions: []
    });

    await interview.save();
    console.log('Interview created:', interview._id);

    // Check for existing questions in DB first
    let existingQuestions = [];
    try {
      existingQuestions = await Question.find({
        type,
        domain,
        isActive: true
      }).limit(numQuestions);
      console.log('Found existing questions:', existingQuestions.length);
    } catch (dbError) {
      console.error('Error fetching existing questions:', dbError.message);
    }

    // If not enough questions, generate more
    if (existingQuestions.length < numQuestions) {
      const neededCount = numQuestions - existingQuestions.length;
      console.log('Need to generate', neededCount, 'new questions');
      
      // Generate questions in parallel
      const questionPromises = [];
      const askedCategories = existingQuestions.map(q => q.category);
      
      for (let i = 0; i < neededCount; i++) {
        questionPromises.push(
          aiService.generateInterviewQuestion(type, domain, 'medium', askedCategories)
        );
      }

      console.log('Calling AI service...');
      let aiQuestions;
      try {
        aiQuestions = await Promise.all(questionPromises);
        console.log('AI generated questions:', aiQuestions.length);
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
        aiQuestions = [];
      }
      
      // Save new questions to DB
      const newQuestionDocs = [];
      for (const aiQ of aiQuestions) {
        if (aiQ && aiQ.question && !aiQ.error) {
          try {
            const questionDoc = new Question({
              type,
              domain,
              difficulty: 'medium',
              question: aiQ.question,
              category: aiQ.category || 'General',
              expectedAnswerPoints: aiQ.expectedPoints || aiQ.expectedAnswerPoints || [],
              aiPrompt: aiQ.aiPrompt || `Question about ${domain}`,
              timeLimit: aiQ.timeLimit || 300,
              isActive: true
            });
            await questionDoc.save();
            newQuestionDocs.push(questionDoc);
            askedCategories.push(aiQ.category || 'General');
          } catch (saveError) {
            console.error('Failed to save AI question:', saveError.message);
          }
        }
      }

      existingQuestions = [...existingQuestions, ...newQuestionDocs];
    }

    // Limit to requested number and store in interview
    const selectedQuestions = existingQuestions.slice(0, numQuestions).map((q, index) => ({
      questionId: q._id,
      question: q.question,
      category: q.category,
      timeLimit: q.timeLimit || 300,
      type: q.type,
      order: index
    }));

    interview.questions = selectedQuestions;
    await interview.save();

    res.status(201).json({
      message: 'Interview started',
      interviewId: interview._id,
      interview,
      questions: selectedQuestions
    });
  } catch (error) {
    console.error('Start interview error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to start interview', error: error.message });
  }
});

// Get next question
router.get('/:interviewId/next-question', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);

    if (!interview || interview.userId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const answeredQuestionIds = interview.questions
      .filter(q => q.questionId)
      .map(q => q.questionId.toString());

    const askedCategories = interview.questions
      .filter(q => q.category)
      .map(q => q.category);

    let question = await Question.findOne({
      _id: { $nin: answeredQuestionIds },
      type: interview.type,
      domain: interview.domain,
      category: { $nin: askedCategories },
      isActive: true
    });

    if (!question) {
      const aiQuestion = await aiService.generateInterviewQuestion(
        interview.type,
        interview.domain,
        'medium',
        askedCategories
      );

      if (aiQuestion.error) {
        console.error('AI question generation failed:', aiQuestion.error);
        return res.status(500).json({ message: 'Failed to generate question' });
      }

      question = new Question({
        type: interview.type,
        domain: interview.domain,
        difficulty: 'medium',
        question: aiQuestion.question,
        category: aiQuestion.category || 'General',
        expectedAnswerPoints: aiQuestion.expectedPoints || [],
        aiPrompt: aiQuestion.aiPrompt || `Question about ${interview.domain}`,
        timeLimit: aiQuestion.timeLimit || 300,
        isActive: true
      });

      await question.save();
    }

    res.json({
      questionId: question._id,
      question: question.question,
      category: question.category,
      timeLimit: question.timeLimit || 300,
      type: question.type
    });
  } catch (error) {
    console.error('Get next question error:', error);
    res.status(500).json({ message: 'Failed to get question' });
  }
});

// Submit answer
router.post('/:interviewId/answer', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { questionId, answer, audioUrl, videoUrl, duration } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const question = await Question.findById(questionId);
    
    // Get AI evaluation
    const aiFeedback = await aiService.evaluateAnswer(
      question.question,
      answer,
      interview.type,
      interview.domain
    );

    const answerData = {
      questionId,
      question: question.question,
      answer,
      audioUrl,
      videoUrl,
      duration,
      timestamp: new Date()
    };

    interview.questions.push(answerData);
    await interview.save();

    res.json({
      message: 'Answer submitted',
      feedback: aiFeedback,
      questionNumber: interview.questions.length
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
});

// Complete interview
router.post('/:interviewId/complete', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interview = await Interview.findById(interviewId);
    if (!interview || interview.userId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    // Generate overall feedback
    const overallFeedback = await aiService.generateOverallFeedback(interview);

    // Calculate average score
    const scores = interview.questions
      .filter(q => q.feedback && q.feedback.score)
      .map(q => q.feedback.score);
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.totalDuration = Math.round((interview.completedAt - interview.startedAt) / 1000);
    interview.overallScore = overallFeedback.overallScore || averageScore;
    interview.feedback = {
      strengths: overallFeedback.strengths,
      improvements: overallFeedback.areasForImprovement,
      detailedAnalysis: overallFeedback.keyTakeaways
    };

    await interview.save();

    // Save detailed feedback
    const feedbackDoc = new Feedback({
      interviewId: interview._id,
      userId: req.user.userId,
      questionResponses: interview.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        answer: q.answer,
        feedback: q.feedback
      })),
      overallFeedback: {
        score: interview.overallScore,
        strengths: overallFeedback.strengths,
        areasForImprovement: overallFeedback.areasForImprovement,
        keyTakeaways: overallFeedback.keyTakeaways,
        communicationSkills: overallFeedback.communication || {}
      }
    });

    await feedbackDoc.save();

    await feedbackDoc.save();

    updateUserProgress(req.user.userId, interview).catch(err => {
      console.error('Progress update failed:', err.message);
    });

    res.json({
      message: 'Interview completed',
      interview: {
        id: interview._id,
        overallScore: interview.overallScore,
        totalQuestions: interview.questions.length,
        duration: interview.totalDuration,
        feedback: interview.feedback
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({ message: 'Failed to complete interview' });
  }
});

// Get interview history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('-questions.answer');

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview history' });
  }
});

// Get single interview details
router.get('/:interviewId', authMiddleware, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findOne({
      _id: interviewId,
      userId: req.user.userId
    });

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interview' });
  }
});

async function updateUserProgress(userId, interview) {
  try {
    const newHistoryEntry = {
      interviewId: interview._id,
      type: interview.type,
      domain: interview.domain,
      score: interview.overallScore,
      date: interview.completedAt
    };

    const newActivityEntry = {
      action: `Completed ${interview.type} interview`,
      date: new Date(),
      details: `Score: ${interview.overallScore}/100`
    };

    const progress = await Progress.findOne({ userId });
    const skillProgress = progress?.skillProgress || {};

    if (!progress) {
      const newProgress = new Progress({
        userId,
        totalInterviews: 1,
        completedInterviews: 1,
        averageScore: interview.overallScore,
        interviewHistory: [newHistoryEntry],
        skillProgress: {
          [interview.type]: { total: 1, score: interview.overallScore }
        },
        recentActivity: [newActivityEntry],
        lastUpdated: new Date()
      });
      await newProgress.save();
      return;
    }

    const newTotal = progress.totalInterviews + 1;
    const newAverageScore = Math.round(((progress.averageScore * progress.totalInterviews) + interview.overallScore) / newTotal);

    const currentSkill = skillProgress[interview.type] || { total: 0, score: 0 };
    const skillTotal = (currentSkill.total || 0) + 1;
    const skillScore = Math.round(((currentSkill.score || 0) * (skillTotal - 1) + interview.overallScore) / skillTotal);

    const updateDoc = {
      $inc: {
        totalInterviews: 1,
        completedInterviews: 1
      },
      $set: {
        averageScore: newAverageScore,
        [`skillProgress.${interview.type}`]: { total: skillTotal, score: skillScore },
        lastUpdated: new Date()
      },
      $push: {
        interviewHistory: newHistoryEntry,
        recentActivity: { $each: [newActivityEntry], $slice: -10 }
      }
    };

    await Progress.findOneAndUpdate(
      { userId },
      updateDoc,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Progress update error:', error.message);
  }
}

module.exports = router;
