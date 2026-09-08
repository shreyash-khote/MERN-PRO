import React, { useState, useEffect } from 'react';
import { getChannelStatsApi, getChannelVideosApi, togglePublishStatusApi, deleteVideoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Eye, Users, ThumbsUp, Video, Trash2, ToggleLeft, ToggleRight, Loader2, Plus } from 'lucide-react';

export const DashboardPage = () => {
  const { user, openAuthModal, setUploadModalOpen } = useAuth();
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, videosRes] = await Promise.all([
        getChannelStatsApi(),
        getChannelVideosApi()
      ]);
      if (statsRes.data) setStats(statsRes.data);
      if (videosRes.data) setVideos(videosRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      const res = await togglePublishStatusApi(videoId);
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: res.data.isPublished } : v))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await deleteVideoApi(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', margin: '60px auto' }}>
        <LayoutDashboard size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Creator Studio</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Sign in to view your channel analytics and manage your videos.</p>
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Creator Dashboard</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Welcome back, {user.fullname}!</p>
        </div>
        <button onClick={() => setUploadModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Upload Video
        </button>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 159, 28, 0.15)', color: 'var(--accent-amber)' }}>
            <Eye size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Views</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats?.totalViews || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(255, 107, 53, 0.15)', color: 'var(--accent-terracotta)' }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Subscribers</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats?.totalSubscribers || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(247, 197, 159, 0.15)', color: 'var(--accent-gold)' }}>
            <ThumbsUp size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Total Likes</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats?.totalLikes || 0}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '14px', background: 'rgba(230, 57, 70, 0.15)', color: 'var(--accent-crimson)' }}>
            <Video size={26} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Uploaded Videos</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{stats?.totalVideos || 0}</div>
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Uploaded Content</h2>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-warm)', color: 'var(--text-muted)', fontSize: '12px' }}>
              <th style={{ padding: '14px 18px' }}>Status</th>
              <th style={{ padding: '14px 18px' }}>Video</th>
              <th style={{ padding: '14px 18px' }}>Likes</th>
              <th style={{ padding: '14px 18px' }}>Date Uploaded</th>
              <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No videos uploaded yet.
                </td>
              </tr>
            ) : (
              videos.map((vid) => (
                <tr key={vid._id} style={{ borderBottom: '1px solid var(--border-warm)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      onClick={() => handleTogglePublish(vid._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: vid.isPublished ? '#4EAE4E' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}
                    >
                      {vid.isPublished ? <ToggleRight size={22} color="#4EAE4E" /> : <ToggleLeft size={22} />}
                      <span>{vid.isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={vid.thumbnail} alt={vid.title} style={{ width: '70px', aspectRatio: '16/9', borderRadius: '6px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vid.title}</span>
                  </td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>{vid.likesCount || 0} likes</td>

                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                    {new Date(vid.createdAt).toLocaleDateString()}
                  </td>

                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteVideo(vid._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer', padding: '6px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
