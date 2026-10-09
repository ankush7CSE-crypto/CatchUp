import React from 'react';
import { Search, Shield, Bell, User } from 'lucide-react';

export default function Header({ activeUser, onOpenPersonaModal, currentChannel }) {
  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Active Channel:</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.82rem',
            border: '1px solid var(--primary-border)'
          }}>
            {currentChannel || '#general'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Air-gapped trust badge */}
        <div className="pill pill-local" style={{ fontSize: '0.72rem' }}>
          <Shield size={12} />
          <span>Air-Gapped Localhost</span>
        </div>

        {/* User profile persona pill */}
        <button
          type="button"
          onClick={onOpenPersonaModal}
          className="btn btn-ghost"
          style={{
            padding: '4px 8px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Configure active persona & blast radius"
        >
          <div style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeUser.name[0]}
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activeUser.name}
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-canvas)',
            padding: '1px 6px',
            borderRadius: '4px'
          }}>
            {activeUser.role}
          </span>
        </button>
      </div>
    </header>
  );
}
