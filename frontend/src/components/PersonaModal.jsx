import React, { useState } from 'react';
import { X, User, Check, Sparkles } from 'lucide-react';

const PRESET_PERSONAS = [
  { name: 'Priya', role: 'Backend Engineer', keywords: ['backend', 'database', 'postgres', 'pool', 'api'] },
  { name: 'Sarah', role: 'Frontend Lead', keywords: ['frontend', 'ui', 'checkout', 'tokens', 'components'] },
  { name: 'Julian', role: 'DevOps Engineer', keywords: ['devops', 'infra', 'deploy', 'tls', 'config'] },
  { name: 'Maya', role: 'Engineering Lead', keywords: ['roadmap', 'sprint', 'blocker', 'sign-off', 'deadline'] }
];

export default function PersonaModal({ isOpen, onClose, activeUser, onSave }) {
  const [name, setName] = useState(activeUser.name);
  const [role, setRole] = useState(activeUser.role);
  const [keywords, setKeywords] = useState((activeUser.domain_keywords || []).join(', '));

  if (!isOpen) return null;

  const handleSelectPreset = (p) => {
    setName(p.name);
    setRole(p.role);
    setKeywords(p.keywords.join(', '));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const kwList = keywords.split(',').map(s => s.trim()).filter(Boolean);
    onSave({
      name: name.trim() || 'Priya',
      role: role.trim() || 'Backend Engineer',
      domain_keywords: kwList
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(4px)',
      zIndex: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '460px',
        maxWidth: '100%',
        padding: '24px',
        boxShadow: 'var(--shadow-modal)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <User size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Personal Blast Radius
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Configure who you are to prioritize your personal triage lens.
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            Quick-Switch Persona
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {PRESET_PERSONAS.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="btn btn-secondary"
                style={{
                  padding: '8px 10px',
                  justifyContent: 'flex-start',
                  fontSize: '0.78rem',
                  borderColor: name === p.name ? 'var(--primary)' : 'var(--border-subtle)',
                  backgroundColor: name === p.name ? 'var(--primary-soft)' : 'var(--bg-surface)'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {p.name[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{p.role}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Your Name / Handle:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="card"
              style={{
                padding: '8px 12px',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxShadow: 'none'
              }}
              placeholder="e.g. Priya"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Your Role:
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="card"
              style={{
                padding: '8px 12px',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxShadow: 'none'
              }}
              placeholder="e.g. Backend Engineer"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Domain Focus Keywords (comma-separated):
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="card"
              style={{
                padding: '8px 12px',
                fontSize: '0.84rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxShadow: 'none'
              }}
              placeholder="e.g. backend, database, postgres"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontSize: '0.82rem' }}>
              <Check size={14} />
              Save Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
