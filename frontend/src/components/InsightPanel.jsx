import React from 'react'
import ReactMarkdown from 'react-markdown'
import { BarChart3, Gavel } from 'lucide-react'
import { GlassPanel } from './ui'

const phaseDescriptions = {
  idle: 'Ready to brief delegates and launch the next moderated session.',
  loading: 'Building country context, strategy cards, and opening position summaries.',
  opening: 'Opening speeches are entering the chamber with primary policy framing.',
  'rebuttal-1': 'Delegates are testing each other’s claims and probing weak assumptions.',
  'rebuttal-2': 'Counter-positioning is escalating as blocs refine coalition strategy.',
  resolution: 'Key motions and compromise language are being synthesized.',
  voting: 'Delegates are aligning around the moderator-led draft resolution.',
  judging: 'Judge analysis is complete with winner selection and reasoning.',
  error: 'The room needs attention before the next simulation can proceed.',
}

const scoreKeys = ['logic', 'diplomacy', 'facts', 'strategy']

function parseJudgePayload(verdict) {
  let parsed = {}

  try {
    parsed = typeof verdict === 'string' ? JSON.parse(verdict) : verdict || {}
  } catch (error) {
    parsed = {}
  }

  return parsed && typeof parsed === 'object' ? parsed : {}
}

function getScoreEntries(parsedJudge) {
  if (parsedJudge?.scores && typeof parsedJudge.scores === 'object') {
    return Object.entries(parsedJudge.scores)
  }

  return Object.entries(parsedJudge).filter(([key, value]) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false
    }

    return scoreKeys.some((scoreKey) => typeof value[scoreKey] === 'number')
  })
}

function getWinner(parsedJudge) {
  if (parsedJudge?.winner) {
    return parsedJudge.winner
  }

  const entries = getScoreEntries(parsedJudge)
  if (!entries.length) {
    return 'Pending'
  }

  const ranked = entries
    .map(([country, scores]) => [
      country,
      scoreKeys.reduce((sum, key) => sum + Number(scores?.[key] || 0), 0),
    ])
    .sort((a, b) => b[1] - a[1])

  return ranked[0][0]
}

function getReasoning(parsedJudge) {
  return parsedJudge?.reasoning || 'Short reasoning will be added after judge deliberation.'
}

const InsightPanel = ({ phase = 'idle', verdict = null, resolution = '' }) => {
  const parsedJudge = parseJudgePayload(verdict)
  const scoreEntries = getScoreEntries(parsedJudge)
  const winner = getWinner(parsedJudge)
  const reasoning = getReasoning(parsedJudge)

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto pr-2 [scrollbar-color:rgba(148,163,184,0.45)_transparent] [scrollbar-width:thin]">
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

      <GlassPanel className="flex h-full flex-col overflow-hidden p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-300">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Moderator Verdict</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Final committee conclusion</h3>
          </div>
        </div>

        <div className="mt-5 max-h-[250px] overflow-y-auto rounded-2xl bg-slate-900 p-4 [scrollbar-color:rgba(148,163,184,0.45)_transparent] [scrollbar-width:thin]">
          <ReactMarkdown
            components={{
              strong: ({ node, ...props }) => <span className="font-semibold text-cyan-400" {...props} />,
              p: ({ node, ...props }) => <p className="mb-2 text-sm leading-relaxed text-gray-300" {...props} />,
              h1: ({ node, ...props }) => <h1 className="mb-2 text-lg font-semibold text-white" {...props} />,
              h2: ({ node, ...props }) => <h2 className="mb-2 text-base font-semibold text-white" {...props} />,
              h3: ({ node, ...props }) => <h3 className="mb-2 text-sm font-semibold text-white" {...props} />,
              ul: ({ node, ...props }) => <ul className="my-2 list-disc pl-5 text-gray-300" {...props} />,
              ol: ({ node, ...props }) => <ol className="my-2 list-decimal pl-5 text-gray-300" {...props} />,
              li: ({ node, ...props }) => <li className="my-1 text-sm leading-relaxed" {...props} />,
            }}
          >
            {resolution || 'The moderator conclusion will appear here once the draft resolution is finalized.'}
          </ReactMarkdown>
        </div>
      </GlassPanel>

      <GlassPanel className="flex h-full flex-col overflow-hidden p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
            <Gavel className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Judge Result</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Verdict summary</h3>
          </div>
        </div>

        <div className="mt-5 flex-1 overflow-y-auto rounded-2xl bg-slate-900 p-4 [scrollbar-color:rgba(148,163,184,0.45)_transparent] [scrollbar-width:thin]">
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-950/70 p-3">
              <h2 className="font-semibold text-green-400">Judge Verdict</h2>
              <p className="mt-2 text-sm font-medium text-white">Winner: {winner}</p>
            </div>

            {scoreEntries.length > 0 ? (
              <div className="space-y-3 rounded-2xl bg-slate-900">
                {scoreEntries.map(([country, scores]) => {
                  const total = scoreKeys.reduce((sum, key) => sum + Number(scores?.[key] || 0), 0)
                  const width = `${Math.max(0, Math.min(100, (total / 40) * 100))}%`

                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex justify-between text-sm text-slate-200">
                        <span>{country}</span>
                        <span>{total}/40</span>
                      </div>

                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div className="h-2 rounded-full bg-green-400" style={{ width }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Judge score breakdown is not available yet.</p>
            )}

            <div className="rounded-xl bg-slate-950/70 p-3">
              <p className="text-sm leading-relaxed text-gray-300">{reasoning}</p>
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  )
}

export default InsightPanel
