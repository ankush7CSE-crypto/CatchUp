import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Upload, 
  Lock, 
  MessageSquare, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Tag, 
  User, 
  Briefcase, 
  FileCode, 
  ShieldCheck, 
  Cpu, 
  Loader2,
  RotateCcw
} from 'lucide-react';
import { SAMPLE_CONVERSATIONS } from '../data/sampleConversations';
import { validateTranscript } from '../services/analyzer';

export default function DashboardScreen({ 
  onAnalyze, 
  isAnalyzing, 
  activeUser, 
  onUpdateUser,
  healthStatus,
  addToast,
  onResetSession
}) {
  const [transcript, setTranscript] = useState('');
  const [channelName, setChannelName] = useState('#general');
  const [detectedFormat, setDetectedFormat] = useState('Raw Chat Feed');
  const [tokenCount, setTokenCount] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Local editable persona state
  const [userName, setUserName] = useState(activeUser?.name || 'Priya');
  const [userRole, setUserRole] = useState(activeUser?.role || 'Backend Engineer');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeUser) {
      setUserName(activeUser.name || 'Priya');
      setUserRole(activeUser.role || 'Backend Engineer');
    }
  }, [activeUser]);

  useEffect(() => {
    // Clear validation error when user types
    if (validationError && transcript.trim()) {
      setValidationError('');
    }

    // Auto-detect format based on content
    if (transcript.includes('[') && transcript.includes(']')) {
      if (transcript.toLowerCase().includes('maya') || transcript.toLowerCase().includes('devops')) {
        setDetectedFormat('Slack Export');
      } else {
        setDetectedFormat('Standard Timestamp Log');
      }
    } else if (transcript.includes(' - ')) {
      setDetectedFormat('WhatsApp Export');
    } else {
      setDetectedFormat('Raw Chat Feed');
    }

    // Token estimation
    const words = transcript.trim().split(/\s+/).filter(Boolean).length;
    setTokenCount(Math.max(0, words * 4));
  }, [transcript]);

  // Handle Preset Selection (Clearly Labeled as Sample Data)
  const handleSelectPreset = (preset) => {
    setTranscript(preset.transcript);
    setChannelName(preset.channel);
    setValidationError('');
    if (preset.activeUser) {
      setUserName(preset.activeUser.name);
      setUserRole(preset.activeUser.role);
      onUpdateUser?.(preset.activeUser);
    }
    addToast?.({
      type: 'info',
      title: 'Sample Channel Loaded',
      message: `Loaded sample discussion for ${preset.channel}.`
    });
  };

  // Safe file reader & validator for both click upload and drag-and-drop
  const processFile = (file) => {
    if (!file) return;

    // Size limit: 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      addToast?.({
        type: 'error',
        title: 'File Too Large',
        message: `"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed file size is 5MB.`
      });
      return;
    }

    // Format validation
    const validExtensions = ['.txt', '.json', '.csv', '.log'];
    const fileName = file.name || '';
    const ext = '.' + fileName.split('.').pop().toLowerCase();
    const isTextMime = file.type && (file.type.startsWith('text/') || file.type === 'application/json');

    if (!validExtensions.includes(ext) && !isTextMime) {
      addToast?.({
        type: 'error',
        title: 'Unsupported Format',
        message: `Only .txt, .json, and .csv files are supported. Received "${fileName}".`
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        let contentToUse = text;
        // If JSON array (e.g. Slack export JSON), parse cleanly into readable timestamps
        if (ext === '.json' || text.trim().startsWith('[')) {
          try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
              contentToUse = parsed.map(m => {
                const author = m.user_profile?.real_name || m.user || 'User';
                const ts = m.ts ? new Date(parseFloat(m.ts) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM';
                return `[${ts}] ${author}: ${m.text || ''}`;
              }).join('\n');
            }
          } catch (e) {
            // Keep raw string if not JSON array
          }
        }

        setTranscript(contentToUse);
        setValidationError('');
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        setChannelName(`#${nameWithoutExt.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}`);

        addToast?.({
          type: 'success',
          title: 'File Loaded Successfully',
          message: `Imported "${fileName}" (${(file.size / 1024).toFixed(1)} KB).`
        });
      }
    };

    reader.onerror = () => {
      addToast?.({
        type: 'error',
        title: 'Read Failed',
        message: `Unable to read "${fileName}". Please check file permissions.`
      });
    };

    reader.readAsText(file);
  };

  // Handle File Input Event
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Clear / Reset Handler
  const handleClear = () => {
    if (transcript.trim().length > 20) {
      const confirmed = window.confirm(
        'Clear the transcript input and reset active analysis results? Any unsaved edits will be discarded.'
      );
      if (!confirmed) return;
    }

    setTranscript('');
    setValidationError('');
    setTokenCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onResetSession?.();
  };

  const handlePersonaChange = (newName, newRole) => {
    setUserName(newName);
    setUserRole(newRole);
    onUpdateUser?.({
      name: newName,
      role: newRole,
      domain_keywords: activeUser?.domain_keywords || []
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (isAnalyzing) return;

    // Validate transcript input
    const validation = validateTranscript(transcript);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Please enter a valid chat transcript.');
      return;
    }

    setValidationError('');
    onAnalyze({
      raw_transcript: transcript,
      channel_name: channelName || '#general',
      user_profile: {
        name: userName.trim() || 'You',
        role: userRole.trim() || 'Team Member'
      }
    });
  };

  // Keyboard shortcut listener: Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcript, channelName, userName, userRole, isAnalyzing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="pill pill-local" style={{ padding: '4px 12px' }}>
            <span className="dot dot-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Local-First Intelligence • Air-Gapped & Private
            </span>
          </div>
        </div>

        <div>
          <h1 className="display-title">Your conversations, caught up.</h1>
          <p className="display-subtitle" style={{ maxWidth: '680px', marginTop: '6px' }}>
            Find what matters without reading every message. Paste your Slack, Teams, or Discord dump or test an air-gapped demo channel.
          </p>
        </div>
      </section>

      {/* User Persona & Role Configuration Card */}
      <section className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={15} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your Identity Lens (Personal Blast Radius)
              </span>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Used to filter direct action items, blockers, and domain dependencies for you.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Name:</span>
              <input
                type="text"
                value={userName}
                onChange={(e) => handlePersonaChange(e.target.value, userRole)}
                placeholder="e.g. Priya"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)',
                  width: '130px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Role:</span>
              <input
                type="text"
                value={userRole}
                onChange={(e) => handlePersonaChange(userName, e.target.value)}
                placeholder="e.g. Backend Engineer"
                style={{
                  padding: '5px 10px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)',
                  width: '180px',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Ingestion & Parser Card */}
      <section className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header Bar within Card */}
        <div style={{
          backgroundColor: 'var(--bg-canvas)',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Channel Tag Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Tag size={14} color="var(--primary)" />
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  backgroundColor: 'transparent',
                  width: '180px'
                }}
                placeholder="#channel-name"
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-medium)' }}></span>
              {transcript.trim().split('\n').filter(Boolean).length} messages detected
            </span>
          </div>

          {/* Format Auto-Detect Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-tertiary)'
            }}>
              Format auto-detected:
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: 'var(--primary)'
            }}>
              <MessageSquare size={12} />
              {detectedFormat}
            </span>
          </div>
        </div>

        {/* Textarea Area */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Validation Error Banner */}
          {validationError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--urgency-high-bg)',
              border: '1px solid var(--urgency-high-border)',
              color: 'var(--urgency-high-text)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Textarea with Drag-and-Drop Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={isDragging ? 'dropzone-dragover' : ''}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.15s ease'
            }}
          >
            {isDragging && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(238, 242, 255, 0.94)',
                border: '2px dashed var(--primary)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                zIndex: 10,
                pointerEvents: 'none'
              }}>
                <Upload size={32} color="var(--primary)" />
                <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.92rem' }}>
                  Drop transcript file here
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Accepts .txt, .json, .csv (Max 5MB) • 100% On-Device
                </span>
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (validationError) setValidationError('');
              }}
              rows={8}
              placeholder="Paste raw conversation logs, chat threads, or thread exports here, or drag & drop a file..."
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-canvas-elevated)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.84rem',
                lineHeight: 1.6,
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: validationError ? '1px solid var(--urgency-high-text)' : '1px solid var(--border-subtle)',
                resize: 'vertical',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}
            />
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem' }}
                title="Upload conversation export file"
              >
                <Upload size={14} color="var(--primary)" />
                <span>Attach export <span style={{ color: 'var(--text-tertiary)' }}>(.txt, .json, .csv)</span></span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.csv"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              {/* Quick Sample Button */}
              <button
                type="button"
                onClick={() => handleSelectPreset(SAMPLE_CONVERSATIONS[0])}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-soft)',
                  borderColor: 'var(--primary-border)'
                }}
                title="Load sample incident conversation for quick testing"
              >
                <Sparkles size={14} color="var(--primary)" />
                <span>Load Sample</span>
              </button>

              {/* Clear / Reset Control */}
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-surface)'
                }}
                title="Clear transcript input and reset current analysis"
              >
                <RotateCcw size={14} />
                <span>Clear / Reset</span>
              </button>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)'
              }}>
                <Cpu size={14} />
                <span>~{tokenCount.toLocaleString()} tokens</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)'
              }}>
                <kbd>⌘</kbd> + <kbd>Enter</kbd>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className="btn btn-primary"
                style={{
                  padding: '9px 22px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  opacity: isAnalyzing ? 0.75 : 1
                }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="dot-pulse" />
                    <span>Analyzing on-device...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} fill="currentColor" />
                    <span>Analyze Messages</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Assurance Banner Strip */}
          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Lock size={14} color="var(--success)" />
              <span>
                Processed <strong style={{ color: 'var(--text-primary)' }}>100% on-device</strong> with local parser & heuristic engine. Zero data egress.
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--success)'
            }}>
              <span className="dot" style={{ backgroundColor: 'var(--success)' }}></span>
              <span>Air-Gapped Local Baseline: Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Preset Cards Section (Clearly Labeled as Sample Datasets) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Load a Sample Transcript for Testing
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            Clearly labeled demonstration samples
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}>
          {SAMPLE_CONVERSATIONS.map((preset) => (
            <article
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="card"
              style={{
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                border: channelName === preset.channel ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                backgroundColor: channelName === preset.channel ? 'var(--bg-surface-hover)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`pill ${preset.tagType === 'error' ? 'pill-high' : preset.tagType === 'primary' ? 'pill-local' : 'pill-low'}`} style={{ fontSize: '0.7rem' }}>
                    <span className="dot" style={{ backgroundColor: 'currentColor' }}></span>
                    {preset.tag}
                  </span>
                  <ArrowUpRight size={15} color="var(--text-tertiary)" />
                </div>

                <div>
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ color: 'var(--text-outline)' }}>#</span>
                    {preset.channel.replace('#', '')}
                  </h3>
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                    lineHeight: 1.5
                  }}>
                    {preset.description}
                  </p>
                </div>
              </div>

              <div style={{
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {preset.metricsBadge}
                </span>
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Load Sample →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
