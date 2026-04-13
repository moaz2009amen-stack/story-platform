import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storyHelpers, favoritesHelpers, ratingsHelpers } from '../lib/supabase'
import { queryKeys } from '../lib/queryClient'
import toast from 'react-hot-toast'

// جلب القصص المنشورة
export const usePublishedStories = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.stories.published(filters),
    queryFn: () => storyHelpers.getPublished(filters),
    staleTime: 1000 * 60, // 1 دقيقة
    keepPreviousData: true,
  })
}

// جلب تفاصيل قصة
export const useStory = (id) => {
  return useQuery({
    queryKey: queryKeys.stories.detail(id),
    queryFn: () => storyHelpers.getById(id),
    enabled: !!id,
  })
}

// جلب قصص كاتب
export const useAuthorStories = (authorId, onlyPublished = true) => {
  return useQuery({
    queryKey: queryKeys.stories.byAuthor(authorId),
    queryFn: () => storyHelpers.getByAuthor(authorId, { onlyPublished }),
    enabled: !!authorId,
  })
}

// إنشاء قصة
export const useCreateStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (story) => storyHelpers.create(story),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.all })
      toast.success('تم إنشاء القصة بنجاح')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء القصة')
    },
  })
}

// تحديث قصة
export const useUpdateStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }) => storyHelpers.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.all })
      toast.success('تم تحديث القصة بنجاح')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث القصة')
    },
  })
}

// حذف قصة
export const useDeleteStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => storyHelpers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.all })
      toast.success('تم حذف القصة بنجاح')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء حذف القصة')
    },
  })
}

// إعجاب بقصة
export const useFavoriteStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, storyId, isFavorited }) => {
      if (isFavorited) {
        return favoritesHelpers.remove(userId, storyId)
      }
      return favoritesHelpers.add(userId, storyId)
    },
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.check(storyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.detail(storyId) })
    },
  })
}

// التحقق من حالة الإعجاب
export const useIsFavorited = (userId, storyId) => {
  return useQuery({
    queryKey: queryKeys.favorites.check(storyId),
    queryFn: () => favoritesHelpers.isFavorited(userId, storyId),
    enabled: !!userId && !!storyId,
  })
}

// إضافة تقييم
export const useRateStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, storyId, rating, review }) => 
      ratingsHelpers.rate(userId, storyId, rating, review),
    onSuccess: (_, { storyId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ratings.average(storyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.detail(storyId) })
      toast.success('شكراً لتقييمك!')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء إرسال التقييم')
    },
  })
}

// جلب متوسط التقييم
export const useAverageRating = (storyId) => {
  return useQuery({
    queryKey: queryKeys.ratings.average(storyId),
    queryFn: () => ratingsHelpers.getAverageRating(storyId),
    enabled: !!storyId,
  })
}

// جلب تقييم المستخدم لقصة
export const useUserRating = (userId, storyId) => {
  return useQuery({
    queryKey: queryKeys.ratings.user(storyId),
    queryFn: () => ratingsHelpers.getUserRating(userId, storyId),
    enabled: !!userId && !!storyId,
  })
}

// جلب قصص مفضلة للمستخدم
export const useUserFavorites = (userId) => {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: () => favoritesHelpers.getUserFavorites(userId),
    enabled: !!userId,
  })
}

// جلب قصص الأدمن (كل القصص)
export const useAdminStories = () => {
  return useQuery({
    queryKey: queryKeys.stories.admin,
    queryFn: () => storyHelpers.getAll(),
    enabled: false, // needs admin check
  })
}

// تعليق/إلغاء تعليق قصة (للأدمن)
export const useSuspendStory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, suspended }) => storyHelpers.suspend(id, suspended),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.stories.admin })
      toast.success('تم تحديث حالة القصة')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ')
    },
  })
}
