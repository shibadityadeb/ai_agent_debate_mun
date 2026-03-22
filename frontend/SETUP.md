# Diplomatrix AI - Frontend Setup Guide

## Getting Started

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 🎨 UI Features Included

✅ **Header** - Displays debate topic, live status, and round counter
✅ **CountryPanel** - Shows all participants with status indicators
✅ **DebateFeed** - Chat-style message display with real-time updates
✅ **MessageBubble** - Color-coded messages per country with metadata
✅ **ControlPanel** - Topic input and debate control buttons
✅ **InsightPanel** - Votes, judge verdicts, and MCP context
✅ **Dashboard** - Master layout orchestrating all components

## 🎯 Demo Features

- 5 Mock countries with different statuses
- Sample debate messages with timestamps
- Vote tracking
- Judge verdict with country scores
- MCP context items
- Responsive design
- Dark theme with neon blue accents
- Glassmorphism cards
- Smooth animations

## 🔄 Next Steps

After running the dev server:

1. **Test the UI** - All components display with mock data
2. **Explore Components** - Check individual component files in `src/components/`
3. **Customize Styling** - Modify CSS variables in `src/styles/global.css`
4. **Connect Backend** - Replace mock data with API calls
5. **Add WebSocket** - Implement real-time message updates

## 📞 Backend Integration

To connect with your backend:

1. Update mock data calls in `Dashboard.jsx`
2. Implement API service layer
3. Add WebSocket handler for live messages
4. Replace mock countries and messages with real data

Enjoy building with Diplomatrix AI! 🚀
