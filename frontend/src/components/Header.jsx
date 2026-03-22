import React from 'react'
import { Activity, Orbit, Sparkles } from 'lucide-react'
import { GlassPanel, SectionBadge } from './ui'

const Header = ({ topic, phase }) => {
  return (
    <header className="border-b border-white/10 p-4 sm:p-6 lg:p-8">
      <GlassPanel className="overflow-hidden bg-gradient-to-r from-slate-900/80 via-slate-900/70 to-cyan-500/10 p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-4">
            <SectionBadge icon={Sparkles}>Diplomatrix AI Control Room</SectionBadge>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Debate Topic</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-white md:text-4xl">{topic}</h1>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current Phase</p>
                  <p className="mt-1 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-lg font-semibold text-transparent">
                    {phase}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
                  <Orbit className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mode</p>
                  <p className="mt-1 text-lg font-semibold text-white">Live Simulation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>
    </header>
  )
}

export default Header
