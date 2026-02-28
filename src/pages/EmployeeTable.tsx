import React, { useEffect, useState, useRef } from 'react';
import { Search, Download, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Employee {
  id: string;
  name: string;
  dept: string;
  attendance_pct: number;
  actual_hours: number;
  target_hours: number;
  days_present: number;
  days_absent: number;
  anomaly_days: number;
  late_days: number;
  risk_score: number;
  status: string;
  pattern: string;
}

// ─── Inline Style Objects ─────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    background: '#F0F6FF',
    padding: '40px 32px',
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: '#1E293B',
    position: 'relative' as const,
    overflow: 'hidden',
  } as React.CSSProperties,

  orb1: {
    position: 'fixed' as const,
    top: '-120px',
    left: '-120px',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },
  orb2: {
    position: 'fixed' as const,
    bottom: '-80px',
    right: '-80px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },

  content: {
    position: 'relative' as const,
    zIndex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '36px',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  eyebrow: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
    color: '#2563EB',
    marginBottom: '2px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.15,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    margin: 0,
    marginTop: '4px',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 22px',
    borderRadius: '12px',
    border: '1px solid rgba(37,99,235,0.3)',
    background: 'rgba(37,99,235,0.08)',
    color: '#1D6FD8',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
    whiteSpace: 'nowrap' as const,
  },

  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(186,218,255,0.6)',
    borderRadius: '14px',
    padding: '18px 20px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    boxShadow: '0 2px 12px rgba(59,130,246,0.07)',
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748B',
    textTransform: 'uppercase' as const,
    letterSpacing: '1.5px',
    fontWeight: 600,
  },
  statValue: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#0F172A',
    lineHeight: 1.2,
  },
  statSub: {
    fontSize: '12px',
    color: '#94A3B8',
  },

  toolbar: {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(186,218,255,0.6)',
    borderRadius: '16px',
    padding: '16px 20px',
    marginBottom: '20px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    boxShadow: '0 2px 12px rgba(59,130,246,0.06)',
  },
  searchWrap: {
    flex: 1,
    minWidth: '200px',
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '14px',
    color: '#94A3B8',
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    background: 'rgba(241,247,255,0.8)',
    border: '1px solid rgba(186,218,255,0.7)',
    borderRadius: '10px',
    padding: '10px 14px 10px 42px',
    color: '#1E293B',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },

  tableCard: {
    background: 'rgba(255,255,255,0.9)',
    border: '1px solid rgba(186,218,255,0.5)',
    borderRadius: '20px',
    overflow: 'hidden',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 8px 40px rgba(59,130,246,0.1), 0 1px 3px rgba(0,0,0,0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  thead: {
    background: 'rgba(240,246,255,0.8)',
    borderBottom: '1px solid rgba(186,218,255,0.5)',
  },
  th: {
    padding: '14px 20px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    whiteSpace: 'nowrap' as const,
  },
  thCenter: {
    padding: '14px 20px',
    textAlign: 'center' as const,
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(186,218,255,0.25)',
    verticalAlign: 'middle' as const,
  },
  tdCenter: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(186,218,255,0.25)',
    textAlign: 'center' as const,
    verticalAlign: 'middle' as const,
  },

  empWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 800,
    flexShrink: 0,
    color: '#fff',
  },
  empName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: '2px',
  },
  empMeta: {
    fontSize: '12px',
    color: '#94A3B8',
  },

  attWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
    minWidth: '120px',
  },
  attTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  attPct: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#0F172A',
  },
  attHrs: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  barBg: {
    height: '5px',
    background: 'rgba(59,130,246,0.1)',
    borderRadius: '99px',
    overflow: 'hidden',
  },

  riskWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
  },
  riskNum: {
    fontSize: '18px',
    fontWeight: 800,
    lineHeight: 1,
  },
  riskLbl: {
    fontSize: '10px',
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
  },

  actionBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    border: '1px solid rgba(186,218,255,0.6)',
    background: 'rgba(241,247,255,0.8)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94A3B8',
    transition: 'all 0.15s ease',
    margin: '0 auto',
  },

  empty: {
    padding: '80px 20px',
    textAlign: 'center' as const,
    color: '#94A3B8',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '8px',
    color: '#64748B',
  },
};

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  Exceptional: { bg: 'rgba(139,92,246,0.08)',  color: '#7C3AED', dot: '#8B5CF6', label: '🏆 Exceptional' },
  Excellent:   { bg: 'rgba(16,185,129,0.08)',  color: '#059669', dot: '#10B981', label: '✦ Excellent' },
  Good:        { bg: 'rgba(59,130,246,0.08)',  color: '#1D6FD8', dot: '#3B82F6', label: '◆ Good' },
  Warning:     { bg: 'rgba(245,158,11,0.08)',  color: '#B45309', dot: '#F59E0B', label: '⚠ Warning' },
  Critical:    { bg: 'rgba(239,68,68,0.08)',   color: '#DC2626', dot: '#EF4444', label: '✕ Critical' },
  Severe:      { bg: 'rgba(220,38,38,0.1)',    color: '#991B1B', dot: '#DC2626', label: '🚨 Severe' },
};

