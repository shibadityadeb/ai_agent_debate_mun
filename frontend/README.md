# Diplomatrix AI - Frontend

A modern React UI for the AI Debate system built with Vite and pure CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx         # Main container component
│   │   ├── Header.jsx            # Topic & status header
│   │   ├── CountryPanel.jsx      # Participant list
│   │   ├── DebateFeed.jsx        # Message feed
│   │   ├── MessageBubble.jsx     # Individual message component
│   │   ├── InsightPanel.jsx      # Votes, verdict, MCP context
│   │   ├── ControlPanel.jsx      # Input & controls
│   │   └── */*.css               # Component-scoped styles
│   ├── styles/
│   │   └── global.css            # Global variables & utilities
│   ├── data/
│   │   └── mockData.js           # Mock data for demo
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Background**: `#0f172a` (slate-950)
- **Secondary Background**: `#1e293b` (slate-900)
- **Accent Primary**: `#38bdf8` (cyan-400)
- **Accent Secondary**: `#0ea5e9` (cyan-500)
- **Text Primary**: `#f1f5f9` (slate-100)
- **Text Secondary**: `#cbd5e1` (slate-400)

### Effects
- Glassmorphism cards with backdrop blur
- Neon accent borders
- Smooth animations and transitions
- Responsive design (mobile-first)

## 🧩 Components

### Header
- Displays debate topic
- Shows live status
- Current round indicator

### CountryPanel
- List of participating countries
- Status indicators (speaking, active, waiting)
- Score display per country
- Visual legend

### DebateFeed
- Chat-style debate message display
- Real-time message updates
- Auto-scrolling to latest messages
- Empty state handling

### MessageBubble
- Country flag and name
- Message content with color accent per country
- Timestamp and round number
- Hover animations

### ControlPanel
- Topic input field
- Start Debate button
- Debate statistics
- Load template option

### InsightPanel
- **Votes**: Vote distribution with progress bars
- **Judge Verdict**: Current leader and reasoning with detailed scores
- **MCP Context**: Debate phase, time, current speaker, relevant context items

### Dashboard
- Master layout component
- 3-column grid layout (responsive)
- Manages state for mock data
- Integrates all components

## 🔄 State Management

Currently using React's `useState` for demo purposes. To integrate with backend:

1. Replace mock data with API calls
2. Implement WebSocket for real-time message updates
3. Add context provider for global state
4. Include error handling and loading states

## 🎯 Features

- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Dark theme with neon accents
- ✅ Glassmorphism UI cards
- ✅ Smooth animations and transitions
- ✅ Mock data demo
- ✅ Production-ready code structure
- ✅ Clean component architecture
- ✅ No external UI libraries (pure CSS)

## 🔗 Integration Points

### Backend API Endpoints (Ready for Integration)

```javascript
// Debate Management
POST /api/debate/start
GET  /api/debate/current
GET  /api/debate/messages
GET  /api/debate/status

// Real-time Updates (WebSocket)
WS /ws/debate/:debateId
```

## 🎮 Demo Data

The application includes comprehensive mock data:
- 5 participating countries with different statuses
- Sample debate messages with timestamps
- Vote counts and judge verdict
- MCP context information

## 📦 Dependencies

### Production
- React 18.2.0
- React DOM 18.2.0

### Development
- Vite 4.3.9
- @vitejs/plugin-react 4.0.0

## 📝 Code Style

- Functional components with React Hooks
- CSS modules per component
- Clear naming conventions
- Responsive grid-based layouts
- Accessible color contrasts

## 🚀 Deployment

```bash
# Build for production
npm run build

# Output is in the dist/ directory
# Deploy to any static hosting service
```

## 🎓 Future Enhancements

- User authentication
- Backend integration
- Real-time WebSocket updates
- Dark/Light theme toggle
- Message reactions
- Debate recording & playback
- Advanced analytics
- Export debate transcripts
