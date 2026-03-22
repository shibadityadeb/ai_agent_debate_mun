import React from 'react';
import './Header.css';

const Header = ({ topic }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">⚖️</span>
          <h1 className="logo-text">Diplomatrix AI</h1>
        </div>
        <div className="topic-container">
          <h2 className="topic-title">Debate Topic</h2>
          <p className="topic-text">{topic}</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-label">Status</span>
            <span className="stat-value accent-text">LIVE</span>
          </div>
          <div className="stat">
            <span className="stat-label">Round</span>
            <span className="stat-value">2/3</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
