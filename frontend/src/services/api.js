import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// Interceptor to handle token errors or API errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/users/login') &&
      !originalRequest.url.includes('/users/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        await api.post('/users/refresh-token');
        return api(originalRequest);
      } catch (refreshErr) {
        return Promise.reject(error.response?.data || error);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// AUTH ENDPOINTS
export const registerUserApi = (formData) => api.post('/users/register', formData);
export const loginUserApi = (credentials) => api.post('/users/login', credentials);
export const logoutUserApi = () => api.post('/users/logout');
export const getCurrentUserApi = () => api.get('/users/current-user');
export const updateAccountDetailsApi = (data) => api.patch('/users/update-account', data);
export const updateUserAvatarApi = (formData) => api.patch('/users/avatar', formData);
export const updateUserCoverImageApi = (formData) => api.patch('/users/cover-image', formData);
export const getUserChannelProfileApi = (username) => api.get(`/users/c/${username}`);
export const getWatchHistoryApi = () => api.get('/users/history');

// VIDEO ENDPOINTS
export const getAllVideosApi = (params) => api.get('/videos', { params });
export const publishVideoApi = (formData) => api.post('/videos', formData);
export const getVideoByIdApi = (videoId) => api.get(`/videos/${videoId}`);
export const incrementVideoViewsApi = (videoId) => api.patch(`/videos/views/${videoId}`);
export const updateVideoApi = (videoId, formData) => api.patch(`/videos/${videoId}`, formData);
export const deleteVideoApi = (videoId) => api.delete(`/videos/${videoId}`);
export const togglePublishStatusApi = (videoId) => api.patch(`/videos/toggle/publish/${videoId}`);

// COMMENT ENDPOINTS
export const getVideoCommentsApi = (videoId, params) => api.get(`/comments/${videoId}`, { params });
export const addCommentApi = (videoId, content) => api.post(`/comments/${videoId}`, { content });
export const updateCommentApi = (commentId, content) => api.patch(`/comments/c/${commentId}`, { content });
export const deleteCommentApi = (commentId) => api.delete(`/comments/c/${commentId}`);

// LIKE ENDPOINTS
export const toggleVideoLikeApi = (videoId) => api.post(`/likes/toggle/v/${videoId}`);
export const toggleCommentLikeApi = (commentId) => api.post(`/likes/toggle/c/${commentId}`);
export const toggleTweetLikeApi = (tweetId) => api.post(`/likes/toggle/t/${tweetId}`);
export const getLikedVideosApi = () => api.get('/likes/videos');

// PLAYLIST ENDPOINTS
export const createPlaylistApi = (data) => api.post('/playlist', data);
export const getUserPlaylistsApi = (userId) => api.get(`/playlist/user/${userId}`);
export const getPlaylistByIdApi = (playlistId) => api.get(`/playlist/${playlistId}`);
export const addVideoToPlaylistApi = (playlistId, videoId) => api.patch(`/playlist/add/${playlistId}/${videoId}`);
export const removeVideoFromPlaylistApi = (playlistId, videoId) => api.patch(`/playlist/remove/${playlistId}/${videoId}`);
export const updatePlaylistApi = (playlistId, data) => api.patch(`/playlist/${playlistId}`, data);
export const deletePlaylistApi = (playlistId) => api.delete(`/playlist/${playlistId}`);

// SUBSCRIPTION ENDPOINTS
export const toggleSubscriptionApi = (channelId) => api.post(`/subscriptions/c/${channelId}`);
export const getUserChannelSubscribersApi = (channelId) => api.get(`/subscriptions/c/${channelId}`);
export const getSubscribedChannelsApi = (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`);

// TWEET ENDPOINTS
export const createTweetApi = (content) => api.post('/tweets', { content });
export const getUserTweetsApi = (userId) => api.get(`/tweets/user/${userId}`);
export const updateTweetApi = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });
export const deleteTweetApi = (tweetId) => api.delete(`/tweets/${tweetId}`);

// DASHBOARD ENDPOINTS
export const getChannelStatsApi = () => api.get('/dashboard/stats');
export const getChannelVideosApi = () => api.get('/dashboard/videos');

export default api;
