import { GEMINI_API_KEY as API_KEY } from '@env';
import { 
  buildGenerateQuestionsPrompt, 
  parseGeminiResponse, 
  getFallbackQuestions, 
  buildChatPrompt,
  getFallbackChatResponse
} from '../utils/aiUtils';

const USE_REAL_AI = true;

export interface Question {
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  type?: string;
}

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(url, { ...options, signal: controller.signal as any });
  clearTimeout(id);
  return response;
};

export const generateQuestions = async (level: number, count: number = 5): Promise<Question[]> => {
  const { getProgress } = await import('./storageService');
  const progress = await getProgress();
  const prompt = buildGenerateQuestionsPrompt(level, count, progress.weaknesses);

  if (USE_REAL_AI && API_KEY) {
    try {
      const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      console.log("GEMINI GENERATE QUESTIONS RESPONSE:", JSON.stringify(data, null, 2));
      return parseGeminiResponse(data);
    } catch (error) {
      console.error("Gemini AI Generation failed, falling back to mock data", error);
    }
  }

  // Simulated AI Processing Delay (Fallback)
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));
  return getFallbackQuestions(count);
};



export const getChatResponse = async (userMessage: string, history: { role: string, text: string }[] = []): Promise<{ response: string, correction?: string }> => {
  if (USE_REAL_AI && API_KEY) {
    try {
      const prompt = buildChatPrompt(userMessage, history);

      const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      console.log("GEMINI CHAT RESPONSE:", JSON.stringify(data, null, 2));
      
      try {
        return parseGeminiResponse(data);
      } catch (parseError: any) {
        return { response: parseError.message };
      }
    } catch (error: any) {
      console.error("Gemini AI Chat failed", error);
      return { response: `[Fetch Error]: ${error.message}` };
    }
  }

  // Simulated AI Chat (Fallback)
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1200));
  return getFallbackChatResponse(userMessage);
};