// ─── Avatar Gradients ────────────────────────────────────────
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#3B82F6,#8B5CF6)',
  'linear-gradient(135deg,#06B6D4,#3B82F6)',
  'linear-gradient(135deg,#10B981,#06B6D4)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
  'linear-gradient(135deg,#EF4444,#F97316)',
];
const getGradient = (name: string) =>
  AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

// ─── Bar fill color ──────────────────────────────────────────
const getBarColor = (pct: number) => {
  if (pct >= 95) return 'linear-gradient(90deg,#7C3AED,#A855F7)';
  if (pct >= 85) return 'linear-gradient(90deg,#059669,#10B981)';
  if (pct >= 75) return 'linear-gradient(90deg,#1D4ED8,#3B82F6)';
  if (pct >= 60) return 'linear-gradient(90deg,#92400E,#F59E0B)';
  if (pct >= 40) return 'linear-gradient(90deg,#991B1B,#EF4444)';
  return 'linear-gradient(90deg,#7F1D1D,#DC2626)';
};

// ─── Risk color ──────────────────────────────────────────────
const getRiskColor = (score: number) => {
  if (score <= 25) return '#059669';
  if (score <= 50) return '#B45309';
  if (score <= 75) return '#C2410C';
  return '#DC2626';
};

// ─── Filter Pill ─────────────────────────────────────────────
const FilterPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '7px 16px',
      borderRadius: '99px',
      border: active ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(186,218,255,0.6)',
      background: active ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.6)',
      color: active ? '#1D6FD8' : '#64748B',
      fontSize: '12px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      letterSpacing: '0.3px',
    }}
  >
    {label}
  </button>
);

