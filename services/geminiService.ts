import { GoogleGenAI, Type } from "@google/genai";
import { Country, Aircraft, StatDefinition } from "../types";

// Safe API Key retrieval
const getApiKey = () => {
    // Check Vite env with optional chaining to prevent crash
    const viteKey = (import.meta as any).env?.VITE_API_KEY;
    if (viteKey) return viteKey;
    
    // Check process env (fallback)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        return process.env.API_KEY;
    }
    
    return "";
};

const apiKey = getApiKey();

// Initialize AI only if key exists (handled in calls)
const ai = new GoogleGenAI({ apiKey });

// --- COUNTRY GENERATION ---
export const generateCountryData = async (
  countryName: string, 
  currentCount: number,
  statDefinitions: StatDefinition[]
): Promise<Country | null> => {
  try {
    if (!apiKey) {
      console.error("API Key is missing. Please check your .env file or VITE_API_KEY variable.");
      return null;
    }
    const model = ai.models;
    
    // Dynamically build the keys for schema documentation in prompt
    const statKeys = statDefinitions.map(s => s.id).join(', ');
    const sliderKeys = statDefinitions.filter(s => s.format === 'slider').map(s => s.id).join(', ');

    let prompt = `Generate a realistic JSON object for the country "${countryName}" for a military strategy app. 
    Estimate statistics based on real-world public data as of 2024.
    
    REQUIRED FIELDS:
    - id: unique 3 letter slug
    - flagCode: ISO 2-letter code
    - rank: estimation > ${currentCount}
    - score: An integer estimate of military power between 10 and 100 (Higher is better). USA is ~98, North Korea ~40.
    - stats: A JSON object containing ONLY numerical values for these specific keys: ${statKeys}.
    
    Ensure 'defenseBudget' is in raw USD (no suffix).`;
    
    if (sliderKeys.length > 0) {
      prompt += `\n    IMPORTANT: The following fields are Power Indices and MUST be a float value between 1.0 (Very Low) and 10.0 (Elite/Superpower): ${sliderKeys}. Example: 1.0, 5.5, 9.75.`;
    }

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            flagCode: { type: Type.STRING },
            rank: { type: Type.INTEGER },
            score: { type: Type.NUMBER },
            description: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: statDefinitions.reduce((acc, curr) => ({
                 ...acc,
                 [curr.id]: { type: Type.NUMBER }
              }), {} as any),
              required: statDefinitions.map(s => s.id)
            }
          },
          required: ["id", "name", "stats", "rank", "score"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Country;
      data.isGenerated = true;
      return data;
    }
    return null;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
};

// --- AIRCRAFT GENERATION ---
export const generateAircraftData = async (
  aircraftName: string, 
  currentCount: number,
  statDefinitions: StatDefinition[]
): Promise<Aircraft | null> => {
  try {
    if (!apiKey) {
      console.error("API Key is missing.");
      return null;
    }
    const model = ai.models;
    const statKeys = statDefinitions.map(s => s.id).join(', ');
    const sliderKeys = statDefinitions.filter(s => s.format === 'slider').map(s => s.id).join(', ');

    let prompt = `Generate a realistic JSON object for the military aircraft "${aircraftName}". 
    Estimate statistics based on real-world public data as of 2024.
    
    REQUIRED FIELDS:
    - id: unique slug (e.g. f22_raptor)
    - name: Full name (e.g. Lockheed Martin F-22 Raptor)
    - origin: Country of origin
    - rank: estimation > ${currentCount}
    - score: An integer estimate of combat capability between 10 and 100. F-22 is ~99.
    - stats: A JSON object containing ONLY numerical values for these keys: ${statKeys}.`;

    if (sliderKeys.length > 0) {
      prompt += `\n    IMPORTANT: The following fields are Power Indices (1.0 - 10.0): ${sliderKeys}.`;
    }

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            origin: { type: Type.STRING },
            rank: { type: Type.INTEGER },
            score: { type: Type.NUMBER },
            description: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: statDefinitions.reduce((acc, curr) => ({
                 ...acc,
                 [curr.id]: { type: Type.NUMBER }
              }), {} as any),
              required: statDefinitions.map(s => s.id)
            }
          },
          required: ["id", "name", "origin", "stats", "rank", "score"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as Aircraft;
      data.isGenerated = true;
      return data;
    }
    return null;
  } catch (error) {
    console.error("Gemini aircraft generation error:", error);
    return null;
  }
};

export const analyzeComparison = async (c1: Country, c2: Country): Promise<{
  analysis: string,
  winner: string,
  factors: string[]
} | null> => {
  try {
    if (!apiKey) return null;
    const model = ai.models;
    const prompt = `Compare the military strength of ${c1.name} and ${c2.name}. 
    
    Score ${c1.name}: ${c1.score}
    Stats ${c1.name}: ${JSON.stringify(c1.stats)}
    
    Score ${c2.name}: ${c2.score}
    Stats ${c2.name}: ${JSON.stringify(c2.stats)}
    
    Provide a strategic analysis of a hypothetical conventional conflict.
    Identify key factors for each side.
    Predict a winner in a neutral setting or defensive scenarios.
    
    Return JSON.`;

    const response = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            winner: { type: Type.STRING },
            factors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Gemini analysis error:", error);
    return null;
  }
}