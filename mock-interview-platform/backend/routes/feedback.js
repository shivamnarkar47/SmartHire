const express = require('express');
const Feedback = require('../models/Feedback');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all feedback for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.userId })
      .sort({ generatedAt: -1 })
      .populate('interviewId', 'type domain completedAt overallScore');
    
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Get feedback for specific interview
router.get('/interview/:interviewId', authMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      interviewId: req.params.interviewId,
      userId: req.user.userId
    }).populate('interviewId');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

module.exports = router;
