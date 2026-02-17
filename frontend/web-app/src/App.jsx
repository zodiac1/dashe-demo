


import OverviewPage from './pages/overview/OverviewPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import LoginPage from './pages/login/LoginPage';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import { useState, useEffect } from 'react';
import { useSession } from './contexts/SessionContext';
import './App.css';

import { SessionProvider } from './contexts/SessionContext';



function AppRoutes() {
  const { session, saveSession, clearSession } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isLoggedIn = !!session.access_token;

  if (!isLoggedIn && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }
  if (isLoggedIn && location.pathname === '/login') {
    return <Navigate to="/overview" replace />;
  }

  if (!isLoggedIn) {
    return <Routes>
      <Route path="/login" element={<LoginPage onLogin={({ access_token, username, role }) => saveSession({ access_token, username, role })} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>;
  }

  function handleLogout() {
    clearSession();
  }

  return (
    <div style={{minHeight:'100vh', background:'var(--background)'}}>
      {/* Burger menu button */}
      <button
        aria-label="Open sidebar menu"
        style={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 101,
          background: 'var(--surface)',
          border: 'none',
          borderRadius: 8,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          cursor: 'pointer',
          padding: 0,
        }}
        onClick={() => setSidebarOpen(true)}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
          <rect y="6" width="28" height="3" rx="1.5" fill="#222" />
          <rect y="13" width="28" height="3" rx="1.5" fill="#222" />
          <rect y="20" width="28" height="3" rx="1.5" fill="#222" />
        </svg>
      </button>
      {/* Sidebar overlay and backdrop */}
      {sidebarOpen && (
        <>
          <div
            onClick={()=>setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(18,28,52,0.45)',
              zIndex: 1001,
              transition: 'background 0.2s',
            }}
          />
          <Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} user={{ username: session.username }} role={session.role} />
        </>
      )}
      {/* Main content overlayed by sidebar */}
      <main style={{flex:1, padding:'0', minHeight:'100vh', marginLeft:0}}>
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/analytics" element={
            session.role === 'admin' ? <AnalyticsPage /> : <Navigate to="/overview" replace />
          } />
          <Route path="/logout" element={<Logout onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}


function Logout({ onLogout }) {
  useEffect(() => {
    onLogout();
    // eslint-disable-next-line
  }, []);
  return <Navigate to="/login" replace />;
}


function App() {
  return (
    <SessionProvider>
      <AppRoutes />
    </SessionProvider>
  );
}

export default App;
