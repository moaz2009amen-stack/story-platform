import { FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'

const VerifiedBadge = ({ size = 'small', showTooltip = true }) => {
  const sizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl',
    xl: 'text-2xl',
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1 verified-badge group relative"
    >
      <FiCheckCircle className={`${sizes[size]} text-blue-500`} />
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          حساب موثق ✓
        </span>
      )}
    </motion.span>
  )
}

export default VerifiedBadge
