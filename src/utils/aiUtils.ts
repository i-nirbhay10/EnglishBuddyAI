import { Question } from '../services/aiService';

export const buildGenerateQuestionsPrompt = (level: number, count: number, weaknesses?: string[]): string => {
  const weaknessPrompt = weaknesses && weaknesses.length > 0 
    ? ` The user struggles with: ${weaknesses.join(', ')}. Please heavily bias the questions towards testing these specific concepts.` 
    : '';
  
  return `Generate ${count} multiple-choice English questions for a level ${level} learner. The questions should be a mix of:
1. Grammar (fill-in-the-blank with ___)
2. Spelling (choose the correctly spelled word to complete the sentence)
3. Vocabulary (choose the word that best fits the definition or context)

${weaknessPrompt}

Return ONLY a valid JSON array of objects with keys: 
- 'sentence' (the question text or sentence with ___ for the blank)
- 'options' (array of 4 string options)
- 'correctAnswer' (the correct option)
- 'explanation' (a concise 1-2 sentence explanation of why this answer is right)
- 'topic' (a short 1-3 word description of the rule/concept being tested, e.g. "Past Perfect", "Spelling", "Vocabulary")
- 'type' (must be exactly one of: "grammar", "spelling", "vocabulary")

Do not include markdown tags like \`\`\`json, just return the raw JSON.`;
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
    { sentence: "The dog ___ loudly when the postman arrives.", options: ["bark", "barks", "barking", "barked"], correctAnswer: "barks", explanation: "Use present simple for facts/habits.", topic: "Present Simple", type: "grammar" },
    { sentence: "If it rains tomorrow, we ___ at home.", options: ["stay", "stayed", "will stay", "staying"], correctAnswer: "will stay", explanation: "First conditional uses will + base verb.", topic: "First Conditional", type: "grammar" },
    { sentence: "I think you ___ the word 'accommodation'.", options: ["mispeled", "misspelled", "mispelled", "misspeled"], correctAnswer: "misspelled", explanation: "'Misspelled' has double s and double l.", topic: "Spelling", type: "spelling" },
    { sentence: "The new policy is highly ___ to all employees.", options: ["beneficial", "beneficiel", "benificial", "benifitial"], correctAnswer: "beneficial", explanation: "The correct spelling is 'beneficial'.", topic: "Spelling", type: "spelling" },
    { sentence: "A person who studies the stars is an ___.", options: ["astrologer", "astronaut", "astronomer", "archaeologist"], correctAnswer: "astronomer", explanation: "An astronomer studies stars and the universe.", topic: "Vocabulary", type: "vocabulary" },
    { sentence: "Neither the teacher nor the students ___ happy about the test.", options: ["was", "were", "is", "be"], correctAnswer: "were", explanation: "With neither/nor, the verb agrees with the closest subject.", topic: "Subject-Verb Agreement", type: "grammar" },
    { sentence: "He asked me what ___ doing.", options: ["am I", "was I", "I am", "I was"], correctAnswer: "I was", explanation: "Reported speech statement order is subject + verb.", topic: "Reported Speech", type: "grammar" },
    { sentence: "The weather is very ___ today.", options: ["unpredictable", "unpredictible", "impredictable", "unpredicable"], correctAnswer: "unpredictable", explanation: "The correct spelling ends with '-able'.", topic: "Spelling", type: "spelling" },
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
