import { useState, useEffect } from 'react'

/**
 * Hook لتأخير تنفيذ الدوال (مثل البحث)
 * @param {any} value - القيمة المراد تأخيرها
 * @param {number} delay - مدة التأخير بالمللي ثانية
 * @returns {any} - القيمة بعد التأخير
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook لتأخير استدعاء دالة (للمنع من الضغط المتكرر)
 * @param {Function} callback - الدالة المراد استدعاؤها
 * @param {number} delay - مدة التأخير
 * @returns {Function} - الدالة المعدلة
 */
export const useDebouncedCallback = (callback, delay = 500) => {
  let timeoutId
  
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

/**
 * Hook لمنع الضغط المتكرر على الأزرار (Throttle)
 * @param {Function} callback - الدالة المراد استدعاؤها
 * @param {number} limit - الحد الأدنى للفاصل الزمني
 * @returns {Function} - الدالة المعدلة
 */
export const useThrottle = (callback, limit = 1000) => {
  let lastCall = 0
  
  return (...args) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      callback(...args)
    }
  }
}
