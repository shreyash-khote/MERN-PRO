import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserPlaylistsApi, createPlaylistApi, deletePlaylistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ListVideo, Plus, Trash2, Loader2, X } from 'lucide-react';

export const PlaylistsPage = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const res = await getUserPlaylistsApi(user._id);
      if (res.data) setPlaylists(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    try {
      const res = await createPlaylistApi({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setCreateModalOpen(false);
      if (res.data?._id) {
        navigate(`/playlist/${res.data._id}`);
      } else {
        fetchPlaylists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await deletePlaylistApi(playlistId);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', margin: '60px auto' }}>
        <ListVideo size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Your Playlists</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Sign in to create and manage custom video playlists.</p>
        <button onClick={() => openAuthModal('login')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={36} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ListVideo size={24} color="var(--accent-amber)" />
          <span>My Playlists ({playlists.length})</span>
        </h1>
        <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          You haven't created any playlists yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {playlists.map((pl) => (
            <Link
              key={pl._id}
              to={`/playlist/${pl._id}`}
              className="glass-card"
              style={{
                padding: '20px',
                position: 'relative',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <button
                onClick={(e) => handleDeletePlaylist(pl._id, e)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer', zIndex: 5 }}
              >
                <Trash2 size={16} />
              </button>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', paddingRight: '24px' }}>{pl.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{pl.description}</p>
              <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {pl.videos?.length || 0} Videos
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {createModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setCreateModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Playlist Name" value={name} onChange={(e) => setName(e.target.value)} className="input-warm" required />
              <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} className="input-warm" rows={3} required />
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>Create</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
