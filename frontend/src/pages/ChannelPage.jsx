import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getUserChannelProfileApi, 
  getAllVideosApi, 
  getUserPlaylistsApi, 
  getUserTweetsApi,
  toggleSubscriptionApi 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { VideoCard } from '../components/videos/VideoCard';
import { CheckCircle, Tv, ListVideo, MessageSquare, Loader2 } from 'lucide-react';

export const ChannelPage = () => {
  const { username } = useParams();
  const { user, openAuthModal } = useAuth();
  
  const [channel, setChannel] = useState(null);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'playlists' | 'tweets'
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannel();
  }, [username]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const res = await getUserChannelProfileApi(username);
      if (res.data) {
        setChannel(res.data);
        if (res.data._id) {
          fetchChannelVideos(res.data._id);
          fetchChannelPlaylists(res.data._id);
          fetchChannelTweets(res.data._id);
        }
      }
    } catch (err) {
      console.error('Error fetching channel profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelVideos = async (userId) => {
    try {
      const res = await getAllVideosApi({ userId });
      if (res.data?.docs) setVideos(res.data.docs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChannelPlaylists = async (userId) => {
    try {
      const res = await getUserPlaylistsApi(userId);
      if (res.data) setPlaylists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChannelTweets = async (userId) => {
    try {
      const res = await getUserTweetsApi(userId);
      if (res.data) setTweets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) return openAuthModal();
    if (!channel?._id) return;
    try {
      const res = await toggleSubscriptionApi(channel._id);
      setChannel((prev) => ({
        ...prev,
        isSubscribed: res.data?.isSubscribed,
        subscriberscount: res.data?.isSubscribed ? prev.subscriberscount + 1 : Math.max(0, prev.subscriberscount - 1)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 size={36} color="var(--accent-amber)" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!channel) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Channel not found.</div>;
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Cover Image Banner */}
      <div style={{
        width: '100%',
        height: '200px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #171411 0%, #201c18 100%)',
        position: 'relative'
      }}>
        {channel.coverimage ? (
          <img src={channel.coverimage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--accent-gradient)', opacity: 0.2 }} />
        )}
      </div>

      {/* Profile Info Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 24px', marginTop: '-40px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img
            src={channel.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={channel.username}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid var(--bg-main)',
              boxShadow: 'var(--glow-warm)'
            }}
          />

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              {channel.fullname || channel.username}
              <CheckCircle size={18} color="var(--accent-amber)" />
            </h1>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>@{channel.username} • {channel.subscriberscount || 0} Subscribers</div>
          </div>
        </div>

        <button
          onClick={handleToggleSubscribe}
          className={channel.isSubscribed ? "btn-secondary" : "btn-primary"}
          style={{ borderRadius: '20px', padding: '10px 24px' }}
        >
          {channel.isSubscribed ? 'Subscribed' : 'Subscribe'}
        </button>
      </div>

      {/* Tabs Navbar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-warm)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('videos')}
          style={{
            padding: '8px 20px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'videos' ? 'rgba(255, 159, 28, 0.15)' : 'transparent',
            color: activeTab === 'videos' ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Tv size={16} /> Videos ({videos.length})
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          style={{
            padding: '8px 20px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'playlists' ? 'rgba(255, 159, 28, 0.15)' : 'transparent',
            color: activeTab === 'playlists' ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <ListVideo size={16} /> Playlists ({playlists.length})
        </button>

        <button
          onClick={() => setActiveTab('tweets')}
          style={{
            padding: '8px 20px',
            borderRadius: '12px',
            border: 'none',
            background: activeTab === 'tweets' ? 'rgba(255, 159, 28, 0.15)' : 'transparent',
            color: activeTab === 'tweets' ? 'var(--accent-amber)' : 'var(--text-secondary)',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Posts ({tweets.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {playlists.map((pl) => (
            <div key={pl._id} className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{pl.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pl.description}</p>
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {pl.videos?.length || 0} Videos
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tweets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
          {tweets.map((tweet) => (
            <div key={tweet._id} className="glass-card" style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{tweet.content}</p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                {new Date(tweet.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
