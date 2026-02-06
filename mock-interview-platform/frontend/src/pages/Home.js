import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Master Your Next Interview with
          <span style={styles.heroGradient}> AI-Powered Practice</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Practice real interview questions, get instant AI feedback, and track your progress.
          Prepare for technical, behavioral, and domain-specific interviews.
        </p>
        <div style={styles.heroCta}>
          <Link to="/register" style={styles.primaryBtn}>Start Practicing Free</Link>
          <Link to="/login" style={styles.secondaryBtn}>Sign In</Link>
        </div>
      </section>

      <section style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>💬</div>
          <h3 style={styles.featureTitle}>Text Interviews</h3>
          <p style={styles.featureText}>Practice typing out your answers and get detailed feedback on content and structure.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🎤</div>
          <h3 style={styles.featureTitle}>Voice Interviews</h3>
          <p style={styles.featureText}>Speak your answers and improve your verbal communication and confidence.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📹</div>
          <h3 style={styles.featureTitle}>Video Interviews</h3>
          <p style={styles.featureText}>Practice with video to work on body language and presentation skills.</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3 style={styles.featureTitle}>AI Feedback</h3>
          <p style={styles.featureText}>Get instant, detailed feedback powered by advanced AI analysis.</p>
        </div>
      </section>

      <section style={styles.interviewTypes}>
        <h2 style={styles.sectionTitle}>Interview Types</h2>
        <div style={styles.typeGrid}>
          <div style={styles.typeCard}>
            <h4>Technical</h4>
            <p>Coding, system design, and technical questions</p>
          </div>
          <div style={styles.typeCard}>
            <h4>Behavioral</h4>
            <p>STAR method, soft skills, and situational questions</p>
          </div>
          <div style={styles.typeCard}>
            <h4>Domain-Specific</h4>
            <p>Role-specific questions for any industry</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    padding: '0',
    minHeight: '100vh'
  },
  hero: {
    textAlign: 'center',
    padding: '6rem 2rem 4rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto 1.5rem'
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto 2rem',
    lineHeight: 1.6
  },
  heroCta: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  primaryBtn: {
    padding: '1rem 2rem',
    background: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  secondaryBtn: {
    padding: '1rem 2rem',
    background: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.2s'
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#333'
  },
  featureText: {
    color: '#666',
    lineHeight: 1.6
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333'
  },
  interviewTypes: {
    padding: '4rem 2rem',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  typeCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    borderLeft: '4px solid #667eea'
  }
};

export default Home;
