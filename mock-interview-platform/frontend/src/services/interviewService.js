import api from './api';

export const interviewService = {
  startInterview: (type, mode, domain, numQuestions = 5) => 
    api.post('/interviews/start', { type, mode, domain, numQuestions }),
  
  getNextQuestion: (interviewId) => 
    api.get(`/interviews/${interviewId}/next-question`),
  
  submitAnswer: (interviewId, questionId, answer, audioUrl, videoUrl, duration) => 
    api.post(`/interviews/${interviewId}/answer`, { questionId, answer, audioUrl, videoUrl, duration }),
  
  completeInterview: (interviewId) => 
    api.post(`/interviews/${interviewId}/complete`),
  
  getInterviewHistory: () => 
    api.get('/interviews/history'),
  
  getInterview: (interviewId) => 
    api.get(`/interviews/${interviewId}`)
};

export const questionService = {
  getQuestions: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/questions?${params}`);
  },
  
  getCategories: (type, domain) => 
    api.get(`/questions/categories?type=${type}&domain=${domain}`)
};

export const feedbackService = {
  getFeedback: () => 
    api.get('/feedback'),
  
  getInterviewFeedback: (interviewId) => 
    api.get(`/feedback/interview/${interviewId}`)
};

export const progressService = {
  getProgress: () => 
    api.get('/progress'),
  
  getStats: () => 
    api.get('/progress/stats')
};
