import { Question } from '../services/aiService';

export const buildGenerateQuestionsPrompt = (level: number, count: number, weaknesses?: string[]): string => {
  const weaknessPrompt = weaknesses && weaknesses.length > 0 
    ? ` The user struggles with: ${weaknesses.join(', ')}. Please heavily bias the questions towards testing these specific grammar rules.` 
    : '';
  
  return `Generate ${count} fill-in-the-blank English grammar questions for a level ${level} learner.${weaknessPrompt} Return ONLY a valid JSON array of objects with keys: 'sentence' (use ___ for the blank), 'options' (array of 4 strings), 'correctAnswer', 'explanation' (a concise 1-2 sentence explanation of why this answer is right), and 'topic' (a short 1-3 word description of the grammar rule being tested, e.g. "Past Perfect", "Prepositions", "Conditionals"). Do not include markdown tags like \`\`\`json, just return the raw JSON.`;
};

export const buildChatPrompt = (userMessage: string, history: { role: string, text: string }[]): string => {
  const conversationContext = history.map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`).join('\n');
  return `You are an English tutor. Reply to the user. If they make a grammar mistake in the latest message, provide a 'correction' field in your JSON response along with your conversational 'response' field. Otherwise, leave 'correction' empty. Return ONLY valid JSON without any markdown formatting.\n\n[CONVERSATION HISTORY]\n${conversationContext}\n\n[LATEST USER MESSAGE]\nUser: ${userMessage}`;
};

export const parseGeminiResponse = (data: any): any => {
  if (data.error) {
    throw new Error(`[API Error from Gemini]: ${data.error.message}`);
  }
  
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    let rawText = data.candidates[0].content.parts[0].text;
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(rawText);
  }
  
  throw new Error(`[Unexpected API Response]: ${JSON.stringify(data)}`);
};

export const getFallbackQuestions = (count: number): Question[] => {
  const dynamicPool: Question[] = [
    { sentence: "The dog ___ loudly when the postman arrives.", options: ["bark", "barks", "barking", "barked"], correctAnswer: "barks", explanation: "Use present simple for facts/habits.", topic: "Present Simple" },
    { sentence: "If it rains tomorrow, we ___ at home.", options: ["stay", "stayed", "will stay", "staying"], correctAnswer: "will stay", explanation: "First conditional uses will + base verb.", topic: "First Conditional" },
    { sentence: "I have never ___ to Paris before.", options: ["be", "was", "been", "being"], correctAnswer: "been", explanation: "Present perfect uses the past participle.", topic: "Present Perfect" },
    { sentence: "By the time you arrive, I ___ cooking dinner.", options: ["will finish", "finished", "will have finished", "finishing"], correctAnswer: "will have finished", explanation: "Future perfect for actions completed before a future time.", topic: "Future Perfect" },
    { sentence: "She ___ playing the piano since she was five.", options: ["is", "has been", "was", "had been"], correctAnswer: "has been", explanation: "Present perfect continuous for actions starting in past and continuing.", topic: "Present Perfect Continuous" },
    { sentence: "Neither the teacher nor the students ___ happy about the test.", options: ["was", "were", "is", "be"], correctAnswer: "were", explanation: "With neither/nor, the verb agrees with the closest subject.", topic: "Subject-Verb Agreement" },
    { sentence: "He asked me what ___ doing.", options: ["am I", "was I", "I am", "I was"], correctAnswer: "I was", explanation: "Reported speech statement order is subject + verb.", topic: "Reported Speech" },
    { sentence: "Despite ___ tired, he finished the marathon.", options: ["to be", "was", "being", "been"], correctAnswer: "being", explanation: "Despite is followed by a gerund or noun.", topic: "Gerunds" },
  ];

  return dynamicPool.sort(() => 0.5 - Math.random()).slice(0, count);
};

export const getFallbackChatResponse = (userMessage: string): { response: string, correction?: string } => {
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes("i goes")) {
    return { correction: "You should say 'I go' instead of 'I goes'.", response: "I understand what you mean. Where do you usually go?" };
  } else if (lowerMsg.includes("he don't")) {
    return { correction: "Use 'He doesn't' instead of 'He don't'.", response: "Really? Why doesn't he?" };
  } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return { response: "Hello! It's great to hear from you. What would you like to talk about today?" };
  }
  
  return { response: "That's very interesting! Tell me more about it." };
};
