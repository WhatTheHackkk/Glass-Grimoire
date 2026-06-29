import { GoogleGenAI } from '@google/genai';

const getAIClient = () => {
  const apiKey = localStorage.getItem('glassGrimoire_geminiKey');
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("Missing Gemini API Key. Please click the Settings gear icon (⚙️) to enter your own API key.");
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
};

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
    const ai = getAIClient();
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
    throw err;
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
    const ai = getAIClient();
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
    throw err;
  }
};
