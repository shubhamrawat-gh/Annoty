import React from 'react';

export function Pricing() {
  return (
    <section className="pricing-section">
      <h2>Pricing Plans</h2>
      <div className="card-grid">
        <div className="card">
          <h3>Developer Plan</h3>
          {/* Explicit data-annoty-source attribute to test Tier 3 */}
          <div 
            className="price" 
            data-annoty-source="src/components/Pricing.tsx:11"
          >
            $29/mo
          </div>
          <p>Perfect for solo developers building fast.</p>
          <button style={{ background: '#3ecf8e', color: '#111' }}>Upgrade Now</button>
        </div>
        
        <div className="card">
          <h3>Team Plan</h3>
          <div className="price">$99/mo</div>
          <p>For collaborative development teams.</p>
          <button>Contact Us</button>
        </div>
      </div>
    </section>
  );
}
