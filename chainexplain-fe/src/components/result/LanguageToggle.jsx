import React from 'react'
import { motion } from 'framer-motion'
import useJobStore from '../../store/useJobStore'

export default function LanguageToggle() {
  const activeLang = useJobStore((state) => state.activeLang)
  const setLang = useJobStore((state) => state.setLang)

  const options = [
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'en', label: 'English' }
  ]

  return (
    <div className="inline-flex rounded-full bg-card border border-border p-1 relative select-none">
      {options.map((opt) => {
        const isActive = activeLang === opt.code
        
        return (
          <button
            key={opt.code}
            type="button"
            onClick={() => setLang(opt.code)}
            className={`relative px-4 py-1.5 font-sans text-xs font-semibold rounded-full transition-colors duration-200 z-10 ${
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {/* Sliding background indicator */}
            {isActive && (
              <motion.div
                layoutId="activeLangIndicator"
                className="absolute inset-0 bg-primary/20 border border-primary/25 rounded-full -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            )}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
