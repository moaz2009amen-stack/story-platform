import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { commentsHelpers } from '../../lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../lib/queryClient'
import CommentItem from './CommentItem'
import AddComment from './AddComment'
import { FiMessageCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const CommentSection = ({ storyId }) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [replyTo, setReplyTo] = useState(null)

  // جلب التعليقات
  const { data: comments, isLoading } = useQuery({
    queryKey: queryKeys.comments.byStory(storyId),
    queryFn: () => commentsHelpers.getByStory(storyId),
    enabled: !!storyId,
  })

  // حذف تعليق
  const deleteComment = useMutation({
    mutationFn: (commentId) => commentsHelpers.delete(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.byStory(storyId) })
      toast.success('تم حذف التعليق')
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف التعليق')
    },
  })

  const handleReply = (comment) => {
    setReplyTo(comment)
    // Scroll to add comment form
    document.getElementById('add-comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-20 w-full" />
        <div className="skeleton h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-light)]">
        <FiMessageCircle className="text-2xl text-gold-500" />
        <h3 className="text-xl font-bold">التعليقات</h3>
        <span className="badge badge-gold">{comments?.length || 0}</span>
      </div>

      {/* Add Comment Form */}
      <div id="add-comment-form">
        <AddComment
          storyId={storyId}
          userId={user?.id}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: queryKeys.comments.byStory(storyId) })
            setReplyTo(null)
          }}
        />
      </div>

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CommentItem
                comment={comment}
                currentUserId={user?.id}
                onReply={() => handleReply(comment)}
                onDelete={() => deleteComment.mutate(comment.id)}
                storyId={storyId}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-[var(--bg-surface)] rounded-lg">
          <FiMessageCircle className="text-4xl text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-[var(--text-muted)]">لا توجد تعليقات بعد. كن أول من يعلق!</p>
        </div>
      )}
    </div>
  )
}

export default CommentSection
