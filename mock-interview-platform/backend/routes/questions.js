const express = require('express');
const Question = require('../models/Question');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get questions by filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, domain, difficulty, category } = req.query;
    
    const query = { isActive: true };
    if (type) query.type = type;
    if (domain) query.domain = domain;
    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const questions = await Question.find(query).limit(50);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get question categories
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const { type, domain } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (domain) query.domain = domain;

    const categories = await Question.distinct('category', query);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Get single question
router.get('/:questionId', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

module.exports = router;
