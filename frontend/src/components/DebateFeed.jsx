import React from 'react';
import MessageBubble from './MessageBubble';
import './DebateFeed.css';

const DebateFeed = ({ messages, isLoading = false, phase = 'idle' }) => {
  const feedRef = React.useRef(null);

  React.useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  // Group messages by phase
  const messagesByPhase = {};
  messages.forEach((msg) => {
    const ph = msg.role || phase;
    if (!messagesByPhase[ph]) {
      messagesByPhase[ph] = [];
    }
    messagesByPhase[ph].push(msg);
  });

  const phaseDisplayNames = {
    'opening': '🎤 Opening Statements',
    'rebuttal-1': '🔄 First Rebuttal',
    'rebuttal-2': '🔄 Second Rebuttal',
    'resolution': '📋 Resolution',
    'voting': '🗳️ Voting',
    'judging': '⚖️ Final Judgment'
  };

  return (
    <div className="debate-feed glass-card">
      <div className="feed-header">
        <h3 className="feed-title">💬 Debate Feed</h3>
        <span className="feed-message-count">{messages.length}</span>
        <span className="feed-phase">{phase !== 'idle' && phase !== 'loading' ? `📍 ${phase}` : ''}</span>
      </div>

      <div className="feed-content" ref={feedRef}>
        {isLoading && messages.length === 0 ? (
          <div className="feed-loading">
            <span className="loading-spinner"></span>
            <p className="loading-text">Agents are debating...</p>
            <p className="loading-hint">Processing responses from all participants</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="feed-empty">
            <span className="empty-icon">🤔</span>
            <p className="empty-text">Waiting for debate to start...</p>
            <p className="empty-hint">Start a debate from the control panel</p>
          </div>
        ) : (
          <div className="messages-container">
            {Object.entries(messagesByPhase).map(([ph, phaseMessages]) => (
              <div key={ph} className="phase-group">
                <div className="phase-header">
                  <h4 className="phase-name">{phaseDisplayNames[ph] || ph}</h4>
                </div>
                <div className="phase-messages">
                  {phaseMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      country={msg.country}
                      flag={msg.flag}
                      color={msg.color}
                      text={msg.text}
                      timestamp={msg.timestamp}
                      round={msg.round}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && messages.length > 0 && (
          <div className="feed-streaming">
            <span className="streaming-indicator">⏳ Streaming phase...</span>
          </div>
        )}
      </div>

      <div className="feed-footer">
        <div className="footer-info">
          <span className="footer-label">Live Updates</span>
          <span className="footer-indicator pulse">●</span>
        </div>
      </div>
    </div>
  );
};

export default DebateFeed;
