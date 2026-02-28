import React, { useEffect, useState } from 'react';
import { Brain, AlertTriangle, TrendingUp, Zap, Users, Shield, Activity } from 'lucide-react';
import { api } from '@/services/api';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip,
  ResponsiveContainer, Cell, BarChart, Bar, LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface EmpData {
  id: string;
  name: string;
  dept: string;
  attendance_pct: number;
  risk_score: number;
  anomaly_flag: boolean;
  anomaly_days: number;
  late_days: number;
  pattern: string;
  status: string;
  cluster: string;
  avg_arrival: string;
  days_absent: number;
}

// ─── Light Blue + White Theme ─────────────────────────────────
const FONT   = "'DM Sans', sans-serif";
const BG     = '#F0F7FF';          // very light blue page bg
const CARD   = '#FFFFFF';          // pure white cards
const BORDER = 'rgba(56,189,248,0.18)';
const TEXT   = '#0F172A';          // near black text
const MUTED  = '#64748B';
const ACCENT = '#0EA5E9';          // sky blue accent

const CLUSTER_COLORS: Record<string, { bg: string; glow: string; text: string; border: string }> = {
  Exceptional: { bg: '#F5F3FF', glow: '#7C3AED', text: '#6D28D9', border: '#DDD6FE' },
  Excellent:   { bg: '#F0FDF4', glow: '#16A34A', text: '#15803D', border: '#BBF7D0' },
  Good:        { bg: '#EFF6FF', glow: '#2563EB', text: '#1D4ED8', border: '#BFDBFE' },
  Warning:     { bg: '#FFFBEB', glow: '#D97706', text: '#B45309', border: '#FDE68A' },
  Critical:    { bg: '#FFF1F2', glow: '#E11D48', text: '#BE123C', border: '#FECDD3' },
  Severe:      { bg: '#FFF1F2', glow: '#9F1239', text: '#881337', border: '#FECDD3' },
};

const PATTERN_ICONS: Record<string, string> = {
  'Frequent Late Arrival': '⏰',
  'Biometric Issues': '🔐',
  'Significant Hours Gap': '📉',
  'Consistent': '✅',
};

// ─── Custom Scatter Dot ───────────────────────────────────────
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const isAnomaly = payload.anomaly_flag;
  const cfg = CLUSTER_COLORS[payload.cluster] || CLUSTER_COLORS.Good;
  const color = isAnomaly ? '#E11D48' : cfg.glow;
  return (
    <g>
      <circle cx={cx} cy={cy} r={isAnomaly ? 9 : 7} fill={color} fillOpacity={0.12} />
      <circle cx={cx} cy={cy} r={isAnomaly ? 5 : 4} fill={color} fillOpacity={1} />
      {isAnomaly && (
        <circle cx={cx} cy={cy} r={12} fill="none" stroke="#E11D48"
          strokeWidth={1.5} strokeOpacity={0.5} strokeDasharray="3 2" />
      )}
    </g>
  );
};

