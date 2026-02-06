const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  completedInterviews: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  interviewHistory: [{
    interviewId: mongoose.Schema.Types.Mixed,
    type: mongoose.Schema.Types.Mixed,
    domain: mongoose.Schema.Types.Mixed,
    score: mongoose.Schema.Types.Mixed,
    date: mongoose.Schema.Types.Mixed
  }],
  skillProgress: {
    type: mongoose.Schema.Types.Mixed
  },
  recentActivity: [{
    action: mongoose.Schema.Types.Mixed,
    date: mongoose.Schema.Types.Mixed,
    details: mongoose.Schema.Types.Mixed
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { strict: false });

module.exports = mongoose.model('Progress', progressSchema);
