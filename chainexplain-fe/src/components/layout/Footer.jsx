import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-border py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-sans text-xs text-muted-foreground/60 tracking-wider">
          &copy; {new Date().getFullYear()} ChainExplain. All rights reserved.
        </p>
        <p className="mt-2 font-sans text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          Simplifying Web3 protocols for everyone, one block at a time.
        </p>
      </div>
    </footer>
  )
}
