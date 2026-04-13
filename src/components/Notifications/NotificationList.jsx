import { Link } from 'react-router-dom'
import { useNotifications } from '../../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { FiCheckAll, FiBell, FiHeart, FiMessageCircle, FiStar, FiCheckCircle, FiUserPlus } from 'react-icons/fi'
import { motion } from 'framer-motion'

const getNotificationIcon = (type) => {
  const icons = {
    like: <FiHeart className="text-red-500" />,
    comment: <FiMessageCircle className="text-blue-500" />,
    rating: <FiStar className="text-yellow-500" />,
    verified: <FiCheckCircle className="text-green-500" />,
    follow: <FiUserPlus className="text-purple-500" />,
  }
  return icons[type] || <FiBell className="text-gray-500" />
}

const NotificationList = ({ onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
    onClose()
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-[var(--bg-elevated)] rounded-xl shadow-xl border border-[var(--border-light)] overflow-hidden">
        <div className="p-4 text-center">
          <FiBell className="text-4xl text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-[var(--text-muted)]">لا توجد إشعارات جديدة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl shadow-xl border border-[var(--border-light)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
        <h3 className="font-bold flex items-center gap-2">
          <FiBell />
          الإشعارات
          {unreadCount > 0 && (
            <span className="badge badge-gold text-xs">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-gold-500 hover:text-gold-600 transition-colors flex items-center gap-1"
          >
            <FiCheckAll />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 border-b border-[var(--border-light)] cursor-pointer transition-all duration-300 hover:bg-[var(--bg-surface)] ${
              !notification.is_read ? 'bg-gold-50 dark:bg-gold-900/10' : ''
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 bg-gold-500 rounded-full mt-2" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 text-center border-t border-[var(--border-light)]">
        <Link
          to="/profile?tab=notifications"
          onClick={onClose}
          className="text-sm text-gold-500 hover:text-gold-600 transition-colors"
        >
          عرض كل الإشعارات
        </Link>
      </div>
    </div>
  )
}

export default NotificationList
