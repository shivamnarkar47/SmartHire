const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionResponses: [{
    questionId: mongoose.Schema.Types.ObjectId,
    question: String,
    answer: String,
    feedback: {
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      strengths: [String],
      improvements: [String],
      aiAnalysis: String
    }
  }],
  overallFeedback: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    strengths: [String],
    areasForImprovement: [String],
    keyTakeaways: String,
    communicationSkills: {
      clarity: Number,
      structure: Number,
      confidence: Number
    }
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
