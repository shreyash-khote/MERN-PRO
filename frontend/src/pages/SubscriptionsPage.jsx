import React, { useState, useEffect } from 'react';
import { getSubscribedChannelsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Tv, CheckCircle, Loader2 } from 'lucide-react';

export const SubscriptionsPage = () => {
  const { user, openAuthModal } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getSubscribedChannelsApi(user._id);
      if (res.data) {
        setChannels(res.data);
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
        <Tv size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Subscriptions</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Sign in to see updates from your favorite creators.</p>
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
        <Tv size={24} color="var(--accent-amber)" />
        <span>Subscribed Channels ({channels.length})</span>
      </h1>

      {channels.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          You haven't subscribed to any channels yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {channels.map((item) => {
            const ch = item.subscribedChannel || {};
            return (
              <Link
                key={item._id}
                to={`/c/${ch.username}`}
                className="glass-card"
                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none' }}
              >
                <img
                  src={ch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={ch.username}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-amber)' }}
                />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {ch.fullname || ch.username}
                    <CheckCircle size={14} color="var(--accent-amber)" />
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{ch.username}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
