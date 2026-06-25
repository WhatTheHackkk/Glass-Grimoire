import React, { useState, useEffect, useContext, useRef } from 'react';
import { X, Plus, Image as ImageIcon } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { CATEGORIES } from '../constants/categories';

export const SubmitPanel = ({ isOpen, onClose, editingRecipe }) => {
  const { addRecipe, updateRecipe } = useContext(AppContext);
  
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', qty: '' }]);
  const [coverImage, setCoverImage] = useState(null);

  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingRecipe, setPendingRecipe] = useState(null);
  const [localEditingRecipe, setLocalEditingRecipe] = useState(null);

  const [showJSInput, setShowJSInput] = useState(false);
  const [jsInputValue, setJsInputValue] = useState('');
  const [jsInputError, setJsInputError] = useState('');

  const prevIsOpen = useRef(isOpen);
  const prevEditingRecipe = useRef(editingRecipe);

  const loadRecipe = (recipe) => {
    setTitle(recipe.title);
    setDesc(recipe.description);
    setSelectedTags(recipe.tags || []);
    setInstructions(recipe.instructions);
    setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', qty: '' }]);
    setCoverImage(recipe.coverImage);
  };

  useEffect(() => {
    if (isOpen) {
      const isContextChanging = !prevIsOpen.current || prevEditingRecipe.current !== editingRecipe;
      if (isContextChanging) {
        const isDirty = title.trim() !== '' || desc.trim() !== '' || instructions.trim() !== '';
        
        // If the form has data, AND they aren't just reopening the exact same draft they were already editing
        if (isDirty && localEditingRecipe !== editingRecipe) {
          setShowPrompt(true);
          setPendingRecipe(editingRecipe);
        } else {
          setLocalEditingRecipe(editingRecipe);
          if (editingRecipe) loadRecipe(editingRecipe);
        }
      }
    }
    
    prevIsOpen.current = isOpen;
    prevEditingRecipe.current = editingRecipe;
  }, [isOpen, editingRecipe]);

  useEffect(() => {
    const handlePaste = (e) => {
      if (!isOpen || !e.clipboardData || !e.clipboardData.files.length) return;
      const file = Array.from(e.clipboardData.files).find(f => f.type.startsWith('image/'));
      if (file) {
        processImageFile(file);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setSelectedTags([]);
    setInstructions('');
    setIngredients([{ name: '', qty: '' }]);
    setCoverImage(null);
  };

  const processImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width;
        let h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } } 
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        setCoverImage(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    processImageFile(e.target.files[0]);
  };

  const handleJSSubmit = () => {
    try {
      let parsed;
      try {
        parsed = JSON.parse(jsInputValue);
      } catch(e) {
        // Fallback for raw JS string formatting
        // eslint-disable-next-line no-new-func
        parsed = new Function('return ' + jsInputValue)();
      }

      if (!Array.isArray(parsed)) {
        throw new Error('Input must be a JavaScript array.');
      }

      const newIngredients = parsed.map((item, idx) => {
        if (!Array.isArray(item) || item.length < 2) {
          throw new Error(`Item at index ${idx} is not a valid tuple [Name, Qty].`);
        }
        return { name: String(item[0]), qty: String(item[1]) };
      });

      setIngredients(newIngredients.length > 0 ? newIngredients : [{ name: '', qty: '' }]);
      
      setShowJSInput(false);
      setJsInputError('');
    } catch (err) {
      setJsInputError('Failed to parse: ' + err.message);
    }
  };

  const handleToggleJS = () => {
    if (!showJSInput) {
      const validIngs = ingredients.filter(i => i.name.trim() !== '' || i.qty.trim() !== '');
      if (validIngs.length > 0) {
        const formatted = '[\n' + validIngs.map(i => `  [${JSON.stringify(i.name)}, ${JSON.stringify(i.qty)}]`).join(',\n') + '\n]';
        setJsInputValue(formatted);
      } else if (!jsInputValue) {
        setJsInputValue('[\n  ["", ""]\n]');
      }
    }
    setShowJSInput(!showJSInput);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      description: desc,
      tags: selectedTags,
      instructions,
      ingredients: ingredients.filter(i => i.name.trim()),
      coverImage: coverImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'
    };

    if (localEditingRecipe) {
      updateRecipe({ ...localEditingRecipe, ...data });
    } else {
      addRecipe(data);
      resetForm();
    }
    onClose();
  };

  return (
    <>
      {/* Overlay mask */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}
        onClick={onClose}
      />

      <div 
        className="glass-panel"
        style={{
          position: 'fixed',
          right: '0',
          top: '5vh',
          bottom: '5vh',
          width: '100%',
          maxWidth: '450px',
          maxHeight: '90vh',
          marginRight: '0',
          padding: '2rem',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)' }}>{localEditingRecipe ? 'Edit Recipe' : 'Submit New Recipe'}</h2>
          <button type="button" className="glass-btn" onClick={onClose} style={{ padding: '0.4rem', border: 'none' }}><X size={20} /></button>
        </div>

        {showPrompt ? (
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, 
            textAlign: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.6)', borderRadius: '15px', padding: '2rem', 
            border: '1px solid var(--glow-purple)', backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(178, 0, 255, 0.2)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--glow-cyan)' }}>Unsaved Draft Detected</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You are still in the middle of editing a recipe. Would you like to continue working on it, or start fresh?</p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%', flexDirection: 'column' }}>
              <button 
                className="glass-btn" 
                style={{ border: '1px solid var(--glow-cyan)' }}
                onClick={() => setShowPrompt(false)}
              >
                Continue Working
              </button>
              <button 
                className="glass-btn"
                style={{ border: '1px solid var(--glow-purple)' }}
                onClick={() => {
                  setShowPrompt(false);
                  setLocalEditingRecipe(pendingRecipe);
                  if (pendingRecipe) loadRecipe(pendingRecipe);
                  else resetForm();
                }}
              >
                Start Fresh
              </button>
            </div>
          </div>
        ) : (
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        <div className="form-group">
          <label>Recipe Name</label>
          <input type="text" className="glass-input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        
        <div className="form-group">
          <label>Categories & Flags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  if (selectedTags.includes(cat)) {
                    setSelectedTags(selectedTags.filter(t => t !== cat));
                  } else {
                    setSelectedTags([...selectedTags, cat]);
                  }
                }}
                className={`glass-btn ${selectedTags.includes(cat) ? 'active-pill' : ''}`}
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '15px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Chef Note / Description</label>
          <textarea className="glass-input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Cover Image</label>
          <label 
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '120px', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer',
              background: coverImage ? `url(${coverImage}) center/cover` : 'rgba(0,0,0,0.2)'
            }}
          >
            <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
            {!coverImage ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.8rem' }}>Click or Paste Image Here</div>
              </div>
            ) : null}
          </label>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ marginBottom: 0 }}>Ingredients</label>
            <button 
              type="button" 
              className="glass-btn" 
              style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '15px' }}
              onClick={handleToggleJS}
            >
              JS Code
            </button>
          </div>
          
          {showJSInput && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Paste a JS array of tuples: <code>[["Name", "Qty"], ...]</code>
              </div>
              <textarea 
                className="glass-input" 
                rows={4} 
                value={jsInputValue}
                onChange={e => { setJsInputValue(e.target.value); setJsInputError(''); }}
                placeholder={'[\n  ["Fettuccine pasta", "200g"],\n  ["Fresh cream", "1 cup"]\n]'}
              />
              {jsInputError && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{jsInputError}</div>}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="glass-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setShowJSInput(false); setJsInputError(''); }}>Close</button>
                <button type="button" className="glass-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', borderColor: 'var(--glow-cyan)' }} onClick={handleJSSubmit}>Save & Sync</button>
              </div>
            </div>
          )}

          {ingredients.map((ing, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" className="glass-input" placeholder="Name" value={ing.name} onChange={e => {
                const newIng = [...ingredients]; newIng[idx].name = e.target.value; setIngredients(newIng);
              }} required />
              <input type="text" className="glass-input" placeholder="Qty" value={ing.qty} style={{ width: '80px' }} onChange={e => {
                const newIng = [...ingredients]; newIng[idx].qty = e.target.value; setIngredients(newIng);
              }} required />
            </div>
          ))}
          <button type="button" className="glass-btn" style={{ fontSize: '0.8rem', padding: '0.4rem', marginTop: '0.5rem' }} onClick={() => setIngredients([...ingredients, { name: '', qty: '' }])}>
            + Add Ingredient
          </button>
        </div>

        <div className="form-group" style={{ flex: 1 }}>
          <label>Instructions</label>
          <textarea className="glass-input" rows={5} value={instructions} onChange={e => setInstructions(e.target.value)} required />
        </div>

        <button type="submit" className="glass-btn" style={{ border: '1px solid var(--glow-cyan)', marginTop: 'auto' }}>
          {localEditingRecipe ? 'Save Changes' : 'Submit Recipe'}
        </button>
      </form>
      )}
      </div>
    </>
  );
};
