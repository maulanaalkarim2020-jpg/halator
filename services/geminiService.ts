import { GoogleGenAI, Type } from "@google/genai";
import type { ProductAuditResult, ProcessAuditResult, TransactionAuditResult, EducationResult } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const callWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 2000
): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        const isRateLimit = error?.status === 429 || 
                          error?.error?.code === 429 || 
                          error?.message?.includes('429') ||
                          error?.message?.includes('RESOURCE_EXHAUSTED');
                          
        if (retries > 0 && isRateLimit) {
            console.warn(`Gemini API Rate Limit/High Demand (429). Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callWithRetry(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

const safeJsonParse = <T,>(jsonString: string): T | { error: string } => {
    try {
        // Clean the string: remove ```json wrapper and trim whitespace
        const cleanedString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedString) as T;
    } catch (error) {
        console.error("JSON parsing error:", error);
        return { error: `Invalid JSON response from AI. Raw response: ${jsonString}` };
    }
};

export const analyzeIngredients = async (ingredientsText: string, productName?: string): Promise<ProductAuditResult | { error: string }> => {
    try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are an expert Halal food auditor. Analyze the ingredients for the product "${productName || 'Unknown Product'}": "${ingredientsText}". Determine if each is Halal, Haram, or Syubhat (doubtful). Provide a brief reason for any Haram or Syubhat item. Respond in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ingredient: { type: Type.STRING },
                            status: { type: Type.STRING, enum: ['Halal', 'Haram', 'Syubhat'] },
                            reason: { type: Type.STRING }
                        },
                        required: ["ingredient", "status", "reason"]
                    }
                }
            }
        }));
        return safeJsonParse<ProductAuditResult>(response.text);
    } catch (error) {
        console.error("Gemini API Error (analyzeIngredients):", error);
        return { error: "Failed to communicate with the AI. Please check your connection and API key." };
    }
};

export const analyzeImageIngredients = async (base64Image: string, mimeType: string): Promise<ProductAuditResult | { error: string }> => {
     try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: { parts: [
                { text: `Extract the ingredients list from this image. Then, as a Halal food auditor, analyze each ingredient. Determine if it is Halal, Haram, or Syubhat (doubtful). Provide a brief reason for any Haram or Syubhat item. Respond ONLY in JSON format.` },
                { inlineData: { data: base64Image, mimeType: mimeType } }
            ]},
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            ingredient: { type: Type.STRING },
                            status: { type: Type.STRING, enum: ['Halal', 'Haram', 'Syubhat'] },
                            reason: { type: Type.STRING }
                        },
                        required: ["ingredient", "status", "reason"]
                    }
                }
            }
        }));
        return safeJsonParse<ProductAuditResult>(response.text);
    } catch (error) {
        console.error("Gemini API Error (analyzeImageIngredients):", error);
        return { error: "Failed to analyze the image with AI. Please try a clearer image." };
    }
};


export const analyzeProcess = async (answers: Record<string, string>): Promise<ProcessAuditResult | { error: string }> => {
    try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are a Halal process auditor. Based on these checklist answers: ${JSON.stringify(answers)}, provide a summary, highlight potential risks, and give a final assessment. Respond ONLY in JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        assessment: { type: Type.STRING, enum: ['Compliant', 'Needs Improvement', 'Non-Compliant'] }
                    },
                    required: ["summary", "risks", "assessment"]
                }
            }
        }));
        return safeJsonParse<ProcessAuditResult>(response.text);
    } catch (error) {
        console.error("Gemini API Error (analyzeProcess):", error);
        return { error: "Failed to communicate with the AI for process analysis." };
    }
};

