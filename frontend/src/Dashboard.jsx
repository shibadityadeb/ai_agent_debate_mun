import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Header from './components/Header'
import CountryPanel from './components/CountryPanel'
import DebateFeed from './components/DebateFeed'
import ControlPanel from './components/ControlPanel'
import InsightPanel from './components/InsightPanel'
import { runDebate } from './services/api'
import { mockCountries, mockDebateTopic } from './data/mockData'

const phases = ['opening', 'rebuttal-1', 'rebuttal-2', 'resolution', 'voting', 'judging']

const phaseLabels = {
  idle: 'Ready Room',
  loading: 'Initializing Session',
  opening: 'Opening Statements',
  'rebuttal-1': 'Rebuttal One',
  'rebuttal-2': 'Rebuttal Two',
  resolution: 'Draft Resolution',
  voting: 'Voting Bloc',
  judging: 'Judge Review',
  error: 'Attention Needed',
}

function Dashboard({ onBack }) {
  const [currentTopic, setCurrentTopic] = useState(mockDebateTopic)
  const [messages, setMessages] = useState([])
  const [activeSpeaker, setActiveSpeaker] = useState('United States')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [votes, setVotes] = useState({ yes: 0, no: 0, abstain: 0 })
  const [verdict, setVerdict] = useState(null)
  const [participants, setParticipants] = useState(() =>
    mockCountries.map((country, index) => ({
      ...country,
      score: (8.2 + index * 0.2).toFixed(1),
      status: country.status || 'waiting',
    })),
  )

  const updateParticipantStatus = (speaker, spokenSet) => {
    setParticipants((prev) =>
      prev.map((country) => {
        if (country.name === speaker) {
          return { ...country, status: 'speaking' }
        }

        if (spokenSet.has(country.name)) {
          return { ...country, status: 'active' }
        }

        return { ...country, status: 'waiting' }
      }),
    )
  }

  const handleStartDebate = async (topic) => {
    if (!topic.trim()) {
      setError('Topic cannot be empty.')
      return
    }

    setIsLoading(true)
    setPhase('loading')
    setError(null)
    setMessages([])
    setVerdict(null)
    setVotes({ yes: 0, no: 0, abstain: 0 })
    setParticipants(
      mockCountries.map((country, index) => ({
        ...country,
        score: (8.2 + index * 0.2).toFixed(1),
        status: 'waiting',
      })),
    )

    try {
      const response = await runDebate(topic, mockCountries.map((country) => country.name))

      if (response.history && Array.isArray(response.history)) {
        const judgeMessage = response.history.find((item) => item.role === 'judging')

        if (judgeMessage?.content) {
          try {
            setVerdict(JSON.parse(judgeMessage.content))
          } catch {
            setVerdict(null)
          }
        }

        setCurrentTopic(topic)
        simulateDebateRounds(response.history, response.final_state)
      } else {
        throw new Error('No debate history returned by the API.')
      }
    } catch (err) {
      setError(`Failed to start debate: ${err.message}`)
      setPhase('error')
      setIsLoading(false)
    }
  }

  const simulateDebateRounds = (history, finalState) => {
    setMessages([])
    setPhase('opening')

    const spoken = new Set()
    const messagesByPhase = {}

    history.forEach((msg) => {
      const currentPhase = msg.phase || msg.role
      if (!messagesByPhase[currentPhase]) {
        messagesByPhase[currentPhase] = []
      }
      messagesByPhase[currentPhase].push(msg)
    })

    let totalDelay = 0
    const delayPerMessage = 1100

    phases.forEach((currentPhase) => {
      const phaseMessages = messagesByPhase[currentPhase] || []
      if (!phaseMessages.length) {
        return
      }

      totalDelay += 450

      setTimeout(() => {
        setPhase(currentPhase)
      }, totalDelay)

      phaseMessages.forEach((msg, index) => {
        totalDelay += delayPerMessage

        setTimeout(() => {
          const transformedMessage = {
            id: `${currentPhase}-${index}-${msg.agent || msg.country || 'delegate'}`,
            country: msg.country || msg.agent,
            flag: msg.flag || '🌐',
            color: msg.color || '#22d3ee',
            text: msg.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            round: msg.round || index + 1,
            role: msg.role || currentPhase,
            agent: msg.agent,
          }

          setMessages((prev) => [...prev, transformedMessage])
          setActiveSpeaker(msg.agent || msg.country || '')

          if (msg.agent && msg.agent !== 'Moderator' && msg.agent !== 'Judge') {
            spoken.add(msg.agent)
          }

          updateParticipantStatus(msg.agent, spoken)
        }, totalDelay)
      })
    })

    totalDelay += delayPerMessage

    setTimeout(() => {
      if (finalState?.votes) {
        setVotes(finalState.votes)
      }

      setParticipants((prev) =>
        prev.map((country) => ({
          ...country,
          status: spoken.has(country.name) ? 'active' : country.status,
        })),
      )

      setPhase('judging')
      setIsLoading(false)
    }, totalDelay)
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-4 text-gray-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] rounded-[2rem] border border-white/10 bg-slate-950/90 shadow-panel">
        <Header topic={currentTopic} phase={phaseLabels[phase] || phase} />

        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-xl transition duration-300 hover:scale-[1.02] hover:border-cyan-400/30 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to landing
          </button>
        </div>

        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
            <CountryPanel countries={participants} activeSpeaker={activeSpeaker} />
            <DebateFeed messages={messages} isLoading={isLoading} phase={phase} />
            <InsightPanel phase={phase} votes={votes} verdict={verdict} />
          </div>

          <ControlPanel onStartDebate={handleStartDebate} isLoading={isLoading} />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
