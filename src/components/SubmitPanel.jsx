import React, { useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    if (editingRecipe) {
      setTitle(editingRecipe.title);
      setDesc(editingRecipe.description);
      setSelectedTags(editingRecipe.tags || []);
      setInstructions(editingRecipe.instructions);
      setIngredients(editingRecipe.ingredients.length > 0 ? editingRecipe.ingredients : [{ name: '', qty: '' }]);
      setCoverImage(editingRecipe.coverImage);
    } else {
      resetForm();
    }
  }, [editingRecipe, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDesc('');
    setSelectedTags([]);
    setInstructions('');
    setIngredients([{ name: '', qty: '' }]);
    setCoverImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
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

    if (editingRecipe) {
      updateRecipe({ ...editingRecipe, ...data });
    } else {
      addRecipe(data);
    }
    onClose();
  };

  return (
    <div 
      className="glass-panel"
      style={{
        position: 'fixed',
        right: isOpen ? '0' : '-500px',
        top: '10vh',
        bottom: '10vh',
        width: '100%',
        maxWidth: '450px',
        marginRight: '0',
        padding: '2rem',
        transition: 'right 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)' }}>{editingRecipe ? 'Edit Recipe' : 'Submit New Recipe'}</h2>
        <button className="glass-btn" onClick={onClose} style={{ padding: '0.4rem', border: 'none' }}><X size={20} /></button>
      </div>

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
            {!coverImage && <ImageIcon size={32} color="var(--text-muted)" />}
          </label>
        </div>

        <div className="form-group">
          <label>Ingredients</label>
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
          {editingRecipe ? 'Save Changes' : 'Submit Recipe'}
        </button>
      </form>
    </div>
  );
};
