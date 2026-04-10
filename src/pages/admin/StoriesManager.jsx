import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stories } from '../../lib/supabase'
import AdminLayout from './AdminLayout'

export default function StoriesManager() {
  const [allStories, setAllStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedStories, setSelectedStories] = useState([])

  useEffect(() => {
    loadStories()
  }, [])

  useEffect(() => {
    filterStories()
  }, [allStories, searchTerm, filterStatus])

  async function loadStories() {
    setLoading(true)
    const { data, error } = await stories.getAll()
    if (!error && data) {
      setAllStories(data)
    }
    setLoading(false)
  }

  function filterStories() {
    let filtered = [...allStories]
    
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title?.ar?.includes(searchTerm) || 
        s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (filterStatus === 'published') {
      filtered = filtered.filter(s => s.is_published)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(s => !s.is_published)
    }
    
    setFilteredStories(filtered)
  }

  async function togglePublish(storyId, currentStatus) {
    const { error } = await stories.update(storyId, { is_published: !currentStatus })
    if (!error) {
      setAllStories(allStories.map(s => 
        s.id === storyId ? { ...s, is_published: !currentStatus } : s
      ))
    }
  }

  async function deleteStory(storyId) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه القصة؟')) return
    
    const { error } = await stories.delete(storyId)
    if (!error) {
      setAllStories(allStories.filter(s => s.id !== storyId))
    }
  }

  async function bulkDelete() {
    if (!confirm(`⚠️ هل أنت متأكد من حذف ${selectedStories.length} قصة؟`)) return
    
    for (const id of selectedStories) {
      await stories.delete(id)
    }
    setAllStories(allStories.filter(s => !selectedStories.includes(s.id)))
    setSelectedStories([])
  }

  function toggleSelectAll() {
    if (selectedStories.length === filteredStories.length) {
      setSelectedStories([])
    } else {
      setSelectedStories(filteredStories.map(s => s.id))
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📚 إدارة القصص
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {filteredStories.length} قصة
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              placeholder="🔍 بحث..."
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="all">الكل</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
            </select>

            {selectedStories.length > 0 && (
              <button
                onClick={bulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                🗑️ حذف المحدد ({selectedStories.length})
              </button>
            )}
          </div>
        </div>

        {/* Stories Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStories.length === filteredStories.length && filteredStories.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-right">القصة</th>
                <th className="px-4 py-3 text-right">الكاتب</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">المشاهدات</th>
                <th className="px-4 py-3 text-right">التاريخ</th>
                <th className="px-4 py-3 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredStories.map(story => (
                <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStories.includes(story.id)}
                      onChange={() => {
                        if (selectedStories.includes(story.id)) {
                          setSelectedStories(selectedStories.filter(id => id !== story.id))
                        } else {
                          setSelectedStories([...selectedStories, story.id])
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={story.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                      <div>
                        <p className="font-medium">{story.title?.ar}</p>
                        <p className="text-xs text-gray-500">{story.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {story.author?.full_name || story.author?.username}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(story.id, story.is_published)}
                      className={`px-2 py-1 rounded-full text-xs ${
                        story.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {story.is_published ? 'منشور' : 'مسودة'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">{story.views || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(story.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteStory(story.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
