import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!textToCopy) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      whileTap={{ scale: 0.92 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-card border border-border text-xs font-semibold font-sans text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Copy summary to clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="flex items-center gap-1 text-accent"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Copied!</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy ELI5</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
