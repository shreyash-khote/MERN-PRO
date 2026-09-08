import React, { useState, useEffect } from 'react';
import { createTweetApi, getUserTweetsApi, deleteTweetApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';

export const TweetsPage = () => {
  const { user, openAuthModal } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTweets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await getUserTweetsApi(user._id);
      if (res.data) setTweets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    if (!content.trim()) return;

    try {
      await createTweetApi(content.trim());
      setContent('');
      fetchTweets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await deleteTweetApi(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '440px', margin: '60px auto' }}>
        <MessageSquare size={48} color="var(--accent-amber)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Community Posts</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Sign in to create and view community posts.</p>
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
    <div style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '60px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageSquare size={24} color="var(--accent-amber)" />
        <span>Community Posts</span>
      </h1>

      {/* Create Tweet Box */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <form onSubmit={handleCreateTweet}>
          <textarea
            placeholder="Share an update with your community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-warm"
            rows={3}
            style={{ marginBottom: '12px' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary">
              <Send size={16} /> Post
            </button>
          </div>
        </form>
      </div>

      {/* Tweets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tweets.map((tweet) => (
          <div key={tweet._id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                {tweet.owner?.[0]?.fullname || user.fullname}
              </div>
              <button
                onClick={() => handleDeleteTweet(tweet._id)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>{tweet.content}</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
              {new Date(tweet.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
