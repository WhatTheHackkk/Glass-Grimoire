import React, { useState, useRef, useContext, useEffect } from 'react';
import { X, Printer, Share2, Play, Square, ShoppingCart, CheckCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import { AppContext } from '../context/AppContext';
import { estimateNutrition } from '../services/ai';
import { Loader } from 'lucide-react';

export const RecipeViewModal = ({ recipe, isOpen, onClose }) => {
  if (!isOpen || !recipe) return null;

  const { addToGrocery, updateRecipe } = useContext(AppContext);
  const [multiplier, setMultiplier] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const cardRef = useRef(null);

  // Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(-1);

  // Nutrition State
  const [nutrition, setNutrition] = useState(recipe.nutrition || null);
  const [isEstimating, setIsEstimating] = useState(false);

  // Cleanup speech on unmount or close
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#070913' });
      const link = document.createElement('a');
      link.download = `${recipe.title.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const scaleQuantity = (qtyStr) => {
    if (multiplier === 1) return qtyStr;
    
    // Simple regex to find the leading number/decimal/fraction in the quantity string
    const match = qtyStr.match(/^([\d\.\/]+)\s*(.*)$/);
    if (!match) return qtyStr;

    let numStr = match[1];
    const rest = match[2];
    
    let num = 0;
    if (numStr.includes('/')) {
      const parts = numStr.split('/');
      num = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      num = parseFloat(numStr);
    }

    if (isNaN(num)) return qtyStr;
    
    let scaled = num * multiplier;
    // Format to 1 decimal place if needed
    scaled = Math.round(scaled * 10) / 10;
    
    return `${scaled} ${rest}`.trim();
  };

  const handleAddToCart = () => {
    addToGrocery(recipe.ingredients);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleEstimateNutrition = async () => {
    if (nutrition) return;
    setIsEstimating(true);
    try {
      const result = await estimateNutrition(recipe);
      setNutrition(result);
      if (recipe.id) {
        await updateRecipe(recipe.id, { ...recipe, nutrition: result });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEstimating(false);
    }
  };

  const startSpeech = () => {
    window.speechSynthesis.cancel();
    
    // Split instructions by newlines, filtering out empty ones
    const steps = recipe.instructions.split('\n').filter(s => s.trim().length > 0);
    
    if (steps.length === 0) return;
    
    setIsSpeaking(true);
    setSpeechIndex(0);
    speakStep(steps, 0);
  };

  const speakStep = (steps, index) => {
    if (index >= steps.length) {
      setIsSpeaking(false);
      setSpeechIndex(-1);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(steps[index]);
    utterance.onend = () => {
      setSpeechIndex(index + 1);
      speakStep(steps, index + 1);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechIndex(-1);
  };

  return (
    <div className="modal-overlay print-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
      padding: '2rem'
    }}>
      <div 
        ref={cardRef}
        className="glass-panel print-container"
        style={{
          width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
          position: 'relative', display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ position: 'relative', height: '300px', width: '100%' }}>
          <img src={recipe.coverImage} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button className="glass-btn no-print" onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.5rem', background: 'rgba(0,0,0,0.5)' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>{recipe.title}</h2>
            
            <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="glass-btn" onClick={handlePrint} title="Print Recipe">
                <Printer size={20} />
              </button>
              <button className="glass-btn" onClick={handleShare} title="Save as Image">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            {recipe.tags && recipe.tags.map(tag => (
              <span key={tag} className="active-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', border: '1px solid' }}>{tag}</span>
            ))}
            
            {!nutrition && !isEstimating && (
              <button 
                className="glass-btn no-print" 
                onClick={handleEstimateNutrition}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', border: '1px dashed var(--glow-cyan)', color: 'var(--glow-cyan)' }}
              >
                ✨ Estimate Macros
              </button>
            )}
            {isEstimating && (
              <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Loader className="spin" size={12} /> Estimating...
              </span>
            )}
            {nutrition && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)' }}>🔥 {nutrition.calories} kcal</span>
                <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)' }}>🥩 {nutrition.protein} Pro</span>
                <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)' }}>🌾 {nutrition.carbs} Carb</span>
                <span style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.1)' }}>🥑 {nutrition.fat} Fat</span>
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', fontStyle: 'italic' }}>
            {recipe.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--glow-cyan)' }}>Ingredients</h3>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="glass-btn no-print" 
                    onClick={handleAddToCart}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: addedToCart ? '#00FF00' : '' }}
                  >
                    {addedToCart ? <CheckCircle size={14} color="#00FF00" /> : <ShoppingCart size={14} />}
                    {addedToCart ? 'Added' : 'Add to List'}
                  </button>

                  <div className="no-print" style={{ display: 'flex', gap: '0.3rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: '8px' }}>
                    <button className="glass-btn" style={{ padding: '0.2rem 0.6rem', background: multiplier === 0.5 ? 'var(--glow-cyan)' : 'transparent', color: multiplier === 0.5 ? '#000' : '#fff' }} onClick={() => setMultiplier(0.5)}>0.5x</button>
                    <button className="glass-btn" style={{ padding: '0.2rem 0.6rem', background: multiplier === 1 ? 'var(--glow-cyan)' : 'transparent', color: multiplier === 1 ? '#000' : '#fff' }} onClick={() => setMultiplier(1)}>1x</button>
                    <button className="glass-btn" style={{ padding: '0.2rem 0.6rem', background: multiplier === 2 ? 'var(--glow-cyan)' : 'transparent', color: multiplier === 2 ? '#000' : '#fff' }} onClick={() => setMultiplier(2)}>2x</button>
                  </div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <span>{ing.name}</span>
                    <span style={{ color: 'var(--glow-cyan)', fontWeight: 'bold' }}>{scaleQuantity(ing.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--glow-purple)' }}>Instructions</h3>
                <button 
                  className="glass-btn no-print" 
                  onClick={isSpeaking ? stopSpeech : startSpeech}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderColor: isSpeaking ? 'var(--glow-purple)' : '' }}
                >
                  {isSpeaking ? <Square size={14} color="var(--glow-purple)" /> : <Play size={14} />}
                  {isSpeaking ? 'Stop Audio' : 'Hands-Free Cooking'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {recipe.instructions.split('\n').map((step, idx) => (
                  step.trim() && (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: '0.8rem', 
                        borderRadius: '8px', 
                        background: speechIndex === idx ? 'rgba(178, 0, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        borderLeft: speechIndex === idx ? '3px solid var(--glow-purple)' : '3px solid transparent',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        transition: 'all 0.3s'
                      }}
                    >
                      {step}
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
