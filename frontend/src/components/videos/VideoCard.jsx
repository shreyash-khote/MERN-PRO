import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, CheckCircle } from 'lucide-react';

export const VideoCard = ({ video }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const owner = video.owner || {};

  return (
    <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Thumbnail Container */}
      <Link to={`/watch/${video._id}`} style={{ position: 'relative', display: 'block', width: '100%', paddingTop: '56.25%', background: '#171411' }}>
        <img
          src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
          alt={video.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
          <span className="badge-duration">{formatDuration(video.duration)}</span>
        </div>
      </Link>

      {/* Info Container */}
      <div style={{ padding: '16px', display: 'flex', gap: '12px', flex: 1 }}>
        <Link to={`/c/${owner.username || ''}`} style={{ textDecoration: 'none' }}>
          <img
            src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={owner.username}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid var(--border-warm)'
            }}
          />
        </Link>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Link to={`/watch/${video._id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: '1.3',
              marginBottom: '4px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {video.title}
            </h3>
          </Link>

          <Link to={`/c/${owner.username || ''}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px' }}>
            <span>{owner.fullname || owner.username || 'Creator'}</span>
            <CheckCircle size={12} color="var(--accent-amber)" />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={12} /> {formatViews(video.views)}
            </span>
            <span>•</span>
            <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
