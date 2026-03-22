export const mockDebateTopic = "Should AI regulation prioritize innovation or safety?";

export const mockCountries = [
  {
    id: 1,
    name: "United States",
    status: "speaking",
    color: "#3b82f6",
    flag: "🇺🇸"
  },
  {
    id: 2,
    name: "European Union",
    status: "active",
    color: "#8b5cf6",
    flag: "🇪🇺"
  },
  {
    id: 3,
    name: "China",
    status: "active",
    color: "#ec4899",
    flag: "🇨🇳"
  },
  {
    id: 4,
    name: "India",
    status: "waiting",
    color: "#f59e0b",
    flag: "🇮🇳"
  },
  {
    id: 5,
    name: "United Kingdom",
    status: "waiting",
    color: "#10b981",
    flag: "🇬🇧"
  }
];

export const mockMessages = [
  {
    id: 1,
    country: "United States",
    flag: "🇺🇸",
    color: "#3b82f6",
    text: "We believe that innovation should be balanced with reasonable safeguards. The tech industry has demonstrated self-regulatory capacity.",
    timestamp: "2:34 PM",
    round: 1
  },
  {
    id: 2,
    country: "European Union",
    flag: "🇪🇺",
    color: "#8b5cf6",
    text: "The EU perspective emphasizes that regulation must come first. Without proper oversight, we risk catastrophic outcomes.",
    timestamp: "2:36 PM",
    round: 1
  },
  {
    id: 3,
    country: "China",
    flag: "🇨🇳",
    color: "#ec4899",
    text: "We support a balanced approach with government-industry collaboration. State guidance is essential for responsible AI development.",
    timestamp: "2:38 PM",
    round: 1
  },
  {
    id: 4,
    country: "United States",
    flag: "🇺🇸",
    color: "#3b82f6",
    text: "We must acknowledge that over-regulation could stifle breakthrough innovations that benefit humanity globally.",
    timestamp: "2:40 PM",
    round: 2
  },
  {
    id: 5,
    country: "India",
    flag: "🇮🇳",
    color: "#f59e0b",
    text: "As a developing nation, we're concerned that restrictive regulations could exclude us from AI advancement opportunities.",
    timestamp: "2:42 PM",
    round: 2
  }
];

export const mockVotes = {
  "Innovation First": 2,
  "Safety First": 2,
  "Balanced Approach": 1
};

export const mockJudgeResult = {
  winner: "Balanced Approach",
  reasoning: "The balanced approach acknowledging both innovation and safety concerns presents the most pragmatic path forward for global AI governance.",
  scores: {
    "United States": 8.5,
    "European Union": 9.2,
    "China": 8.8
  }
};

export const mockMcpContext = {
  debatePhase: "Round 2 - Rebuttal",
  timeRemaining: "4:32",
  totalSpeakers: 5,
  activeSpeaker: "United States",
  contextItems: [
    "AI safety standards ISO/IEC 42001",
    "EU AI Act requirements",
    "US Executive Order on AI",
    "Industry self-regulation frameworks"
  ]
};
