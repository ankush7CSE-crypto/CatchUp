import React, { useEffect, useRef } from 'react';
import { X, Search, CheckCircle, Shield, FileText, CornerDownRight } from 'lucide-react';

export default function SourceInspector({
  isOpen,
  onClose,
  indexedMessages,
  highlightLine,
  highlightText,
  activeFindingTitle
}) {
  const lineRefs = useRef({});

  useEffect(() => {
    if (isOpen && highlightLine && lineRefs.current[highlightLine]) {
      lineRefs.current[highlightLine].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [isOpen, highlightLine]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '520px',
      maxWidth: '90vw',
      backgroundColor: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-modal)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column'
    }} className="slide-over">
      {/* Inspector Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-canvas)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="var(--primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Source Message Inspector
          </h3>
          <span className="pill pill-local" style={{ fontSize: '0.65rem' }}>
            <Shield size={10} />
            Verified Source
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
          style={{ padding: '4px', borderRadius: 'var(--radius-sm)' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Active Finding Banner */}
      {activeFindingTitle && (
        <div style={{
          padding: '12px 20px',
          backgroundColor: 'var(--primary-soft)',
          borderBottom: '1px solid var(--primary-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--primary)'
          }}>
            Inspecting Finding:
          </span>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            fontWeight: 500,
            lineHeight: 1.4
          }}>
            {activeFindingTitle}
          </p>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CornerDownRight size={12} />
            Mapped to source message [msg_{highlightLine}] / Line #{highlightLine}
          </span>
        </div>
      )}

      {/* Raw Transcript Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backgroundColor: 'var(--bg-canvas)'
      }}>
        {indexedMessages.map((msg, idx) => {
          const lineNum = msg.line || msg.lineIndex || idx + 1;
          const msgId = msg.id || `msg_${lineNum}`;
          const isTarget = lineNum === highlightLine;

          return (
            <div
              key={msgId}
              ref={(el) => (lineRefs.current[lineNum] = el)}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isTarget ? '#fef08a' : 'var(--bg-surface)',
                border: isTarget ? '1px solid #eab308' : '1px solid var(--border-subtle)',
                boxShadow: isTarget ? '0 0 0 2px rgba(234, 179, 8, 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Message ID Column */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                color: isTarget ? '#854d0e' : 'var(--text-outline)',
                userSelect: 'none',
                minWidth: '50px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontWeight: 600 }}>{msgId}</span>
                <span style={{ fontSize: '0.65rem' }}>L{lineNum}</span>
              </div>

              {/* Message Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: isTarget ? '#713f12' : 'var(--text-primary)'
                  }}>
                    {msg.author}
                  </span>
                  {msg.authorRole && (
                    <span style={{
                      fontSize: '0.68rem',
                      color: isTarget ? '#854d0e' : 'var(--text-tertiary)',
                      backgroundColor: isTarget ? '#fde047' : 'var(--bg-canvas)',
                      padding: '1px 5px',
                      borderRadius: '3px'
                    }}>
                      {msg.authorRole}
                    </span>
                  )}
                  {msg.time && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: isTarget ? '#854d0e' : 'var(--text-tertiary)'
                    }}>
                      [{msg.time}]
                    </span>
                  )}
                  {isTarget && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: '#eab308',
                      color: '#ffffff',
                      padding: '1px 6px',
                      borderRadius: '3px'
                    }}>
                      ORIGIN
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  color: isTarget ? '#713f12' : 'var(--text-secondary)',
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Source integrity validated locally (zero cloud transfer)</span>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
