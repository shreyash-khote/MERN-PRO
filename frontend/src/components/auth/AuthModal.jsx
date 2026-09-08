import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, UserPlus, LogIn, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, login, register } = useAuth();
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverimage, setCoverimage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError('Please enter username/email and password');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const credentials = loginIdentifier.includes('@')
        ? { email: loginIdentifier, password: loginPassword }
        : { username: loginIdentifier, password: loginPassword };
      
      await login(credentials);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      setError('Avatar image is required for registration.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('fullname', fullname);
      formData.append('email', email);
      formData.append('username', username);
      formData.append('password', password);
      formData.append('avatar', avatar);
      if (coverimage) formData.append('coverimage', coverimage);

      await register(formData);
      setError('');
      alert('Registration successful! Please sign in with your credentials.');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '460px', padding: '24px', position: 'relative' }}>
        <button
          onClick={() => setAuthModalOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Tab Header */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-warm)', paddingBottom: '14px', marginBottom: '20px' }}>
          <button
            onClick={() => { setAuthModalTab('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: authModalTab === 'login' ? 'var(--accent-gradient)' : 'transparent',
              color: authModalTab === 'login' ? '#0c0a09' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            onClick={() => { setAuthModalTab('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: authModalTab === 'register' ? 'var(--accent-gradient)' : 'transparent',
              color: authModalTab === 'register' ? '#0c0a09' : 'var(--text-secondary)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(230, 57, 70, 0.15)', border: '1px solid var(--accent-crimson)', borderRadius: '10px', color: '#ff8080', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {authModalTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Username or Email</label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                className="input-warm"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input-warm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px', justifyContent: 'center' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <span>Sign In</span>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Full Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="input-warm"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Username</label>
              <input
                type="text"
                placeholder="alexmorgan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-warm"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Email</label>
              <input
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-warm"
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-warm"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Avatar File *</label>
                <label style={{ display: 'block', padding: '8px', border: '1px dashed var(--border-warm)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: 'var(--bg-secondary)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {avatar ? avatar.name : 'Choose Avatar'}
                  <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} style={{ display: 'none' }} />
                </label>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Cover Image</label>
                <label style={{ display: 'block', padding: '8px', border: '1px dashed var(--border-warm)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: 'var(--bg-secondary)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {coverimage ? coverimage.name : 'Choose Cover'}
                  <input type="file" accept="image/*" onChange={(e) => setCoverimage(e.target.files[0])} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px', justifyContent: 'center' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <span>Create Account</span>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
