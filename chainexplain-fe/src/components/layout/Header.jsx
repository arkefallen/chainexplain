import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Terminal, Cpu, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useJobStore from '@/store/useJobStore'

export default function Header() {
  const reset = useJobStore((state) => state.reset)
  const theme = useJobStore((state) => state.theme)
  const toggleTheme = useJobStore((state) => state.toggleTheme)
  const navigate = useNavigate()

  const handleLogoClick = (e) => {
    e.preventDefault()
    reset()
    navigate('/')
  }

  return (
    <header className="glass-nav sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a 
          href="/" 
          onClick={handleLogoClick}
          className="group flex items-center gap-2.5 font-sans text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground transition-transform duration-300 group-hover:scale-105">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="font-sans font-extrabold tracking-wider bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Chain<span className="text-foreground">Explain</span>
          </span>
        </a>

        {/* Navigation / Links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <a
            href="/"
            onClick={handleLogoClick}
            className="font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </a>
          <Link
            to="/upload"
            className="rounded-full bg-primary/10 px-4 py-1.5 font-sans text-xs font-semibold text-primary border border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all duration-200"
          >
            ELI5 Summarizer
          </Link>

          {/* High-Fidelity Animated Theme Switch */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={theme}
              onClick={toggleTheme}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all relative overflow-hidden flex items-center justify-center h-8 w-8"
              aria-label="Toggle theme"
            >
              <motion.div
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-violet-600" />
                )}
              </motion.div>
            </motion.button>
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
}