// ─── Scatter Tooltip ──────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as EmpData;
  if (!d) return null;
  const cfg = CLUSTER_COLORS[d.cluster] || CLUSTER_COLORS.Good;
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${cfg.border}`,
      borderRadius: '14px', padding: '14px 18px',
      boxShadow: '0 8px 32px rgba(14,165,233,0.15)',
      minWidth: '200px', fontFamily: FONT,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: 800, color: cfg.text,
        }}>{d.name?.[0]}</div>
        <div>
          <p style={{ color: TEXT, fontSize: '13px', fontWeight: 700, margin: 0 }}>{d.name}</p>
          <p style={{ color: MUTED, fontSize: '11px', margin: 0 }}>{d.dept}</p>
        </div>
      </div>
      {[
        ['Attendance', `${d.attendance_pct}%`, cfg.text],
        ['Risk Score', `${d.risk_score}`, d.risk_score > 60 ? '#E11D48' : '#16A34A'],
        ['Cluster', d.cluster, cfg.text],
        ['Pattern', d.pattern, MUTED],
      ].map(([k, v, c]) => (
        <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '5px' }}>
          <span style={{ fontSize: '11px', color: MUTED }}>{k}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: c as string }}>{v}</span>
        </div>
      ))}
      {d.anomaly_flag && (
        <div style={{
          marginTop: '10px', padding: '6px 10px', borderRadius: '8px',
          background: '#FFF1F2', border: '1px solid #FECDD3',
          fontSize: '11px', color: '#E11D48', fontWeight: 600, textAlign: 'center' as const,
        }}>⚠ Anomaly Flagged</div>
      )}
    </div>
  );
};

// ─── Anomaly Card ─────────────────────────────────────────────
const AnomalyCard = ({ emp, idx }: { emp: EmpData; idx: number }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.06 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 14px', borderRadius: '12px',
        background: hov ? '#FFF1F2' : '#FFFAFB',
        border: `1px solid ${hov ? '#FECDD3' : '#FFE4E6'}`,
        cursor: 'default', transition: 'all 0.18s',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
        background: '#FFF1F2', border: '1px solid #FECDD3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', fontWeight: 800, color: '#E11D48',
      }}>{emp.name?.[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT, margin: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</p>
        <p style={{ fontSize: '11px', color: '#E11D48', margin: '2px 0 0' }}>
          {PATTERN_ICONS[emp.pattern] || '⚠'} {emp.pattern}
        </p>
      </div>
      <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
        <p style={{ fontSize: '15px', fontWeight: 800, color: '#E11D48', margin: 0 }}>{emp.risk_score}</p>
        <p style={{ fontSize: '10px', color: MUTED, margin: 0 }}>risk</p>
      </div>
    </motion.div>
  );
};

// ─── Cluster Badge ────────────────────────────────────────────
const ClusterBadge = ({ label, count, total }: { label: string; count: number; total: number }) => {
  const cfg = CLUSTER_COLORS[label] || CLUSTER_COLORS.Good;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '11px 14px', borderRadius: '12px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <div style={{
        width: '9px', height: '9px', borderRadius: '50%',
        background: cfg.glow, flexShrink: 0,
        boxShadow: `0 0 6px ${cfg.glow}60`,
      }} />
      <span style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: cfg.text }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 800, color: TEXT }}>{count}</span>
      <span style={{
        fontSize: '11px', padding: '2px 8px', borderRadius: '99px',
        background: cfg.border, color: cfg.text, fontWeight: 700,
      }}>{pct}%</span>
    </div>
  );
};

// ─── Bar Tooltip ──────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: `1px solid ${BORDER}`,
      borderRadius: '10px', padding: '10px 14px', fontFamily: FONT,
      boxShadow: '0 4px 16px rgba(14,165,233,0.12)',
    }}>
      <p style={{ color: ACCENT, fontWeight: 700, margin: '0 0 2px', fontSize: '12px' }}>{label}</p>
      <p style={{ color: TEXT, fontWeight: 900, margin: 0, fontSize: '20px' }}>{payload[0].value}</p>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────
export const MLInsights = () => {
  const [data, setData] = useState<EmpData[]>([]);
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  useEffect(() => {
    api.getResults().then(res => setData(res.data));
  }, []);

  const anomalies = data.filter(d => d.anomaly_flag);
  const clusters  = ['Exceptional', 'Excellent', 'Good', 'Warning', 'Critical', 'Severe'];

  const patternCounts = data.reduce<Record<string, number>>((acc, d) => {
    acc[d.pattern] = (acc[d.pattern] || 0) + 1;
    return acc;
  }, {});
  const patternData = Object.entries(patternCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const filteredScatter = activeCluster
    ? data.filter(d => d.cluster === activeCluster)
    : data;

  const statCards = [
    { icon: <Brain size={18} />,         label: 'Total Analysed', value: data.length,          color: ACCENT,    bg: '#EFF6FF', border: '#BFDBFE', sub: 'employees'    },
    { icon: <AlertTriangle size={18} />, label: 'Anomalies',      value: anomalies.length,      color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3', sub: 'flagged by AI' },
    { icon: <Shield size={18} />,        label: 'At-Risk Rate',   value: `${data.length ? Math.round((anomalies.length / data.length) * 100) : 0}%`, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', sub: 'of workforce'  },
    { icon: <Activity size={18} />,      label: 'Avg Risk Score', value: data.length ? Math.round(data.reduce((s, d) => s + d.risk_score, 0) / data.length) : 0, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', sub: 'out of 100'    },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      padding: '40px 32px', fontFamily: FONT,
      color: TEXT, position: 'relative',
    }}>
      {/* Subtle top gradient */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '300px',
        background: 'linear-gradient(180deg, rgba(186,230,255,0.35) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '3px',
            textTransform: 'uppercase' as const, color: ACCENT, marginBottom: '6px',
          }}>Machine Learning</p>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: TEXT, margin: 0, letterSpacing: '-0.5px' }}>
            AI Analytics & Insights
          </h1>
          <p style={{ color: MUTED, margin: '6px 0 0', fontSize: '14px' }}>
            Isolation Forest anomaly detection · KMeans behavioral clustering · Risk scoring
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          {statCards.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: s.bg, border: `1px solid ${s.border}`,
                borderRadius: '16px', padding: '22px',
                boxShadow: '0 2px 12px rgba(14,165,233,0.07)',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '11px', marginBottom: '12px',
                background: '#fff', border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color,
                boxShadow: `0 2px 8px ${s.color}20`,
              }}>{s.icon}</div>
              <p style={{ fontSize: '11px', color: MUTED, textTransform: 'uppercase' as const,
                letterSpacing: '1.5px', fontWeight: 600, margin: '0 0 5px' }}>{s.label}</p>
              <p style={{ fontSize: '30px', fontWeight: 900, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: MUTED, margin: '4px 0 0' }}>{s.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Scatter + Sidebar ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>

          {/* Scatter */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '28px',
              boxShadow: '0 4px 24px rgba(14,165,233,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap' as const, gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: TEXT, margin: 0 }}>Behavioral Cluster Map</h3>
                <p style={{ fontSize: '12px', color: MUTED, margin: '3px 0 0' }}>Attendance % vs Risk Score · Click to filter</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                <button onClick={() => setActiveCluster(null)} style={{
                  padding: '5px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  border: !activeCluster ? `1px solid ${ACCENT}` : '1px solid #E2E8F0',
                  background: !activeCluster ? '#EFF6FF' : '#fff',
                  color: !activeCluster ? ACCENT : MUTED, transition: 'all 0.15s',
                }}>All</button>
                {clusters.map(cl => {
                  const cfg = CLUSTER_COLORS[cl] || CLUSTER_COLORS.Good;
                  const isActive = activeCluster === cl;
                  return (
                    <button key={cl} onClick={() => setActiveCluster(isActive ? null : cl)} style={{
                      padding: '5px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${isActive ? cfg.glow + '60' : cfg.border}`,
                      background: isActive ? cfg.bg : '#fff',
                      color: isActive ? cfg.text : MUTED, transition: 'all 0.15s',
                    }}>{cl}</button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: '340px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <XAxis type="number" dataKey="attendance_pct" name="Attendance" unit="%"
                    stroke="#E2E8F0" tick={{ fill: MUTED, fontSize: 11 }}
                    label={{ value: 'Attendance %', position: 'insideBottom', offset: -10, fill: MUTED, fontSize: 11 }} />
                  <YAxis type="number" dataKey="risk_score" name="Risk Score"
                    stroke="#E2E8F0" tick={{ fill: MUTED, fontSize: 11 }}
                    label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', fill: MUTED, fontSize: 11 }} />
                  <ZAxis type="number" range={[50, 200]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={filteredScatter} shape={<CustomDot />} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              display: 'flex', gap: '20px', marginTop: '16px', paddingTop: '16px',
              borderTop: '1px solid #F1F5F9', fontSize: '12px', color: MUTED,
            }}>
              {[
                { color: ACCENT, label: 'Normal employee' },
                { color: '#E11D48', label: 'Anomaly flagged (Isolation Forest)' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}
          >
            {/* Anomaly list */}
            <div style={{
              background: CARD, border: '1px solid #FECDD3',
              borderRadius: '20px', padding: '22px',
              boxShadow: '0 4px 16px rgba(225,29,72,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#FFF1F2', border: '1px solid #FECDD3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48',
                }}>
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: TEXT, margin: 0 }}>Anomalies Detected</h3>
                  <p style={{ fontSize: '11px', color: '#E11D48', margin: 0 }}>{anomalies.length} flagged by AI</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                <AnimatePresence>
                  {anomalies.slice(0, 5).map((a, i) => <AnomalyCard key={a.id} emp={a} idx={i} />)}
                  {anomalies.length === 0 && (
                    <div style={{ textAlign: 'center' as const, padding: '28px 0', color: MUTED, fontSize: '13px' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                      No critical anomalies found
                    </div>
                  )}
                </AnimatePresence>
                {anomalies.length > 5 && (
                  <p style={{ textAlign: 'center' as const, fontSize: '12px', color: MUTED, margin: '4px 0 0' }}>
                    +{anomalies.length - 5} more anomalies
                  </p>
                )}
              </div>
            </div>

            {/* Cluster distribution */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '22px',
              boxShadow: '0 4px 16px rgba(14,165,233,0.07)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#F5F3FF', border: '1px solid #DDD6FE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED',
                }}>
                  <Users size={17} />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 800, color: TEXT, margin: 0 }}>Cluster Distribution</h3>
                  <p style={{ fontSize: '11px', color: MUTED, margin: 0 }}>KMeans segmentation</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
                {clusters.map(cl => {
                  const count = data.filter(d => d.cluster === cl).length;
                  if (!count) return null;
                  return <ClusterBadge key={cl} label={cl} count={count} total={data.length} />;
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Pattern bar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '26px',
              boxShadow: '0 4px 20px rgba(14,165,233,0.08)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: TEXT, margin: '0 0 4px' }}>
              Behavioral Pattern Breakdown
            </h3>
            <p style={{ fontSize: '12px', color: MUTED, margin: '0 0 20px' }}>Employee count by detected pattern</p>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={patternData} layout="vertical" margin={{ left: 10, right: 44 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={165}
                    tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}
                    background={{ fill: '#F8FAFC', radius: 6 }}>
                    {patternData.map((_, idx) => (
                      <Cell key={idx} fill={[ACCENT, '#16A34A', '#D97706', '#E11D48'][idx % 4]} />
                    ))}
                    <LabelList dataKey="count" position="right"
                      style={{ fill: MUTED, fontSize: '12px', fontWeight: 700 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Key insights */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: '20px', padding: '26px',
              boxShadow: '0 4px 20px rgba(14,165,233,0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#EFF6FF', border: '1px solid #BFDBFE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT,
              }}>
                <TrendingUp size={17} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: TEXT, margin: 0 }}>Key Patterns Found</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '10px' }}>
              {[
                { icon: '🔐', title: 'Biometric Punch Failures', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
                  desc: `${data.filter(d => d.anomaly_days > 0).length} employees have 00:00 punch records — likely hardware glitches.` },
                { icon: '⏰', title: 'Late Arrival Pattern', color: ACCENT, bg: '#EFF6FF', border: '#BFDBFE',
                  desc: `${data.filter(d => d.late_days > 3).length} employees consistently arrive after 10:00 AM.` },
                { icon: '📉', title: 'Hours Shortfall', color: '#E11D48', bg: '#FFF1F2', border: '#FECDD3',
                  desc: `${data.filter(d => d.attendance_pct < 75).length} employees below 75% threshold — HR review needed.` },
                { icon: '✅', title: 'Consistent Performers', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
                  desc: `${data.filter(d => d.pattern === 'Consistent').length} employees maintain regular hours with no anomalies.` },
              ].map((insight, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  style={{
                    display: 'flex', gap: '13px', padding: '13px',
                    borderRadius: '12px',
                    background: insight.bg, border: `1px solid ${insight.border}`,
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                    background: '#fff', border: `1px solid ${insight.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                  }}>{insight.icon}</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: insight.color, margin: '0 0 3px' }}>
                      {insight.title}
                    </p>
                    <p style={{ fontSize: '12px', color: MUTED, margin: 0, lineHeight: 1.55 }}>
                      {insight.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F0F7FF; }
        ::-webkit-scrollbar-thumb { background: #BAE6FD; border-radius: 99px; }
      `}</style>
    </div>
  );
};