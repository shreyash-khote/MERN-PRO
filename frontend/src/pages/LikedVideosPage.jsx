import React, { useState, useEffect } from 'react';
import { getLikedVideosApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/videos/VideoCard';
import { Heart, Loader2 } from 'lucide-react';

export const LikedVideosPage = () => {
  const { user, openAuthModal } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLikedVideos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const res = await getLikedVideosApi();
      if (res.data) {
        // Filter valid video items
        const list = res.data.map((item) => item.video).filter(Boolean);
        setVideos(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', margin: '60px auto' }}>
        <Heart size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Liked Videos</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Sign in to view videos you have liked.</p>
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
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Heart size={24} color="var(--accent-amber)" fill="var(--accent-amber)" />
        <span>Liked Videos ({videos.length})</span>
      </h1>

      {videos.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          You haven't liked any videos yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {videos.map((vid) => (
            <VideoCard key={vid._id} video={vid} />
          ))}
        </div>
      )}
    </div>
  );
};
