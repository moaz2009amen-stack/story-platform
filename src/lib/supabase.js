// هذا الملف للاستخدام في المتصفح فقط
// جميع الطلبات تمر عبر API الخاص بنا

const API_URL = '/api/supabase'

async function callAPI(action, data = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action, data }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Request failed')
  }

  return result.data
}

// ============ دوال القصص ============
export const storyHelpers = {
  getPublished: (filters) => callAPI('getPublishedStories', filters),
  getById: (id) => callAPI('getStoryById', { id }),
  getByAuthor: (authorId, { onlyPublished = true } = {}) => {
    // سيتم تنفيذها لاحقاً
    return callAPI('getStoriesByAuthor', { authorId, onlyPublished })
  },
  create: (story) => callAPI('createStory', { story }),
  update: (id, updates) => callAPI('updateStory', { id, updates }),
  delete: (id) => callAPI('deleteStory', { id }),
  incrementViews: (storyId) => callAPI('incrementViews', { storyId }),
  getAll: () => callAPI('getAllStories'),
  suspend: (id, suspended) => callAPI('suspendStory', { id, suspended }),
}

// ============ دوال الملفات الشخصية ============
export const profileHelpers = {
  getByUsername: (username) => callAPI('getProfileByUsername', { username }),
  getUserProfile: (userId) => callAPI('getUserProfile', { userId }),
  updateProfile: (userId, updates) => callAPI('updateProfile', { userId, updates }),
  getAll: () => callAPI('getAllProfiles'),
  banUser: (userId, banned) => callAPI('banUser', { userId, banned }),
  verifyUser: (userId) => callAPI('verifyUser', { userId }),
  checkUsernameUnique: (username, excludeUserId = null) => 
    callAPI('checkUsernameUnique', { username, excludeUserId }),
}

// ============ دوال الإعجابات ============
export const favoritesHelpers = {
  add: (userId, storyId) => callAPI('addFavorite', { userId, storyId }),
  remove: (userId, storyId) => callAPI('removeFavorite', { userId, storyId }),
  isFavorited: (userId, storyId) => callAPI('isFavorited', { userId, storyId }),
  getUserFavorites: (userId) => callAPI('getUserFavorites', { userId }),
}

// ============ دوال التقييمات ============
export const ratingsHelpers = {
  rate: (userId, storyId, rating, review) => 
    callAPI('rateStory', { userId, storyId, rating, review }),
  getAverageRating: (storyId) => callAPI('getAverageRating', { storyId }),
  getUserRating: (userId, storyId) => callAPI('getUserRating', { userId, storyId }),
}

// ============ دوال سجل القراءة ============
export const readingHelpers = {
  saveProgress: (userId, storyId, currentScene, progress) =>
    callAPI('saveProgress', { userId, storyId, currentScene, progress }),
  getHistory: (userId) => callAPI('getReadingHistory', { userId }),
  getProgress: (userId, storyId) => callAPI('getReadingProgress', { userId, storyId }),
}

// ============ دوال التعليقات ============
export const commentsHelpers = {
  getByStory: (storyId) => callAPI('getComments', { storyId }),
  add: (storyId, userId, content, parentId = null) =>
    callAPI('addComment', { storyId, userId, content, parentId }),
  delete: (commentId) => callAPI('deleteComment', { commentId }),
  update: (commentId, content) => callAPI('updateComment', { commentId, content }),
}

// ============ دوال الإشعارات ============
export const notificationsHelpers = {
  getUserNotifications: (userId, { limit = 20, offset = 0 } = {}) =>
    callAPI('getNotifications', { userId, limit, offset }),
  markAsRead: (notificationId) => callAPI('markNotificationAsRead', { notificationId }),
  markAllAsRead: (userId) => callAPI('markAllNotificationsAsRead', { userId }),
  getUnreadCount: (userId) => callAPI('getUnreadCount', { userId }),
}

// ============ دوال طلبات التوثيق ============
export const verificationHelpers = {
  createRequest: (userId, storiesCount) =>
    callAPI('createVerificationRequest', { userId, storiesCount }),
  getMyRequest: (userId) => callAPI('getMyVerificationRequest', { userId }),
  getPending: () => callAPI('getPendingVerificationRequests'),
  approve: (requestId, userId) => callAPI('approveVerification', { requestId, userId }),
  reject: (requestId, note) => callAPI('rejectVerification', { requestId, note }),
}
