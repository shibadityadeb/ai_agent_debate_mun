import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ country, flag, color, text, timestamp, round }) => {
  return (
    <div className="message-bubble animate-slide-in">
      <div className="message-header">
        <div className="message-sender">
          <span className="sender-flag">{flag}</span>
          <div className="sender-info">
            <h4 className="sender-name">{country}</h4>
            <span className="sender-time">{timestamp}</span>
          </div>
        </div>
        <span className="round-badge">Round {round}</span>
      </div>

      <div className="message-content">
        <div
          className="message-accent"
          style={{ backgroundColor: color }}
        ></div>
        <p className="message-text">{text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
