import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Download, Calendar, Clock, Brain,
  ShieldAlert, CheckCircle2, AlertCircle, TrendingUp,
  User, Zap, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, ReferenceLine
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';

// ─── Types ─────────────────────────────────────────────────────
interface AttendanceRecord {
  date: string;
  in: string;
  out: string;
  total: string;
}
interface EmployeeProfileProps {
  employee: any;
  onBack: () => void;
}

// ─── Constants ──────────────────────────────────────────────────
const FONT   = "'DM Sans', sans-serif";
const BG     = '#F0F6FF';
const CARD   = 'rgba(255,255,255,0.9)';
const BORDER = 'rgba(186,218,255,0.55)';

const STATUS_CFG: Record<string, { color: string; glow: string; bg: string }> = {
  Exceptional: { color: '#7C3AED', glow: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
  Excellent:   { color: '#059669', glow: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
  Good:        { color: '#1D6FD8', glow: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
  Warning:     { color: '#B45309', glow: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  Critical:    { color: '#DC2626', glow: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
  Severe:      { color: '#991B1B', glow: '#DC2626', bg: 'rgba(220,38,38,0.1)'    },
};

// ─── Helpers ────────────────────────────────────────────────────
const toHours = (total: string) => {
  if (!total || total === '00:00' || total === '00:00:00') return 0;
  const parts = total.split(':');
  return parseFloat(parts[0]) + parseFloat(parts[1]) / 60;
};

const getBarColor = (h: number) => {
  if (h === 0)  return '#CBD5E1';
  if (h >= 8)   return '#10B981';
  if (h >= 4)   return '#F59E0B';
  return '#EF4444';
};

const getRowStatus = (total: string) => {
  const h = toHours(total);
  if (total === '00:00' || total === '00:00:00') return { label: 'Anomaly',   color: '#DC2626', bg: 'rgba(239,68,68,0.08)',   glow: '#EF4444' };
  if (h >= 8)  return                                   { label: 'Full Day',  color: '#059669', bg: 'rgba(16,185,129,0.08)',  glow: '#10B981' };
  if (h >= 4)  return                                   { label: 'Short Day', color: '#B45309', bg: 'rgba(245,158,11,0.08)',  glow: '#F59E0B' };
  return                                                { label: 'Minimal',   color: '#DC2626', bg: 'rgba(239,68,68,0.08)',   glow: '#EF4444' };
};

const getRecommendation = (pct: number) => {
  if (pct >= 95) return { text: 'Exceptional performer. Eligible for monthly excellence award. Maintain current work pattern.',       color: '#7C3AED' };
  if (pct >= 85) return { text: 'Strong attendance record. Minor improvements in consistency could push to exceptional tier.',        color: '#059669' };
  if (pct >= 75) return { text: 'Moderate shortfall detected. Team lead should discuss scheduling and work-life balance.',            color: '#1D6FD8' };
  if (pct >= 60) return { text: 'Attendance below threshold. HR counselling session recommended within this month.',                  color: '#B45309' };
  return              {   text: 'Critical attendance gap. Immediate HR review required. Risk of policy non-compliance.',              color: '#DC2626' };
};

// ─── Custom Tooltips ────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const h = payload[0].value;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid rgba(186,218,255,0.7)',
      borderRadius: '12px', padding: '10px 14px', fontFamily: FONT,
      boxShadow: '0 8px 24px rgba(59,130,246,0.12)',
    }}>
      <p style={{ color: '#94A3B8', fontSize: '11px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: getBarColor(h), fontWeight: 800, fontSize: '18px', margin: 0 }}>
        {h.toFixed(1)}h
      </p>
    </div>
  );
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid rgba(59,130,246,0.25)',
      borderRadius: '12px', padding: '10px 14px', fontFamily: FONT,
      boxShadow: '0 8px 24px rgba(59,130,246,0.12)',
    }}>
      <p style={{ color: '#94A3B8', fontSize: '11px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ color: '#1D6FD8', fontWeight: 800, fontSize: '18px', margin: 0 }}>
        {payload[0].value.toFixed(1)}h
      </p>
      <p style={{ color: '#94A3B8', fontSize: '11px', margin: '2px 0 0' }}>cumulative</p>
    </div>
  );
};

// ─── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, glow, delay }: any) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? '#FFFFFF' : CARD,
        border: `1px solid ${hov ? glow + '50' : BORDER}`,
        borderRadius: '18px', padding: '22px',
        backdropFilter: 'blur(20px)',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.22s ease',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov
          ? `0 16px 40px rgba(59,130,246,0.14), 0 0 0 1px ${glow}25`
          : '0 2px 12px rgba(59,130,246,0.07)',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, opacity: hov ? 1 : 0,
        background: `radial-gradient(ellipse at top left, ${glow}0C 0%, transparent 65%)`,
        transition: 'opacity 0.3s', pointerEvents: 'none',
      }} />
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px', marginBottom: '14px',
        background: `${glow}15`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color,
        border: `1px solid ${glow}25`,
        boxShadow: hov ? `0 0 16px ${glow}30` : 'none', transition: 'box-shadow 0.22s',
      }}>
        <Icon size={19} />
      </div>
      <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' as const,
        letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1, letterSpacing: '-0.5px' }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '12px', color, margin: '5px 0 0', fontWeight: 600 }}>{sub}</p>
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${glow}60, transparent)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.3s',
      }} />
    </motion.div>
  );
};

