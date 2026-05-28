import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import useJobStore from '../../store/useJobStore'

export default function ChunkAccordion({ chapters }) {
  if (!chapters || chapters.length === 0) return null

  return (
    <div className="w-full flex flex-col gap-5 border-t border-border pt-10 text-left">
      <div className="flex flex-col gap-1.5">
        <h3 className="font-sans font-extrabold text-base text-foreground">
          Detailed Section Explanations
        </h3>
        <p className="font-sans text-xs text-muted-foreground leading-relaxed">
          Click any section below to reveal a simplified breakdown of specific whitepaper chapters.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
        {chapters.map((chapter, index) => {
          const title = chapter.title || `Chapter ${index + 1}`
          return (
            <AccordionItem
              value={`chapter-${index}`}
              key={index}
              className="glass rounded-lg border border-border px-5 py-0.5 shadow-sm transition-all hover:border-primary/20"
            >
              <AccordionTrigger className="font-sans font-bold text-sm text-foreground hover:text-primary transition-colors hover:no-underline py-4">
                <span className="flex items-center gap-3 text-left">
                  <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded border border-border text-muted-foreground/80 flex-shrink-0">
                    #{index + 1}
                  </span>
                  {title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 border-t border-border pt-5">
                {Array.isArray(chapter.points) && chapter.points.length > 0 ? (
                  <ul className="flex flex-col gap-2.5 pl-1">
                    {chapter.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 mt-[6px] h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="font-sans text-sm text-muted-foreground leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-sans text-xs text-muted-foreground italic">No detailed points available.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
