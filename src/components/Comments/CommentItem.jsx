import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { FiMessageCircle, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import VerifiedBadge from '../VerifiedBadge'
import { commentsHelpers } from '../../lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import toast from 'react-hot-toast'

const CommentItem = ({ comment, currentUserId, onReply, onDelete, storyId }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showReplies, setShowReplies] = useState(true)
  const queryClient = useQueryClient()

  const updateComment = useMutation({
    mutationFn: ({ commentId, content }) => commentsHelpers.update(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byStory(storyId) })
      setIsEditing(false)
      toast.success('تم تحديث التعليق')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث التعليق')
    },
  })

  const handleUpdate = () => {
    if (editContent.trim() && editContent !== comment.content) {
      updateComment.mutate({ commentId: comment.id, content: editContent })
    } else {
      setIsEditing(false)
    }
  }

  const isOwner = currentUserId === comment.user_id
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link to={`/author/${comment.user?.username}`} className="flex-shrink-0">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
              {comment.user?.full_name?.charAt(0)}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-[var(--bg-surface)] rounded-lg p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={`/author/${comment.user?.username}`}
                className="flex items-center gap-2 hover:text-gold-500 transition-colors"
              >
                <span className="font-semibold text-sm">{comment.user?.full_name}</span>
                {comment.user?.is_verified && <VerifiedBadge size="small" />}
                <span className="text-xs text-[var(--text-muted)]">
                  @{comment.user?.username}
                </span>
              </Link>
              <span className="text-xs text-[var(--text-muted)]">
                {formatDistanceToNow(new Date(comment.created_at), { 
                  addSuffix: true, 
                  locale: ar 
                })}
              </span>
            </div>

            {/* Content / Edit Form */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)] focus:outline-none focus:ring-2 focus:ring-gold-500"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm flex items-center gap-1"
                  >
                    <FiCheck /> حفظ
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm flex items-center gap-1"
                  >
                    <FiX /> إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{comment.content}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-1 mr-2">
            <button
              onClick={onReply}
              className="text-xs text-[var(--text-muted)] hover:text-gold-500 transition-colors flex items-center gap-1"
            >
              <FiMessageCircle className="text-xs" />
              رد
            </button>
            {isOwner && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-[var(--text-muted)] hover:text-blue-500 transition-colors flex items-center gap-1"
                >
                  <FiEdit2 className="text-xs" />
                  تعديل
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <FiTrash2 className="text-xs" />
                  حذف
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="mr-12">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-[var(--text-muted)] hover:text-gold-500 transition-colors mb-2"
          >
            {showReplies ? 'إخفاء الردود' : `عرض ${comment.replies.length} ردود`}
          </button>
          {showReplies && (
            <div className="space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onDelete={onDelete}
                  storyId={storyId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CommentItem
