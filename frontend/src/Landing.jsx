import React from 'react'
import { ArrowRight, BadgeCheck, Bot, Globe2, ShieldCheck, Sparkles } from 'lucide-react'
import {
  DemoPreview,
  GlassPanel,
  GradientButton,
  NavBar,
  SectionBadge,
  StatCard,
} from './components/ui'

const featureCards = [
  {
    icon: Globe2,
    title: 'Geopolitical realism',
    text: 'Simulate bloc politics, caucusing pressure, and strategic trade-offs across major delegations.',
  },
  {
    icon: Bot,
    title: 'Instant prep loops',
    text: 'Generate speeches, rebuttals, and moderated caucus responses in a polished UN workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Judge-grade feedback',
    text: 'Review voting outcomes, persuasion quality, and context signals before your next committee.',
  },
]

function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-200">
      <div className="min-h-screen bg-hero-radial">
        <NavBar onStart={onStart} />

        <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 pb-20 pt-8 lg:px-10">
          <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-10">
            <div className="space-y-8">
              <SectionBadge icon={BadgeCheck}>#1 AI Debate Simulator</SectionBadge>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
                  Win Best Delegate.
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-500 bg-clip-text text-transparent">
                    Without the stress.
                  </span>
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                  AI-powered geopolitical debate simulation in seconds, built for delegates who want sharper
                  strategy, faster prep, and calmer committee days.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <GradientButton onClick={onStart} icon={ArrowRight}>
                  Start Debate
                </GradientButton>
                <button className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-400/40 hover:bg-white/10">
                  Watch Product Tour
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="5 agent orchestration" value="live" />
                <StatCard label="3 rounds" value="proven" />
                <StatCard label="1 moderator + 1 judging panel" value="standard" />
              </div>
            </div>

            <DemoPreview />
          </section>

          <section className="grid gap-5 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, text }) => (
              <GlassPanel
                key={title}
                className="group p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-glow"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
              </GlassPanel>
            ))}
          </section>


        </main>
      </div>
    </div>
  )
}

export default Landing
