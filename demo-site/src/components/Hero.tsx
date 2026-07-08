import React from 'react';

export function Hero() {
  return (
    <header className="hero-section">
      <span className="badge" style={{ padding: '4px 8px', background: '#3b82f6', borderRadius: '4px', fontSize: '0.8rem' }}>
        v1.0.0 Beta
      </span>
      <h1 className="hero-title">Build faster with AI</h1>
      <p className="hero-subtitle">
        Click elements, write quick instructions, and compile an instant Markdown prompt for your AI coding assistant.
      </p>
      <button className="cta-button" style={{ marginTop: '1rem' }}>
        Get Started
      </button>
    </header>
  );
}
