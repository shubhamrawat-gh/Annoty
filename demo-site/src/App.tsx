import React from 'react';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';

function App() {
  // Trigger cache rebuild
  return (
    <div className="app-container">
      <Hero />
      <hr style={{ border: '0', height: '1px', background: '#3f3f46', margin: '4rem 0' }} />
      <Pricing />
      <footer style={{ marginTop: '5rem', color: '#71717a', fontSize: '0.9rem' }}>
        <p>Annoty Sandbox Footer — Try clicking elements in Annoty mode!</p>
      </footer>
    </div>
  );
}

export default App;
