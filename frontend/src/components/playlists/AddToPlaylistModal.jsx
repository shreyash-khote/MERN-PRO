import React, { useState, useEffect } from 'react';
import { getUserPlaylistsApi, addVideoToPlaylistApi, removeVideoFromPlaylistApi, createPlaylistApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Check, ListVideo, Loader2 } from 'lucide-react';

export const AddToPlaylistModal = ({ videoId, isOpen, onClose }) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchUserPlaylists();
    }
  }, [isOpen, user]);

  const fetchUserPlaylists = async () => {
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

  const handleToggleVideoInPlaylist = async (playlist) => {
    const isVideoInPlaylist = playlist.videos?.some(
      (v) => (typeof v === 'string' ? v : v._id) === videoId
    );

    try {
      if (isVideoInPlaylist) {
        await removeVideoFromPlaylistApi(playlist._id, videoId);
        setPlaylists((prev) =>
          prev.map((pl) =>
            pl._id === playlist._id
              ? { ...pl, videos: pl.videos.filter((v) => (typeof v === 'string' ? v : v._id) !== videoId) }
              : pl
          )
        );
      } else {
        await addVideoToPlaylistApi(playlist._id, videoId);
        setPlaylists((prev) =>
          prev.map((pl) =>
            pl._id === playlist._id ? { ...pl, videos: [...(pl.videos || []), videoId] } : pl
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    try {
      setCreating(true);
      const res = await createPlaylistApi({
        name: newPlaylistName.trim(),
        description: 'Custom video playlist'
      });
      if (res.data?._id) {
        await addVideoToPlaylistApi(res.data._id, videoId);
      }
      setNewPlaylistName('');
      setShowCreate(false);
      fetchUserPlaylists();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

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
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListVideo size={20} color="var(--accent-amber)" /> Save video to...
        </h2>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <Loader2 size={28} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
            {playlists.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
                No playlists yet. Create one below!
              </div>
            ) : (
              playlists.map((playlist) => {
                const inPlaylist = playlist.videos?.some(
                  (v) => (typeof v === 'string' ? v : v._id) === videoId
                );
                return (
                  <button
                    key={playlist._id}
                    onClick={() => handleToggleVideoInPlaylist(playlist)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: inPlaylist ? 'rgba(255, 159, 28, 0.15)' : 'var(--bg-secondary)',
                      border: '1px solid var(--border-warm)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600
                    }}
                  >
                    <span>{playlist.name}</span>
                    {inPlaylist && <Check size={16} color="var(--accent-amber)" />}
                  </button>
                );
              })
            )}
          </div>
        )}

        {showCreate ? (
          <form onSubmit={handleCreateNewPlaylist} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Playlist Title"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="input-warm"
              required
            />
            <button type="submit" disabled={creating} className="btn-primary" style={{ padding: '0 16px' }}>
              {creating ? <Loader2 size={16} className="spin" /> : 'Create'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={16} /> Create new playlist
          </button>
        )}
      </div>
    </div>
  );
};
