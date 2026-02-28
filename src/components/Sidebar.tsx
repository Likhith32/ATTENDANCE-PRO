import React, { useState } from 'react';
import { LayoutDashboard, Upload, Users, Brain, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  id: 'dashboard' },
  { icon: Upload,          label: 'Upload',      id: 'upload'    },
  { icon: Users,           label: 'Employees',   id: 'employees' },
  { icon: Brain,           label: 'ML Insights', id: 'ml'        },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  return (
    <div style={{
      width: '260px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #E0F2FE 0%, #EFF8FF 50%, #F0F9FF 100%)',
      borderRight: '1px solid rgba(56,189,248,0.25)',
      display: 'flex',
      flexDirection: 'column' as const,
      position: 'fixed' as const,
      left: 0, top: 0, bottom: 0,
      zIndex: 100,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: '4px 0 24px rgba(56,189,248,0.1)',
      overflow: 'hidden',
    }}>

      {/* Ambient orbs */}
      <div style={{
        position: 'absolute', top: '-60px', left: '-60px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', right: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
      }} />

      {/* ── Logo ── */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(56,189,248,0.2)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(255,255,255,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(56,189,248,0.35)',
            boxShadow: '0 4px 16px rgba(56,189,248,0.18)',
            overflow: 'hidden',
          }}>
            {!logoError ? (
              <img
                src="https://tse4.mm.bing.net/th/id/OIP._KgEoeUCp0qBL0-lpgNXmQHaHi?pid=Api&P=0&h=180"
                alt="JNTU Logo"
                onError={() => setLogoError(true)}
                style={{ width: '44px', height: '44px', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#0369A1' }}>JN</span>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '15px', fontWeight: 900, color: '#0C4A6E', margin: 0, lineHeight: 1.2 }}>
              JNTUGV
            </h1>
            <p style={{ fontSize: '11px', color: '#0284C7', margin: '2px 0 0', fontWeight: 700,
              letterSpacing: '1.5px', textTransform: 'uppercase' as const }}>
              Attendance Pro
            </p>
          </div>
        </div>
        <div style={{
          marginTop: '16px', height: '1px',
          background: 'linear-gradient(90deg, rgba(56,189,248,0.5), rgba(56,189,248,0.05))',
        }} />
      </div>

      {/* ── Nav Label ── */}
      <p style={{
        fontSize: '10px', fontWeight: 700, color: 'rgba(2,132,199,0.5)',
        letterSpacing: '2px', textTransform: 'uppercase' as const,
        padding: '18px 22px 8px', margin: 0,
      }}>Main Menu</p>

      {/* ── Nav Items ── */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
        {navItems.map((item, index) => {
          const isActive  = activeTab === item.id;
          const isHovered = hoveredItem === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '12px',
                border: isActive ? '1px solid rgba(2,132,199,0.3)' : '1px solid transparent',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(186,230,253,0.4))'
                  : isHovered ? 'rgba(56,189,248,0.1)' : 'transparent',
                cursor: 'pointer', transition: 'all 0.18s ease',
                position: 'relative' as const, overflow: 'hidden', textAlign: 'left' as const,
                boxShadow: isActive ? '0 4px 16px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.6)' : 'none',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: '3px', borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #0284C7, #38BDF8)',
                  boxShadow: '0 0 8px rgba(2,132,199,0.5)',
                }} />
              )}
              <div style={{
                width: '34px', height: '34px', borderRadius: '9px', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? 'rgba(2,132,199,0.15)' : isHovered ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.08)',
                color: isActive ? '#0284C7' : isHovered ? '#0369A1' : '#7DD3FC',
                transition: 'all 0.18s',
                boxShadow: isActive ? '0 0 12px rgba(2,132,199,0.2)' : 'none',
                border: isActive ? '1px solid rgba(2,132,199,0.2)' : '1px solid transparent',
              }}>
                <item.icon size={17} />
              </div>
              <span style={{
                fontSize: '13px', fontWeight: isActive ? 700 : 500, flex: 1,
                color: isActive ? '#0C4A6E' : isHovered ? '#0369A1' : '#475569',
                transition: 'color 0.18s',
              }}>{item.label}</span>
              <AnimatePresence>
                {(isActive || isHovered) && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  >
                    <ChevronRight size={14} style={{ color: isActive ? '#0284C7' : '#94A3B8' }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* ── System Info Card ── */}
      <div style={{
        margin: '12px',
        padding: '14px 16px', borderRadius: '14px',
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(56,189,248,0.25)',
        boxShadow: '0 2px 12px rgba(56,189,248,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7' }}>System Online</span>
        </div>
        <p style={{ fontSize: '10px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
          JNTUGV Biometric<br />Attendance Analytics v2.0
        </p>
      </div>

      {/* bottom padding so info card doesn't hit edge */}
      <div style={{ height: '12px' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
};