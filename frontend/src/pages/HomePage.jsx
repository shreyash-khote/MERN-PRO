import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllVideosApi } from '../services/api';
import { VideoCard } from '../components/videos/VideoCard';
import { Flame, Loader2, Sparkles } from 'lucide-react';

export const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('query') || '';

  const categories = ['All', 'Trending'];

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (activeCategory !== 'All' && !searchQuery) params.query = activeCategory;

      const res = await getAllVideosApi(params);
      if (res.data?.docs) {
        setVideos(res.data.docs);
      } else if (Array.isArray(res.data)) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, activeCategory]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Category Chips Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '16px',
        marginBottom: '24px',
        scrollbarWidth: 'none'
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid var(--border-warm)',
              background: activeCategory === cat ? 'var(--accent-gradient)' : 'var(--bg-surface)',
              color: activeCategory === cat ? '#0c0a09' : 'var(--text-secondary)',
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {searchQuery && (
        <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 700 }}>
          Results for <span style={{ color: 'var(--accent-amber)' }}>"{searchQuery}"</span>
        </div>
      )}

      {/* Videos Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Loader2 size={36} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
          <Sparkles size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>No Videos Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Be the first creator to upload a video to AmberTube!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
