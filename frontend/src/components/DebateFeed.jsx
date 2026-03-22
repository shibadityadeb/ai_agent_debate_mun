import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquareText, Radio } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { GlassPanel } from './ui'

const phaseDisplayNames = {
  opening: 'Opening Statements',
  'rebuttal-1': 'First Rebuttal',
  'rebuttal-2': 'Second Rebuttal',
  resolution: 'Draft Resolution',
  voting: 'Voting',
  judging: 'Final Judgment',
}

const DebateFeed = ({ messages, isLoading = false, phase = 'idle' }) => {
  const feedRef = React.useRef(null)

  React.useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages])

  const messagesByPhase = messages.reduce((grouped, message) => {
    const messagePhase = message.role || phase
    if (!grouped[messagePhase]) {
      grouped[messagePhase] = []
    }
    grouped[messagePhase].push(message)
    return grouped
  }, {})

  return (
    <GlassPanel className="flex min-h-[720px] flex-col p-5">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Debate Feed</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Live diplomatic exchange</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            {messages.length} messages
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            <MessageSquareText className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div ref={feedRef} className="mt-5 flex-1 space-y-6 overflow-y-auto pr-1">
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <Radio className="h-7 w-7 animate-pulse" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">Launching the room</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Delegates are preparing opening statements, alignment briefs, and caucus strategy.
            </p>
          </div>
        ) : null}

        {!isLoading && messages.length === 0 ? (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-slate-950/60 px-6 text-center">
            <div className="rounded-full bg-white/5 p-4 text-slate-300">
              <MessageSquareText className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-white">Waiting for debate to begin</h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Start a simulation below to watch arguments stream in with animated speaker updates.
            </p>
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {Object.entries(messagesByPhase).map(([messagePhase, phaseMessages]) => (
            <motion.div
              key={messagePhase}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="sticky top-0 z-10 flex justify-start">
                <span className="rounded-full border border-cyan-400/20 bg-slate-950/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 backdrop-blur-xl">
                  {phaseDisplayNames[messagePhase] || messagePhase}
                </span>
              </div>

              <div className="space-y-3">
                {phaseMessages.map((message) => (
                  <MessageBubble key={message.id} {...message} />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassPanel>
  )
}

export default DebateFeed
