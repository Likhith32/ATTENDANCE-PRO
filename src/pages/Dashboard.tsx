import React, { useEffect, useState, useRef } from 'react';
import { Users, Percent, Trophy, Fingerprint, TrendingUp, TrendingDown, AlertCircle, Award, Activity } from 'lucide-react';
import { api } from '@/services/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ─────────────────────────────────────────────────────
interface SummaryData {
  total_employees: number;
  avg_attendance: number;
  best_performer: { name: string; att: number };
  worst_performer: { name: string; att: number };
  anomaly_cases: number;
  status_distribution: Record<string, number>;
  ready: boolean;
}

// ─── Constants ──────────────────────────────────────────────────
const FONT = "'Cabinet Grotesk', 'DM Sans', sans-serif";
const BG = '#F0F6FF';
const CARD = 'rgba(255,255,255,0.92)';
const BORDER = 'rgba(186,218,255,0.6)';

const STATUS_CFG: Record<string, { color: string; glow: string; bg: string; emoji: string }> = {
  Exceptional: { color: '#7C3AED', glow: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',  emoji: '🏆' },
  Excellent:   { color: '#059669', glow: '#10B981', bg: 'rgba(16,185,129,0.08)',   emoji: '✦'  },
  Good:        { color: '#1D6FD8', glow: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  emoji: '◆'  },
  Warning:     { color: '#B45309', glow: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  emoji: '⚠'  },
  Critical:    { color: '#DC2626', glow: '#EF4444', bg: 'rgba(239,68,68,0.08)',   emoji: '✕'  },
  Severe:      { color: '#991B1B', glow: '#DC2626', bg: 'rgba(220,38,38,0.08)',   emoji: '🚨' },
};

// ─── Animated Counter ───────────────────────────────────────────
const useCounter = (target: number, duration = 1400) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
};

// ─── KPI Card ───────────────────────────────────────────────────
const KpiCard = ({ label, rawValue, displayValue, sub, icon: Icon, color, glow, delay }: any) => {
  const [hovered, setHov] = useState(false);
  const counted = useCounter(rawValue, 1200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hovered ? '#FFFFFF' : CARD,
        border: `1px solid ${hovered ? glow + '55' : BORDER}`,
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s, background 0.25s',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 20px 50px rgba(59,130,246,0.15), 0 0 0 1px ${glow}30, inset 0 1px 0 rgba(255,255,255,0.9)`
          : '0 2px 12px rgba(100,149,237,0.1), 0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* Gradient sweep background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: hovered ? 1 : 0,
        background: `radial-gradient(ellipse at top left, ${glow}10 0%, transparent 60%)`,
        transition: 'opacity 0.3s', pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '13px',
          background: `${glow}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: color, border: `1px solid ${glow}30`,
          boxShadow: hovered ? `0 0 20px ${glow}25` : 'none',
          transition: 'box-shadow 0.25s',
        }}>
          <Icon size={20} />
        </div>
        <div style={{
          fontSize: '10px', padding: '4px 10px', borderRadius: '99px',
          background: `${glow}15`, color: color,
          fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' as const,
          border: `1px solid ${glow}30`,
        }}>
          Live
        </div>
      </div>

      {/* Value */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{
          fontSize: '38px', fontWeight: 900, color: '#0F172A',
          lineHeight: 1, letterSpacing: '-1.5px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {typeof displayValue === 'string' && displayValue.includes('%')
            ? `${counted}%`
            : typeof displayValue === 'number'
              ? counted
              : displayValue}
        </span>
      </div>

      {/* Label */}
      <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 600,
        textTransform: 'uppercase' as const, letterSpacing: '1.5px' }}>
        {label}
      </p>
      {sub && (
        <p style={{ fontSize: '13px', color: color, margin: '4px 0 0', fontWeight: 600,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </p>
      )}

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, transparent, ${glow}70, transparent)`,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
      }} />
    </motion.div>
  );
};

// ─── Custom Pie Tooltip ─────────────────────────────────────────
const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const cfg = STATUS_CFG[name] || STATUS_CFG.Good;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${cfg.glow}44`,
      borderRadius: '14px', padding: '12px 16px',
      fontFamily: FONT, minWidth: '140px',
      boxShadow: `0 8px 32px rgba(59,130,246,0.15)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '18px' }}>{cfg.emoji}</span>
        <span style={{ color: cfg.color, fontWeight: 800, fontSize: '14px' }}>{name}</span>
      </div>
      <span style={{ color: '#0F172A', fontSize: '24px', fontWeight: 900 }}>{value}</span>
      <span style={{ color: '#94A3B8', fontSize: '12px', marginLeft: '4px' }}>employees</span>
    </div>
  );
};

