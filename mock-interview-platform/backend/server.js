const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interviews');
const questionRoutes = require('./routes/questions');
const feedbackRoutes = require('./routes/feedback');
const progressRoutes = require('./routes/progress');

dotenv.config();

const ERROR_LOG_PATH = path.join(__dirname, 'error.log');

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

console.log('JWT_SECRET is configured:', process.env.JWT_SECRET ? '✓' : '✗');


function logErrorToFile(error) {
  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${error.stack || error.message || error}\n`;
  fs.appendFileSync(ERROR_LOG_PATH, errorMessage);
}

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error.message);
  logErrorToFile(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  logErrorToFile(new Error(`Unhandled Rejection: ${reason}`));
});

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SmartHire API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progress', progressRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  logErrorToFile(err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    logErrorToFile(err);
  }
};

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 SmartHire Server running on http://localhost:${PORT}`);
});

connectDB();

module.exports = app;
