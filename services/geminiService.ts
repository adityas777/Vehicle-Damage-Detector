
import { GoogleGenAI, Type } from "@google/genai";
import { DamageAnalysis, ClaimsInformation } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you'd handle this more gracefully.
    // Here we throw to ensure it's set during development.
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export async function analyzeVehicleDamage(file: File): Promise<DamageAnalysis> {
    // RETAIN: Use the most powerful model for the critical task of damage analysis to ensure accuracy.
    const model = 'gemini-3-pro-preview';

    // ENHANCE: The prompt is now much more detailed to guide the stronger model.
    const prompt = `
      You are a highly experienced and certified AI vehicle damage appraiser. Your primary task is to conduct a meticulous analysis of the provided vehicle image to identify and quantify all visible damages with the highest possible accuracy.

      For each distinct damage you identify, you must provide the following details:
      - damageType: Classify the damage into one: 'Scratch', 'Dent', 'Crack', 'Broken Part', 'Paint Damage'.
      - location: Be very specific about the location (e.g., "Lower right section of the front bumper," "Above the handle on the rear passenger-side door").
      - severity: Assess the severity as 'Low', 'Medium', or 'High'. Base this on the size, depth, and complexity of the damage.
      - estimatedCostINR: Provide a precise repair cost estimate in Indian Rupees (INR). This estimate should factor in typical labor costs, part costs (if applicable), material (plastic, metal), and paint complexity (e.g., metallic, pearl). Be as accurate as possible.
      - confidenceScore: A value between 0.0 and 1.0 indicating your confidence in this specific damage assessment.
      - explanation: A clear, detailed sentence explaining your reasoning for the assessment and cost estimation, mentioning the factors considered (e.g., "Cost includes bumper reshaping and a three-coat paint job due to deep scratches.").

      After detailing all individual damages, provide a comprehensive summary:
      - totalEstimatedCostINR: The sum of all individual estimated repair costs.
      - costFactors: A list of the most significant factors influencing the total cost (e.g., "Bumper replacement required", "Multi-panel paint blending needed", "High labor cost for dent removal on a crease line").

      Your response MUST be a single, valid JSON object that strictly adheres to the provided schema. Do not include any text, markdown, or any characters outside of this JSON object.
    `;

    const imagePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }, imagePart] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    damages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                damageType: { type: Type.STRING, enum: ['Scratch', 'Dent', 'Crack', 'Broken Part', 'Paint Damage'] },
                                location: { type: Type.STRING },
                                severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
                                estimatedCostINR: { type: Type.NUMBER },
                                confidenceScore: { type: Type.NUMBER },
                                explanation: { type: Type.STRING },
                            },
                            required: ['damageType', 'location', 'severity', 'estimatedCostINR', 'confidenceScore', 'explanation']
                        },
                    },
                    totalEstimatedCostINR: { type: Type.NUMBER },
                    costFactors: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                },
                required: ['damages', 'totalEstimatedCostINR', 'costFactors']
            },
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as DamageAnalysis;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", jsonText);
        throw new Error("The AI model returned an invalid response. Please try again with clearer images.");
    }
}

export async function generateClaimsGuide(analysisSummary: string): Promise<ClaimsInformation> {
    // OPTIMIZE: Use the faster gemini-3-flash-preview model for this text-based task to increase speed.
    const model = 'gemini-3-flash-preview';

    // ENHANCE: The prompt is refined for more tailored and accurate advice.
    const prompt = `
      You are an expert insurance claims advisor for vehicle damages in India. Based on the following summary of detected vehicle damages, provide an accurate and practical guide for filing an insurance claim.

      Damage Summary:
      ${analysisSummary}

      Your response must be a single, valid JSON object. The guide should be tailored to the specific damages listed and include:
      - eligibleClaims: An array of potential claims the user can make. For each, provide a 'claimType' (e.g., "Own Damage Claim," "Comprehensive Claim") and a 'description' of its relevance to the specified damages.
      - claimProcedure: A detailed, step-by-step array of strings outlining the entire claim filing process, from notifying the insurer to the final settlement. Ensure the steps are in the correct order.
      - requiredDocuments: A comprehensive array of strings listing all necessary documents for a smooth claim process in India (e.g., "Signed claim form," "Copy of vehicle's Registration Certificate (RC)," "Copy of driver's license").

      Ensure the information is clear, accurate, and practical for a typical vehicle owner. Do not include any text, markdown, or characters outside of the JSON object.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    eligibleClaims: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                claimType: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                            required: ['claimType', 'description']
                        }
                    },
                    claimProcedure: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    requiredDocuments: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    }
                },
                required: ['eligibleClaims', 'claimProcedure', 'requiredDocuments']
            },
        },
    });

    const jsonText = response.text.trim();
    try {
        return JSON.parse(jsonText) as ClaimsInformation;
    } catch (e) {
        console.error("Failed to parse Gemini response for claims guide:", jsonText);
        throw new Error("The AI model returned an invalid response for the claims guide.");
    }
}