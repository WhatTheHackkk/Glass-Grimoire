import React, { useState } from 'react';
import { X, Sparkles, Loader } from 'lucide-react';
import { generateRecipeFromIngredients } from '../services/ai';

export const AIChefPanel = ({ isOpen, onClose, onRecipeGenerated }) => {
  const [ingredients, setIngredients] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const generatedRecipe = await generateRecipeFromIngredients(ingredients);
      // Give it a default cover image
      generatedRecipe.coverImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";
      onRecipeGenerated(generatedRecipe);
      onClose();
    } catch (err) {
      setError("The AI Chef encountered an issue. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '2rem' }}>
        <button className="glass-btn" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--glow-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles /> AI Chef (Admin)
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Type the ingredients you currently have in your fridge or pantry, and the Gemini AI will instantly generate a unique recipe for you to publish to the Grimoire.
        </p>

        <textarea 
          className="glass-input"
          placeholder="e.g. Chicken breast, rice, soy sauce, broccoli, garlic..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ width: '100%', height: '120px', resize: 'vertical', marginBottom: '1rem' }}
        />

        {error && <p style={{ color: '#FF4D6D', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

        <button 
          className="glass-btn" 
          onClick={handleGenerate}
          disabled={isGenerating || !ingredients.trim()}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            background: 'rgba(0, 240, 255, 0.1)', 
            borderColor: 'var(--glow-cyan)',
            color: 'var(--text-primary)',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: (isGenerating || !ingredients.trim()) ? 0.5 : 1
          }}
        >
          {isGenerating ? <Loader className="spin" size={20} /> : <Sparkles size={20} />}
          {isGenerating ? 'Cooking up a recipe...' : 'Generate Recipe'}
        </button>
      </div>
    </div>
  );
};
