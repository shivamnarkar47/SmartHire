const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'domain-specific'],
    required: true
  },
  mode: {
    type: String,
    enum: ['text', 'audio', 'video'],
    required: true
  },
  domain: {
    type: String,
    enum: ['software-engineering', 'product-management', 'data-science', 'design', 'marketing', 'general'],
    required: true
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  questions: [{
    questionId: mongoose.Schema.Types.Mixed,
    question: mongoose.Schema.Types.Mixed,
    category: mongoose.Schema.Types.Mixed,
    timeLimit: mongoose.Schema.Types.Mixed,
    type: mongoose.Schema.Types.Mixed,
    order: mongoose.Schema.Types.Mixed,
    answer: mongoose.Schema.Types.Mixed,
    audioUrl: mongoose.Schema.Types.Mixed,
    videoUrl: mongoose.Schema.Types.Mixed,
    duration: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    detailedAnalysis: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  totalDuration: {
    type: Number
  }
}, { strict: false });

module.exports = mongoose.model('Interview', interviewSchema);
