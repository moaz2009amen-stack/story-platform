import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../../contexts/NotificationContext'
import { FiBell } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import NotificationList from './NotificationList'

const NotificationBell = () => {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
        aria-label="الإشعارات"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 mt-2 w-80 sm:w-96 z-50"
          >
            <NotificationList onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
