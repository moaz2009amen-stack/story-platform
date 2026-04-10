import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase, auth } from '../../lib/supabase'
import AdminLayout from './AdminLayout'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'قصة واختار',
    siteDescription: 'منصة القصص التفاعلية',
    allowRegistration: true,
    maintenanceMode: false
  })
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleUpdateSettings(e) {
    e.preventDefault()
    setLoading(true)
    
    // حفظ الإعدادات في Supabase
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'site_settings', value: settings })
    
    if (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الإعدادات' })
    } else {
      setMessage({ type: 'success', text: '✅ تم حفظ الإعدادات بنجاح' })
    }
    
    setLoading(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '❌ كلمة المرور الجديدة غير متطابقة' })
      return
    }
    
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
      return
    }
    
    setLoading(true)
    
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    })
    
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '✅ تم تغيير كلمة المرور بنجاح' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
    
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          ⚙️ الإعدادات
        </h1>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold mb-4">🌐 إعدادات عامة</h2>
          
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المنصة</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">وصف المنصة</label>
              <textarea
                rows="3"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
              />
              <label>السماح بالتسجيل للمستخدمين الجدد</label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <label>وضع الصيانة</label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              💾 حفظ الإعدادات
            </button>
          </form>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold mb-4">🔐 تغيير كلمة المرور</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                minLength="6"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                minLength="6"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              🔄 تغيير كلمة المرور
            </button>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
