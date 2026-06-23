import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import { Header } from './components/Header';
import { RecipeGrid } from './components/RecipeGrid';
import { SubmitPanel } from './components/SubmitPanel';
import { AIChefPanel } from './components/AIChefPanel';
import { LoginModal } from './components/LoginModal';
import { RecipeViewModal } from './components/RecipeViewModal';
import { GroceryPanel } from './components/GroceryPanel';
import { Plus, Sparkles } from 'lucide-react';

const AppContent = () => {
  const { isAdmin } = useContext(AppContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAIChefOpen, setIsAIChefOpen] = useState(false);
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [viewedRecipe, setViewedRecipe] = useState(null);

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setIsPanelOpen(true);
  };

  const openNewRecipePanel = () => {
    setEditingRecipe(null);
    setIsPanelOpen(true);
  };

  return (
    <>
      <Header 
        onLoginRequest={() => setIsLoginOpen(true)} 
        onOpenGrocery={() => setIsGroceryOpen(true)}
      />
      
      <main>
        <RecipeGrid onEditRecipe={handleEditRecipe} onViewRecipe={(recipe) => setViewedRecipe(recipe)} />
      </main>

      <SubmitPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        editingRecipe={editingRecipe} 
      />
      
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />

      {viewedRecipe && (
        <RecipeViewModal
          recipe={viewedRecipe}
          isOpen={true}
          onClose={() => setViewedRecipe(null)}
        />
      )}

      <GroceryPanel 
        isOpen={isGroceryOpen}
        onClose={() => setIsGroceryOpen(false)}
      />

      <AIChefPanel 
        isOpen={isAIChefOpen}
        onClose={() => setIsAIChefOpen(false)}
        onRecipeGenerated={(recipe) => {
          setEditingRecipe(recipe);
          setIsPanelOpen(true);
        }}
      />

      {isAdmin && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', zIndex: 90 }}>
          <button 
            className="glass-btn"
            onClick={() => setIsAIChefOpen(true)}
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '1px solid var(--glow-purple)',
              boxShadow: '0 0 15px rgba(178, 0, 255, 0.3)',
              background: 'rgba(178, 0, 255, 0.1)'
            }}
            title="AI Chef Generator"
          >
            <Sparkles size={28} color="var(--glow-purple)" />
          </button>

          <button 
            className="glass-btn"
            onClick={openNewRecipePanel}
            style={{
              width: '60px', height: '60px', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              border: '1px solid var(--glow-cyan)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
            }}
            title="Add New Recipe"
          >
            <Plus size={28} color="var(--glow-cyan)" />
          </button>
        </div>
      )}
    </>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
