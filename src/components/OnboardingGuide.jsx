import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiChevronRight, FiChevronLeft, FiCheck, FiBookOpen, FiEdit, FiGitBranch, FiAward, FiUserCheck } from 'react-icons/fi'

const ONBOARDING_KEY = 'onboarding_completed'

const steps = [
  {
    title: 'مرحباً بك في قصتك على طريقتك!',
    description: 'منصة تفاعلية للقصص حيث يمكنك القراءة والكتابة والمشاركة. دعنا نأخذك في جولة سريعة.',
    icon: FiBookOpen,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'كيف تقرأ القصص',
    description: 'اختر أي قصة من الصفحة الرئيسية أو مكتبة القصص. ستظهر لك القصة بشكل جذاب مع إمكانية التنقل بين المشاهد (للقصص التفاعلية).',
    icon: FiBookOpen,
    color: 'from-green-500 to-green-600',
    tips: [
      'يمكنك تغيير لغة العرض في قارئ القصة',
      'سيتم حفظ تقدمك تلقائياً',
      'يمكنك تقييم القصة بعد الانتهاء'
    ]
  },
  {
    title: 'كيف تنشئ قصة عادية',
    description: 'اختر "عادية" في خطوة نوع القصة. اكتب المشاهد بالترتيب من البداية إلى النهاية.',
    icon: FiEdit,
    color: 'from-orange-500 to-orange-600',
    tips: [
      'أضف صوراً لكل مشهد من Unsplash',
      'استخدم زر الترجمة للترجمة بين العربية والإنجليزية',
      'احفظ كمسودة أو انشر مباشرة'
    ]
  },
  {
    title: 'كيف تنشئ قصة تفاعلية',
    description: 'اختر "تفاعلية" وأضف اختيارات لكل مشهد. اربط كل اختيار بمشهد آخر لإنشاء فروع متعددة.',
    icon: FiGitBranch,
    color: 'from-purple-500 to-purple-600',
    tips: [
      'تأكد من وجود مشهد بداية واحد',
      'أضف مشاهد نهاية مع أنواع مختلفة (نجاح/فشل/محايد)',
      'يمكنك معاينة القصة قبل النشر'
    ]
  },
  {
    title: 'إدارة حسابك',
    description: 'في صفحة "حسابي" يمكنك تعديل معلوماتك الشخصية، وإدارة قصصك، ومشاهدة سجل قراءتك.',
    icon: FiUserCheck,
    color: 'from-teal-500 to-teal-600',
    tips: [
      'يمكنك تغيير اسم المستخدم مرة واحدة كل 30 يوماً',
      'قصصك المنشورة تظهر للجميع',
      'المسودات تظهر لك فقط'
    ]
  },
  {
    title: 'إشارة التحقق الزرقاء',
    description: 'انشر 10 قصص أو أكثر، ثم اطلب التوثيق من صفحة حسابك. بعد موافقة الإدارة، ستحصل على الشارة الزرقاء ✓',
    icon: FiAward,
    color: 'from-yellow-500 to-yellow-600',
    tips: [
      'الشارة تظهر بجانب اسمك في كل مكان',
      'تزيد من مصداقيتك ككاتب',
      'تفتح لك ميزات إضافية في المستقبل'
    ]
  },
]

const OnboardingGuide = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY)
    if (!completed) {
      setIsOpen(true)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setIsOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-md w-full bg-[var(--bg-elevated)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-gold-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                <Icon className="text-3xl text-white" />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-center mb-2">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-[var(--text-muted)] text-center mb-4">
                {step.description}
              </p>

              {/* Tips */}
              {step.tips && (
                <div className="bg-[var(--bg-surface)] rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold mb-2">💡 نصائح سريعة:</p>
                  <ul className="space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                        <FiCheck className="text-green-500 text-xs" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step Counter */}
              <div className="flex justify-center gap-1 mb-6">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-6 bg-gold-500'
                        : i < currentStep
                        ? 'w-1.5 bg-gold-300'
                        : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="flex-1 py-2 rounded-lg border border-[var(--border-light)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <FiChevronRight />
                    السابق
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className={`flex-1 py-2 rounded-lg bg-gold-500 text-white hover:bg-gold-600 transition-all duration-300 flex items-center justify-center gap-2 ${
                    currentStep === 0 ? 'flex-1' : ''
                  }`}
                >
                  {isLastStep ? (
                    <>
                      ابدأ الرحلة
                      <FiCheck />
                    </>
                  ) : (
                    <>
                      التالي
                      <FiChevronLeft />
                    </>
                  )}
                </button>
              </div>

              {/* Skip Link */}
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-sm text-[var(--text-muted)] hover:text-gold-500 transition-colors"
              >
                تخطي الدليل
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OnboardingGuide
