import React from 'react'
import { BarChart3, Gavel, Layers3, Vote } from 'lucide-react'
import { GlassPanel } from './ui'
import { mockMcpContext } from '../data/mockData'

const phaseDescriptions = {
  idle: 'Ready to brief delegates and launch the next moderated session.',
  loading: 'Building country context, strategy cards, and opening position summaries.',
  opening: 'Opening speeches are entering the chamber with primary policy framing.',
  'rebuttal-1': 'Delegates are testing each other’s claims and probing weak assumptions.',
  'rebuttal-2': 'Counter-positioning is escalating as blocs refine coalition strategy.',
  resolution: 'Key motions and compromise language are being synthesized.',
  voting: 'Votes are being tallied with alignment shifts across delegations.',
  judging: 'Judge analysis is complete with winner selection and reasoning.',
  error: 'The room needs attention before the next simulation can proceed.',
}

const InsightPanel = ({ phase = 'idle', votes = {}, verdict = null }) => {
  const totalVotes = Object.values(votes).reduce((sum, value) => sum + value, 0)
  const showVotes = phase === 'voting' || phase === 'judging'

  return (
    <div className="space-y-5">
      <GlassPanel className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Insights</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Live room telemetry</h2>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current phase</p>
          <p className="mt-2 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-2xl font-bold capitalize text-transparent">
            {phase}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{phaseDescriptions[phase] || phaseDescriptions.idle}</p>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
            <Vote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Votes</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Resolution alignment</h3>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {showVotes && totalVotes > 0 ? (
            Object.entries(votes).map(([label, count]) => {
              const width = totalVotes ? `${(count / totalVotes) * 100}%` : '0%'
              return (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-300">{label}</span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width }}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm leading-6 text-slate-400">Vote bars will populate once the chamber enters voting.</p>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Judge Result</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Verdict summary</h3>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm leading-6 text-slate-300">
            {verdict?.reasoning || 'The judge panel will publish the winner and final rationale after deliberation.'}
          </p>
          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Top outcome</p>
            <p className="mt-2 text-base font-semibold text-white">
              {verdict?.winner || 'Pending final committee judgment'}
            </p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/5 p-3 text-slate-200">
            <Layers3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">MCP Context</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Support signals</h3>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {mockMcpContext.contextItems.map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  )
}

export default InsightPanel
