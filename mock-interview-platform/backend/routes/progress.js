const express = require('express');
const Progress = require('../models/Progress');
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get user progress
router.get('/', authMiddleware, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      // Calculate progress from existing interviews
      const interviews = await Interview.find({
        userId: req.user.userId,
        status: 'completed'
      });

      progress = new Progress({
        userId: req.user.userId,
        totalInterviews: interviews.length,
        completedInterviews: interviews.length,
        averageScore: interviews.length > 0 
          ? Math.round(interviews.reduce((acc, int) => acc + (int.overallScore || 0), 0) / interviews.length)
          : 0,
        interviewHistory: interviews.map(int => ({
          interviewId: int._id,
          type: int.type,
          domain: int.domain,
          score: int.overallScore,
          date: int.completedAt
        }))
      });

      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Get performance stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user.userId,
      status: 'completed'
    });

    const stats = {
      totalInterviews: interviews.length,
      byType: {},
      byDomain: {},
      scoreTrend: [],
      recentScores: interviews.slice(-5).map(int => ({
        date: int.completedAt,
        score: int.overallScore,
        type: int.type
      }))
    };

    interviews.forEach(int => {
      // By type
      if (!stats.byType[int.type]) {
        stats.byType[int.type] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      stats.byType[int.type].count++;
      stats.byType[int.type].totalScore += int.overallScore || 0;

      // By domain
      if (!stats.byDomain[int.domain]) {
        stats.byDomain[int.domain] = { count: 0, totalScore: 0, avgScore: 0 };
      }
      stats.byDomain[int.domain].count++;
      stats.byDomain[int.domain].totalScore += int.overallScore || 0;
    });

    // Calculate averages
    Object.keys(stats.byType).forEach(key => {
      stats.byType[key].avgScore = Math.round(
        stats.byType[key].totalScore / stats.byType[key].count
      );
    });

    Object.keys(stats.byDomain).forEach(key => {
      stats.byDomain[key].avgScore = Math.round(
        stats.byDomain[key].totalScore / stats.byDomain[key].count
      );
    });

    // Score trend over last 10 interviews
    stats.scoreTrend = interviews.slice(-10).map(int => ({
      date: int.completedAt,
      score: int.overallScore
    }));

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
