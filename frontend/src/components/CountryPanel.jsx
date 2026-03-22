import React from 'react';
import './CountryPanel.css';

const CountryPanel = ({ countries, activeSpeaker }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'speaking':
        return 'status-speaking';
      case 'active':
        return 'status-active';
      case 'waiting':
        return 'status-waiting';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'speaking':
        return '🎤';
      case 'active':
        return '✋';
      case 'waiting':
        return '⏳';
      default:
        return '○';
    }
  };

  return (
    <div className="country-panel glass-card">
      <div className="country-header">
        <h3 className="country-title">🌍 Participants</h3>
        <span className="country-count">{countries.length}</span>
      </div>

      <div className="country-list">
        {countries.map((country) => (
          <div
            key={country.id}
            className={`country-item ${getStatusColor(country.status)} ${
              country.name === activeSpeaker ? 'is-active-speaker' : ''
            }`}
          >
            <div className="country-flag-container">
              <span className="country-flag">{country.flag}</span>
              <span className={`status-indicator ${getStatusColor(country.status)}`}></span>
            </div>

            <div className="country-info">
              <h4 className="country-name">{country.name}</h4>
              <p className="country-status">
                <span className="status-icon">{getStatusIcon(country.status)}</span>
                <span className="status-text">{country.status}</span>
              </p>
            </div>

            <div className="country-score">
              <span className="score-label">Score</span>
              <span className="score-value">8.2</span>
            </div>
          </div>
        ))}
      </div>

      <div className="country-legend">
        <div className="legend-item">
          <span className="legend-dot speaking"></span>
          <span>Currently Speaking</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot active"></span>
          <span>Ready to Speak</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot waiting"></span>
          <span>Waiting</span>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;
