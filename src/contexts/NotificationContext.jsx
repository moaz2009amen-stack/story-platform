import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { notificationsHelpers } from '../lib/supabase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../lib/queryClient'
import toast from 'react-hot-toast'

const NotificationContext = createContext({})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [unreadCount, setUnreadCount] = useState(0)

  // جلب الإشعارات
  const { data: notifications, refetch: refetchNotifications } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsHelpers.getUserNotifications(user?.id),
    enabled: !!user,
    refetchInterval: 30000, // كل 30 ثانية
  })

  // جلب عدد الإشعارات غير المقروءة
  const { data: count, refetch: refetchUnreadCount } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsHelpers.getUnreadCount(user?.id),
    enabled: !!user,
    refetchInterval: 10000, // كل 10 ثواني
  })

  useEffect(() => {
    if (count !== undefined) {
      setUnreadCount(count)
    }
  }, [count])

  // عرض إشعار فوري عند وصول إشعار جديد
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      const lastNotification = notifications[0]
      const lastShown = localStorage.getItem('last_notification_shown')
      
      if (lastNotification && lastNotification.created_at !== lastShown && !lastNotification.is_read) {
        localStorage.setItem('last_notification_shown', lastNotification.created_at)
        
        toast.custom((t) => (
          <div 
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[var(--bg-elevated)] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            onClick={() => {
              toast.dismiss(t.id)
              if (lastNotification.link) {
                window.location.href = lastNotification.link
              }
            }}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-gold-100 dark:bg-gold-900 flex items-center justify-center">
                    <span className="text-xl">
                      {getNotificationIcon(lastNotification.type)}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {lastNotification.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {lastNotification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ), { duration: 5000 })
      }
    }
  }, [notifications])

  const markAsRead = useCallback(async (notificationId) => {
    await notificationsHelpers.markAsRead(notificationId)
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
  }, [queryClient])

  const markAllAsRead = useCallback(async () => {
    if (user) {
      await notificationsHelpers.markAllAsRead(user.id)
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount })
    }
  }, [user, queryClient])

  const refetch = useCallback(() => {
    refetchNotifications()
    refetchUnreadCount()
  }, [refetchNotifications, refetchUnreadCount])

  const value = {
    notifications: notifications || [],
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

function getNotificationIcon(type) {
  const icons = {
    like: '❤️',
    comment: '💬',
    rating: '⭐',
    verified: '✓',
    follow: '👤',
  }
  return icons[type] || '🔔'
}
