import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { progressService } from '../services/interviewService';

const Progress = () => {
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progressRes, statsRes] = await Promise.all([
        progressService.getProgress(),
        progressService.getStats()
      ]);
      setProgress(progressRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading progress...</div>;
  }

  if (!progress || !stats) {
    return <div style={styles.error}>Failed to load progress data</div>;
  }

  const pieData = Object.entries(stats.byType).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: data.count
  }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb'];

  const formatChartData = () => {
    return stats.scoreTrend.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: item.score
    }));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Your Progress</h1>
      <p style={styles.subtitle}>Track your interview practice journey</p>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{progress.completedInterviews}</div>
          <div style={styles.statLabel}>Interviews Completed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statValue}>{progress.averageScore}%</div>
          <div style={styles.statLabel}>Average Score</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🔥</div>
          <div style={styles.statValue}>{progress.totalInterviews}</div>
          <div style={styles.statLabel}>Total Attempts</div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: 'none', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Interview Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <h3 style={styles.detailTitle}>By Interview Type</h3>
          {Object.entries(stats.byType).map(([type, data]) => (
            <div key={type} style={styles.detailRow}>
              <span style={styles.detailLabel}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <div style={styles.detailBar}>
                <div 
                  style={{
                    ...styles.detailFill,
                    width: `${data.avgScore}%`,
                    background: data.avgScore >= 70 ? '#16a34a' : data.avgScore >= 50 ? '#d97706' : '#dc2626'
                  }} 
                />
              </div>
              <span style={styles.detailValue}>{data.avgScore}%</span>
            </div>
          ))}
        </div>

        <div style={styles.detailCard}>
          <h3 style={styles.detailTitle}>Recent Activity</h3>
          {progress.recentActivity.slice(0, 5).map((activity, idx) => (
            <div key={idx} style={styles.activityItem}>
              <span style={styles.activityDot} />
              <div style={styles.activityInfo}>
                <span style={styles.activityAction}>{activity.action}</span>
                <span style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
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
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#333'
  },
  subtitle: {
    color: '#666',
    marginBottom: '2rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem'
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#667eea'
  },
  statLabel: {
    color: '#666',
    fontSize: '0.9rem'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  chartCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  detailCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  detailTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#333'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem'
  },
  detailLabel: {
    width: '100px',
    fontSize: '0.9rem',
    color: '#666'
  },
  detailBar: {
    flex: 1,
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  detailFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s'
  },
  detailValue: {
    width: '50px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#333'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f3f4f6'
  },
  activityDot: {
    width: '8px',
    height: '8px',
    background: '#667eea',
    borderRadius: '50%'
  },
  activityInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  activityAction: {
    fontSize: '0.9rem',
    color: '#333'
  },
  activityDate: {
    fontSize: '0.8rem',
    color: '#666'
  }
};

export default Progress;
