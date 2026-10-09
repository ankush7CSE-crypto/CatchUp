import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const duration = toast.duration || 3500;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const borderColor = isSuccess 
    ? 'var(--success-border)' 
    : isError 
    ? 'var(--urgency-high-border)' 
    : 'var(--primary-border)';

  const icon = isSuccess ? (
    <CheckCircle2 size={16} color="var(--success)" />
  ) : isError ? (
    <AlertCircle size={16} color="var(--urgency-high-text)" />
  ) : (
    <Info size={16} color="var(--primary)" />
  );

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-modal)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        animation: 'slideInToast 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div style={{ marginTop: '2px', flexShrink: 0 }}>
        {icon}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {toast.title && (
          <span style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            {toast.title}
          </span>
        )}
        <span style={{
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4
        }}>
          {toast.message}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="btn btn-ghost"
        style={{
          padding: '2px',
          color: 'var(--text-tertiary)',
          marginLeft: '4px',
          flexShrink: 0
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
