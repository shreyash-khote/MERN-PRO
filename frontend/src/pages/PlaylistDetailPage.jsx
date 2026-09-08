import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlaylistByIdApi, deletePlaylistApi, removeVideoFromPlaylistApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/videos/VideoCard';
import { ListVideo, Trash2, ArrowLeft, Loader2, Play } from 'lucide-react';

export const PlaylistDetailPage = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [playlistId]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const res = await getPlaylistByIdApi(playlistId);
      if (res.data) {
        setPlaylist(res.data);
      }
    } catch (err) {
      console.error('Error fetching playlist details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await deletePlaylistApi(playlistId);
      navigate('/playlists');
    } catch (err) {
      console.error('Error deleting playlist:', err);
    }
  };

  const handleRemoveVideo = async (videoId, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await removeVideoFromPlaylistApi(playlistId, videoId);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              videos: prev.videos.filter((v) => (typeof v === 'string' ? v : v._id) !== videoId),
            }
          : prev
      );
    } catch (err) {
      console.error('Error removing video from playlist:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Playlist not found.</h2>
        <button onClick={() => navigate('/playlists')} className="btn-primary">
          <ArrowLeft size={16} /> Back to Playlists
        </button>
      </div>
    );
  }

  const isOwner = user?._id && (playlist.owner?._id || playlist.owner) === user._id;
  const videos = playlist.videos || [];
  const owner = playlist.owner || {};

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header Bar */}
      <button
        onClick={() => navigate('/playlists')}
        className="btn-secondary"
        style={{ marginBottom: '20px', borderRadius: '20px', padding: '6px 14px', fontSize: '13px' }}
      >
        <ArrowLeft size={16} /> Back to Playlists
      </button>

      {/* Playlist Hero Info Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '32px', borderRadius: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <ListVideo size={28} color="var(--accent-amber)" />
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>{playlist.name}</h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', maxWidth: '600px', lineHeight: '1.5' }}>
              {playlist.description || 'No description provided.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span>Created by <strong style={{ color: 'var(--text-primary)' }}>{owner.fullname || owner.username || 'User'}</strong></span>
              <span>•</span>
              <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>{videos.length} {videos.length === 1 ? 'Video' : 'Videos'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {videos.length > 0 && (
              <Link to={`/watch/${videos[0]._id}`} className="btn-primary" style={{ textDecoration: 'none' }}>
                <Play size={16} fill="currentColor" /> Play All
              </Link>
            )}
            {isOwner && (
              <button onClick={handleDeletePlaylist} className="btn-secondary" style={{ borderColor: 'var(--accent-crimson)', color: 'var(--accent-crimson)' }}>
                <Trash2 size={16} /> Delete Playlist
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Videos List Grid */}
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
        Videos in this Playlist
      </h2>

      {videos.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No videos added to this playlist yet. Browse videos and click "Save" to add them!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {videos.map((vid) => (
            <div key={vid._id} style={{ position: 'relative' }}>
              <VideoCard video={vid} />
              {isOwner && (
                <button
                  onClick={(e) => handleRemoveVideo(vid._id, e)}
                  title="Remove from playlist"
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid var(--border-warm)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-crimson)',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
