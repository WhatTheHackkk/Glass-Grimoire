import React, { useContext, useState } from 'react';
import { Heart, Star, Edit, Trash2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export const RecipeCard = ({ recipe, onEdit, onView }) => {
  const { incrementHeart, toggleFavorite, deleteRecipe, isAdmin } = useContext(AppContext);
  const [isPulsing, setIsPulsing] = useState(false);

  const handleHeartClick = () => {
    incrementHeart(recipe.id);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 400);
  };

  return (
    <article 
      className="glass-panel"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '400px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 240, 255, 0.05)'
      }}
    >
      <div onClick={onView} style={{ position: 'relative', height: '200px', width: '100%', overflow: 'hidden', cursor: 'pointer' }}>
        <img 
          src={recipe.coverImage} 
          alt={recipe.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Very thin top glowing highlight */}
        <div style={{ position: 'absolute', top: 0, left: '10%', width: '30%', height: '2px', background: 'var(--glow-cyan)', boxShadow: '0 0 8px var(--glow-cyan)' }}></div>
      </div>

      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 onClick={onView} style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', marginBottom: '0.5rem', lineHeight: '1.2', cursor: 'pointer' }}>{recipe.title}</h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {recipe.tags && recipe.tags.map((tag, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{tag} &bull; </span>
          ))}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
          {recipe.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '0.8rem' }}>
          <div 
            onClick={handleHeartClick}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transform: isPulsing ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.4s' }}
          >
            <Heart size={18} fill={isPulsing ? '#FF4D6D' : 'transparent'} color={isPulsing ? '#FF4D6D' : 'var(--text-secondary)'} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{recipe.hearts}</span>
          </div>

          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="glass-btn" style={{ padding: '0.4rem', border: recipe.isFavorite ? '1px solid var(--glow-cyan)' : '' }} onClick={() => toggleFavorite(recipe.id)}>
                <Star size={16} fill={recipe.isFavorite ? 'var(--glow-cyan)' : 'none'} color={recipe.isFavorite ? 'var(--glow-cyan)' : 'var(--text-secondary)'} />
              </button>
              <button className="glass-btn" style={{ padding: '0.4rem' }} onClick={() => onEdit(recipe)}>
                <Edit size={16} />
              </button>
              <button className="glass-btn" style={{ padding: '0.4rem' }} onClick={() => deleteRecipe(recipe.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
