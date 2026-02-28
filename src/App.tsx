import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from './pages/UploadPage';
import { EmployeeTable } from './pages/EmployeeTable';
import { MLInsights } from './pages/MLInsights';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const handleSelectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    setActiveTab('profile');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#060A10',
    }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{
        marginLeft: '260px',   /* pushes content past the fixed sidebar */
        flex: 1,
        minHeight: '100vh',
        overflow: 'auto',
        background: '#060A10',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'upload' && (
              <UploadPage onCalculate={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'employees' && (
              <EmployeeTable onSelect={handleSelectEmployee} />
            )}
            {activeTab === 'profile' && selectedEmployee && (
              <EmployeeProfile
                employee={selectedEmployee}
                onBack={() => setActiveTab('employees')}
              />
            )}
            {activeTab === 'ml' && <MLInsights />}
            {activeTab === 'reports' && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: '70vh', gap: '10px',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: '#334155', fontStyle: 'italic', margin: 0 }}>
                  Coming Soon
                </p>
                <p style={{ color: '#475569', margin: 0 }}>
                  Developing reports analytics...
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;