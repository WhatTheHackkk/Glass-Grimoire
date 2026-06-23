import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = "AQ.Ab8RN6K6eSqxmEj_6Bs2AOkhEjVqbD3FnwQs6VbHwK-XcrDnxQ";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateRecipeFromIngredients = async (ingredientsList) => {
  const prompt = `You are an expert chef. Create a creative, delicious recipe using primarily these ingredients: ${ingredientsList}. You can assume basic pantry staples (salt, oil, etc) are available. 
Return a JSON object matching this schema:
{
  "title": "Recipe Name",
  "description": "Short description of the dish",
  "tags": ["Tag1", "Tag2"],
  "ingredients": [
    { "name": "Ingredient Name", "qty": "Quantity string (e.g. 1 cup)" }
  ],
  "instructions": "Step 1. Do this.\\nStep 2. Do that."
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    console.error("AI Generation Error:", err);
    throw new Error("Failed to generate recipe.");
  }
};

export const estimateNutrition = async (recipe) => {
  const ingredientsStr = recipe.ingredients.map(i => `${i.qty} ${i.name}`).join(', ');
  const prompt = `Estimate the nutritional information for the following recipe based on these ingredients:
${ingredientsStr}
Return a JSON object with this schema:
{
  "calories": number,
  "protein": "string with grams e.g. '20g'",
  "carbs": "string with grams e.g. '30g'",
  "fat": "string with grams e.g. '10g'"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text);
  } catch (err) {
    console.error("AI Nutrition Error:", err);
    throw new Error("Failed to estimate nutrition.");
  }
};
