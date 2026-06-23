import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { RecipeCard } from './RecipeCard';

export const RecipeGrid = ({ onEditRecipe, onViewRecipe }) => {
  const { recipes, searchQuery, activeCategory } = useContext(AppContext);

  const filteredRecipes = recipes
    .filter(r => {
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.tags && r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                          (r.ingredients && r.ingredients.some(i => i.name.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchCategory = activeCategory === 'All' || (r.tags && r.tags.includes(activeCategory));
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

  return (
    <div className="vault-grid">
      {filteredRecipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} onEdit={onEditRecipe} onView={() => onViewRecipe(recipe)} />
      ))}
    </div>
  );
};
