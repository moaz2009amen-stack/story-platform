import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileHelpers, verificationHelpers } from '../lib/supabase'
import { queryKeys } from '../lib/queryClient'
import toast from 'react-hot-toast'

// جلب الملف الشخصي الحالي
export const useCurrentProfile = (userId) => {
  return useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: () => profileHelpers.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 30, // 30 ثانية
  })
}

// جلب ملف شخصي حسب اسم المستخدم
export const useProfileByUsername = (username) => {
  return useQuery({
    queryKey: queryKeys.profile.byUsername(username),
    queryFn: () => profileHelpers.getByUsername(username),
    enabled: !!username,
  })
}

// تحديث الملف الشخصي
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, updates }) => profileHelpers.updateProfile(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current })
      toast.success('تم تحديث الملف الشخصي بنجاح')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء تحديث الملف الشخصي')
    },
  })
}

// التحقق من تفرد اسم المستخدم
export const useCheckUsername = (username, excludeUserId = null) => {
  return useQuery({
    queryKey: ['username', 'check', username, excludeUserId],
    queryFn: () => profileHelpers.checkUsernameUnique(username, excludeUserId),
    enabled: username && username.length >= 3,
    staleTime: 1000,
  })
}

// طلب التوثيق
export const useVerificationRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ userId, storiesCount }) => 
      verificationHelpers.createRequest(userId, storiesCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification', 'myRequest'] })
      toast.success('تم إرسال طلب التوثيق بنجاح. سيتم مراجعته قريباً')
    },
    onError: (error) => {
      toast.error(error.message || 'حدث خطأ أثناء إرسال الطلب')
    },
  })
}

// جلب طلب التوثيق الخاص بي
export const useMyVerificationRequest = (userId) => {
  return useQuery({
    queryKey: queryKeys.verification.myRequest,
    queryFn: () => verificationHelpers.getMyRequest(userId),
    enabled: !!userId,
  })
}
