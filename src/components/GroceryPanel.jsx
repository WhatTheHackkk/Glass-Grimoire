import React, { useContext } from 'react';
import { X, Check, Trash2, ShoppingCart } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const GroceryPanel = ({ isOpen, onClose }) => {
  const { groceryList, toggleGroceryItem, clearGroceryList } = useContext(AppContext);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} 
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-400px',
          width: '400px',
          maxWidth: '100%',
          height: '100vh',
          zIndex: 1001,
          transition: 'right 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--glass-border)',
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          borderRadius: 0,
          backgroundColor: 'var(--bg-dark)'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--glow-cyan)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart /> Grocery List
          </h2>
          <button className="glass-btn" onClick={onClose} style={{ padding: '0.5rem' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {groceryList.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
              Your grocery list is empty. Add ingredients from any recipe!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {groceryList.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleGroceryItem(idx)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    background: item.checked ? 'rgba(0, 240, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid',
                    borderColor: item.checked ? 'rgba(0, 240, 255, 0.3)' : 'var(--glass-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    border: `2px solid ${item.checked ? 'var(--glow-cyan)' : 'var(--text-muted)'}`,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                  }}>
                    {item.checked && <Check size={14} color="var(--glow-cyan)" />}
                  </div>
                  <div style={{ flex: 1, textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {item.name}
                  </div>
                  {item.qty && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {item.qty}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {groceryList.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
            <button 
              className="glass-btn" 
              onClick={clearGroceryList}
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderColor: '#FF4D6D', color: '#FF4D6D' }}
            >
              <Trash2 size={18} /> Clear List
            </button>
          </div>
        )}
      </div>
    </>
  );
};
