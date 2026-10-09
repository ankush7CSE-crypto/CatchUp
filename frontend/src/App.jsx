import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardScreen from './components/DashboardScreen';
import AnalysisScreen from './components/AnalysisScreen';
import PersonaModal from './components/PersonaModal';
import Toast from './components/Toast';
import { parseTranscript, analyzeTranscript } from './services/analyzer';
import { FileText, ArrowRight, Clock, Tag } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'pulsecatch_sessions_v1';
const STORAGE_KEY_USER = 'pulsecatch_user_profile_v1';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'results' | 'recent'
  const [toasts, setToasts] = useState([]);
  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'Priya',
      role: 'Backend Engineer',
      domain_keywords: ['backend', 'database', 'postgres', 'pool', 'api']
    };
  });

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recentSessions, setRecentSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const addToast = (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newToast = typeof toast === 'string'
      ? { id, type: 'info', message: toast }
      : { id, type: toast.type || 'info', title: toast.title, message: toast.message, duration: toast.duration };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleResetSession = () => {
    setAnalysisResult(null);
    setView('dashboard');
    setCurrentTab('dashboard');
    addToast({
      type: 'info',
      title: 'Session Cleared',
      message: 'Active transcript and analysis results have been reset.'
    });
  };

  const [resultsFilterTab, setResultsFilterTab] = useState('all');

  const [healthStatus, setHealthStatus] = useState({
    ollama_connected: false,
    local_first: true,
    default_engine: 'PulseCatch Heuristic Engine (Phase 1 Baseline)'
  });

  // Save profile to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(activeUser));
    } catch (e) {}
  }, [activeUser]);

  // Save sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(recentSessions));
    } catch (e) {}
  }, [recentSessions]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      setView('dashboard');
    } else if (tab === 'results') {
      if (analysisResult) {
        setView('results');
      } else if (recentSessions.length > 0) {
        setAnalysisResult(recentSessions[0].fullResult);
        setView('results');
      } else {
        setView('dashboard');
        setCurrentTab('dashboard');
      }
    } else if (tab === 'recent-summaries') {
      setView('recent');
    } else if (tab === 'actions') {
      if (analysisResult) {
        setResultsFilterTab('for-me');
        setView('results');
      } else if (recentSessions.length > 0) {
        setAnalysisResult(recentSessions[0].fullResult);
        setResultsFilterTab('for-me');
        setView('results');
      } else {
        setView('dashboard');
        setCurrentTab('dashboard');
        addToast({
          type: 'info',
          title: 'No Active Analysis',
          message: 'Load a sample or paste a chat to extract Action Items.'
        });
      }
    } else if (tab === 'decisions') {
      if (analysisResult) {
        setResultsFilterTab('decisions');
        setView('results');
      } else if (recentSessions.length > 0) {
        setAnalysisResult(recentSessions[0].fullResult);
        setResultsFilterTab('decisions');
        setView('results');
      } else {
        setView('dashboard');
        setCurrentTab('dashboard');
        addToast({
          type: 'info',
          title: 'No Active Analysis',
          message: 'Load a sample or paste a chat to view Decisions.'
        });
      }
    }
  };

  /**
   * Process actual transcript using the standalone, transparent analysis engine.
   */
  const handleAnalyze = async (payload) => {
    setIsAnalyzing(true);
    // Replace any stale results immediately
    setAnalysisResult(null);

    try {
      // Simulate slight async frame so user sees loading state feedback
      await new Promise(resolve => setTimeout(resolve, 350));

      const { raw_transcript, channel_name, user_profile } = payload;
      
      // Step 1: Parse messages into structured array with stable IDs
      const messages = parseTranscript(raw_transcript);

      // Step 2: Run transparent local analysis engine
      const result = analyzeTranscript(messages, user_profile || activeUser, channel_name);

      // Step 3: Populate results and record session
      const sessionId = `sess_${Date.now()}`;
      const sessionRecord = {
        id: sessionId,
        channel_name: result.channel_name,
        summary: result.summary,
        stats: result.stats,
        created_at: new Date().toISOString(),
        fullResult: result
      };

      setRecentSessions(prev => [sessionRecord, ...prev.slice(0, 19)]);
      setAnalysisResult(result);
      setView('results');
      setCurrentTab('results');
      addToast({
        type: 'success',
        title: 'Analysis Complete',
        message: `Triage complete: ${result.stats.messages_analyzed} messages analyzed with 0 byte data egress.`
      });
    } catch (err) {
      console.error('Analysis error:', err);
      addToast({
        type: 'error',
        title: 'Analysis Error',
        message: err.message || 'Encountered an error while analyzing the transcript.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleInsight = (insightId, completed) => {
    if (!analysisResult) return;
    const updatedActions = (analysisResult.action_items || []).map(item => {
      if (item.id === insightId) {
        return { ...item, is_completed: completed ? 1 : 0 };
      }
      return item;
    });

    setAnalysisResult(prev => ({
      ...prev,
      action_items: updatedActions
    }));
  };

  const handleLoadPastSession = (session) => {
    if (session.fullResult) {
      setAnalysisResult(session.fullResult);
      setView('results');
      setCurrentTab('results');
      addToast({
        type: 'info',
        title: 'Session Loaded',
        message: `Loaded triage session for ${session.channel_name}.`
      });
    }
  };

  const handleSavePersona = (newProfile) => {
    setActiveUser(newProfile);
    addToast({
      type: 'success',
      title: 'Identity Updated',
      message: `Lens updated for ${newProfile.name} (${newProfile.role}).`
    });
  };

  return (
    <div className="app-container">
      {/* Permanent Sidebar from Stitch specs */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        activeUser={activeUser}
        onOpenPersonaModal={() => setIsPersonaOpen(true)}
        healthStatus={healthStatus}
        hasAnalysisResult={Boolean(analysisResult)}
      />

      <div className="main-content">
        {/* Top Header */}
        <Header
          activeUser={activeUser}
          onOpenPersonaModal={() => setIsPersonaOpen(true)}
          currentChannel={analysisResult?.channel_name || '#general'}
        />

        {/* Page Content View Router */}
        <main className="page-body">
          {view === 'dashboard' && (
            <DashboardScreen
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              activeUser={activeUser}
              onUpdateUser={setActiveUser}
              healthStatus={healthStatus}
              addToast={addToast}
              onResetSession={handleResetSession}
            />
          )}

          {view === 'results' && analysisResult && (
            <AnalysisScreen
              result={analysisResult}
              onBack={() => {
                setView('dashboard');
                setCurrentTab('dashboard');
              }}
              activeUser={activeUser}
              onToggleInsight={handleToggleInsight}
              addToast={addToast}
              onResetSession={handleResetSession}
              initialFilterTab={resultsFilterTab}
            />
          )}

          {view === 'recent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h1 className="display-title" style={{ fontSize: '1.6rem' }}>Recent Chat Triage Sessions</h1>
                  <p className="display-subtitle" style={{ fontSize: '0.92rem' }}>
                    Historical channel digests persisted on-device in LocalStorage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('dashboard')}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  New Triage +
                </button>
              </div>

              {recentSessions.length === 0 ? (
                <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>No past sessions recorded yet. Analyze a conversation on the dashboard to build your local archive.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentSessions.map(sess => (
                    <div
                      key={sess.id}
                      onClick={() => handleLoadPastSession(sess)}
                      className="card"
                      style={{
                        padding: '16px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: 'var(--primary)'
                          }}>
                            {sess.channel_name}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {new Date(sess.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.4 }}>
                          {sess.summary}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {sess.stats && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-tertiary)'
                          }}>
                            <span>{sess.stats.messages_analyzed || 0} msgs</span>
                            <span>•</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {sess.stats.action_items_count || 0} tasks
                            </span>
                            <span>•</span>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                              {sess.stats.decisions_count || 0} decisions
                            </span>
                          </div>
                        )}
                        <ArrowRight size={16} color="var(--text-tertiary)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Persona Configuration Modal */}
      <PersonaModal
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
        activeUser={activeUser}
        onSave={handleSavePersona}
      />

      {/* Accessible Toast Notification System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
