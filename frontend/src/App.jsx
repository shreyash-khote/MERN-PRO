import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { UploadModal } from './components/videos/UploadModal';

import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { ChannelPage } from './pages/ChannelPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { LikedVideosPage } from './pages/LikedVideosPage';
import { PlaylistsPage } from './pages/PlaylistsPage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { TweetsPage } from './pages/TweetsPage';
import { DashboardPage } from './pages/DashboardPage';

import './styles/theme.css';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <Navbar
        toggleSidebar={toggleSidebar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <Sidebar isOpen={sidebarOpen} />

      <main style={{
        marginTop: 'var(--navbar-height)',
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
        padding: '24px',
        minHeight: 'calc(100vh - var(--navbar-height))',
        transition: 'margin-left var(--transition-normal)',
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/c/:username" element={<ChannelPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/liked-videos" element={<LikedVideosPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/tweets" element={<TweetsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>

      <AuthModal />
      <UploadModal />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

