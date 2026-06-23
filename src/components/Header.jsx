import React, { useContext, useRef, useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';

export const Header = ({ onLoginRequest, onOpenGrocery }) => {
  const { searchQuery, setSearchQuery, isAdmin, activeCategory, setActiveCategory, groceryList } = useContext(AppContext);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef(null);

  const handleTitleClick = () => {
    if (isAdmin) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    if (newCount === 10) {
      onLoginRequest();
      setTapCount(0);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 600); // 600ms window for consecutive taps
    }
  };

  return (
    <header className="main-header">
      <div className="header-top">
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: isAdmin ? 'default' : 'pointer' }} onClick={handleTitleClick}>
          <img src="/logo.png" alt="Glass Grimoire Logo" style={{ height: '40px', width: '40px', objectFit: 'contain' }} />
          <h1 className="grimoire-title" style={{ margin: 0 }}>
            GLASS GRIMOIRE
          </h1>
        </div>

        <div className="search-wrapper" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Search Recipes, Ingredients, Tags..." 
              className="glass-input"
              style={{ paddingLeft: '3rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            className="glass-btn" 
            onClick={onOpenGrocery}
            style={{ position: 'relative', padding: '0.6rem', borderRadius: '50%' }}
          >
            <ShoppingCart size={22} />
            {groceryList.length > 0 && (
              <span style={{ 
                position: 'absolute', top: '-5px', right: '-5px', background: 'var(--glow-cyan)', 
                color: '#000', fontSize: '0.7rem', fontWeight: 'bold', width: '18px', height: '18px', 
                borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' 
              }}>
                {groceryList.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="header-separator" style={{ marginBottom: '1rem' }}></div>
      
      <div style={{
        display: 'flex',
        gap: '0.8rem',
        overflowX: 'auto',
        paddingBottom: '1rem',
        marginBottom: '2rem',
        scrollbarWidth: 'none', // Firefox
      }} className="category-ribbon">
        <button
          onClick={() => setActiveCategory('All')}
          className={`glass-btn ${activeCategory === 'All' ? 'active-pill' : ''}`}
          style={{ borderRadius: '20px', whiteSpace: 'nowrap', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`glass-btn ${activeCategory === cat ? 'active-pill' : ''}`}
            style={{ borderRadius: '20px', whiteSpace: 'nowrap', padding: '0.4rem 1rem', fontSize: '0.9rem' }}
          >
            {cat}
          </button>
        ))}
      </div>
    </header>
  );
};
