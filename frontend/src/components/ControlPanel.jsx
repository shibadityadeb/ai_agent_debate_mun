import React, { useState } from 'react'
import { Rocket, Sparkles, Wand2 } from 'lucide-react'
import { GlassPanel, GradientButton } from './ui'

const presets = [
  'Should AI regulation prioritize innovation or safety?',
  'How should the UN address climate migration financing?',
  'What is the best multilateral response to AI-enabled cyber warfare?',
]

const ControlPanel = ({ onStartDebate, isLoading = false }) => {
  const [topic, setTopic] = useState('')

  const handleStartDebate = async () => {
    if (!topic.trim() || isLoading) {
      return
    }

    await onStartDebate(topic)
    setTopic('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleStartDebate()
    }
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Control Panel</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Launch a new committee simulation</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              {isLoading ? 'Running' : 'Ready'}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-200">Debate Topic</label>
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-2">
              <input
                type="text"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Enter a high-stakes UN topic..."
                className="w-full rounded-[1rem] border-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <p className="text-sm text-slate-400">
              Build a multi-country simulation with speaking rounds, voting, and judge rationale.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTopic(preset)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition duration-300 hover:border-cyan-400/30 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {[
              ['Delegates', '5 countries', Rocket],
              ['Format', '3 rounds', Wand2],
              ['Experience', 'Premium live UI', Sparkles],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-1 font-semibold text-white">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <GradientButton
            onClick={handleStartDebate}
            disabled={!topic.trim() || isLoading}
            className="w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Starting Debate...' : 'Start Debate'}
          </GradientButton>
        </div>
      </div>
    </GlassPanel>
  )
}

export default ControlPanel
