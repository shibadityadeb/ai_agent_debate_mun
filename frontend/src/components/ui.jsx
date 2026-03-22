import React from 'react'
import { ArrowRight, Globe, Mic, Sparkles } from 'lucide-react'

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function GlassPanel({ children, className = '' }) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/10 bg-white/5 shadow-panel backdrop-blur-2xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SectionBadge({ children, icon: Icon = Sparkles }) {
  return (
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur-xl">
      <Icon className="h-4 w-4" />
      {children}
    </div>
  )
}

export function GradientButton({ children, icon: Icon = ArrowRight, className = '', ...props }) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-glow transition duration-300 hover:scale-[1.02] hover:brightness-110',
        className,
      )}
    >
      {children}
      <Icon className="h-4 w-4" />
    </button>
  )
}

export function NavBar({ onStart }) {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/40 to-cyan-400/30 text-cyan-200 ring-1 ring-white/15">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">Diplomatrix AI</p>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">UN Debate Simulator</p>
        </div>
      </div>

      <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
        {/* Nav links removed as requested */}
      </nav>

      <GradientButton onClick={onStart} className="px-5 py-2.5">
        Start Free
      </GradientButton>
    </header>
  )
}

export function StatCard({ label, value }) {
  return (
    <GlassPanel className="p-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </GlassPanel>
  )
}

export function DemoPreview() {
  const countries = ['USA', 'China', 'India']
  const topics = ['Climate', 'Security', 'Trade']

  return (
    <GlassPanel className="relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-blue-500/10" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Live Simulation Preview</p>
          <h2 className="mt-2 text-2xl font-bold text-white">ModelDiplomat-style debate room</h2>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          Live
        </div>
      </div>

      <div className="relative mt-6 space-y-5">
        <div className="ml-auto max-w-md rounded-[1.5rem] border border-cyan-400/25 bg-cyan-400/10 px-5 py-4 text-sm text-cyan-50 shadow-glow">
          How should the UN balance climate financing with national energy security?
        </div>

        <div className="flex flex-wrap gap-2">
          {countries.map((country, index) => (
            <button
              key={country}
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition duration-300',
                index === 0
                  ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/30 hover:text-white',
              )}
            >
              {country}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300"
            >
              {topic}
            </span>
          ))}
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
              <Mic className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-white">United States</p>
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-blue-200">
                  Opening
                </span>
              </div>
              <p className="text-sm leading-7 text-slate-300">
                We support a dual-track resolution: resilient energy investment today, paired with climate finance
                mechanisms that protect vulnerable states and preserve economic stability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassPanel>
  )
}
