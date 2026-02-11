import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interviewService';

const InterviewSession = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [showVideo, setShowVideo] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const currentQRef = useRef(null);
  const currentIndexRef = useRef(0);

  const getQuestionsCount = useCallback(() => {
    return interview?.questions?.length || 5;
  }, [interview]);

  const MAX_QUESTIONS = 5; // Hard limit for interview questions

  const initializeInterview = useCallback(async () => {
    try {
      setError(null);
      const response = await interviewService.getInterview(interviewId);
      const interviewData = response.data;
      setInterview(interviewData);
      currentIndexRef.current = 0;
      
      if (interviewData.questions && interviewData.questions.length > 0) {
        const firstQ = interviewData.questions[0];
        const qData = {
          questionId: firstQ.questionId,
          question: firstQ.question,
          category: firstQ.category,
          timeLimit: firstQ.timeLimit || 300,
          type: firstQ.type,
          order: firstQ.order
        };
        setQuestion(qData);
        currentQRef.current = qData;
        setTimeLeft(firstQ.timeLimit || 300);
      } else {
        throw new Error('No questions found in interview');
      }
    } catch (err) {
      console.error('Failed to load interview:', err);
      setError(err.message || 'Failed to load interview');
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    initializeInterview();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initializeInterview, stream]);

  useEffect(() => {
    if (question && interview?.mode === 'text') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitAnswer(true);
            return question.timeLimit || 300;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [question, interview]);

  const fetchNextQuestion = useCallback(async () => {
    if (!interview?.questions) return false;

    const nextIndex = currentIndexRef.current + 1;

    // Check if we've reached the maximum number of questions
    if (nextIndex >= MAX_QUESTIONS) {
      console.log(`Reached maximum of ${MAX_QUESTIONS} questions. Interview complete.`);
      return false; // Signal that no more questions - complete the interview
    }

    if (nextIndex < interview.questions.length) {
      setIsTransitioning(true);
      
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }

      setTimeout(() => {
        const nextQ = interview.questions[nextIndex];
        const qData = {
          questionId: nextQ.questionId,
          question: nextQ.question,
          category: nextQ.category,
          timeLimit: nextQ.timeLimit || 300,
          type: nextQ.type,
          order: nextQ.order
        };
        setQuestion(qData);
        currentQRef.current = qData;
        currentIndexRef.current = nextIndex;
        setCurrentQuestionIndex(nextIndex);
        setTimeLeft(nextQ.timeLimit || 300);
        setAnswer('');
        setAudioChunks([]);
        setFeedback(null);
        setIsTransitioning(false);
      }, 300);

      return true;
    }

    try {
      setIsTransitioning(true);
      
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }

      console.log('Fetching new question from backend...');
      const response = await interviewService.getNextQuestion(interviewId);
      
      if (response.data && response.data.question) {
        const newQ = response.data;
        const qData = {
          questionId: newQ.questionId,
          question: newQ.question,
          category: newQ.category,
          timeLimit: newQ.timeLimit || 300,
          type: newQ.type,
          order: interview.questions.length
        };
        
        const updatedInterview = {
          ...interview,
          questions: [...interview.questions, qData]
        };
        setInterview(updatedInterview);
        
        setQuestion(qData);
        currentQRef.current = qData;
        currentIndexRef.current = updatedInterview.questions.length - 1;
        setCurrentQuestionIndex(updatedInterview.questions.length - 1);
        setTimeLeft(qData.timeLimit || 300);
        setAnswer('');
        setAudioChunks([]);
        setFeedback(null);
        setIsTransitioning(false);
        
        console.log('New question fetched successfully');
        return true;
      }
    } catch (err) {
      console.error('Failed to fetch next question:', err);
      setError(err.response?.data?.message || 'Failed to load next question');
    }
    
    setIsTransitioning(false);
    return false;
  }, [interview, isRecording, mediaRecorder, interviewId]);

  const handleSubmitAnswer = async (force = false) => {
    if (!force && !answer.trim() && audioChunks.length === 0 && !submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let audioUrl = null;
      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(audioBlob);
      }

      const response = await interviewService.submitAnswer(
        interviewId,
        question.questionId,
        answer,
        audioUrl,
        null,
        (question.timeLimit || 300) - timeLeft
      );

      if (response.data.feedback) {
        setFeedback(response.data.feedback);
      }

      // Check if we've reached the maximum questions before fetching next
      if (currentIndexRef.current >= MAX_QUESTIONS - 1) {
        try {
          await interviewService.completeInterview(interviewId);
          setTimeout(() => {
            navigate(`/interview/feedback/${interviewId}`);
          }, 500);
        } catch (err) {
          console.error('Failed to complete interview:', err);
          setTimeout(() => {
            navigate(`/interview/feedback/${interviewId}`);
          }, 500);
        }
        setSubmitting(false);
        return;
      }
      
      const hasMore = await fetchNextQuestion();
      
      if (!hasMore) {
        try {
          await interviewService.completeInterview(interviewId);
          setTimeout(() => {
            navigate(`/interview/feedback/${interviewId}`);
          }, 500);
        } catch (err) {
          console.error('Failed to complete interview:', err);
          setTimeout(() => {
            navigate(`/interview/feedback/${interviewId}`);
          }, 500);
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = useCallback(() => {
    if (submitting) return;
    if (currentIndexRef.current >= MAX_QUESTIONS - 1) {
      handleSubmitAnswer(true);
      return;
    }
    handleSubmitAnswer(true);
  }, [answer, audioChunks, submitting]);

  const handleStartRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(audioStream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleStartVideo = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream);
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      setShowVideo(true);
    } catch (err) {
      console.error('Failed to start video:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const handleStopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowVideo(false);
  };

  const handleComplete = async () => {
    try {
      await interviewService.completeInterview(interviewId);
      navigate(`/interview/feedback/${interviewId}`);
    } catch (err) {
      console.error('Failed to complete interview:', err);
      setError('Failed to complete interview');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = getQuestionsCount();
  const progressPercent = ((currentQuestionIndex + 1) / MAX_QUESTIONS) * 100;
  const isLastQuestion = currentQuestionIndex >= MAX_QUESTIONS - 1;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Preparing your interview...</p>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠</div>
        <h2 style={styles.errorTitle}>Unable to load interview</h2>
        <p style={styles.errorText}>{error}</p>
        <button style={styles.retryButton} onClick={initializeInterview}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.progressHeader}>
        <div style={styles.progressContainer}>
          <div style={styles.progressLabels}>
            <span style={styles.progressLabel}>Question {currentQuestionIndex + 1} of {MAX_QUESTIONS}</span>
            <span style={styles.progressPercent}>{Math.round(progressPercent)}%</span>
          </div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${progressPercent}%`
              }} 
            />
          </div>
        </div>
        
        {interview?.mode === 'text' && (
          <div style={{
            ...styles.timer,
            color: timeLeft < 60 ? '#ef4444' : timeLeft < 120 ? '#f59e0b' : '#1e293b'
          }}>
            <span style={styles.timerIcon}>⏱</span>
            <span style={styles.timerText}>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span>{error}</span>
          <button style={styles.dismissError} onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div style={{
        ...styles.questionCard,
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'translateY(-10px)' : 'translateY(0)'
      }}>
        <div style={styles.categoryBadge}>{question?.category}</div>
        <h1 style={styles.questionText}>{question?.question}</h1>
        
        {feedback && (
          <div style={styles.feedbackPreview}>
            <div style={styles.feedbackScore}>
              <span style={styles.feedbackScoreLabel}>Score</span>
              <span style={styles.feedbackScoreValue}>{feedback.score || 75}</span>
            </div>
            <div style={styles.feedbackSummary}>
              <p style={styles.feedbackStrengths}>
                ✓ {feedback.strengths?.[0] || 'Good response!'}
              </p>
            </div>
          </div>
        )}
      </div>

      {interview?.mode === 'video' && showVideo && (
        <div style={styles.videoContainer}>
          <video ref={videoRef} autoPlay muted style={styles.video} />
          <button style={styles.stopVideoBtn} onClick={handleStopVideo}>
            Stop Camera
          </button>
        </div>
      )}

      <div style={styles.answerSection}>
        {interview?.mode === 'text' ? (
          <div style={styles.textInputWrapper}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Describe your experience using the STAR method..."
              style={styles.textarea}
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAutoSubmit();
                }
              }}
            />
            <div style={styles.hint}>
              Press Ctrl+Enter to submit quickly
            </div>
          </div>
        ) : (
          <div style={styles.voiceWrapper}>
            <div style={styles.mediaControls}>
              {interview?.mode === 'video' && !showVideo && (
                <button style={styles.controlBtn} onClick={handleStartVideo}>
                  <span style={styles.btnIcon}>📹</span>
                  Start Camera
                </button>
              )}
              
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                style={{
                  ...styles.controlBtn,
                  background: isRecording ? '#ef4444' : '#0f172a',
                  color: 'white'
                }}
              >
                <span style={styles.btnIcon}>{isRecording ? '⏹' : '🎤'}</span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
            
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your transcribed answer will appear here, or type manually..."
              style={styles.textarea}
              disabled={submitting}
            />
            
            {audioChunks.length > 0 && (
              <div style={styles.audioIndicator}>
                <span style={styles.audioDot}></span>
                Audio recorded ({audioChunks.length} chunks)
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || (!answer.trim() && audioChunks.length === 0)}
          style={{
            ...styles.submitBtn,
            opacity: submitting || (!answer.trim() && audioChunks.length === 0) ? 0.6 : 1
          }}
        >
          {submitting ? (
            <span style={styles.btnContent}>
              <span style={styles.spinner}></span>
              Submitting...
            </span>
          ) : (
            <span style={styles.btnContent}>
              {isLastQuestion ? 'Finish Interview' : 'Submit Answer'}
              <span style={styles.arrow}>→</span>
            </span>
          )}
        </button>
        
        {!isLastQuestion && (
          <button
            onClick={handleAutoSubmit}
            disabled={submitting}
            style={styles.skipBtn}
          >
            Skip for Now
          </button>
        )}
      </div>

      {isLastQuestion && !submitting && (
        <div style={styles.completePrompt}>
          <p>This is the last question. When you're ready, click "Finish Interview" to complete.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '720px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f8fafc'
  },
  loader: {
    width: '48px',
    height: '48px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#0f172a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '2rem',
    background: '#f8fafc'
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '0.5rem'
  },
  errorText: {
    color: '#64748b',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    background: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  progressHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
    gap: '1rem'
  },
  progressContainer: {
    flex: 1
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem'
  },
  progressLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500'
  },
  progressPercent: {
    fontSize: '0.85rem',
    color: '#0f172a',
    fontWeight: '600'
  },
  progressBar: {
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
    borderRadius: '3px',
    transition: 'width 0.4s ease-out'
  },
  timer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  timerIcon: {
    fontSize: '1rem'
  },
  timerText: {
    fontSize: '1.1rem',
    fontWeight: '700',
    fontVariantNumeric: 'tabular-nums'
  },
  errorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: '#dc2626',
    fontSize: '0.9rem'
  },
  dismissError: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '1rem'
  },
  questionCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '1.5rem',
    transition: 'opacity 0.3s ease, transform 0.3s ease'
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '0.35rem 0.85rem',
    background: '#f1f5f9',
    color: '#475569',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '1rem'
  },
  questionText: {
    fontSize: '1.35rem',
    lineHeight: 1.6,
    color: '#0f172a',
    fontWeight: '600',
    margin: 0
  },
  feedbackPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f0fdf4',
    borderRadius: '10px',
    border: '1px solid #bbf7d0'
  },
  feedbackScore: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    background: '#16a34a',
    borderRadius: '8px',
    color: 'white'
  },
  feedbackScoreLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    opacity: 0.9
  },
  feedbackScoreValue: {
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  feedbackSummary: {
    flex: 1
  },
  feedbackStrengths: {
    color: '#166534',
    fontSize: '0.9rem',
    margin: 0,
    fontWeight: '500'
  },
  answerSection: {
    marginBottom: '1.5rem'
  },
  textInputWrapper: {
    position: 'relative'
  },
  textarea: {
    width: '100%',
    padding: '1.25rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '180px',
    lineHeight: '1.6',
    background: 'white',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none'
  },
  hint: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '0.5rem',
    textAlign: 'right'
  },
  voiceWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  mediaControls: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  controlBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnIcon: {
    fontSize: '1.1rem'
  },
  audioIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#fef3c7',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#92400e',
    width: 'fit-content'
  },
  audioDot: {
    width: '8px',
    height: '8px',
    background: '#f59e0b',
    borderRadius: '50%',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  submitBtn: {
    flex: 1,
    padding: '1rem 2rem',
    background: '#0f172a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  btnContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  arrow: {
    fontSize: '1.1rem'
  },
  skipBtn: {
    padding: '1rem 1.5rem',
    background: 'transparent',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  completePrompt: {
    textAlign: 'center',
    padding: '1rem',
    background: '#f0fdf4',
    borderRadius: '10px',
    color: '#166534',
    fontSize: '0.9rem'
  },
  videoContainer: {
    position: 'relative',
    marginBottom: '1rem'
  },
  video: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  stopVideoBtn: {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    padding: '0.5rem 1rem',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default InterviewSession;
