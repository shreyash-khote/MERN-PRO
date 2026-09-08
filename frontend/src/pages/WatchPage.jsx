import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getVideoByIdApi, 
  getAllVideosApi, 
  toggleVideoLikeApi, 
  toggleSubscriptionApi,
  getVideoCommentsApi,
  addCommentApi,
  deleteCommentApi,
  incrementVideoViewsApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, Eye, Share2, CheckCircle, MessageSquare, Trash2, Send, Loader2, ListVideo } from 'lucide-react';
import { AddToPlaylistModal } from '../components/playlists/AddToPlaylistModal';

export const WatchPage = () => {
  const { videoId } = useParams();
  const { user, openAuthModal } = useAuth();
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [hasCountedView, setHasCountedView] = useState(false);
  
  // Comments State
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    setHasCountedView(false);
    fetchVideoDetails();
    fetchComments();
    fetchRecommended();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      const res = await getVideoByIdApi(videoId);
      if (res.data) {
        setVideo(res.data);
      }
    } catch (err) {
      console.error('Error loading video details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!hasCountedView && videoId) {
      setHasCountedView(true);
      try {
        const res = await incrementVideoViewsApi(videoId);
        if (res.data?.views !== undefined) {
          setVideo((prev) => prev ? { ...prev, views: res.data.views } : prev);
        }
      } catch (err) {
        console.error('Error incrementing view count:', err);
      }
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await getVideoCommentsApi(videoId);
      if (res.data?.docs) {
        setComments(res.data.docs);
      } else if (Array.isArray(res.data)) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const res = await getAllVideosApi();
      if (res.data?.docs) {
        setRecommendedVideos(res.data.docs.filter((v) => v._id !== videoId));
      }
    } catch (err) {
      console.error('Error loading recommended videos:', err);
    }
  };

  const handleToggleLike = async () => {
    if (!user) return openAuthModal();
    try {
      const res = await toggleVideoLikeApi(videoId);
      setIsLiked(res.data?.isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) return openAuthModal();
    if (!video?.owner?._id) return;
    try {
      const res = await toggleSubscriptionApi(video.owner._id);
      setIsSubscribed(res.data?.isSubscribed);
      setSubscribersCount((prev) => res.data?.isSubscribed ? prev + 1 : Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    if (!newComment.trim()) return;

    try {
      await addCommentApi(videoId, newComment.trim());
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteCommentApi(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 size={40} color="var(--accent-amber)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!video) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Video not found.</div>;
  }

  const owner = video.owner || {};

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', paddingBottom: '60px' }}>
      {/* Left Main Player & Details */}
      <div>
        {/* Responsive HTML5 Player */}
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#000',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--glow-warm)'
        }}>
          <video
            src={video.videoFile}
            poster={video.thumbnail}
            controls
            autoPlay
            onPlay={handlePlay}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {/* Video Title */}
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '16px 0 12px 0' }}>{video.title}</h1>

        {/* Channel & Controls Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-warm)', paddingBottom: '16px' }}>
          {/* Creator Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={`/c/${owner.username}`}>
              <img
                src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={owner.username}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
            </Link>

            <div>
              <Link to={`/c/${owner.username}`} style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{owner.fullname || owner.username}</span>
                <CheckCircle size={14} color="var(--accent-amber)" />
              </Link>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{owner.username}</div>
            </div>

            <button
              onClick={handleToggleSubscribe}
              className={isSubscribed ? "btn-secondary" : "btn-primary"}
              style={{ marginLeft: '12px', borderRadius: '20px', padding: '8px 18px', fontSize: '13px' }}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleToggleLike}
              className="btn-secondary"
              style={{
                borderRadius: '20px',
                borderColor: isLiked ? 'var(--accent-amber)' : 'var(--border-warm)',
                color: isLiked ? 'var(--accent-amber)' : 'var(--text-primary)'
              }}
            >
              <ThumbsUp size={16} fill={isLiked ? 'var(--accent-amber)' : 'none'} />
              <span>Like</span>
            </button>

            <button
              onClick={() => {
                if (!user) return openAuthModal();
                setPlaylistModalOpen(true);
              }}
              className="btn-secondary"
              style={{ borderRadius: '20px' }}
            >
              <ListVideo size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Expandable Description Box */}
        <div className="glass-card" style={{ padding: '16px', margin: '20px 0' }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px' }}>
            <span>{video.views} views</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', whitespace: 'pre-wrap', lineHeight: '1.6' }}>
            {video.description}
          </p>
        </div>

        {/* Comments Section */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <MessageSquare size={20} color="var(--accent-amber)" />
            <span>Comments ({comments.length})</span>
          </h2>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="User"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <input
              type="text"
              placeholder={user ? "Add a public comment..." : "Sign in to add a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-warm"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 18px' }}>
              <Send size={16} />
            </button>
          </form>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {comments.map((comment) => (
              <div key={comment._id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                <img
                  src={comment.owner?.[0]?.avatar || comment.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="Commenter"
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                      {comment.owner?.[0]?.fullname || comment.owner?.fullname || 'User'}
                    </div>
                    {user?._id === (comment.owner?.[0]?._id || comment.owner?._id) && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-crimson)', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar Recommended Videos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recommended Videos</h3>
        {recommendedVideos.map((rec) => (
          <Link
            key={rec._id}
            to={`/watch/${rec._id}`}
            style={{ display: 'flex', gap: '12px', textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{ width: '120px', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
              <img src={rec.thumbnail} alt={rec.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, lineHeight: '1.3', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {rec.title}
              </h4>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rec.owner?.fullname || rec.owner?.username}</div>
            </div>
          </Link>
        ))}
      </div>

      <AddToPlaylistModal
        videoId={videoId}
        isOpen={playlistModalOpen}
        onClose={() => setPlaylistModalOpen(false)}
      />
    </div>
  );
};
