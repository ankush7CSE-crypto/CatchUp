import React from 'react';
import { 
  Layers, 
  LayoutDashboard,
  BarChart3,
  Inbox, 
  FileText, 
  CheckSquare, 
  Bookmark, 
  Settings, 
  ShieldCheck, 
  User, 
  ChevronDown 
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  activeUser, 
  onOpenPersonaModal, 
  healthStatus,
  hasAnalysisResult
}) {
  return (
    <aside className="sidebar">
      <div>
        {/* Branding & App Title */}
        <div style={{
          height: '56px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={17} />
          </div>
          <span style={{
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)'
          }}>
            CatchUp-Local
          </span>
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            fontFamily: 'var(--font-mono)'
          }}>
            LOCAL
          </span>
        </div>

        {/* Workspace Quick-Switch */}
        <div style={{ padding: '12px 14px 6px' }}>
          <button 
            type="button"
            onClick={onOpenPersonaModal}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '6px 10px',
              fontSize: '0.8rem',
              backgroundColor: 'var(--bg-canvas)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: 'var(--success)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeUser.name[0]}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {activeUser.name} ({activeUser.role.split(' ')[0]})
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-tertiary)" />
          </button>
        </div>

        {/* Nav Links */}
        <nav style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`btn ${currentTab === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              fontWeight: currentTab === 'dashboard' ? 600 : 500
            }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          {hasAnalysisResult && (
            <button
              type="button"
              onClick={() => setCurrentTab('results')}
              className={`btn ${currentTab === 'results' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                fontWeight: currentTab === 'results' ? 600 : 500
              }}
            >
              <BarChart3 size={16} />
              <span>Analysis Results</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentTab('recent-summaries')}
            className={`btn ${currentTab === 'recent-summaries' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              color: currentTab === 'recent-summaries' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <FileText size={16} />
            <span>Recent Summaries</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('actions')}
            className={`btn ${currentTab === 'actions' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              color: currentTab === 'actions' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            <CheckSquare size={16} />
            <span>Action Items</span>
          </button>

          <button
            type="button"
            onClick={onOpenPersonaModal}
            className="btn btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <User size={16} />
            <span>My Blast Radius</span>
          </button>
        </nav>
      </div>

      {/* Local Air-Gapped Trust Indicator */}
      <div style={{ padding: '14px' }}>
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="dot dot-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)'
            }}>
              {healthStatus?.ollama_connected ? 'Ollama (On-Device)' : 'Local Neural Engine'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'var(--success)',
            fontFamily: 'var(--font-mono)'
          }}>
            <ShieldCheck size={14} />
            <span>100% Air-Gapped & Private</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
