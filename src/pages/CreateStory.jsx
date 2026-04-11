import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBookOpenLine, RiPencilLine, RiImageLine, RiAddLine,
  RiDeleteBinLine, RiArrowLeftLine, RiArrowRightLine,
  RiEyeLine, RiFlagLine, RiPlayLine, RiCheckLine,
  RiInformationLine, RiCloseLine, RiDragMoveLine,
} from 'react-icons/ri'
import Navbar from '../components/Navbar'
import { storyHelpers, uploadImage } from '../lib/supabase'

const CATEGORIES = ['مغامرة', 'رعب', 'رومانسية', 'خيال علمي', 'تاريخية', 'جريمة', 'أخرى']
const ENDING_TYPES = [
  { value: 'good',    label: '😊 نهاية سعيدة', color: '#22c55e' },
  { value: 'bad',     label: '😢 نهاية حزينة', color: '#ef4444' },
  { value: 'neutral', label: '😐 نهاية محايدة', color: '#f59e0b' },
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

const DEFAULT_CHOICE = (targetId = '') => ({
  id: genId(),
  text: { ar: '', en: '' },
  targetScene: targetId,
})

/* ── Step indicator ─────────────────────────── */
function StepBar({ current }) {
  const steps = ['معلومات القصة', 'المشاهد والاختيارات', 'المراجعة والنشر']
  return (
    <div className="flex items-center gap-3 mb-10">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
            i < current ? 'bg-green-500 text-white' :
            i === current ? 'text-black' : ''
          }`}
            style={i === current ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)' } :
                   i < current  ? {} :
                   { background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
            {i < current ? <RiCheckLine /> : i + 1}
          </div>
          <span className="text-xs font-semibold hidden sm:block transition-colors"
            style={{ color: i === current ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className="flex-1 h-px mx-2 hidden sm:block" style={{ background: 'var(--border-default)' }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Scene Editor ───────────────────────────── */
function SceneEditor({ scene, allScenes, onChange, onDelete, isFirst, onSetFirst }) {
  const updateField = (path, value) => {
    const [a, b] = path.split('.')
    onChange(b ? { ...scene, [a]: { ...scene[a], [b]: value } } : { ...scene, [a]: value })
  }
  const addChoice = () => onChange({ ...scene, choices: [...scene.choices, DEFAULT_CHOICE()] })
  const removeChoice = (cid) => onChange({ ...scene, choices: scene.choices.filter(c => c.id !== cid) })
  const updateChoice = (cid, patch) => onChange({
    ...scene,
    choices: scene.choices.map(c => c.id === cid ? { ...c, ...patch } : c),
  })

  return (
    <div className="card-flat p-6 space-y-5">
      {/* Scene header */}
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
            <button onClick={() => onSetFirst(scene.id)}
              className="btn-ghost text-xs px-2 py-1 rounded-lg" title="تعيين كمشهد بداية">
              <RiPlayLine />
            </button>
          )}
          <button onClick={onDelete} className="btn-danger text-xs px-2 py-1 rounded-lg">
            <RiDeleteBinLine />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label-sm">عنوان المشهد (عربي)</label>
          <input type="text" className="input-base text-sm mt-1"
            placeholder="عنوان المشهد بالعربية"
            value={scene.title?.ar || ''} onChange={e => updateField('title.ar', e.target.value)} />
        </div>
        <div>
          <label className="label-sm" dir="ltr">Scene Title (English)</label>
          <input type="text" className="input-base text-sm mt-1" dir="ltr"
            placeholder="Scene title in English"
            value={scene.title?.en || ''} onChange={e => updateField('title.en', e.target.value)} />
        </div>
      </div>

      {/* Content */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="label-sm">محتوى المشهد (عربي) *</label>
          <textarea rows={4} className="input-base text-sm mt-1 resize-none"
            placeholder="اكتب نص المشهد بالعربية..."
            value={scene.content?.ar || ''} onChange={e => updateField('content.ar', e.target.value)} />
        </div>
        <div>
          <label className="label-sm" dir="ltr">Scene Content (English)</label>
          <textarea rows={4} className="input-base text-sm mt-1 resize-none" dir="ltr"
            placeholder="Write scene content in English..."
            value={scene.content?.en || ''} onChange={e => updateField('content.en', e.target.value)} />
        </div>
      </div>

      {/* Is ending */}
      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
        <input type="checkbox" id={`end-${scene.id}`} checked={scene.isEnd}
          onChange={e => onChange({ ...scene, isEnd: e.target.checked })}
          className="w-4 h-4 accent-yellow-500" />
        <label htmlFor={`end-${scene.id}`} className="text-sm font-semibold cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}>هذا مشهد نهاية 🏁</label>
      </div>

      {scene.isEnd && (
        <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl" style={{ border: '1px dashed var(--border-default)' }}>
          <div className="sm:col-span-3">
            <label className="label-sm">نوع النهاية</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {ENDING_TYPES.map(et => (
                <button
                  key={et.value}
                  type="button"
                  onClick={() => onChange({ ...scene, endType: et.value })}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                  style={{
                    background: scene.endType === et.value ? `${et.color}15` : 'transparent',
                    borderColor: scene.endType === et.value ? et.color : 'var(--border-default)',
                    color: scene.endType === et.value ? et.color : 'var(--text-muted)',
                  }}
                >
                  {et.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-sm">رسالة النهاية (عربي)</label>
            <input type="text" className="input-base text-sm mt-1"
              placeholder="رسالة تظهر عند النهاية..."
              value={scene.endMessage?.ar || ''}
              onChange={e => updateField('endMessage.ar', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label-sm" dir="ltr">End Message (English)</label>
            <input type="text" className="input-base text-sm mt-1" dir="ltr"
              placeholder="Message shown at the end..."
              value={scene.endMessage?.en || ''}
              onChange={e => updateField('endMessage.en', e.target.value)} />
          </div>
        </div>
      )}

      {/* Choices */}
      {!scene.isEnd && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label-sm">الاختيارات ({scene.choices.length}/4)</label>
            {scene.choices.length < 4 && (
              <button type="button" onClick={addChoice}
                className="btn-ghost text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                style={{ color: '#f59e0b' }}>
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
                  <input type="text" className="input-base text-xs py-2"
                    placeholder="نص الاختيار بالعربية"
                    value={choice.text?.ar || ''}
                    onChange={e => updateChoice(choice.id, { text: { ...choice.text, ar: e.target.value } })} />
                  <input type="text" className="input-base text-xs py-2" dir="ltr"
                    placeholder="Choice text in English"
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
                أضف اختياراً واحداً على الأقل لغير مشاهد النهاية
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
  const navigate  = useNavigate()
  const [step,    setStep]    = useState(0)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [uploading, setUploading] = useState(false)

  // Step 1: Basic info
  const [info, setInfo] = useState({
    title_ar: '', title_en: '',
    desc_ar: '', desc_en: '',
    cover: '',
    category: 'مغامرة',
    readingTime: 5,
  })

  // Step 2: Scenes
  const firstScene = DEFAULT_SCENE()
  const [scenes,     setScenes]     = useState([firstScene])
  const [firstSceneId, setFirstSceneId] = useState(firstScene.id)
  const [activeSid,  setActiveSid]  = useState(firstScene.id)

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

  async function handleCoverUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setInfo(i => ({ ...i, cover: url }))
    } catch { setError('فشل رفع الصورة. حاول مرة أخرى.') }
    setUploading(false)
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
    }

    const { data, error } = await storyHelpers.create(storyData)
    if (error) { setError(error.message || 'حدث خطأ أثناء الحفظ'); setSaving(false); return }
    navigate(`/story/${data.id}`)
  }

  // Validation
  const step1Valid = info.title_ar.trim().length > 2
  const step2Valid = scenes.length > 0 && scenes.every(s =>
    s.content?.ar?.trim() || s.isEnd
  )

  const activeScene = scenes.find(s => s.id === activeSid)

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      <div className="page-container py-10">
        <div className="max-w-4xl mx-auto">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                إنشاء قصة جديدة
              </h1>
            </div>
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

            {/* ── Step 0: Basic Info ─────────────── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6">

                <div className="card-flat p-6">
                  <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>معلومات القصة الأساسية</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label-sm">عنوان القصة (عربي) *</label>
                      <input type="text" className="input-base mt-1"
                        placeholder="عنوان رائع بالعربية..."
                        value={info.title_ar} onChange={e => setInfo(i => ({ ...i, title_ar: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm" dir="ltr">Story Title (English)</label>
                      <input type="text" className="input-base mt-1" dir="ltr"
                        placeholder="An amazing English title..."
                        value={info.title_en} onChange={e => setInfo(i => ({ ...i, title_en: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label-sm">وصف القصة (عربي)</label>
                      <textarea rows={3} className="input-base mt-1 resize-none"
                        placeholder="وصف مثير يشجع على القراءة..."
                        value={info.desc_ar} onChange={e => setInfo(i => ({ ...i, desc_ar: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label-sm" dir="ltr">Story Description (English)</label>
                      <textarea rows={3} className="input-base mt-1 resize-none" dir="ltr"
                        placeholder="An exciting description..."
                        value={info.desc_en} onChange={e => setInfo(i => ({ ...i, desc_en: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label-sm">التصنيف</label>
                      <select className="input-base mt-1"
                        value={info.category} onChange={e => setInfo(i => ({ ...i, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label-sm">وقت القراءة (دقائق)</label>
                      <input type="number" min={1} max={120} className="input-base mt-1"
                        value={info.readingTime} onChange={e => setInfo(i => ({ ...i, readingTime: +e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Cover Upload */}
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
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                        ارفع صورة جذابة لقصتك (JPG, PNG, WebP)
                      </p>
                      <label className="btn-secondary cursor-pointer inline-flex">
                        {uploading ? (
                          <><span className="w-4 h-4 border-2 border-t-yellow-500 rounded-full animate-spin" /> جاري الرفع...</>
                        ) : (
                          <><RiImageLine /> اختر صورة</>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                      </label>
                      {info.cover && (
                        <button onClick={() => setInfo(i => ({ ...i, cover: '' }))}
                          className="btn-ghost text-sm mr-2" style={{ color: '#ef4444' }}>
                          إزالة
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Scenes ─────────────────── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid lg:grid-cols-[220px,1fr] gap-6">

                  {/* Scene list */}
                  <div>
                    <div className="card-flat p-3 space-y-1 sticky top-20">
                      <p className="text-xs font-bold px-2 py-1 mb-2" style={{ color: 'var(--text-muted)' }}>
                        المشاهد ({scenes.length})
                      </p>
                      {scenes.map((s, i) => (
                        <button
                          key={s.id}
                          onClick={() => setActiveSid(s.id)}
                          className="w-full text-right px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                          style={{
                            background: activeSid === s.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                            color: activeSid === s.id ? '#f59e0b' : 'var(--text-secondary)',
                          }}
                        >
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

                  {/* Active scene editor */}
                  <div>
                    {activeScene ? (
                      <SceneEditor
                        scene={activeScene}
                        allScenes={scenes}
                        onChange={updated => updateScene(activeScene.id, updated)}
                        onDelete={() => deleteScene(activeScene.id)}
                        isFirst={activeScene.id === firstSceneId}
                        onSetFirst={id => setFirstSceneId(id)}
                      />
                    ) : (
                      <div className="card-flat p-12 text-center">
                        <p style={{ color: 'var(--text-muted)' }}>اختر مشهداً من القائمة لتعديله</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Preview ────────────────── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6">
                <div className="card-flat p-6">
                  <h2 className="font-bold text-xl mb-5" style={{ color: 'var(--text-primary)' }}>مراجعة القصة</h2>
                  <div className="flex gap-5 items-start flex-wrap">
                    {info.cover && (
                      <img src={info.cover} alt="cover" className="w-32 h-32 rounded-2xl object-cover shrink-0" />
                    )}
                    <div>
                      <h3 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{info.title_ar}</h3>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{info.desc_ar}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-gold">{info.category}</span>
                        <span className="badge">{scenes.length} مشهد</span>
                        <span className="badge">{info.readingTime} دقائق</span>
                        <span className="badge badge-crimson">{scenes.filter(s => s.isEnd).length} نهاية</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-flat p-6">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>ملخص المشاهد</h3>
                  <div className="space-y-2">
                    {scenes.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-3 py-2 border-b last:border-0"
                        style={{ borderColor: 'var(--border-subtle)' }}>
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>{i + 1}</span>
                        <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {s.title?.ar || `مشهد ${i + 1}`}
                        </span>
                        <div className="flex gap-1">
                          {s.id === firstSceneId && <span className="badge badge-green text-xs"><RiPlayLine /> بداية</span>}
                          {s.isEnd && <span className="badge badge-crimson text-xs"><RiFlagLine /> نهاية</span>}
                          {!s.isEnd && <span className="badge text-xs">{s.choices.length} اختيار</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => publish(false)} disabled={saving}
                    className="btn-secondary flex-1 justify-center py-3.5">
                    <RiEyeLine /> حفظ كمسودة
                  </button>
                  <button onClick={() => publish(true)} disabled={saving}
                    className="btn-primary flex-1 justify-center py-3.5">
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> جاري النشر...</>
                    ) : (
                      <><RiCheckLine /> نشر القصة 🚀</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="btn-secondary flex items-center gap-2"
              style={{ opacity: step === 0 ? 0.3 : 1 }}
            >
              <RiArrowRightLine /> السابق
            </button>
            {step < 2 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && !step1Valid) || (step === 1 && !step2Valid)}
                className="btn-primary flex items-center gap-2"
              >
                التالي <RiArrowLeftLine />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