export const analyzeProcessFromDocument = async (
    base64Image: string,
    mimeType: string,
    questions: { id: string; text: string; category: string }[]
): Promise<Record<string, string> | { error: string }> => {
    try {
        const questionText = questions.map(q => `${q.id}: ${q.text}`).join('\n');

        const properties: { [key: string]: { type: Type; enum: string[] } } = {};
        questions.forEach(q => {
            properties[q.id] = { type: Type.STRING, enum: ['Yes', 'No', 'N/A'] };
        });

        const schema = {
            type: Type.OBJECT,
            properties,
        };

        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: {
                parts: [
                    {
                        text: `You are an intelligent Halal process auditor assistant. Analyze the provided document image. Based ONLY on the information present in the image, answer the following checklist questions. For each question ID, provide one of three possible string values: 'Yes', 'No', or 'N/A' if the information is not found in the document. Respond ONLY in the requested JSON format.\n\nQuestions:\n${questionText}`
                    },
                    {
                        inlineData: { data: base64Image, mimeType: mimeType }
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        }));
        return safeJsonParse<Record<string, string>>(response.text);
    } catch (error) {
        console.error("Gemini API Error (analyzeProcessFromDocument):", error);
        return { error: "Failed to analyze the document with AI. Please try a clearer image." };
    }
};

export const analyzeTransaction = async (description: string): Promise<TransactionAuditResult | { error: string }> => {
    try {
        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are an expert in Islamic Finance (Fiqh al-Muamalat). Analyze this transaction: "${description}". Determine if it contains Riba, Gharar, or Maysir. Provide a verdict, a detailed explanation, and a boolean analysis. Respond ONLY in JSON format.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        verdict: { type: Type.STRING, enum: ['Permissible', 'Impermissible', 'Doubtful'] },
                        explanation: { type: Type.STRING },
                        analysis: {
                            type: Type.OBJECT,
                            properties: {
                                riba: { type: Type.BOOLEAN },
                                gharar: { type: Type.BOOLEAN },
                                maysir: { type: Type.BOOLEAN }
                            },
                            required: ["riba", "gharar", "maysir"]
                        }
                    },
                    required: ["verdict", "explanation", "analysis"]
                }
            }
        }));
        return safeJsonParse<TransactionAuditResult>(response.text);
    } catch (error) {
        console.error("Gemini API Error (analyzeTransaction):", error);
        return { error: "Failed to communicate with the AI for transaction analysis." };
    }
};

export const getFollowUpAnalysis = async (
    originalDescription: string,
    initialAnalysis: TransactionAuditResult,
    chatHistory: { user: string; ai: string }[],
    followUpQuestion: string
): Promise<string | { error: string }> => {
    try {
        const context = JSON.stringify(initialAnalysis, null, 2);
        
        const historyText = chatHistory.map(chat => 
            `User: ${chat.user}\nAI: ${chat.ai}`
        ).join('\n\n');

        const prompt = `You are an expert in Islamic Finance (Fiqh al-Muamalat).
Context:
- Original Transaction: "${originalDescription}"
- Your Initial Analysis:
${context}

${historyText ? `Previous Conversation:\n${historyText}\n` : ''}
Based on ALL the context above (original transaction, initial analysis, and previous conversation), please answer the following follow-up question from the user. Keep your answer clear, concise, and directly related to the provided transaction analysis and conversation.

User's Question: "${followUpQuestion}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error (getFollowUpAnalysis):", error);
        return { error: "Failed to get a follow-up response from the AI." };
    }
};

export const getEducationInfo = async (term: string, reference?: string): Promise<EducationResult | { error: string }> => {
    try {
        const prompt = `As a Halal educator, explain the term "${term}"${reference ? ` (with the context that it relates to: ${reference})` : ''}. Provide its Halal status (e.g., Halal, Haram, Additive, etc.), a clear explanation, a reference if applicable (like an E-number or common source), and a relevant, trustworthy external URL link if one is available. Respond ONLY in JSON.`;

        const response = await callWithRetry(() => ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING },
                        status: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        reference: { type: Type.STRING },
                        link: { type: Type.STRING }
                    },
                    required: ["term", "status", "explanation"]
                }
            }
        }));
        return safeJsonParse<EducationResult>(response.text);
    } catch (error) {
        console.error("Gemini API Error (getEducationInfo):", error);
        return { error: "Failed to fetch educational information from the AI." };
    }
};