// ─── Custom Bar Tooltip ─────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const cfg = STATUS_CFG[label] || STATUS_CFG.Good;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${cfg.glow}44`,
      borderRadius: '12px', padding: '10px 14px',
      fontFamily: FONT,
      boxShadow: `0 8px 32px rgba(59,130,246,0.12)`,
    }}>
      <p style={{ color: cfg.color, fontWeight: 700, margin: '0 0 4px', fontSize: '13px' }}>{label}</p>
      <p style={{ color: '#0F172A', fontWeight: 900, margin: 0, fontSize: '20px' }}>{payload[0].value}</p>
    </div>
  );
};

// ─── Donut Legend ───────────────────────────────────────────────
const DonutLegend = ({ data, total }: { data: { name: string; value: number }[]; total: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '160px' }}>
    {data.filter(d => d.value > 0).map(d => {
      const cfg = STATUS_CFG[d.name] || STATUS_CFG.Good;
      const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
      return (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '3px', flexShrink: 0,
            background: cfg.glow, boxShadow: `0 0 6px ${cfg.glow}50`,
          }} />
          <span style={{ flex: 1, fontSize: '12px', color: '#475569', fontWeight: 500 }}>{d.name}</span>
          <span style={{ fontSize: '13px', color: cfg.color, fontWeight: 800 }}>{d.value}</span>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>{pct}%</span>
        </div>
      );
    })}
  </div>
);

