import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  Copy, 
  Download, 
  Search, 
  Tag, 
  User, 
  ExternalLink, 
  Check, 
  Bookmark, 
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown,
  AlertOctagon,
  Info,
  CheckCircle,
  Filter,
  CheckSquare
} from 'lucide-react';
import SourceInspector from './SourceInspector';

export default function AnalysisScreen({ 
  result, 
  onBack, 
  activeUser, 
  onToggleInsight,
  addToast,
  onResetSession,
  initialFilterTab = 'all'
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [caughtUp, setCaughtUp] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectTargetLine, setInspectTargetLine] = useState(1);
  const [inspectFindingTitle, setInspectFindingTitle] = useState('');
  
  // Active Filter Tab: 'all' | 'for-me' | 'blockers' | 'decisions' | 'fyi'
  const [activeFilterTab, setActiveFilterTab] = useState(initialFilterTab || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialFilterTab) {
      setActiveFilterTab(initialFilterTab);
    }
  }, [initialFilterTab]);

  // Local state for action items (allowing checkbox toggle)
  const [actionItems, setActionItems] = useState(result.action_items || []);

  const handleOpenSource = (msgIdOrLine, title) => {
    // If msgId is passed like 'msg_3', extract number
    let lineNum = 1;
    if (typeof msgIdOrLine === 'number') {
      lineNum = msgIdOrLine;
    } else if (typeof msgIdOrLine === 'string') {
      const match = msgIdOrLine.match(/\d+/);
      lineNum = match ? parseInt(match[0], 10) : 1;
    }

    setInspectTargetLine(lineNum);
    setInspectFindingTitle(title);
    setInspectorOpen(true);
  };

  const handleToggleTask = (id) => {
    const updated = actionItems.map(item => {
      if (item.id === id) {
        const nextState = item.is_completed ? 0 : 1;
        onToggleInsight?.(id, nextState === 1);
        return { ...item, is_completed: nextState };
      }
      return item;
    });
    setActionItems(updated);
  };

  const handleCopyActions = () => {
    try {
      const text = actionItems
        .map(a => `- [${a.is_completed ? 'x' : ' '}] ${a.task} (@${a.assignee}) - Deadline: ${a.deadline} [Source: ${a.sourceMessageId || 'msg'}]`)
        .join('\n');
      navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      addToast?.({
        type: 'success',
        title: 'Action Items Copied',
        message: `Copied ${actionItems.length} action items to clipboard in Markdown format.`
      });
    } catch (err) {
      addToast?.({
        type: 'error',
        title: 'Copy Failed',
        message: 'Could not access clipboard.'
      });
    }
  };

  const handleExportMarkdown = () => {
    try {
      let md = `# PulseCatch Triage Digest: ${result.channel_name}\n\n`;
      md += `## Executive Summary\n${result.summary}\n\n`;
      md += `### Metrics\n`;
      md += `- Messages Analyzed: ${result.stats.messages_analyzed}\n`;
      md += `- Action Items: ${result.stats.action_items_count}\n`;
      md += `- Decisions Recorded: ${result.stats.decisions_count}\n`;
      md += `- Blockers Tracked: ${result.stats.blockers_count || 0}\n`;
      md += `- Noise Filtered: ${result.stats.noise_reduced_pct}%\n\n`;
      
      md += `## Action Items\n`;
      actionItems.forEach(a => {
        md += `- [${a.is_completed ? 'x' : ' '}] **${a.task}** (Assignee: ${a.assignee}, Due: ${a.deadline}, Priority: ${a.urgency}, Source: ${a.sourceMessageId})\n`;
      });

      if (result.decisions && result.decisions.length > 0) {
        md += `\n## Decisions Recorded\n`;
        result.decisions.forEach(d => {
          md += `- **${d.decision}** (By: ${d.agreedBy || 'Team'}, Source: ${d.sourceMessageId})\n`;
        });
      }

      if (result.blockers && result.blockers.length > 0) {
        md += `\n## Blockers\n`;
        result.blockers.forEach(b => {
          md += `- [${b.isResolved ? 'RESOLVED' : 'ACTIVE'}] **${b.description}** (Reported by: ${b.reportedBy}, Source: ${b.sourceMessageId})\n`;
        });
      }

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pulsecatch-${result.channel_name.replace('#', '')}.md`;
      link.click();
      URL.revokeObjectURL(url);

      addToast?.({
        type: 'success',
        title: 'Summary Exported',
        message: `Saved digest for ${result.channel_name} as Markdown file.`
      });
    } catch (err) {
      addToast?.({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not generate export file.'
      });
    }
  };

  // Filter calculations based on active user and search
  const userNameLower = (activeUser?.name || '').trim().toLowerCase();
  
  const myActionItems = actionItems.filter(item => 
    item.tier === 'DIRECT_IMPACT' || 
    (userNameLower && item.assignee.toLowerCase().includes(userNameLower))
  );

  const filteredActionItems = actionItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignee.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeFilterTab === 'for-me') {
      return item.tier === 'DIRECT_IMPACT' || (userNameLower && item.assignee.toLowerCase().includes(userNameLower));
    }
    return true;
  });

  const blockersList = result.blockers || [];
  const decisionsList = result.decisions || [];
  const fyiList = result.fyi_items || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Action & Navigation Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            title="Return to Dashboard to paste and analyze transcripts"
          >
            <ArrowLeft size={14} />
            <span>← Dashboard</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '1.05rem',
            color: 'var(--text-primary)'
          }}>
            <span style={{ color: 'var(--primary)' }}>#</span>
            {result.channel_name.replace('#', '')}
          </div>

          <span className="pill pill-local" style={{ fontSize: '0.7rem' }}>
            <ShieldCheck size={12} />
            Local Parser Baseline Active
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px', color: 'var(--primary)', borderColor: 'var(--primary-border)', backgroundColor: 'var(--primary-soft)' }}
            title="Paste another conversation transcript"
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>+ New Triage</span>
          </button>

          <button
            type="button"
            onClick={handleCopyActions}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            title="Copy tasks to clipboard"
          >
            {copySuccess ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            <span>{copySuccess ? 'Copied Tasks' : 'Copy Tasks'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Download size={14} />
            <span>Export MD</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextState = !caughtUp;
              setCaughtUp(nextState);
              if (nextState) {
                addToast?.({
                  type: 'success',
                  title: 'Channel Caught Up',
                  message: `All unread messages in ${result.channel_name} marked as acknowledged.`
                });
              }
            }}
            className={`btn ${caughtUp ? 'btn-secondary' : 'btn-primary'}`}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <CheckCircle2 size={14} />
            <span>{caughtUp ? 'Channel Caught Up ✓' : 'Mark Caught Up'}</span>
          </button>
        </div>
      </div>

      {/* AI Synthesis Summary Card */}
      <section className="card" style={{
        padding: '24px',
        borderLeft: '4px solid var(--primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--primary)'
            }}>
              Deterministic Conversation Synthesis
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            Transparent Heuristic Engine • Zero Telemetry
          </span>
        </div>

        <p style={{
          fontSize: '1.02rem',
          lineHeight: 1.65,
          color: 'var(--text-primary)',
          fontWeight: 450
        }}>
          {result.summary}
        </p>

        {/* 5 Compact Metric Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          paddingTop: '8px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Messages Analyzed
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {result.stats.messages_analyzed}
            </span>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Action Items
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {result.stats.action_items_count}
            </span>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Decisions Made
            </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
              {result.stats.decisions_count}
            </span>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
              Noise Filtered
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {result.stats.noise_reduced_pct}%
              </span>
              <TrendingDown size={16} color="var(--success)" />
            </div>
          </div>
        </div>
      </section>

      {/* "Important for You" Section (Personal Blast Radius) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}>
              {activeUser?.name ? activeUser.name[0] : 'U'}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Important for You ({activeUser?.name || 'You'} • {activeUser?.role || 'Team Member'})
            </h2>
          </div>
          <span className="pill pill-local" style={{ fontSize: '0.68rem' }}>
            Personal Blast Radius Active
          </span>
        </div>

        {myActionItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '12px'
          }}>
            {myActionItems.map(task => (
              <div
                key={`my_${task.id}`}
                className="card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  border: '1px solid var(--primary-border)',
                  backgroundColor: 'var(--primary-soft)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(task.is_completed)}
                    onChange={() => handleToggleTask(task.id)}
                    style={{
                      marginTop: '3px',
                      cursor: 'pointer',
                      accentColor: 'var(--primary)',
                      width: '16px',
                      height: '16px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      lineHeight: 1.4
                    }}>
                      {task.task}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="pill pill-high" style={{ fontSize: '0.65rem' }}>
                      {task.urgency}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {task.deadline}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSource(task.sourceMessageId, task.task)}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.72rem', padding: '2px 8px', color: 'var(--primary)' }}
                  >
                    View Source [{task.sourceMessageId}] →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-canvas)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              No direct action items or blockers currently assigned to {activeUser?.name || 'you'} in this thread. All deliverables are owned by other team members.
            </span>
          </div>
        )}
      </section>

      {/* Interactive Filter Tabs & Search Bar */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          {/* Tab Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`btn ${activeFilterTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              All Items ({actionItems.length + decisionsList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('for-me')}
              className={`btn ${activeFilterTab === 'for-me' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              Assigned to Me ({myActionItems.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('decisions')}
              className={`btn ${activeFilterTab === 'decisions' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              Decisions ({decisionsList.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterTab('fyi')}
              className={`btn ${activeFilterTab === 'fyi' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem', padding: '5px 12px' }}
            >
              FYI / Chatter ({fyiList.length})
            </button>
          </div>

          {/* Quick Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px',
            width: '220px'
          }}>
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings..."
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.78rem',
                backgroundColor: 'transparent',
                width: '100%',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Tab 1: Action Items (or when 'all' is selected) */}
        {(activeFilterTab === 'all' || activeFilterTab === 'for-me') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Action Items ({filteredActionItems.length})
              </span>
            </div>

            {filteredActionItems.length === 0 ? (
              <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                No action items matching your current filter.
              </div>
            ) : (
              filteredActionItems.map(item => (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    opacity: item.is_completed ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={Boolean(item.is_completed)}
                      onChange={() => handleToggleTask(item.id)}
                      style={{
                        cursor: 'pointer',
                        accentColor: 'var(--primary)',
                        width: '16px',
                        height: '16px'
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textDecoration: item.is_completed ? 'line-through' : 'none'
                      }}>
                        {item.task}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} />
                          <strong>{item.assignee}</strong>
                          {item.assigneeConfidence === 'uncertain' && (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-outline)' }}>(uncertain)</span>
                          )}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={12} />
                          {item.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`pill ${item.urgency === 'HIGH' ? 'pill-high' : item.urgency === 'MEDIUM' ? 'pill-med' : 'pill-low'}`} style={{ fontSize: '0.68rem' }}>
                      {item.urgency}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenSource(item.sourceMessageId, item.task)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                    >
                      Source [{item.sourceMessageId}]
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Decisions (or when 'all' is selected) */}
        {(activeFilterTab === 'all' || activeFilterTab === 'decisions') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: activeFilterTab === 'all' ? '12px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bookmark size={16} color="var(--success)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Decisions & Consensus ({decisionsList.length})
              </span>
            </div>

            {decisionsList.length === 0 ? (
              <div className="card" style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                No explicit consensus decisions established in this transcript.
              </div>
            ) : (
              decisionsList.map(dec => (
                <div
                  key={dec.id}
                  className="card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="pill pill-local" style={{ fontSize: '0.65rem' }}>
                      <CheckCircle2 size={10} />
                      Consensus Established ({dec.confidence})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenSource(dec.sourceMessageId, dec.decision)}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.7rem', padding: '2px 6px', color: 'var(--primary)' }}
                    >
                      Source [{dec.sourceMessageId}] →
                    </button>
                  </div>

                  <p style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {dec.decision}
                  </p>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {dec.context}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: FYI / Low-Priority Conversation */}
        {(activeFilterTab === 'all' || activeFilterTab === 'fyi') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: activeFilterTab === 'all' ? '12px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                FYI & Low-Priority Context ({fyiList.length})
              </span>
            </div>

            {fyiList.length === 0 ? (
              <div className="card" style={{ padding: '16px', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                No informational side-notes detected.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {fyiList.map(fyi => (
                  <div
                    key={fyi.id}
                    className="card"
                    style={{
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-canvas)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {fyi.author}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenSource(fyi.sourceMessageId, fyi.note)}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.68rem', padding: '1px 4px', color: 'var(--primary)' }}
                      >
                        [{fyi.sourceMessageId}]
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {fyi.note}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Slide-Over Source Message Inspector */}
      <SourceInspector
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        indexedMessages={result.indexed_messages || []}
        highlightLine={inspectTargetLine}
        activeFindingTitle={inspectFindingTitle}
      />
    </div>
  );
}
