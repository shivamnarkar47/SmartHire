import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService, progressService } from '../services/interviewService';

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [interviewsRes, progressRes] = await Promise.all([
        interviewService.getInterviewHistory(),
        progressService.getProgress()
      ]);
      setInterviews(interviewsRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.welcome}>
        <h1 style={styles.title}>Welcome back, {user?.name}! 👋</h1>
        <p style={styles.subtitle}>Ready to practice for your next interview?</p>
      </div>

      <div style={styles.quickStart}>
        <Link to="/interview/setup" style={styles.startBtn}>
          <span style={styles.startIcon}>🚀</span>
          Start New Interview
        </Link>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{progress?.completedInterviews || 0}</div>
          <div style={styles.statLabel}>Interviews Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{progress?.averageScore || 0}%</div>
          <div style={styles.statLabel}>Average Score</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{interviews.length}</div>
          <div style={styles.statLabel}>Total Interviews</div>
        </div>
      </div>

      <div style={styles.sections}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Recent Interviews</h2>
          {interviews.length > 0 ? (
            <div style={styles.interviewList}>
              {interviews.slice(0, 5).map((interview) => (
                <div key={interview._id} style={styles.interviewItem}>
                  <div style={styles.interviewInfo}>
                    <span style={styles.interviewType}>{interview.type}</span>
                    <span style={styles.interviewDomain}>{interview.domain}</span>
                  </div>
                  <div style={styles.interviewMeta}>
                    <span style={styles.interviewDate}>
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </span>
                    {interview.status === 'completed' && (
                      <span style={{
                        ...styles.score,
                        background: interview.overallScore >= 70 ? '#dcfce7' : '#fef3c7',
                        color: interview.overallScore >= 70 ? '#16a34a' : '#d97706'
                      }}>
                        {interview.overallScore}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.empty}>No interviews yet. Start your first practice session!</p>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActions}>
            <Link to="/interview/setup" style={styles.actionCard}>
              <span style={styles.actionIcon}>💬</span>
              <span>Text Interview</span>
            </Link>
            <Link to="/interview/setup?mode=audio" style={styles.actionCard}>
              <span style={styles.actionIcon}>🎤</span>
              <span>Voice Interview</span>
            </Link>
            <Link to="/interview/setup?mode=video" style={styles.actionCard}>
              <span style={styles.actionIcon}>📹</span>
              <span>Video Interview</span>
            </Link>
            <Link to="/progress" style={styles.actionCard}>
              <span style={styles.actionIcon}>📊</span>
              <span>View Progress</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
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
  welcome: {
    marginBottom: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '1.1rem'
  },
  quickStart: {
    marginBottom: '2rem'
  },
  startBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.1rem'
  },
  startIcon: {
    fontSize: '1.3rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#667eea',
    marginBottom: '0.5rem'
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem'
  },
  sections: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem'
  },
  section: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  interviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  interviewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  interviewInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  interviewType: {
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize'
  },
  interviewDomain: {
    fontSize: '0.85rem',
    color: '#666',
    textTransform: 'capitalize'
  },
  interviewMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  interviewDate: {
    fontSize: '0.85rem',
    color: '#666'
  },
  score: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.85rem'
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    padding: '2rem'
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem'
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#f9fafb',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  actionIcon: {
    fontSize: '1.5rem'
  }
};

export default Dashboard;