// ─── Main Component ──────────────────────────────────────────
export const EmployeeTable = ({ onSelect }: { onSelect: (e: Employee) => void }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getResults().then(res => setEmployees(res.data));
  }, []);

  const handleBulkExport = async () => {
    setExportLoading(true);
    try {
      await api.exportBulk();
    } finally {
      setExportLoading(false);
    }
  };

  const filtered = employees.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  const avgAtt = employees.length
    ? Math.round(employees.reduce((s, e) => s + e.attendance_pct, 0) / employees.length)
    : 0;
  const criticalCount = employees.filter(e => e.status === 'Critical' || e.status === 'Severe').length;
  const anomalyTotal = employees.reduce((s, e) => s + e.anomaly_days, 0);

  return (
    <div style={S.page}>
      {/* Ambient orbs */}
      <div style={S.orb1} />
      <div style={S.orb2} />

      {/* Subtle grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      <div style={S.content}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <p style={S.eyebrow}>Attendance System</p>
            <h1 style={S.title}>Employee Directory</h1>
            <p style={S.subtitle}>
              {employees.length} employees · Live attendance analytics
            </p>
          </div>
          <button
            style={{ ...S.exportBtn, opacity: exportLoading ? 0.6 : 1 }}
            onClick={handleBulkExport}
            disabled={exportLoading}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.14)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.5)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)';
            }}
          >
            <Download size={16} />
            {exportLoading ? 'Generating...' : 'Bulk Export'}
          </button>
        </div>

        {/* ── Stats Bar ── */}
        <div style={S.statsBar}>
          {[
            { label: 'Total Employees', value: employees.length, sub: 'in dataset', color: '#1D6FD8' },
            { label: 'Avg Attendance', value: `${avgAtt}%`, sub: 'across all staff', color: avgAtt >= 85 ? '#059669' : avgAtt >= 70 ? '#B45309' : '#DC2626' },
            { label: 'At Risk', value: criticalCount, sub: 'critical or severe', color: '#DC2626' },
            { label: 'Anomaly Days', value: anomalyTotal, sub: 'total punch errors', color: '#B45309' },
          ].map(stat => (
            <div key={stat.label} style={S.statCard}>
              <span style={S.statLabel}>{stat.label}</span>
              <span style={{ ...S.statValue, color: stat.color }}>{stat.value}</span>
              <span style={S.statSub}>{stat.sub}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div style={S.toolbar}>
          <div style={S.searchWrap}>
            <span style={S.searchIcon}><Search size={16} /></span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={S.searchInput}
              onFocus={e => (e.target.style.borderColor = 'rgba(37,99,235,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(186,218,255,0.7)')}
            />
          </div>
          <div style={S.filterGroup}>
            {['All', 'Exceptional', 'Excellent', 'Good', 'Warning', 'Critical', 'Severe'].map(f => (
              <FilterPill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
            ))}
          </div>
          <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' as const }}>
            {filtered.length} results
          </span>
        </div>

        {/* ── Table ── */}
        <div style={S.tableCard}>
          <div style={{ overflowX: 'auto' }}>
            <table style={S.table}>
              <thead style={S.thead}>
                <tr>
                  <th style={S.th}>#</th>
                  <th style={S.th}>Employee</th>
                  <th style={S.th}>Department</th>
                  <th style={S.th}>Attendance</th>
                  <th style={S.th}>Presence</th>
                  <th style={S.th}>Status</th>
                  <th style={S.thCenter}>Risk</th>
                  <th style={S.thCenter}>Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={S.empty}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                        <p style={S.emptyTitle}>No employees found</p>
                        <p style={{ fontSize: '13px', color: '#94A3B8' }}>Try adjusting your search or filter</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((emp, idx) => {
                      const sc = STATUS_CONFIG[emp.status] || STATUS_CONFIG.Good;
                      const isHovered = hoveredRow === emp.id;
                      return (
                        <motion.tr
                          key={emp.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          onClick={() => onSelect(emp)}
                          onMouseEnter={() => setHoveredRow(emp.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{
                            cursor: 'pointer',
                            background: isHovered ? 'rgba(59,130,246,0.04)' : 'transparent',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Rank */}
                          <td style={S.td}>
                            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 700 }}>
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                          </td>

                          {/* Employee */}
                          <td style={S.td}>
                            <div style={S.empWrap}>
                              <div style={{ ...S.avatar, background: getGradient(emp.name) }}>
                                {emp.name[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={S.empName}>{emp.name}</div>
                                <div style={S.empMeta}>ID: {emp.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Dept */}
                          <td style={S.td}>
                            <span style={{
                              fontSize: '12px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(241,247,255,0.9)',
                              border: '1px solid rgba(186,218,255,0.6)',
                              color: '#475569',
                              fontWeight: 500,
                            }}>
                              {emp.dept}
                            </span>
                          </td>

                          {/* Attendance bar */}
                          <td style={S.td}>
                            <div style={S.attWrap}>
                              <div style={S.attTop}>
                                <span style={S.attPct}>{emp.attendance_pct}%</span>
                                <span style={S.attHrs}>{emp.actual_hours}h</span>
                              </div>
                              <div style={S.barBg}>
                                <div style={{
                                  height: '100%',
                                  width: `${emp.attendance_pct}%`,
                                  background: getBarColor(emp.attendance_pct),
                                  borderRadius: '99px',
                                  transition: 'width 0.6s ease',
                                }} />
                              </div>
                            </div>
                          </td>

                          {/* Presence */}
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                                {emp.days_present}P
                              </span>
                              <span style={{ color: '#CBD5E1' }}>/</span>
                              <span style={{ fontSize: '13px', color: '#DC2626', fontWeight: 600 }}>
                                {emp.days_absent}A
                              </span>
                              {emp.anomaly_days > 0 && (
                                <>
                                  <span style={{ color: '#CBD5E1' }}>/</span>
                                  <span style={{ fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
                                    {emp.anomaly_days}⚡
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Status badge */}
                          <td style={S.td}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              borderRadius: '99px',
                              background: sc.bg,
                              color: sc.color,
                              fontSize: '12px',
                              fontWeight: 700,
                              border: `1px solid ${sc.dot}33`,
                              whiteSpace: 'nowrap' as const,
                            }}>
                              <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: sc.dot, flexShrink: 0,
                              }} />
                              {emp.status}
                            </span>
                          </td>

                          {/* Risk score */}
                          <td style={S.tdCenter}>
                            <div style={S.riskWrap}>
                              <span style={{ ...S.riskNum, color: getRiskColor(emp.risk_score) }}>
                                {emp.risk_score}
                              </span>
                              <span style={S.riskLbl}>risk</span>
                            </div>
                          </td>

                          {/* Action */}
                          <td style={S.tdCenter}>
                            <button
                              style={{
                                ...S.actionBtn,
                                background: isHovered ? 'rgba(37,99,235,0.08)' : 'rgba(241,247,255,0.8)',
                                borderColor: isHovered ? 'rgba(37,99,235,0.3)' : 'rgba(186,218,255,0.6)',
                                color: isHovered ? '#1D6FD8' : '#94A3B8',
                              }}
                              onClick={e => { e.stopPropagation(); onSelect(emp); }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filtered.length > 0 && (
            <div style={{
              padding: '14px 24px',
              borderTop: '1px solid rgba(186,218,255,0.35)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(240,246,255,0.5)',
            }}>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Showing <strong style={{ color: '#475569' }}>{filtered.length}</strong> of{' '}
                <strong style={{ color: '#475569' }}>{employees.length}</strong> employees
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                  const count = employees.filter(e => e.status === key).length;
                  if (!count) return null;
                  return (
                    <span key={key} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', color: cfg.color,
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
                      {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #F0F6FF; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.35); }
      `}</style>
    </div>
  );
};