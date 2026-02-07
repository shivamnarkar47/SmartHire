# SmartHire - AI Mock Interview Platform

An AI-powered mock interview platform built with React, Node.js, Express, and Google Gemini API.

## Features

- **Multiple Interview Types**: Technical, Behavioral, and Domain-specific interviews
- **Interview Modes**: Text, Voice (Audio), and Video recording capabilities
- **AI-Powered Feedback**: Real-time feedback using Google Gemini AI
- **Progress Tracking**: Dashboard to monitor improvement over time
- **JWT Authentication**: Secure user authentication system

## Tech Stack


### Frontend
- React 18
- React Router v6
- Axios for API calls
- Recharts for data visualization
- Material UI components
- react-webcam for video recording

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Google Generative AI (Gemini API)
- JWT Authentication
- Socket.io for real-time features

## Project Structure

```
mock-interview-platform/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   ├── Feedback.js
│   │   └── Progress.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── interviews.js
│   │   ├── questions.js
│   │   ├── feedback.js
│   │   └── progress.js
│   ├── services/
│   │   └── aiService.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── InterviewSetup.js
    │   │   ├── InterviewSession.js
    │   │   ├── InterviewFeedback.js
    │   │   └── Progress.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── interviewService.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Gemini API Key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mock_interview_db
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-google-gemini-api-key
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Interviews
- `POST /api/interviews/start` - Start new interview
- `GET /api/interviews/:id/next-question` - Get next question
- `POST /api/interviews/:id/answer` - Submit answer
- `POST /api/interviews/:id/complete` - Complete interview
- `GET /api/interviews/history` - Get interview history
- `GET /api/interviews/:id` - Get interview details

### Questions
- `GET /api/questions` - Get questions with filters
- `GET /api/questions/categories` - Get question categories

### Feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/interview/:id` - Get interview feedback

### Progress
- `GET /api/progress` - Get user progress
- `GET /api/progress/stats` - Get detailed stats

## Interview Features

### Text Mode
- Type answers directly
- Time-limited questions
- Instant feedback after each answer

### Voice Mode
- Record audio responses
- Speech-to-text transcription
- AI analysis of verbal communication

### Video Mode
- Webcam recording
- Body language practice
- Comprehensive feedback on presentation

## AI Features

The platform uses Google Gemini AI for:
- Generating relevant interview questions
- Evaluating candidate answers
- Providing detailed feedback
- Scoring responses (0-100)
- Analyzing communication skills

## License

MIT License
