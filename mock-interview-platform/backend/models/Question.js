const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'domain-specific'],
    required: true
  },
  domain: {
    type: String,
    enum: ['software-engineering', 'product-management', 'data-science', 'design', 'marketing', 'general'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  expectedAnswerPoints: [String],
  aiPrompt: {
    type: String,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 300
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Question', questionSchema);
