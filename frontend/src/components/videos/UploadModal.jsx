import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publishVideoApi } from '../../services/api';
import { X, Upload, Film, Image as ImageIcon, Loader2 } from 'lucide-react';

export const UploadModal = ({ onUploadSuccess }) => {
  const { uploadModalOpen, setUploadModalOpen } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!uploadModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }
    if (!thumbnailFile) {
      setError('Please select a thumbnail image.');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnailFile);

      const res = await publishVideoApi(formData);
      setUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      if (onUploadSuccess) onUploadSuccess(res.data);
    } catch (err) {
      setError(err.message || 'Failed to publish video');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="glass-card" style={{ width: '100%', maxWidth: '580px', padding: '24px', position: 'relative' }}>
        <button
          onClick={() => setUploadModalOpen(false)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--accent-gradient)' }}>
            <Upload size={20} color="#0c0a09" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Upload New Video</h2>
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'rgba(230, 57, 70, 0.15)', border: '1px solid var(--accent-crimson)', borderRadius: '10px', color: '#ff8080', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Video Title</label>
            <input
              type="text"
              placeholder="e.g. Building a Fullstack App with React & Node.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-warm"
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Description</label>
            <textarea
              placeholder="Tell viewers about your video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-warm"
              rows={3}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Video File</label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                border: '2px dashed var(--border-warm)',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
                padding: '10px',
                textAlign: 'center'
              }}>
                <Film size={24} color="var(--accent-amber)" />
                <span style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                  {videoFile ? videoFile.name : 'Select Video'}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Thumbnail Image</label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100px',
                border: '2px dashed var(--border-warm)',
                borderRadius: '12px',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
                padding: '10px',
                textAlign: 'center'
              }}>
                <ImageIcon size={24} color="var(--accent-terracotta)" />
                <span style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-muted)' }}>
                  {thumbnailFile ? thumbnailFile.name : 'Select Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Uploading to Cloudinary...</span>
                </>
              ) : (
                <span>Publish Video</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
