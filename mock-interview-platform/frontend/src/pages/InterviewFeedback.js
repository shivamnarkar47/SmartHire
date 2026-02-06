import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewService, feedbackService } from '../services/interviewService';

const InterviewFeedback = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [interviewId]);

  const fetchData = async () => {
    try {
      const [interviewRes, feedbackRes] = await Promise.all([
        interviewService.getInterview(interviewId),
        feedbackService.getInterviewFeedback(interviewId)
      ]);
      setInterview(interviewRes.data);
      setFeedback(feedbackRes.data);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading feedback...</div>;
  }

  if (!interview || !feedback) {
    return <div style={styles.error}>Failed to load interview data</div>;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#16a34a';
    if (score >= 60) return '#d97706';
    return '#dc2626';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.scoreCircle}>
          <svg viewBox="0 0 100 100" style={styles.scoreSvg}>
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getScoreColor(interview.overallScore)}
              strokeWidth="8"
              strokeDasharray={`${interview.overallScore * 2.83} 283`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div style={styles.scoreValue}>
            <span style={styles.scoreNumber}>{interview.overallScore}</span>
            <span style={styles.scoreLabel}>Overall Score</span>
          </div>
        </div>
        
        <div style={styles.summary}>
          <h1 style={styles.title}>Interview Complete! 🎉</h1>
          <p style={styles.subtitle}>
            {interview.type} interview in {interview.domain}
          </p>
          <div style={styles.stats}>
            <span>📝 {interview.questions.length} questions</span>
            <span>⏱️ {Math.floor(interview.totalDuration / 60)} min {interview.totalDuration % 60}s</span>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        {['overview', 'strengths', 'improvements', 'questions'].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === 'overview' && (
          <div style={styles.overviewSection}>
            <div style={styles.feedbackCard}>
              <h3 style={styles.cardTitle}>📋 Summary</h3>
              <p style={styles.feedbackText}>{feedback.overallFeedback.keyTakeaways}</p>
            </div>

            <div style={styles.feedbackCard}>
              <h3 style={styles.cardTitle}>💪 Key Strengths</h3>
              <ul style={styles.list}>
                {feedback.overallFeedback.strengths.map((strength, idx) => (
                  <li key={idx} style={styles.listItem}>{strength}</li>
                ))}
              </ul>
            </div>

            <div style={styles.feedbackCard}>
              <h3 style={styles.cardTitle}>📈 Areas to Improve</h3>
              <ul style={styles.list}>
                {feedback.overallFeedback.areasForImprovement.map((area, idx) => (
                  <li key={idx} style={styles.listItem}>{area}</li>
                ))}
              </ul>
            </div>

            <div style={styles.feedbackCard}>
              <h3 style={styles.cardTitle}>🎯 Next Steps</h3>
              <p style={styles.feedbackText}>{feedback.overallFeedback.nextSteps?.join('. ') || 'Continue practicing!'}</p>
            </div>
          </div>
        )}

        {activeTab === 'strengths' && (
          <div style={styles.feedbackCard}>
            <h3 style={styles.cardTitle}>💪 Your Strengths</h3>
            {feedback.overallFeedback.strengths.map((strength, idx) => (
              <div key={idx} style={styles.strengthItem}>
                <span style={styles.strengthIcon}>✓</span>
                <span>{strength}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'improvements' && (
          <div style={styles.feedbackCard}>
            <h3 style={styles.cardTitle}>📈 Areas for Improvement</h3>
            {feedback.overallFeedback.areasForImprovement.map((area, idx) => (
              <div key={idx} style={styles.improvementItem}>
                <span style={styles.improvementIcon}>→</span>
                <span>{area}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div style={styles.questionsList}>
            {feedback.questionResponses.map((q, idx) => (
              <div key={idx} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNum}>Q{idx + 1}</span>
                  <span style={{
                    ...styles.questionScore,
                    color: getScoreColor(q.feedback?.score || 0)
                  }}>
                    {q.feedback?.score || 0}%
                  </span>
                </div>
                <p style={styles.questionText}>{q.question}</p>
                <div style={styles.answerSection}>
                  <strong>Your Answer:</strong>
                  <p style={styles.answerText}>{q.answer}</p>
                </div>
                <div style={styles.aiFeedback}>
                  <strong>AI Feedback:</strong>
                  <p style={styles.feedbackText}>{q.feedback?.aiAnalysis}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <Link to="/dashboard" style={styles.secondaryBtn}>
          Back to Dashboard
        </Link>
        <Link to="/interview/setup" style={styles.primaryBtn}>
          Practice Again
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '1.2rem',
    color: '#666'
  },
  error: {
    textAlign: 'center',
    padding: '3rem',
    color: '#dc2626'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '2rem',
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  scoreCircle: {
    position: 'relative',
    width: '150px',
    height: '150px'
  },
  scoreSvg: {
    width: '100%',
    height: '100%'
  },
  scoreValue: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#667eea',
    display: 'block'
  },
  scoreLabel: {
    fontSize: '0.8rem',
    color: '#666'
  },
  summary: {
    flex: 1
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#333'
  },
  subtitle: {
    color: '#666',
    marginBottom: '1rem',
    textTransform: 'capitalize'
  },
  stats: {
    display: 'flex',
    gap: '1.5rem',
    color: '#666'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    background: 'white',
    padding: '0.5rem',
    borderRadius: '12px'
  },
  tab: {
    flex: 1,
    padding: '0.75rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTab: {
    background: '#667eea',
    color: 'white'
  },
  content: {
    marginBottom: '2rem'
  },
  overviewSection: {
    display: 'grid',
    gap: '1.5rem'
  },
  feedbackCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  listItem: {
    padding: '0.5rem 0',
    paddingLeft: '1.5rem',
    position: 'relative',
    color: '#555'
  },
  strengthItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  strengthIcon: {
    width: '24px',
    height: '24px',
    background: '#dcfce7',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#16a34a',
    fontWeight: 'bold'
  },
  improvementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  improvementIcon: {
    color: '#667eea',
    fontWeight: 'bold'
  },
  feedbackText: {
    color: '#555',
    lineHeight: 1.6
  },
  questionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  questionCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  questionNum: {
    background: '#667eea',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  questionScore: {
    fontWeight: '700',
    fontSize: '1.25rem'
  },
  questionText: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '1rem'
  },
  answerSection: {
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  answerText: {
    color: '#555',
    marginTop: '0.5rem',
    lineHeight: 1.6
  },
  aiFeedback: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  primaryBtn: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600'
  },
  secondaryBtn: {
    padding: '1rem 2rem',
    background: 'white',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default InterviewFeedback;
