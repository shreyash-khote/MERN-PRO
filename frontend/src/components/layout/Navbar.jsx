import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  Search, 
  Upload, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  History, 
  Heart,
  Video
} from 'lucide-react';

export const Navbar = ({ toggleSidebar, searchQuery, setSearchQuery }) => {
  const { user, logout, openAuthModal, setUploadModalOpen } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--navbar-height)',
      backgroundColor: 'rgba(12, 10, 9, 0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-warm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
    }}>
      {/* Left Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Menu size={22} />
        </button>

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--glow-warm)'
          }}>
            <Play size={20} color="#0c0a09" fill="#0c0a09" style={{ marginLeft: '2px' }} />
          </div>
          <span style={{
            fontFamily: 'Outfit',
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #fff8f0 0%, #ff9f1c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            AmberTube
          </span>
        </Link>
      </div>

      {/* Middle Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ flex: '0 1 520px', display: 'flex' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search videos, creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-warm"
            style={{
              paddingRight: '48px',
              borderRadius: '24px 0 0 24px',
              background: 'var(--bg-secondary)',
              borderRight: 'none'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-warm)',
            borderLeft: 'none',
            borderRadius: '0 24px 24px 0',
            padding: '0 20px',
            color: 'var(--accent-amber)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <Search size={18} />
        </button>
      </form>

      {/* Right User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="btn-secondary"
              style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '13px' }}
            >
              <Upload size={16} />
              <span>Create</span>
            </button>

            <Link
              to="/dashboard"
              className="btn-secondary"
              style={{ borderRadius: '20px', padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
            >
              <LayoutDashboard size={16} />
              <span>Studio</span>
            </Link>

            {/* Profile Menu */}
            <div style={{ position: 'relative' }}>
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.username}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  cursor: 'pointer',
                  border: '2px solid var(--accent-terracotta)',
                  boxShadow: 'var(--glow-amber)'
                }}
              />

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  right: 0,
                  width: '220px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-warm)',
                  borderRadius: '16px',
                  padding: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  zIndex: 100
                }}>
                  <div style={{ padding: '10px', borderBottom: '1px solid var(--border-warm)', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{user.fullname}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{user.username}</div>
                  </div>

                  <Link
                    to={`/c/${user.username}`}
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      transition: 'background 0.15s'
                    }}
                  >
                    <User size={16} /> Your Channel
                  </Link>

                  <Link
                    to="/history"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <History size={16} /> Watch History
                  </Link>

                  <Link
                    to="/liked-videos"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <Heart size={16} /> Liked Videos
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      color: 'var(--accent-crimson)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      marginTop: '4px',
                      borderRadius: '8px'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="btn-primary"
            style={{ borderRadius: '20px' }}
          >
            <User size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
