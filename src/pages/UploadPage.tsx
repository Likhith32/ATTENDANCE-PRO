import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, ChevronRight, Loader2, X, Zap, Brain, Clock } from 'lucide-react';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Theme ────────────────────────────────────────────────────
const FONT   = "'DM Sans', sans-serif";
const BG     = '#F0F7FF';
const CARD   = '#FFFFFF';
const ACCENT = '#0EA5E9';
const TEXT   = '#0F172A';
const MUTED  = '#64748B';
const BORDER = 'rgba(14,165,233,0.18)';

export const UploadPage = ({ onCalculate }: { onCalculate: () => void }) => {
  const [file, setFile]                   = useState<File | null>(null);
  const [isDragging, setIsDragging]       = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stats, setStats]                 = useState<{ employees: number; pages: string } | null>(null);
  const [workingDays, setWorkingDays]     = useState(24);
  const [standardHours, setStandardHours] = useState(8);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [calcHov, setCalcHov]             = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    const VALID_EXTS = ['.pdf', '.csv', '.xlsx', '.xls'];
    if (f && VALID_EXTS.some(ext => f.name.toLowerCase().endsWith(ext))) {
      setFile(f); setError(null);
    } else setError('Only PDF, CSV, XLSX or XLS files are accepted.');
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12;
      if (progress >= 90) { progress = 90; clearInterval(interval); }
      setUploadProgress(Math.round(progress));
    }, 300);
    try {
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
      const res = await (isExcel ? api.uploadExcel(file) : api.uploadPdf(file));
      clearInterval(interval);
      setUploadProgress(100);
      setStats({ 
        employees: res.data.employees_detected, 
        pages: res.data.pages || res.data.sheets || "All" 
      });
    } catch (err: any) {
      clearInterval(interval);
      setUploadProgress(0);
      setError(err?.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCalculate = async () => {
    if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid email address or leave it blank.');
      return;
    }
    setError(null);
    setIsCalculating(true);
    try {
      await api.calculate(workingDays, standardHours, recipientEmail);
      onCalculate();
    } catch (err) {
      setError('Calculation failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const handleTestEmail = async () => {
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      setError('Please enter a valid recipient email to send a test.');
      return;
    }
    setError(null);
    setIsTestingEmail(true);
    try {
      await api.testEmail(recipientEmail);
      alert('Test report sent! Please check your inbox (and spam folder).');
    } catch (err) {
      setError('Test email failed. Check your SMTP settings in .env');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const resetFile = () => { setFile(null); setStats(null); setError(null); setUploadProgress(0); };

  return (
    <div style={{
      minHeight: '100vh', background: BG,
      padding: '40px 32px', fontFamily: FONT, color: TEXT,
      position: 'relative',
    }}>
      {/* Soft top gradient */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '280px',
        background: 'linear-gradient(180deg, rgba(186,230,255,0.4) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '11px', fontWeight: 700, letterSpacing: '3px',
            textTransform: 'uppercase' as const, color: ACCENT, marginBottom: '6px',
          }}>JNTUGV Attendance System</p>
          <h1 style={{ fontSize: '32px', fontWeight: 900, color: TEXT, margin: 0, letterSpacing: '-0.5px' }}>
            Upload Attendance File
          </h1>
          <p style={{ color: MUTED, margin: '6px 0 0', fontSize: '14px' }}>
            Drag and drop your biometric report or Excel export to start analysis.
          </p>
        </motion.div>

        {/* ── Drop Zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            background: isDragging ? '#EFF6FF' : CARD,
            border: `2px dashed ${isDragging ? ACCENT : file ? '#BBF7D0' : BORDER}`,
            borderRadius: '24px',
            padding: '48px 32px',
            marginBottom: '24px',
            textAlign: 'center' as const,
            transition: 'all 0.2s ease',
            boxShadow: isDragging
              ? `0 0 0 4px rgba(14,165,233,0.1), 0 8px 32px rgba(14,165,233,0.1)`
              : '0 4px 24px rgba(14,165,233,0.07)',
            cursor: file ? 'default' : 'pointer',
          }}
          onClick={() => !file && document.getElementById('fileInput')?.click()}
        >
          <input
            type="file" id="fileInput" accept=".pdf,.csv,.xlsx,.xls" style={{ display: 'none' }}
            onChange={e => { 
              const f = e.target.files?.[0]; 
              if (f) { setFile(f); setError(null); } 
            }}
          />

          {!file ? (
            /* ── Empty state ── */
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '12px' }}>
              <motion.div
                animate={{ y: isDragging ? -8 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: isDragging ? ACCENT : '#EFF6FF',
                  border: `1px solid ${isDragging ? ACCENT : '#BFDBFE'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '4px',
                  boxShadow: isDragging ? `0 8px 24px rgba(14,165,233,0.3)` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Upload size={30} color={isDragging ? '#fff' : ACCENT} />
              </motion.div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: TEXT, margin: 0 }}>
                {isDragging ? 'Release to Upload' : 'Drop your file here'}
              </p>
              <p style={{ fontSize: '14px', color: MUTED, margin: 0 }}>
                or <span style={{ color: ACCENT, fontWeight: 700, cursor: 'pointer' }}>click to browse files</span>
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '99px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                fontSize: '12px', color: MUTED, marginTop: '4px',
              }}>
                <FileText size={13} /> PDF, CSV, XLSX, XLS · Any size
              </div>
            </div>
          ) : (
            /* ── File selected state ── */
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '18px', alignItems: 'stretch' }}>

              {/* File info row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px', borderRadius: '14px',
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                textAlign: 'left' as const,
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                  background: '#FFF1F2', border: '1px solid #FECDD3',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={20} color="#E11D48" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: TEXT, margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '12px', color: MUTED, margin: '2px 0 0' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB · {file.name.split('.').pop()?.toUpperCase()} Document
                  </p>
                </div>
                {!stats && (
                  <button onClick={e => { e.stopPropagation(); resetFile(); }} style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid #E2E8F0', background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: MUTED, flexShrink: 0,
                  }}>
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '14px 18px', borderRadius: '14px',
                      background: '#EFF6FF', border: '1px solid #BFDBFE',
                      textAlign: 'left' as const,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', color: ACCENT, fontWeight: 600, fontStyle: 'italic' }}>
                          Processing biometric data…
                        </span>
                        <span style={{ fontSize: '13px', color: ACCENT, fontWeight: 800 }}>
                          {uploadProgress}%
                        </span>
                      </div>
                      <div style={{
                        height: '8px', borderRadius: '99px',
                        background: 'rgba(14,165,233,0.15)', overflow: 'hidden',
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          style={{
                            height: '100%', borderRadius: '99px',
                            background: `linear-gradient(90deg, ${ACCENT}, #38BDF8)`,
                            boxShadow: '0 0 8px rgba(14,165,233,0.4)',
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      padding: '12px 16px', borderRadius: '12px',
                      background: '#FFF1F2', border: '1px solid #FECDD3',
                      fontSize: '13px', color: '#E11D48', fontWeight: 600,
                      textAlign: 'left' as const,
                    }}>
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success alert */}
              <AnimatePresence>
                {stats && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 18px', borderRadius: '14px',
                      background: '#F0FDF4', border: '1px solid #BBF7D0',
                      textAlign: 'left' as const,
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                      background: '#DCFCE7', border: '1px solid #BBF7D0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={22} color="#16A34A" />
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#15803D', margin: 0 }}>
                        Upload Successful!
                      </p>
                      <p style={{ fontSize: '13px', color: '#16A34A', margin: '2px 0 0' }}>
                        Detected <strong>{stats.employees}</strong> employees from {stats.pages} pages.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload / status button */}
              {!stats && (
                <button
                  onClick={e => { e.stopPropagation(); handleUpload(); }}
                  disabled={isUploading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    padding: '14px 24px', borderRadius: '14px',
                    background: isUploading ? '#EFF6FF' : `linear-gradient(135deg, ${ACCENT}, #38BDF8)`,
                    border: `1px solid ${isUploading ? '#BFDBFE' : 'transparent'}`,
                    color: isUploading ? ACCENT : '#fff',
                    fontSize: '15px', fontWeight: 700, cursor: isUploading ? 'not-allowed' : 'pointer',
                    boxShadow: isUploading ? 'none' : '0 4px 16px rgba(14,165,233,0.35)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isUploading
                    ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Parsing File…</>
                    : <><Upload size={18} /> Start Analysis</>
                  }
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Parameters + Rules ── */}
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              {/* Parameters card */}
              <div style={{
                background: CARD, border: `1px solid ${BORDER}`,
                borderRadius: '20px', padding: '28px',
                boxShadow: '0 4px 20px rgba(14,165,233,0.08)',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: TEXT, margin: '0 0 20px' }}>
                  Calculation Parameters
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '16px' }}>
                    {[
                      { label: 'Total Working Days', val: workingDays, setter: setWorkingDays, placeholder: '24', type: 'number' },
                      { label: 'Standard Hours Per Day', val: standardHours, setter: setStandardHours, placeholder: '8', type: 'number' },
                      { label: 'Alert Email (Recipient)', val: recipientEmail, setter: setRecipientEmail, placeholder: 'principal@jntugv.ac.in', type: 'email' },
                    ].map(({ label, val, setter, placeholder, type }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column' as const, gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: MUTED,
                          textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          value={val}
                          placeholder={placeholder}
                          onChange={e => {
                            if (type === 'number') (setter as (v: number) => void)(Number(e.target.value));
                            else (setter as (v: string) => void)(e.target.value);
                          }}
                          style={{
                            padding: '11px 14px', borderRadius: '11px',
                            border: '1px solid #E2E8F0', background: '#F8FAFC',
                            fontSize: '15px', fontWeight: 700, color: TEXT, outline: 'none',
                            transition: 'border-color 0.18s',
                            fontFamily: FONT,
                          }}
                          onFocus={e => (e.target.style.borderColor = ACCENT)}
                          onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                        />
                      </div>
                    ))}

                  {/* Target hours preview */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '10px',
                    background: '#EFF6FF', border: '1px solid #BFDBFE',
                  }}>
                    <span style={{ fontSize: '13px', color: MUTED }}>Target Hours / Employee</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: ACCENT }}>
                      {workingDays * standardHours}h
                    </span>
                  </div>

                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    onMouseEnter={() => setCalcHov(true)}
                    onMouseLeave={() => setCalcHov(false)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      padding: '14px 24px', borderRadius: '13px',
                      background: isCalculating
                        ? '#EFF6FF'
                        : calcHov
                          ? 'linear-gradient(135deg, #0284C7, #0EA5E9)'
                          : `linear-gradient(135deg, ${ACCENT}, #38BDF8)`,
                      border: 'none',
                      color: isCalculating ? ACCENT : '#fff',
                      fontSize: '15px', fontWeight: 700,
                      cursor: isCalculating ? 'not-allowed' : 'pointer',
                      boxShadow: isCalculating ? 'none' : '0 4px 16px rgba(14,165,233,0.35)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCalculating
                      ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Calculating…</>
                      : <>Generate Dashboard <ChevronRight size={18} /></>
                    }
                  </button>
                </div>
              </div>

              {/* Rules preview */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '14px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 700, color: MUTED,
                  textTransform: 'uppercase' as const, letterSpacing: '2px',
                  margin: 0,
                }}>Analysis Rules</p>

                {[
                  {
                    icon: <Clock size={18} />,
                    label: 'Working Hours',
                    value: `${workingDays * standardHours} hrs`,
                    color: ACCENT, bg: '#EFF6FF', border: '#BFDBFE',
                    desc: `${workingDays} days × ${standardHours}h per day`,
                  },
                  {
                    icon: <Zap size={18} />,
                    label: 'Anomaly Threshold',
                    value: '00:00 Punch',
                    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
                    desc: 'Days with no valid biometric record',
                  },
                  {
                    icon: <Brain size={18} />,
                    label: 'ML Analytics',
                    value: 'Enabled',
                    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
                    desc: 'IsolationForest + KMeans clustering',
                  },
                ].map((rule) => (
                  <div key={rule.label} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 18px', borderRadius: '16px',
                    background: rule.bg, border: `1px solid ${rule.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                      background: '#fff', border: `1px solid ${rule.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: rule.color,
                    }}>{rule.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color: MUTED, margin: '0 0 2px',
                        textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>
                        {rule.label}
                      </p>
                      <p style={{ fontSize: '12px', color: rule.color + 'AA', margin: 0 }}>{rule.desc}</p>
                    </div>
                    <span style={{
                      fontSize: '14px', fontWeight: 800, color: rule.color,
                      whiteSpace: 'nowrap' as const,
                    }}>{rule.value}</span>
                  </div>
                ))}

                {/* Step indicator */}
                <div style={{
                  padding: '16px 18px', borderRadius: '16px',
                  background: CARD, border: `1px solid ${BORDER}`,
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: MUTED,
                    textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 12px' }}>
                    Next Steps
                  </p>
                  {[
                    { step: 1, label: 'Set parameters above', done: true },
                    { step: 2, label: 'Click Generate Dashboard', done: false },
                    { step: 3, label: 'View insights & reports', done: false },
                  ].map(s => (
                    <div key={s.step} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
                    }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                        background: s.done ? '#DCFCE7' : '#EFF6FF',
                        border: `1px solid ${s.done ? '#BBF7D0' : '#BFDBFE'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '10px', fontWeight: 800,
                        color: s.done ? '#16A34A' : ACCENT,
                      }}>{s.done ? '✓' : s.step}</div>
                      <span style={{ fontSize: '12px', color: s.done ? '#16A34A' : MUTED, fontWeight: s.done ? 600 : 400 }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #F0F7FF; }
        ::-webkit-scrollbar-thumb { background: #BAE6FD; border-radius: 99px; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>
    </div>
  );
};