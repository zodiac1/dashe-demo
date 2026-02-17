import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ open, onClose, user, role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  // Sidebar content
  return (
    <aside
      className={open ? 'sidebar-menu open' : 'sidebar-menu'}
      style={{
        width: 220,
        background: 'linear-gradient(120deg, #232526 0%, #414345 100%)',
        height: '100vh',
        padding: '1.2rem 1rem 0.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        boxShadow: '2px 0 16px rgba(0,0,0,0.10)',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1002,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.5s cubic-bezier(.4,2,.6,1)',
        color: '#fbbf24',
        borderRight: '1.5px solid #232526',
      }}
    >
      {/* Avatar and username */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.3rem',marginBottom:'1.1rem',width:'100%'}}>
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=232526&color=fbbf24&size=88&rounded=true`}
          alt="avatar"
          style={{width:72,height:72,borderRadius:'50%',background:'#232526',objectFit:'cover',border:'2.5px solid #fbbf24',boxShadow:'0 2px 8px rgba(0,0,0,0.13)'}}
        />
        <div style={{fontWeight:700,fontSize:'1.08rem',color:'#fbbf24',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:'0.3rem',letterSpacing:'-0.5px'}}>
          {user?.username || 'User'}
        </div>
      </div>
      <button
        className={current === '/overview' ? 'yellow-button' : 'menu-button'}
        style={{
          width:'100%',
          minWidth:0,
          justifyContent:'center',
          fontSize:17,
          color: current === '/overview' ? '#232526' : '#fbbf24',
          background: current === '/overview' ? '#fbbf24' : 'rgba(36,36,40,0.95)',
          border: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '0.7rem 0',
          marginBottom: 2,
          boxShadow: current === '/overview' ? '0 2px 8px rgba(251,191,36,0.08)' : 'none',
          transition: 'background 0.2s,color 0.2s',
        }}
        onClick={()=>{navigate('/overview');onClose();}}
        title="Overview"
      >
        Overview
      </button>
      {role === 'admin' && (
        <button
          className={current === '/analytics' ? 'yellow-button' : 'menu-button'}
          style={{
            width:'100%',
            minWidth:0,
            justifyContent:'center',
            fontSize:17,
            color: current === '/analytics' ? '#232526' : '#fbbf24',
            background: current === '/analytics' ? '#fbbf24' : 'rgba(36,36,40,0.95)',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            padding: '0.7rem 0',
            marginBottom: 2,
            boxShadow: current === '/analytics' ? '0 2px 8px rgba(251,191,36,0.08)' : 'none',
            transition: 'background 0.2s,color 0.2s',
          }}
          onClick={()=>{navigate('/analytics');onClose();}}
          title="Analytics"
        >
          Analytics
        </button>
      )}
      <div style={{flex:1}} />
      <button
        style={{
          width: '100%',
          background: 'rgba(251,191,36,0.95)',
          color: '#232526',
          borderRadius: 18,
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 'calc(3.5rem)',
          maxWidth: '100%',
          boxSizing: 'border-box',
          alignSelf: 'flex-end',
          border: 'none',
          padding: '0.7rem 0',
          boxShadow: '0 2px 8px rgba(251,191,36,0.08)',
          letterSpacing: '0.5px',
          transition: 'background 0.2s,color 0.2s',
        }}
        onClick={()=>{navigate('/logout');onClose();}}
        title="Logout"
      >
        Logout
      </button>
      </aside>
  );
}
