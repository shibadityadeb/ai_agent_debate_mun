import React from 'react'
import { motion } from 'framer-motion'

const MessageBubble = ({ country, flag, color, text, timestamp, round }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/80 text-xl">
            {flag}
          </div>
          <div>
            <p className="font-semibold text-white">{country}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{timestamp}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
          Round {round}
        </span>
      </div>

      <div className="mt-4 flex gap-4">
        <div className="w-1 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-sm leading-7 text-slate-200">{text}</p>
      </div>
    </motion.div>
  )
}

export default MessageBubble
