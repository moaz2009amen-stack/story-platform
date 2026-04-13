import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { commentsHelpers } from '../../lib/supabase'
import { FiSend, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

const AddComment = ({ storyId, userId, replyTo, onCancelReply, onSuccess }) => {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('يرجى تسجيل الدخول لإضافة تعليق')
      return
    }

    if (!content.trim()) {
      toast.error('الرجاء كتابة تعليق')
      return
    }

    setIsSubmitting(true)
    try {
      await commentsHelpers.add(
        storyId,
        userId,
        content.trim(),
        replyTo?.id || null
      )
      setContent('')
      if (onCancelReply) onCancelReply()
      if (onSuccess) onSuccess()
      toast.success(replyTo ? 'تم إضافة الرد بنجاح' : 'تم إضافة التعليق')
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة التعليق')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-[var(--bg-surface)] rounded-lg p-4 text-center">
        <p className="text-[var(--text-muted)]">
          <a href="/auth" className="text-gold-500 hover:underline">سجل الدخول</a> لإضافة تعليق
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {replyTo && (
        <div className="flex items-center justify-between bg-gold-50 dark:bg-gold-900/20 rounded-lg p-2 text-sm">
          <span className="text-[var(--text-muted)]">
            رد على <span className="font-semibold">{replyTo.user?.full_name}</span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 hover:bg-gold-200 dark:hover:bg-gold-800 rounded transition-colors"
          >
            <FiX />
          </button>
        </div>
      )}
      
      <div className="flex gap-3">
        {/* User Avatar */}
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            {user?.user_metadata?.full_name?.charAt(0) || 'U'}
          </div>
        )}
        
        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? `اكتب ردك على ${replyTo.user?.full_name}...` : 'اكتب تعليقك...'}
            className="w-full px-4 py-2 pr-10 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
            rows="3"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="absolute bottom-2 left-2 p-2 text-gold-500 hover:text-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className={`text-lg ${isSubmitting ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </div>
    </form>
  )
}

export default AddComment
