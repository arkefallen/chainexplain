import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Shield, Zap, Globe, FileText } from 'lucide-react'
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
      {/* Hero Section - Offset Asymmetric Layout */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
        {/* Left Column: Copy & Actions (7 columns) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-semibold tracking-wider text-primary uppercase mb-6"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI-Powered ELI5 Engine</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
          >
            Demystify Complex{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Crypto Whitepapers
            </span>{' '}
            in Seconds.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="font-sans text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-8"
          >
            Don't get lost in mathematical equations and technical jargon. Upload any PDF and get a simplified, bilingual, 5-year-old style summary instantly.
          </motion.p>

          {/* CTA Button with Spring Hover & Tactile Feel */}
          <motion.div variants={itemVariants}>
            <Link to="/upload">
              <Button
                size="lg"
                className="group relative px-8 py-6 font-sans text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-lg shadow-primary/20 transition-all active:translate-y-[1px]"
              >
                Start Explaining
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Interactive Illustration (5 columns) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 relative flex items-center justify-center"
        >
          <div className="relative w-full max-w-[420px] aspect-[4/3] glass-card rounded-lg p-6 flex flex-col justify-between overflow-hidden shadow-2xl">
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-secondary/15 blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl -z-10" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono tracking-wider text-muted-foreground">ELI5_EXPLAINER_PIPELINE</span>
              </div>
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              </div>
            </div>

            {/* Floating visual elements */}
            <div className="flex flex-col gap-4 my-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  PDF
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-3/4 rounded bg-muted-foreground/20 mb-1.5" />
                  <div className="h-2 w-1/2 rounded bg-muted-foreground/10" />
                </div>
              </div>
              <div className="flex items-center justify-center py-2 text-muted-foreground/30">
                <ArrowRight className="h-5 w-5 animate-pulse rotate-90 lg:rotate-0" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                  AI
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-5/6 rounded bg-accent/20 mb-1.5" />
                  <div className="h-2 w-2/3 rounded bg-muted-foreground/20" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center bg-muted border border-border rounded px-3 py-2 text-[10px] font-mono text-muted-foreground">
              <span>PIPELINE: ACTIVE</span>
              <span className="text-accent font-bold">READY TO SIMPLIFY</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section - Asymmetric Columns Layout */}
      <section className="flex flex-col gap-12 border-t border-border pt-16">
        <motion.div variants={itemVariants} className="text-left">
          <h2 className="font-sans text-xs font-extrabold uppercase tracking-widest text-accent mb-3">
            Core Engine Features
          </h2>
          <p className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-foreground max-w-lg">
            Purpose-built to deliver extreme clarity in record time.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ELI5 Simplicity */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(99, 102, 241, 0.3)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="glass-card rounded-lg p-6 flex flex-col justify-start items-start text-left border border-border transition-all duration-300"
          >
            <div className="p-3 rounded bg-primary/10 text-primary border border-primary/15 mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-foreground mb-2">ELI5 Simplicity</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              We translate dense algorithmic descriptions, consensus rules, and cryptography into fun, relatable analogies a 5-year-old child can easily grasp.
            </p>
          </motion.div>

          {/* Card 2: Instant Bilingual Output */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(139, 92, 246, 0.3)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="glass-card rounded-lg p-6 flex flex-col justify-start items-start text-left border border-border transition-all duration-300"
          >
            <div className="p-3 rounded bg-secondary/10 text-secondary border border-secondary/15 mb-6">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-foreground mb-2">Bilingual Translation</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Every job renders dual high-fidelity summaries. Instantly switch between English and Bahasa Indonesia with a single fluid visual toggle.
            </p>
          </motion.div>

          {/* Card 3: Asynchronous Performance */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, borderColor: 'rgba(6, 182, 212, 0.3)' }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="glass-card rounded-lg p-6 flex flex-col justify-start items-start text-left border border-border transition-all duration-300"
          >
            <div className="p-3 rounded bg-accent/10 text-accent border border-accent/15 mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-sans text-lg font-bold text-foreground mb-2">Background Worker Pipeline</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">
              Uses an asynchronous Pub/Sub message broker and multi-page text chunking. Upload is immediate; track progress in real-time.
            </p>
          </motion.div>
        </div>
      </section>
    </motion.div>
  )
}
