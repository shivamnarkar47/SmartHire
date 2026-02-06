import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interviewService } from '../services/interviewService';

const InterviewSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState({
    type: searchParams.get('type') || 'behavioral',
    mode: searchParams.get('mode') || 'text',
    domain: searchParams.get('domain') || 'general',
    difficulty: 'medium',
    numQuestions: 5
  });

  const interviewTypes = [
    { id: 'behavioral', label: 'Behavioral', desc: 'STAR method questions' },
    { id: 'technical', label: 'Technical', desc: 'Coding and technical questions' },
    { id: 'domain-specific', label: 'Domain-Specific', desc: 'Role-specific questions' }
  ];

  const modes = [
    { id: 'text', label: 'Text', desc: 'Type your answers', icon: '💬' },
    { id: 'audio', label: 'Voice', desc: 'Speak your answers', icon: '🎤' },
    { id: 'video', label: 'Video', desc: 'Video interview practice', icon: '📹' }
  ];

  const domains = [
    { id: 'general', label: 'General', desc: 'Any role' },
    { id: 'software-engineering', label: 'Software Engineering', desc: 'Developer roles' },
    { id: 'product-management', label: 'Product Management', desc: 'PM positions' },
    { id: 'data-science', label: 'Data Science', desc: 'DS and ML roles' },
    { id: 'design', label: 'Design', desc: 'UX/UI design roles' },
    { id: 'marketing', label: 'Marketing', desc: 'Marketing positions' }
  ];

  const difficulties = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' }
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
      const response = await interviewService.startInterview(
        config.type,
        config.mode,
        config.domain,
        config.numQuestions
      );
      navigate(`/interview/session/${response.data.interviewId}`);
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Setup Your Interview</h1>
      <p style={styles.subtitle}>Choose your preferences and start practicing</p>

      <div style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Interview Type</h3>
          <div style={styles.grid}>
            {interviewTypes.map((type) => (
              <button
                key={type.id}
                style={{
                  ...styles.option,
                  ...(config.type === type.id ? styles.selected : {})
                }}
                onClick={() => setConfig({ ...config, type: type.id })}
              >
                <div style={styles.optionLabel}>{type.label}</div>
                <div style={styles.optionDesc}>{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Mode</h3>
          <div style={styles.grid}>
            {modes.map((mode) => (
              <button
                key={mode.id}
                style={{
                  ...styles.option,
                  ...(config.mode === mode.id ? styles.selected : {})
                }}
                onClick={() => setConfig({ ...config, mode: mode.id })}
              >
                <div style={styles.optionIcon}>{mode.icon}</div>
                <div style={styles.optionLabel}>{mode.label}</div>
                <div style={styles.optionDesc}>{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Domain / Industry</h3>
          <div style={styles.grid}>
            {domains.map((domain) => (
              <button
                key={domain.id}
                style={{
                  ...styles.option,
                  ...(config.domain === domain.id ? styles.selected : {})
                }}
                onClick={() => setConfig({ ...config, domain: domain.id })}
              >
                <div style={styles.optionLabel}>{domain.label}</div>
                <div style={styles.optionDesc}>{domain.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Difficulty</h3>
          <div style={styles.difficultyRow}>
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                style={{
                  ...styles.diffBtn,
                  ...(config.difficulty === diff.id ? styles.diffSelected : {})
                }}
                onClick={() => setConfig({ ...config, difficulty: diff.id })}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Number of Questions</h3>
          <input
            type="range"
            min="3"
            max="10"
            value={config.numQuestions}
            onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
            style={styles.range}
          />
          <div style={styles.rangeValue}>{config.numQuestions} questions</div>
        </div>

        <button
          style={styles.startBtn}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? 'Starting...' : 'Start Interview'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#333'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem'
  },
  form: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem'
  },
  option: {
    padding: '1.25rem',
    background: '#f9fafb',
    border: '2px solid transparent',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s'
  },
  selected: {
    borderColor: '#667eea',
    background: '#eef2ff'
  },
  optionLabel: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '0.25rem'
  },
  optionDesc: {
    fontSize: '0.8rem',
    color: '#666'
  },
  optionIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem'
  },
  difficultyRow: {
    display: 'flex',
    gap: '1rem'
  },
  diffBtn: {
    flex: 1,
    padding: '0.75rem',
    background: '#f9fafb',
    border: '2px solid transparent',
    borderRadius: '8px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  diffSelected: {
    borderColor: '#667eea',
    background: '#eef2ff',
    color: '#667eea'
  },
  range: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: '#e5e7eb',
    outline: 'none'
  },
  rangeValue: {
    textAlign: 'center',
    marginTop: '0.5rem',
    fontWeight: '600',
    color: '#667eea'
  },
  startBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem'
  }
};

export default InterviewSetup;
