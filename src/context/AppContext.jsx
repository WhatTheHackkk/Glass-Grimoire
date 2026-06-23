import React, { createContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const AppContext = createContext();

const STORAGE_KEY = 'glassGrimoire_react_data';

export const AppProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [groceryList, setGroceryList] = useState([]);
  const [theme, setTheme] = useState('dark');

  // Theme effect
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Firebase Real-time Sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'recipes'), (snapshot) => {
      const fetchedRecipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecipes(fetchedRecipes);

      // Migration check
      if (fetchedRecipes.length === 0) {
        migrateLocalDataToFirebase();
      }
    });

    return () => unsubscribe();
  }, []);

  const migrateLocalDataToFirebase = async () => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        if (parsedData.length > 0) {
          console.log("Migrating local recipes to Firebase...");
          const batch = writeBatch(db);
          parsedData.forEach(recipe => {
            // Remove the old 'id' so Firestore auto-generates a clean one, 
            // or we could keep it by doing doc(db, 'recipes', recipe.id).
            // Let's use auto-generated ids.
            const newDocRef = doc(collection(db, 'recipes'));
            const { id, ...recipeData } = recipe; 
            batch.set(newDocRef, recipeData);
          });
          await batch.commit();
          // Clear local storage after successful migration
          localStorage.removeItem(STORAGE_KEY);
          console.log("Migration complete!");
        }
      } catch (err) {
        console.error("Migration failed:", err);
      }
    }
  };

  const addRecipe = async (recipe) => {
    recipe.hearts = 0;
    recipe.isFavorite = false;
    await addDoc(collection(db, 'recipes'), recipe);
  };

  const updateRecipe = async (updatedRecipe) => {
    const recipeRef = doc(db, 'recipes', updatedRecipe.id);
    await updateDoc(recipeRef, updatedRecipe);
  };

  const deleteRecipe = async (id) => {
    const recipeRef = doc(db, 'recipes', id);
    await deleteDoc(recipeRef);
  };

  const incrementHeart = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, { hearts: (recipe.hearts || 0) + 1 });
    }
  };

  const toggleFavorite = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) {
      const recipeRef = doc(db, 'recipes', id);
      await updateDoc(recipeRef, { isFavorite: !recipe.isFavorite });
    }
  };

  const addToGrocery = (ingredients) => {
    // Basic deduplication based on item name
    setGroceryList(prev => {
      const newItems = ingredients.filter(ing => 
        !prev.some(p => p.name.toLowerCase() === ing.name.toLowerCase())
      );
      // Ensure we format them properly with a checked property
      return [...prev, ...newItems.map(item => ({ ...item, checked: false }))];
    });
  };

  const toggleGroceryItem = (index) => {
    setGroceryList(prev => {
      const updated = [...prev];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  };

  const clearGroceryList = () => {
    setGroceryList([]);
  };

  return (
    <AppContext.Provider value={{
      recipes, addRecipe, updateRecipe, deleteRecipe, incrementHeart, toggleFavorite,
      isAdmin, setIsAdmin,
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      groceryList, addToGrocery, toggleGroceryItem, clearGroceryList,
      theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};
