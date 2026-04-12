import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBookOpenLine, RiPencilLine, RiImageLine, RiAddLine,
  RiDeleteBinLine, RiArrowLeftLine, RiArrowRightLine,
  RiEyeLine, RiFlagLine, RiPlayLine, RiCheckLine,
  RiInformationLine, RiCloseLine, RiSearchLine,
  RiUploadLine, RiGalleryLine,
} from 'react-icons/ri'
import Navbar from '../components/Navbar'
import { storyHelpers, uploadImage } from '../lib/supabase'

const CATEGORIES = ['مغامرة', 'رعب', 'رومانسية', 'خيال علمي', 'تاريخية', 'جريمة', 'أخرى']
const ENDING_TYPES = [
  { value: 'good',    label: '😊 نهاية سعيدة', color: '#22c55e' },
  { value: 'bad',     label: '😢 نهاية حزينة', color: '#ef4444' },
  { value: 'neutral', label: '😐 نهاية محايدة', color: '#f59e0b' },
]

// مكتبة صور جاهزة من Unsplash
const STOCK_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400', label: 'غابة' },
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', label: 'جبال' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', label: 'شخص' },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', label: 'ثلوج' },
  { url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400', label: 'طريق' },
  { url: 'https://images.unsplash.com/photo-1524522173746-f628baad3644?w=400', label: 'مدينة' },
  { url: 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=400', label: 'بحر' },
  { url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400', label: 'صحراء' },
  { url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400', label: 'قصر' },
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', label: 'جبل ثلجي' },
  { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400', label: 'بحيرة' },
  { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400', label: 'شروق' },
  { url: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400', label: 'غروب' },
  { url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', label: 'فندق' },
  { url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400', label: 'كهف' },
  { url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400', label: 'حديقة' },
  { url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', label: 'تسلق' },
  { url: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400', label: 'رعب' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400', label: 'نجوم' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', label: 'شاطئ' },
  { url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc1a?w=400', label: 'ورود' },
  { url: 'https://images.unsplash.com/photo-1521170665346-3f21e2291d8b?w=400', label: 'مطر' },
  { url: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=400', label: 'ضباب' },
  { url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400', label: 'قطبي' },
]

function genId() { return `scene_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }

const DEFAULT_SCENE = () => ({
  id: genId(),
  title: { ar: '', en: '' },
  content: { ar: '', en: '' },
  image: '',
  choices: [],
  isEnd: false,
  endType: 'neutral',
  endMessage: { ar: '', en: '' },
})

/* ── Image Picker Modal ─────────────────────── */
function ImagePicker({ current, onSelect, onClose }) {
  const [tab, setTab] = useState('library')
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = STOCK_IMAGES.filter(img => img.label.includes(search))

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onSelect(url)
      onClose()
    } catch { alert('فشل رفع الصورة') }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>اختر صورة</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg">
            <RiCloseLine style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {[
            { id: 'library', label: 'مكتبة الصور', icon: RiGalleryLine },
            { id: 'upload',  label: 'رفع صورة',    icon: RiUploadLine },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
              style={{
                borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
                color: tab === t.id ? '#f59e0b' : 'var(--text-muted)',
              }}>
              <t.icon /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'library' && (
            <>
              <div className="relative mb-4">
                <RiSearchLine className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="ابحث..." value={search}
                  onChange={e => setSearch(e.target.value)} className="input-base pr-9 text-sm" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto">
                {filtered.map(img => (
                  <button key={img.url} onClick={() => { onSelect(img.url); onClose() }}
                    className="relative rounded-xl overflow-hidden aspect-square group transition-all hover:scale-105"
                    style={{ border: current === img.url ? '2px solid #f59e0b' : '2px solid transparent' }}>
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-end p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                      <span className="text-white text-[10px] font-bold">{img.label}</span>
                    </div>
                    {current === img.url && (
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: '#f59e0b' }}>
                        <RiCheckLine className="text-black text-xs" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {tab === 'upload' && (
            <div className="text-center py-10">
              <RiUploadLine style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.4, margin: '0 auto 1rem' }} />
              <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>JPG, PNG, WebP — حتى 10MB</p>
              <label className="btn-primary cursor-pointer inline-flex">
                {uploading
                  ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> جاري الرفع...</>
                  : <><RiUploadLine /> اختر صورة من جهازك</>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
              {current && (
                <div className="mt-4">
                  <img src={current} alt="" className="w-32 h-32 rounded-xl object-cover mx-auto mb-2" />
                  <button onClick={() => { onSelect(''); onClose() }} className="text-xs" style={{ color: '#ef4444' }}>إزالة الصورة</button>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ── Step Bar ───────────────────────────────── */
function StepBar({ current }) {
  const steps = ['معلومات القصة', 'المشاهد', 'المراجعة والنشر']
  return (
    <div className="flex items-center gap-3 mb-10">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all`}
            style={i === current ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000' }
              : i < current ? { background: '#22c55e', color: '#fff' }
              : { background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            {i < current ? <RiCheckLine /> : i + 1}
          </div>
          <span className="text-xs font-semibold hidden sm:block"
            style={{ color: i === current ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s}</span>
          {i < steps.length - 1 && <div className="flex-1 h-px mx-2 hidden sm:block" style={{ background: 'var(--border-default)' }} />}
        </div>
      ))}
    </div>
  )
}

/* ── Scene Editor ───────────────────────────── */
function SceneEditor({ scene, allScenes, onChange, onDelete, isFirst, onSetFirst, storyType }) {
  const [showPicker, setShowPicker] = useState(false)

  const updateField = (path, value) => {
    const [a, b] = path.split('.')
    onChange(b ? { ...scene, [a]: { ...scene[a], [b]: value } } : { ...scene, [a]: value })
  }
  const addChoice = () => onChange({ ...scene, choices: [...scene.choices, { id: genId(), text: { ar: '', en: '' }, targetScene: '' }] })
  const removeChoice = (cid) => onChange({ ...scene, choices: scene.choices.filter(c => c.id !== cid) })
  const updateChoice = (cid, patch) => onChange({ ...scene, choices: scene.choices.map(c => c.id === cid ? { ...c, ...patch } : c) })

  return (
    <div className="card-flat p-6 space-y-5">
      {showPicker && (
        <ImagePicker current={scene.image} onSelect={url => onChange({ ...scene, image: url })} onClose={() => setShowPicker(false)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            {allScenes.findIndex(s => s.id === scene.id) + 1}
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            {scene.title?.ar || `مشهد ${allScenes.findIndex(s => s.id === scene.id) + 1}`}
          </span>
          {isFirst && <span className="badge badge-gold text-xs"><RiPlayLine /> بداية</span>}
          {scene.isEnd && <span className="badge badge-crimson text-xs"><RiFlagLine /> نهاية</span>}
        </div>
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button onClick={() => onSetFirst(scene.id)} className="btn-ghost text-xs px-2 py-1 rounded-lg" title="تعيين كبداية">
              <RiPlayLine />
            </button>
          )}
          <button onClick={onDelete} className="btn-danger text-xs px-2 py-1 rounded-lg">
            <RiDeleteBinLine />
          </button>
        </div>
      </div>

      {/* Scene Image */}
      <div>
        <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>صورة المشهد</label>
        <div className="flex gap-3 items-center">
          <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
            style={{ background: 'var(--bg-subtle)', border: '2px dashed var(--border-default)' }}>
            {scene.image
              ? <img src={scene.image} alt="" className="w-full h-full object-cover" />
              : <RiImageLine style={{ fontSize: '1.5rem', color: 'var(--text-muted)', opacity: 0.4 }} />
            }
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setShowPicker(true)} className="btn-secondary text-xs px-3 py-2 flex items-center gap-1">
              <RiGalleryLine /> اختر صورة
            </button>
            {scene.image && (
              <button onClick={() => onChange({ ...scene, image: '' })} className="text-xs" style={{ color: '#ef4444' }}>إزالة</button>
            )}
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>عنوان المشهد (عربي)</label>
          <input type="text" className="input-base text-sm" placeholder="عنوان المشهد..."
            value={scene.title?.ar || ''} onChange={e => updateField('title.ar', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }} dir="ltr">Scene Title (English)</label>
          <input type="text" className="input-base text-sm" dir="ltr" placeholder="Scene title..."
            value={scene.title?.en || ''} onChange={e => updateField('title.en', e.target.value)} />
        </div>
      </div>

      {/* Content */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>محتوى المشهد (عربي) *</label>
          <textarea rows={4} className="input-base text-sm resize-none" placeholder="اكتب نص المشهد..."
            value={scene.content?.ar || ''} onChange={e => updateField('content.ar', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }} dir="ltr">Scene Content (English)</label>
          <textarea rows={4} className="input-base text-sm resize-none" dir="ltr" placeholder="Scene content..."
            value={scene.content?.en || ''} onChange={e => updateField('content.en', e.target.value)} />
        </div>
      </div>

      {/* Is ending */}
      {storyType === 'interactive' && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
          <input type="checkbox" id={`end-${scene.id}`} checked={scene.isEnd}
            onChange={e => onChange({ ...scene, isEnd: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
          <label htmlFor={`end-${scene.id}`} className="text-sm font-semibold cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}>هذا مشهد نهاية 🏁</label>
        </div>
      )}

      {storyType === 'interactive' && scene.isEnd && (
        <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl" style={{ border: '1px dashed var(--border-default)' }}>
          <div className="sm:col-span-3">
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>نوع النهاية</label>
            <div className="flex gap-2 flex-wrap">
              {ENDING_TYPES.map(et => (
                <button key={et.value} type="button" onClick={() => onChange({ ...scene, endType: et.value })}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: scene.endType === et.value ? `${et.color}15` : 'transparent',
                    borderColor: scene.endType === et.value ? et.color : 'var(--border-default)',
                    color: scene.endType === et.value ? et.color : 'var(--text-muted)',
                  }}>
                  {et.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>رسالة النهاية (عربي)</label>
            <input type="text" className="input-base text-sm" placeholder="رسالة النهاية..."
              value={scene.endMessage?.ar || ''} onChange={e => updateField('endMessage.ar', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }} dir="ltr">End Message (English)</label>
            <input type="text" className="input-base text-sm" dir="ltr" placeholder="End message..."
              value={scene.endMessage?.en || ''} onChange={e => updateField('endMessage.en', e.target.value)} />
          </div>
        </div>
      )}

      {/* Choices — للقصص التفاعلية فقط */}
      {storyType === 'interactive' && !scene.isEnd && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>الاختيارات ({scene.choices.length}/4)</label>
            {scene.choices.length < 4 && (
              <button type="button" onClick={addChoice}
                className="btn-ghost text-xs px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: '#f59e0b' }}>
                <RiAddLine /> إضافة اختيار
              </button>
            )}
          </div>
          <div className="space-y-3">
            {scene.choices.map((choice, ci) => (
              <div key={choice.id} className="flex gap-2 items-start p-3 rounded-xl"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-2"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{ci + 1}</span>
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <input type="text" className="input-base text-xs py-2" placeholder="نص الاختيار بالعربية"
                    value={choice.text?.ar || ''}
                    onChange={e => updateChoice(choice.id, { text: { ...choice.text, ar: e.target.value } })} />
                  <input type="text" className="input-base text-xs py-2" dir="ltr" placeholder="Choice text in English"
                    value={choice.text?.en || ''}
                    onChange={e => updateChoice(choice.id, { text: { ...choice.text, en: e.target.value } })} />
                  <select className="input-base text-xs py-2 sm:col-span-2"
                    value={choice.targetScene}
                    onChange={e => updateChoice(choice.id, { targetScene: e.target.value })}>
                    <option value="">-- اختر المشهد التالي --</option>
                    {allScenes.filter(s => s.id !== scene.id).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title?.ar || `مشهد ${allScenes.findIndex(x => x.id === s.id) + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={() => removeChoice(choice.id)} className="btn-danger p-1.5 rounded-lg mt-1 shrink-0">
                  <RiCloseLine />
                </button>
              </div>
            ))}
            {scene.choices.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: 'var(--text-muted)' }}>
                أضف اختياراً واحداً على الأقل
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Page ──────────────────────────────── */
export default function CreateStory() {
  const navigate = useNavigate()
  const [step,    setStep]    = useState(0)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)

  const [info, setInfo] = useState({
    title_ar: '', title_en: '',
    desc_ar: '', desc_en: '',
    cover: '',
    category: 'مغامرة',
    readingTime: 5,
    storyType: 'interactive', // 'interactive' | 'normal'
  })

  const firstScene = DEFAULT_SCENE()
  const [scenes,       setScenes]       = useState([firstScene])
  const [firstSceneId, setFirstSceneId] = useState(firstScene.id)
  const [activeSid,    setActiveSid]    = useState(firstScene.id)

  function addScene() {
    const s = DEFAULT_SCENE()
    setScenes(prev => [...prev, s])
    setActiveSid(s.id)
  }

  function updateScene(id, updated) {
    setScenes(prev => prev.map(s => s.id === id ? updated : s))
  }

  function deleteScene(id) {
    if (scenes.length === 1) return
    const idx = scenes.findIndex(s => s.id === id)
    setScenes(prev => prev.filter(s => s.id !== id))
    if (firstSceneId === id) setFirstSceneId(scenes.find(s => s.id !== id)?.id || '')
    setActiveSid(scenes[idx > 0 ? idx - 1 : 1]?.id || scenes[0]?.id)
  }

  async function publish(isPublished) {
    setError('')
    setSaving(true)
    const scenesMap = {}
    scenes.forEach(s => { scenesMap[s.id] = s })
    const storyData = {
      title:        { ar: info.title_ar, en: info.title_en },
      description:  { ar: info.desc_ar,  en: info.desc_en },
      cover_image:  info.cover,
      category:     info.category,
      reading_time: info.readingTime,
      scenes:       scenesMap,
      first_scene:  firstSceneId,
      is_published: isPublished,
      story_type:   info.storyType,
    }
    const { data, error } = await storyHelpers.create(storyData)
    if (error) { setError(error.message || 'حدث خطأ أثناء الحفظ'); setSaving(false); return }
    navigate(`/story/${data.id}`)
  }

  const step1Valid = info.title_ar.trim().length > 2
  const step2Valid = scenes.length > 0 && scenes.some(s => s.content?.ar?.trim())
  const activeScene = scenes.find(s => s.id === activeSid)

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      {showCoverPicker && (
        <ImagePicker
          current={info.cover}
          onSelect={url => setInfo(i => ({ ...i, cover: url }))}
          onClose={() => setShowCoverPicker(false)}
        />
      )}

      <div className="page-container py-10">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>إنشاء قصة جديدة</h1>
            <p className="mb-8" style={{ color: 'var(--text-muted)' }}>ابنِ عالمك، أضف مشاهدك، وانشر قصتك للعالم</p>
          </motion.div>

          <StepBar current={step} />

          {error && (
            <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              <RiInformationLine /> {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* Step 0: Basic Info */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">

                {/* نوع القصة */}
                <div className="card-flat p-6">
                  <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>نوع القصة</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { value: 'interactive', icon: '🔀', title: 'قصة تفاعلية', desc: 'مشاهد متعددة واختيارات تقود لنهايات مختلفة' },
                      { value: 'normal',      icon: '📖', title: 'قصة عادية',   desc: 'قصة تُقرأ من البداية للنهاية بدون تفرعات' },
                    ].map(type => (
                      <button key={type.value} onClick={() => setInfo(i => ({ ...i, storyType: type.value }))}
                        className="p-5 rounded-2xl text-right transition-all"
                        style={{
                          background: info.storyType === type.value ? 'rgba(245,158,11,0.08)' : 'var(--bg-subtle)',
                          border: `2px solid ${info.storyType === type.value ? '#f59e0b' : 'var(--border-subtle)'}`,
                        }}>
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{type.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{type.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Basic info */}
                <div className="card-flat p-6">
                  <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>معلومات القصة</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>عنوان القصة (عربي) *</label>
                      <input type="text" className="input-base" placeholder="عنوان رائع..."
                        value={info.title_ar} onChange={e => setInfo(i => ({ ...i, title_ar: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }} dir="ltr">Story Title (English)</label>
                      <input type="text" className="input-base" dir="ltr" placeholder="Amazing title..."
                        value={info.title_en} onChange={e => setInfo(i => ({ ...i, title_en: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>وصف القصة (عربي)</label>
                      <textarea rows={3} className="input-base resize-none" placeholder="وصف مثير..."
                        value={info.desc_ar} onChange={e => setInfo(i => ({ ...i, desc_ar: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }} dir="ltr">Story Description (English)</label>
                      <textarea rows={3} className="input-base resize-none" dir="ltr" placeholder="Exciting description..."
                        value={info.desc_en} onChange={e => setInfo(i => ({ ...i, desc_en: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>التصنيف</label>
                      <select className="input-base" value={info.category} onChange={e => setInfo(i => ({ ...i, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>وقت القراءة (دقائق)</label>
                      <input type="number" min={1} max={120} className="input-base"
                        value={info.readingTime} onChange={e => setInfo(i => ({ ...i, readingTime: +e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Cover */}
                <div className="card-flat p-6">
                  <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>صورة الغلاف</h2>
                  <div className="flex gap-5 items-start flex-wrap">
                    <div className="w-40 h-40 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--bg-subtle)', border: '2px dashed var(--border-default)' }}>
                      {info.cover
                        ? <img src={info.cover} alt="cover" className="w-full h-full object-cover" />
                        : <RiImageLine style={{ fontSize: '2.5rem', color: 'var(--text-muted)', opacity: 0.4 }} />
                      }
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => setShowCoverPicker(true)} className="btn-primary inline-flex">
                        <RiGalleryLine /> اختر صورة الغلاف
                      </button>
                      {info.cover && (
                        <button onClick={() => setInfo(i => ({ ...i, cover: '' }))}
                          className="text-xs" style={{ color: '#ef4444' }}>إزالة الصورة</button>
                      )}
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>اختر من المكتبة أو ارفع من جهازك</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1: Scenes */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid lg:grid-cols-[220px,1fr] gap-6">
                  <div>
                    <div className="card-flat p-3 space-y-1">
                      <p className="text-xs font-bold px-2 py-1 mb-2" style={{ color: 'var(--text-muted)' }}>المشاهد ({scenes.length})</p>
                      {scenes.map((s, i) => (
                        <button key={s.id} onClick={() => setActiveSid(s.id)}
                          className="w-full text-right px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                          style={{ background: activeSid === s.id ? 'rgba(245,158,11,0.1)' : 'transparent', color: activeSid === s.id ? '#f59e0b' : 'var(--text-secondary)' }}>
                          <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{i + 1}</span>
                          <span className="truncate flex-1">{s.title?.ar || `مشهد ${i + 1}`}</span>
                          <div className="flex gap-0.5 shrink-0">
                            {s.id === firstSceneId && <RiPlayLine className="text-green-500 text-[10px]" />}
                            {s.isEnd && <RiFlagLine className="text-red-400 text-[10px]" />}
                          </div>
                        </button>
                      ))}
                      <button onClick={addScene}
                        className="w-full text-center py-2.5 rounded-xl text-xs font-semibold border border-dashed transition-colors mt-2"
                        style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                        <RiAddLine className="inline ml-1" /> مشهد جديد
                      </button>
                    </div>
                  </div>
                  <div>
                    {activeScene ? (
                      <SceneEditor
                        scene={activeScene}
                        allScenes={scenes}
                        storyType={info.storyType}
                        onChange={updated => updateScene(activeScene.id, updated)}
                        onDelete={() => deleteScene(activeScene.id)}
                        isFirst={activeScene.id === firstSceneId}
                        onSetFirst={id => setFirstSceneId(id)}
                      />
                    ) : (
                      <div className="card-flat p-12 text-center">
                        <p style={{ color: 'var(--text-muted)' }}>اختر مشهداً من القائمة</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="card-flat p-6">
                  <h2 className="font-bold text-xl mb-5" style={{ color: 'var(--text-primary)' }}>مراجعة القصة</h2>
                  <div className="flex gap-5 items-start flex-wrap">
                    {info.cover && <img src={info.cover} alt="cover" className="w-32 h-32 rounded-2xl object-cover shrink-0" />}
                    <div>
                      <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{info.title_ar}</h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{info.desc_ar}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-gold">{info.category}</span>
                        <span className="badge">{info.storyType === 'interactive' ? '🔀 تفاعلية' : '📖 عادية'}</span>
                        <span className="badge">{scenes.length} مشهد</span>
                        <span className="badge">{info.readingTime} دقائق</span>
                        {info.storyType === 'interactive' && (
                          <span className="badge badge-crimson">{scenes.filter(s => s.isEnd).length} نهاية</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => publish(false)} disabled={saving} className="btn-secondary flex-1 justify-center py-3.5">
                    <RiEyeLine /> حفظ كمسودة
                  </button>
                  <button onClick={() => publish(true)} disabled={saving} className="btn-primary flex-1 justify-center py-3.5">
                    {saving
                      ? <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> جاري النشر...</>
                      : <><RiCheckLine /> نشر القصة 🚀</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-secondary flex items-center gap-2" style={{ opacity: step === 0 ? 0.3 : 1 }}>
              <RiArrowRightLine /> السابق
            </button>
            {step < 2 && (
              <button onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
                className="btn-primary flex items-center gap-2">
                التالي <RiArrowLeftLine />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
