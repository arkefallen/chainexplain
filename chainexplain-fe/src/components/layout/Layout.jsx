import React, { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import AnimatedBackground from '../ui/AnimatedBackground'
import useJobStore from '../../store/useJobStore'

export default function Layout({ children }) {
  const theme = useJobStore((state) => state.theme)

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-background font-sans antialiased text-foreground">
      {/* Premium Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col justify-start relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
