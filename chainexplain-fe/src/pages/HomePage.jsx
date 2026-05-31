import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, BrainCircuit, Globe, MoonStar, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
}

export default function HomePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-16 md:gap-24 py-4 md:py-8"
    >
      {/* Hero Section - Centered Stitch Layout */}
      <motion.section
        variants={itemVariants}
        className="flex flex-col items-center text-center gap-6 py-12 md:py-16"
      >
        {/* AI Powered Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 rounded-full mb-2 border border-indigo-500/20 shadow-sm"
        >
          <Sparkles className="text-indigo-600 dark:text-indigo-400 h-4 w-4 animate-pulse" />
          <span className="font-sans text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
            AI Powered
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          className="font-sans text-4xl sm:text-5xl lg:text-[64px] lg:leading-[72px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 max-w-[850px]"
        >
          Understand{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 dark:from-indigo-400 dark:via-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
            Crypto Whitepapers
          </span>{' '}
          in Seconds
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          className="font-sans text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-[650px] leading-relaxed"
        >
          AI-powered ELI5 summaries for the decentralized world. Skip the jargon and find the potential immediately.
        </motion.p>

        {/* Actions CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <Link to="/upload">
            <Button
              size="lg"
              className="group relative px-8 py-6 font-sans text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30 flex items-center gap-2 active:scale-98"
            >
              Start Summarizing
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>

          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-sans text-base font-bold px-8 py-6 rounded-lg bg-slate-100 dark:bg-slate-800/10 hover:bg-slate-200/80 dark:hover:bg-slate-800/30 transition-all active:scale-98"
          >
            View Demo
          </Button>
        </div>
      </motion.section>

      {/* Problem Section - 2-Column Asymmetric Stitch Layout */}
      <motion.section
        variants={itemVariants}
        className="py-12 md:py-16 border-t border-slate-200 dark:border-slate-800/50"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start justify-between">
          {/* Left Column: Heading */}
          <div className="md:w-1/2">
            <h2 className="font-sans text-3xl sm:text-4xl md:text-[40px] md:leading-[48px] font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              The Crypto Information Gap
            </h2>
          </div>

          {/* Right Column: Why We Exist & Text */}
          <div className="md:w-1/2 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Info className="h-4.5 w-4.5" />
              <span className="font-sans text-xs font-bold uppercase tracking-widest">
                Why we exist
              </span>
            </div>
            <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Web3 moves at lightning speed, but whitepapers are long, technical, and full of jargon. Investors miss out on alpha because they don't have time to read 40-page PDFs. We bridge that gap.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        id="features"
        variants={itemVariants}
        className="flex flex-col gap-12 border-t border-slate-200 dark:border-slate-800/50 pt-16"
      >
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <h2 className="font-sans text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Key Features
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl">
            Powerful tools for the modern investor.
          </p>
        </div>

        {/* 3-Column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
          {/* Card 1: ELI5 AI Summarizer */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(99, 102, 241, 0.4)', boxShadow: '0 20px 45px -15px rgba(99,102,241,0.15)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="bg-white/60 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/40 rounded-xl p-8 flex flex-col gap-5 hover:border-indigo-500/30 transition-colors backdrop-blur-md group shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700/80 group-hover:scale-105 group-hover:bg-indigo-500/10 transition-all duration-300">
              <BrainCircuit className="text-indigo-600 dark:text-indigo-400 h-6 w-6" />
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-sans text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                ELI5 AI Summarizer
              </h3>
              <p className="font-sans text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Simplifying complex technology into clear, easy-to-understand insights.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Localization */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(139, 92, 246, 0.4)', boxShadow: '0 20px 45px -15px rgba(139,92,246,0.15)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="bg-white/60 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/40 rounded-xl p-8 flex flex-col gap-5 hover:border-violet-500/30 transition-colors backdrop-blur-md group shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700/80 group-hover:scale-105 group-hover:bg-violet-500/10 transition-all duration-300">
              <Globe className="text-violet-600 dark:text-violet-400 h-6 w-6" />
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-sans text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                Localization
              </h3>
              <p className="font-sans text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Support for English and Indonesian, with more global languages coming soon.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Personalized Experience */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(99, 102, 241, 0.4)', boxShadow: '0 20px 45px -15px rgba(99,102,241,0.15)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="bg-white/60 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/40 rounded-xl p-8 flex flex-col gap-5 hover:border-indigo-500/30 transition-colors backdrop-blur-md group shadow-sm"
          >
            <div className="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800/80 flex items-center justify-center border border-slate-200 dark:border-slate-700/80 group-hover:scale-105 group-hover:bg-indigo-500/10 transition-all duration-300">
              <MoonStar className="text-indigo-600 dark:text-indigo-400 h-6 w-6" />
            </div>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-sans text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                Personalized Experience
              </h3>
              <p className="font-sans text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose between Dark and Light mode for your optimal reading comfort.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  )
}
