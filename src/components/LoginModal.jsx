import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const LoginModal = ({ isOpen, onClose }) => {
  const { setIsAdmin } = useContext(AppContext);
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === 'roshvin' && pass === 'roshvin') {
      setIsAdmin(true);
      onClose();
      setId('');
      setPass('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div 
        className="glass-panel"
        style={{
          padding: '3rem', width: '400px', textAlign: 'center',
          transform: error ? 'translateX(10px)' : 'none',
          transition: 'transform 0.1s'
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Access Grimoire Core</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            className="glass-input" 
            placeholder="Admin ID" 
            value={id} 
            onChange={(e) => setId(e.target.value)} 
            required 
            autoComplete="off"
          />
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Password" 
            value={pass} 
            onChange={(e) => setPass(e.target.value)} 
            required 
          />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="glass-btn" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="glass-btn" style={{ flex: 1, border: '1px solid var(--glow-cyan)' }}>Unlock</button>
          </div>
        </form>
      </div>
    </div>
  );
};
