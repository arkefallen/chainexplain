import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'

// Lightweight Markdown Formatter for pristine rendering
function formatMarkdown(text) {
  if (!text) return null

  // Split into block paragraphs
  const paragraphs = text.split('\n\n')

  return paragraphs.map((para, pIdx) => {
    let content = para.trim()
    if (!content) return null

    // Check if it's a list item
    const isBulletList = content.startsWith('- ') || content.startsWith('* ')
    const isNumberedList = /^\d+\.\s/.test(content)

    // Regex to format **bold** words
    const formatBoldText = (str) => {
      const parts = str.split(/\*\*(.*?)\*\*/g)
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} className="font-extrabold text-foreground bg-primary/5 px-1 rounded-sm">
              {part}
            </span>
          )
        }
        return part
      })
    }

    if (isBulletList) {
      const cleanText = content.substring(2)
      return (
        <ul key={pIdx} className="list-disc pl-5 my-2.5 space-y-1 font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
          <li>{formatBoldText(cleanText)}</li>
        </ul>
      )
    }

    if (isNumberedList) {
      const match = content.match(/^(\d+)\.\s(.*)/)
      const num = match[1]
      const cleanText = match[2]
      return (
        <div key={pIdx} className="flex gap-3 my-3 text-left">
          <span className="font-mono font-bold text-xs bg-primary/10 border border-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
            {num}
          </span>
          <p className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed flex-1 mt-0.5">
            {formatBoldText(cleanText)}
          </p>
        </div>
      )
    }

    // Default Paragraph
    return (
      <p key={pIdx} className="font-sans text-sm sm:text-base text-muted-foreground leading-relaxed text-left my-3">
        {formatBoldText(content)}
      </p>
    )
  })
}

export default function SummaryCard({ summaryText }) {
  return (
    <div className="w-full glass rounded-lg p-6 md:p-8 flex flex-col gap-6 border border-border shadow-2xl relative overflow-hidden text-left">
      {/* Decorative gradient corner */}
      <div className="absolute -top-[20%] -right-[15%] h-52 w-52 rounded-full bg-secondary/5 blur-[45px] -z-10" />
      
      {/* Card Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 rounded bg-primary/10 text-primary border border-primary/15">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-extrabold text-sm text-foreground uppercase tracking-wider">
            ELI5 Explanation
          </span>
          <span className="font-sans text-[10px] text-muted-foreground/60 uppercase tracking-widest">
            SIMPLIFIED CRYPTO CONCEPT
          </span>
        </div>
      </div>

      {/* Structured Content Area */}
      <article className="flex flex-col">
        {formatMarkdown(summaryText)}
      </article>
    </div>
  )
}
