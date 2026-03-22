import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ onStartDebate, isLoading = false }) => {
  const [topic, setTopic] = useState('');

  const handleStartDebate = async () => {
    if (topic.trim()) {
      console.log('🎯 ControlPanel: Starting debate with topic:', topic);
      await onStartDebate(topic);
      setTopic('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleStartDebate();
    }
  };

  return (
    <div className="control-panel glass-card">
      <div className="control-header">
        <h3 className="control-title">🎛️ Control Panel</h3>
        <span className={`control-badge ${isLoading ? 'loading' : ''}`}>
          {isLoading ? 'Running...' : 'Ready'}
        </span>
      </div>

      <div className="control-body">
        <div className="input-group">
          <label className="input-label">Debate Topic</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter a debate topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <p className="input-hint">AI agents will prepare arguments and engage in structured debate</p>
        </div>

        <div className="control-actions">
          <button
            className={`button-base button-primary ${isLoading ? 'is-loading' : ''}`}
            onClick={handleStartDebate}
            disabled={!topic.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="loader"></span>
                Starting...
              </>
            ) : (
              <>
                <span>▶️</span> Start Debate
              </>
            )}
          </button>
          <button className="button-base button-secondary" disabled={isLoading}>
            📋 Load Template
          </button>
        </div>

        <div className="control-info">
          <div className="info-item">
            <span className="info-icon">⚙️</span>
            <div>
              <p className="info-title">Participants</p>
              <p className="info-value">5 Countries</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <div>
              <p className="info-title">Duration</p>
              <p className="info-value">~10 minutes</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📊</span>
            <div>
              <p className="info-title">Format</p>
              <p className="info-value">3 Rounds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