// ─── Main Dashboard ─────────────────────────────────────────────
export const Dashboard = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSummary().then(res => {
      setSummary(res.data);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) return (
    <div style={{
      minHeight: '100vh', background: BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT,
    }}>
      <div style={{ textAlign: 'center' as const }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid rgba(59,130,246,0.15)',
            borderTop: '3px solid #3B82F6',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Loading analytics…</p>
      </div>
    </div>
  );

  const pieData = Object.entries(summary.status_distribution)
    .map(([name, value]) => ({ name, value }))
    .filter(d => d.value > 0);

  const total = pieData.reduce((s, d) => s + d.value, 0);
  const barData = [...pieData].sort((a, b) => b.value - a.value);

  const kpis = [
    {
      label: 'Total Employees', rawValue: summary.total_employees,
      displayValue: summary.total_employees,
      icon: Users, color: '#1D6FD8', glow: '#3B82F6', delay: 0.05,
    },
    {
      label: 'Avg Attendance', rawValue: summary.avg_attendance,
      displayValue: `${summary.avg_attendance}%`,
      icon: Percent,
      color: summary.avg_attendance >= 85 ? '#059669' : summary.avg_attendance >= 70 ? '#B45309' : '#DC2626',
      glow: summary.avg_attendance >= 85 ? '#10B981' : summary.avg_attendance >= 70 ? '#F59E0B' : '#EF4444',
      delay: 0.1,
    },
    {
      label: 'Best Performer', rawValue: summary.best_performer.att,
      displayValue: `${summary.best_performer.att}%`,
      sub: summary.best_performer.name,
      icon: Trophy, color: '#7C3AED', glow: '#8B5CF6', delay: 0.15,
    },
    {
      label: 'Worst Performer', rawValue: summary.worst_performer.att,
      displayValue: `${summary.worst_performer.att}%`,
      sub: summary.worst_performer.name,
      icon: TrendingDown, color: '#DC2626', glow: '#EF4444', delay: 0.2,
    },
    {
      label: 'Anomaly Cases', rawValue: summary.anomaly_cases,
      displayValue: summary.anomaly_cases,
      icon: Fingerprint, color: '#C2410C', glow: '#F97316', delay: 0.25,
    },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      padding: '40px 32px', fontFamily: FONT, color: '#1E293B',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* ── Ambient orbs ── */}
      {[
        { top: '-150px', left: '-100px', color: 'rgba(59,130,246,0.12)', size: '500px' },
        { bottom: '-100px', right: '-50px', color: 'rgba(139,92,246,0.08)', size: '400px' },
        { top: '40%', left: '40%', color: 'rgba(16,185,129,0.06)', size: '300px' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'fixed', width: orb.size, height: orb.size,
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          ...(orb.top ? { top: orb.top } : {}),
          ...(orb.bottom ? { bottom: (orb as any).bottom } : {}),
          ...(orb.left ? { left: orb.left } : {}),
          ...(orb.right ? { right: (orb as any).right } : {}),
        }} />
      ))}

      {/* Subtle grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '36px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#3B82F6', marginBottom: '6px',
          }}>
            Live Dashboard
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>
                Organization Overview
              </h1>
              <p style={{ color: '#64748B', margin: '6px 0 0', fontSize: '14px' }}>
                Analytics across all departments · {summary.total_employees} employees tracked
              </p>
            </div>
            {!summary.ready && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                color: '#B45309', fontSize: '13px', fontWeight: 600,
              }}>
                <AlertCircle size={15} /> Upload a PDF to see live data
              </div>
            )}
          </div>
        </motion.div>

        {/* ── KPI Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '14px', marginBottom: '24px',
        }}>
          {kpis.map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        {/* ── Charts Row 1: Donut + Bar ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '20px', marginBottom: '20px',
        }}>

          {/* Donut Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '22px', padding: '28px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(59,130,246,0.08), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Status Distribution
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
                Employee attendance performance tiers
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1, height: '240px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={100}
                      paddingAngle={3} dataKey="value"
                      animationBegin={200} animationDuration={900}
                      strokeWidth={0}
                    >
                      {pieData.map((entry) => {
                        const cfg = STATUS_CFG[entry.name] || STATUS_CFG.Good;
                        return <Cell key={entry.name} fill={cfg.glow} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center' as const, pointerEvents: 'none',
                }}>
                  <p style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                    {total}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0', fontWeight: 600 }}>
                    TOTAL
                  </p>
                </div>
              </div>
              <DonutLegend data={pieData} total={total} />
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '22px', padding: '28px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(59,130,246,0.08), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Employee Count by Status
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
                Distribution across performance tiers
              </p>
            </div>
            <div style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: FONT }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(59,130,246,0.04)', radius: 6 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52} animationDuration={900}>
                    {barData.map((entry) => {
                      const cfg = STATUS_CFG[entry.name] || STATUS_CFG.Good;
                      return <Cell key={entry.name} fill={cfg.glow} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Charts Row 2: Attendance Gauge + Status Breakdown cards ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '320px 1fr',
          gap: '20px',
        }}>

          {/* Radial Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '22px', padding: '28px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(59,130,246,0.08), 0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column' as const,
              alignItems: 'center',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', alignSelf: 'flex-start' }}>
              Avg Attendance Gauge
            </h3>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 20px', alignSelf: 'flex-start' }}>
              Organisation-wide average
            </p>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="65%" outerRadius="90%"
                  startAngle={225} endAngle={-45}
                  data={[{ value: summary.avg_attendance }]}
                >
                  <RadialBar
                    background={{ fill: 'rgba(59,130,246,0.08)' }}
                    dataKey="value" cornerRadius={10}
                    fill={summary.avg_attendance >= 85 ? '#10B981' : summary.avg_attendance >= 70 ? '#F59E0B' : '#EF4444'}
                    animationDuration={1200}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center' as const,
              }}>
                <p style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1 }}>
                  {summary.avg_attendance}%
                </p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0', fontWeight: 600 }}>AVG</p>
              </div>
            </div>
            {/* Gauge ticks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '12px' }}>
              {[
                { label: 'Critical', color: '#EF4444', val: '<60%' },
                { label: 'Good', color: '#3B82F6', val: '75%+' },
                { label: 'Excellent', color: '#10B981', val: '85%+' },
              ].map(t => (
                <div key={t.label} style={{ textAlign: 'center' as const }}>
                  <p style={{ fontSize: '11px', color: t.color, fontWeight: 700, margin: 0 }}>{t.val}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>{t.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status breakdown cards grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            {Object.entries(STATUS_CFG).map(([status, cfg], i) => {
              const count = summary.status_distribution[status] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <motion.div
                  key={status}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  style={{
                    background: count > 0 ? cfg.bg : 'rgba(59,130,246,0.03)',
                    border: `1px solid ${count > 0 ? cfg.glow + '30' : 'rgba(186,218,255,0.4)'}`,
                    borderRadius: '16px', padding: '18px',
                    display: 'flex', flexDirection: 'column' as const,
                    justifyContent: 'space-between',
                    opacity: count === 0 ? 0.5 : 1,
                    boxShadow: count > 0 ? `0 2px 12px ${cfg.glow}10` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{cfg.emoji}</span>
                    <span style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '99px',
                      background: `${cfg.glow}15`, color: cfg.color,
                      fontWeight: 700, border: `1px solid ${cfg.glow}25`,
                    }}>{pct}%</span>
                  </div>
                  <div>
                    <p style={{ fontSize: '28px', fontWeight: 900, color: cfg.color, margin: 0, lineHeight: 1 }}>
                      {count}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0', fontWeight: 600 }}>
                      {status}
                    </p>
                  </div>
                  {/* Mini bar */}
                  <div style={{
                    height: '3px', background: 'rgba(59,130,246,0.1)',
                    borderRadius: '99px', marginTop: '12px', overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6 + i * 0.06, duration: 0.8, ease: 'easeOut' }}
                      style={{ height: '100%', background: cfg.glow, borderRadius: '99px' }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F0F6FF; }
        ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.2); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.35); }
      `}</style>
    </div>
  );
};