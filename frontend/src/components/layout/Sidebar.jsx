import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Tv, 
  Heart, 
  ListVideo, 
  History, 
  MessageSquare, 
  LayoutDashboard,
  Flame,
  UserCheck
} from 'lucide-react';

export const Sidebar = ({ isOpen }) => {
  const mainNavs = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Subscriptions', icon: Tv, path: '/subscriptions' },
    { label: 'Liked Videos', icon: Heart, path: '/liked-videos' },
    { label: 'Playlists', icon: ListVideo, path: '/playlists' },
    { label: 'History', icon: History, path: '/history' },
    { label: 'Community Posts', icon: MessageSquare, path: '/tweets' },
  ];

  const creatorNavs = [
    { label: 'Creator Studio', icon: LayoutDashboard, path: '/dashboard' },
  ];

  return (
    <aside style={{
      position: 'fixed',
      top: 'var(--navbar-height)',
      left: 0,
      bottom: 0,
      width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
      backgroundColor: 'var(--bg-main)',
      borderRight: '1px solid var(--border-warm)',
      padding: isOpen ? '16px 12px' : '16px 6px',
      overflowY: 'auto',
      transition: 'width var(--transition-normal)',
      zIndex: 900,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {mainNavs.map((nav) => {
          const Icon = nav.icon;
          return (
            <NavLink
              key={nav.path}
              to={nav.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: isOpen ? '12px 16px' : '12px 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                borderRadius: '12px',
                color: isActive ? 'var(--accent-amber)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(255, 159, 28, 0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={20} />
              {isOpen && <span style={{ fontSize: '14px' }}>{nav.label}</span>}
            </NavLink>
          );
        })}
      </div>

      <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-warm)' }} />

      {isOpen && (
        <div style={{ padding: '0 12px 8px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Creator Tools
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {creatorNavs.map((nav) => {
          const Icon = nav.icon;
          return (
            <NavLink
              key={nav.path}
              to={nav.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: isOpen ? '12px 16px' : '12px 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                borderRadius: '12px',
                color: isActive ? 'var(--accent-terracotta)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(255, 107, 53, 0.12)' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <Icon size={20} />
              {isOpen && <span style={{ fontSize: '14px' }}>{nav.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};
