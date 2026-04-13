import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      cacheTime: 1000 * 60 * 10, // 10 دقائق
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// مساعدات React Query
export const queryKeys = {
  stories: {
    all: ['stories'],
    published: (filters) => ['stories', 'published', filters],
    detail: (id) => ['stories', 'detail', id],
    byAuthor: (authorId) => ['stories', 'byAuthor', authorId],
    admin: ['stories', 'admin'],
  },
  profile: {
    current: ['profile', 'current'],
    byUsername: (username) => ['profile', 'byUsername', username],
    admin: ['profile', 'admin'],
  },
  favorites: {
    all: ['favorites'],
    check: (storyId) => ['favorites', 'check', storyId],
  },
  ratings: {
    average: (storyId) => ['ratings', 'average', storyId],
    user: (storyId) => ['ratings', 'user', storyId],
  },
  comments: {
    byStory: (storyId) => ['comments', 'byStory', storyId],
  },
  notifications: {
    all: ['notifications'],
    unreadCount: ['notifications', 'unreadCount'],
  },
  verification: {
    myRequest: ['verification', 'myRequest'],
    pending: ['verification', 'pending'],
  },
}