// ─── Mini Calendar Heatmap ───────────────────────────────────────
const CalendarHeatmap = ({ records }: { records: AttendanceRecord[] }) => {
  const grid = records.slice(0, 31);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
      {grid.map((r, i) => {
        const h = toHours(r.total);
        const isAnomaly = r.total === '00:00' || r.total === '00:00:00';
        const bg = isAnomaly ? 'rgba(239,68,68,0.2)'
          : h >= 8 ? 'rgba(16,185,129,0.3)'
          : h >= 4 ? 'rgba(245,158,11,0.25)'
          : h > 0  ? 'rgba(239,68,68,0.15)'
          : 'rgba(186,218,255,0.3)';
        const border = isAnomaly ? '1px solid rgba(239,68,68,0.35)'
          : h >= 8 ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(186,218,255,0.4)';
        return (
          <div key={i} title={`${r.date} · ${r.total}`} style={{
            width: '28px', height: '28px', borderRadius: '6px',
            background: bg, border,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', color: '#64748B', fontWeight: 600,
            cursor: 'default', transition: 'transform 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {i + 1}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────
export const EmployeeProfile = ({ employee: emp, onBack }: EmployeeProfileProps) => {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'calendar'>('chart');

  const scfg = STATUS_CFG[emp.status] || STATUS_CFG.Good;
  const rec  = getRecommendation(emp.attendance_pct);

  const dailyData = emp.records.map((r: AttendanceRecord) => ({
    date: r.date.slice(0, 5),
    hours: toHours(r.total),
    fullDate: r.date,
  }));

  let cumul = 0;
  const cumulData = emp.records.map((r: AttendanceRecord) => {
    cumul += toHours(r.total);
    return { date: r.date.slice(0, 5), cumulative: parseFloat(cumul.toFixed(1)) };
  });

  const handleDownload = async () => {
    setDownloading(true);
    try { await api.downloadReport(emp.id); }
    finally { setDownloading(false); }
  };

  const statCards = [
    { label: 'Actual Hours',  value: `${emp.actual_hours}h`,   sub: `Target: ${emp.target_hours}h`, icon: Clock,        color: '#1D6FD8', glow: '#3B82F6', delay: 0.05 },
    { label: 'Attendance',    value: `${emp.attendance_pct}%`, sub: emp.status,                      icon: CheckCircle2, color: scfg.color, glow: scfg.glow, delay: 0.1  },
    { label: 'Days Present',  value: emp.days_present,         sub: `${emp.days_absent} absent`,     icon: Calendar,     color: '#7C3AED', glow: '#8B5CF6', delay: 0.15 },
    { label: 'Anomaly Days',  value: emp.anomaly_days,         sub: 'punch errors',                  icon: AlertCircle,  color: '#C2410C', glow: '#F97316', delay: 0.2  },
    { label: 'Late Days',     value: emp.late_days,            sub: 'after 10:00 AM',                icon: Zap,          color: '#B45309', glow: '#F59E0B', delay: 0.25 },
    { label: 'Risk Score',    value: emp.risk_score,           sub: 'ML assessment',                 icon: ShieldAlert,  color: emp.risk_score > 50 ? '#DC2626' : '#059669', glow: emp.risk_score > 50 ? '#EF4444' : '#10B981', delay: 0.3 },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      padding: '36px 32px', fontFamily: FONT,
      color: '#1E293B', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-100px', right: '10%', width: '500px', height: '500px',
        borderRadius: '50%', background: `radial-gradient(circle, ${scfg.glow}10 0%, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-80px', left: '-60px', width: '380px', height: '380px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0 }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1300px', margin: '0 auto' }}>

        {/* ── Top Nav Bar ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '20px',
            marginBottom: '32px', flexWrap: 'wrap' as const,
          }}
        >
          <button onClick={onBack} style={{
            width: '42px', height: '42px', borderRadius: '12px',
            border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.7)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#64748B',
            transition: 'all 0.18s',
            boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
              (e.currentTarget as HTMLElement).style.color = '#0F172A';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.35)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.7)';
              (e.currentTarget as HTMLElement).style.color = '#64748B';
              (e.currentTarget as HTMLElement).style.borderColor = BORDER;
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Profile hero */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', flexShrink: 0,
              background: `linear-gradient(135deg, ${scfg.glow}, ${scfg.glow}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 900, color: '#fff',
              boxShadow: `0 8px 24px ${scfg.glow}35`,
              border: `1px solid ${scfg.glow}40`,
            }}>
              {emp.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' as const }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                  {emp.name}
                </h1>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '99px',
                  background: scfg.bg, border: `1px solid ${scfg.glow}35`,
                  color: scfg.color, fontSize: '12px', fontWeight: 700,
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scfg.glow }} />
                  {emp.status}
                </span>
              </div>
              <p style={{ color: '#64748B', margin: '4px 0 0', fontSize: '13px' }}>
                ID: {emp.id} &nbsp;·&nbsp; {emp.dept} Department
              </p>
            </div>
          </div>

          <button onClick={handleDownload} disabled={downloading} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 22px', borderRadius: '13px',
            border: '1px solid rgba(37,99,235,0.3)',
            background: downloading ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.1)',
            color: '#1D6FD8', fontSize: '14px', fontWeight: 700,
            cursor: downloading ? 'not-allowed' : 'pointer',
            transition: 'all 0.18s', opacity: downloading ? 0.7 : 1,
            boxShadow: '0 2px 8px rgba(37,99,235,0.1)',
          }}
            onMouseEnter={e => { if (!downloading) (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.16)'; }}
            onMouseLeave={e => { if (!downloading) (e.currentTarget as HTMLElement).style.background = 'rgba(37,99,235,0.1)'; }}
          >
            <Download size={17} />
            {downloading ? 'Generating…' : 'Download Report'}
          </button>
        </motion.div>

        {/* ── 6 Stat Cards ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px', marginBottom: '22px',
        }}>
          {statCards.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Charts + AI Insights Row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 340px',
          gap: '18px', marginBottom: '18px',
        }}>

          {/* Chart card with tabs */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '22px', padding: '26px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(59,130,246,0.08)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap' as const, gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {activeTab === 'chart' ? 'Daily Working Hours' : 'Cumulative Hours'}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0' }}>
                  {activeTab === 'chart' ? 'Color: green ≥8h · yellow 4-8h · red <4h · grey=absent' : 'Total hours accumulated over the month'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['chart', 'calendar'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '7px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: 600,
                    border: `1px solid ${activeTab === tab ? 'rgba(37,99,235,0.4)' : BORDER}`,
                    background: activeTab === tab ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.6)',
                    color: activeTab === tab ? '#1D6FD8' : '#64748B',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {tab === 'chart' ? 'Bar Chart' : 'Cumulative'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '260px' }}>
              <AnimatePresence mode="wait">
                {activeTab === 'chart' ? (
                  <motion.div key="bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <ReferenceLine y={8} stroke="rgba(16,185,129,0.3)" strokeDasharray="4 3" />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)', radius: 4 }} />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={22}>
                          {dailyData.map((entry: any, i: number) => (
                            <Cell key={i} fill={getBarColor(entry.hours)} fillOpacity={entry.hours === 0 ? 0.5 : 0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                ) : (
                  <motion.div key="line" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={cumulData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.07)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                        <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <ReferenceLine y={emp.target_hours} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 3" label={{ value: 'Target', fill: '#94A3B8', fontSize: 10 }} />
                        <Tooltip content={<LineTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.15)' }} />
                        <defs>
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={2.5}
                          dot={false} activeDot={{ r: 5, fill: '#3B82F6', strokeWidth: 0 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* AI Insights sidebar */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}
          >
            {/* Pattern + Rec */}
            <div style={{
              background: CARD, border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: '20px', padding: '22px',
              backdropFilter: 'blur(20px)', flex: 1,
              boxShadow: '0 4px 20px rgba(139,92,246,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'rgba(139,92,246,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#7C3AED',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}>
                  <Brain size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>AI Insights</h3>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>ML-generated analysis</p>
                </div>
              </div>

              {/* Cluster */}
              <div style={{
                padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.18)',
                marginBottom: '10px',
              }}>
                <p style={{ fontSize: '10px', color: '#7C3AED', textTransform: 'uppercase' as const,
                  letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 4px' }}>Cluster Group</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#6D28D9', margin: 0 }}>{emp.cluster}</p>
              </div>

              {/* Pattern */}
              <div style={{
                padding: '12px 14px', borderRadius: '12px',
                background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)',
                marginBottom: '10px',
              }}>
                <p style={{ fontSize: '10px', color: '#1D4ED8', textTransform: 'uppercase' as const,
                  letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 4px' }}>Pattern Detected</p>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#1D6FD8', margin: 0 }}>{emp.pattern}</p>
              </div>

              {/* Recommendation */}
              <div style={{
                padding: '12px 14px', borderRadius: '12px',
                background: scfg.bg, border: `1px solid ${scfg.glow}30`,
              }}>
                <p style={{ fontSize: '10px', color: scfg.color, textTransform: 'uppercase' as const,
                  letterSpacing: '1.5px', fontWeight: 700, margin: '0 0 6px' }}>Recommendation</p>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.6 }}>
                  {rec.text}
                </p>
              </div>
            </div>

            {/* Mini heatmap */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '20px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.07)',
            }}>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 14px' }}>
                Month Heatmap
              </p>
              <CalendarHeatmap records={emp.records} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' as const }}>
                {[
                  { color: 'rgba(16,185,129,0.3)',  label: '≥8h'    },
                  { color: 'rgba(245,158,11,0.25)', label: '4-8h'   },
                  { color: 'rgba(239,68,68,0.2)',   label: 'Anomaly' },
                  { color: 'rgba(186,218,255,0.3)', label: 'Absent'  },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: l.color, border: '1px solid rgba(186,218,255,0.4)' }} />
                    <span style={{ fontSize: '10px', color: '#64748B' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Day-by-Day Table ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: CARD, border: `1px solid ${BORDER}`,
            borderRadius: '22px', overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 24px rgba(59,130,246,0.08)',
          }}
        >
          <div style={{
            padding: '22px 26px 18px', borderBottom: `1px solid ${BORDER}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(240,246,255,0.6)',
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Day-by-Day Attendance
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0' }}>
                {emp.records.length} records total
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#94A3B8' }}>
              <span>✓ Present: <strong style={{ color: '#059669' }}>{emp.days_present}</strong></span>
              <span>✗ Absent: <strong style={{ color: '#DC2626' }}>{emp.days_absent}</strong></span>
              <span>⚡ Anomaly: <strong style={{ color: '#B45309' }}>{emp.anomaly_days}</strong></span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ background: 'rgba(240,246,255,0.5)', borderBottom: `1px solid ${BORDER}` }}>
                  {['#', 'Date', 'Day', 'In Time', 'Out Time', 'Total Hours', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left' as const,
                      fontSize: '10px', fontWeight: 700, color: '#64748B',
                      letterSpacing: '1.5px', textTransform: 'uppercase' as const,
                      whiteSpace: 'nowrap' as const,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {emp.records.map((r: AttendanceRecord, i: number) => {
                  const rs = getRowStatus(r.total);
                  const hrs = toHours(r.total);
                  const [dd, mm, yyyy] = r.date.split('-');
                  const dayName = new Date(`${yyyy}-${mm}-${dd}`).toLocaleDateString('en-US', { weekday: 'short' });
                  const [hov2, setHov2] = useState(false);
                  return (
                    <tr key={i}
                      onMouseEnter={() => setHov2(true)}
                      onMouseLeave={() => setHov2(false)}
                      style={{
                        borderBottom: `1px solid rgba(186,218,255,0.2)`,
                        background: hov2 ? 'rgba(59,130,246,0.03)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '13px 20px', color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '13px 20px', color: '#475569', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                        {r.date}
                      </td>
                      <td style={{ padding: '13px 20px', color: '#64748B', fontSize: '12px' }}>
                        {dayName}
                      </td>
                      <td style={{ padding: '13px 20px', color: '#1D6FD8', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {r.in}
                      </td>
                      <td style={{ padding: '13px 20px', color: '#DC2626', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600 }}>
                        {r.out}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: getBarColor(hrs) }}>
                          {r.total}
                        </span>
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 11px', borderRadius: '99px',
                          background: rs.bg, color: rs.color,
                          fontSize: '11px', fontWeight: 700,
                          border: `1px solid ${rs.glow}30`,
                          whiteSpace: 'nowrap' as const,
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: rs.glow }} />
                          {rs.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F0F6FF; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.35); }
      `}</style>
    </div>
  );
};