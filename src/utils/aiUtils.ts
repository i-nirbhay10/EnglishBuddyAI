import { Question } from '../services/aiService';

export const buildGenerateQuestionsPrompt = (level: number, count: number, weaknesses?: string[]): string => {
  const weaknessPrompt = weaknesses && weaknesses.length > 0 
    ? ` The user struggles with: ${weaknesses.join(', ')}. Please heavily bias the questions towards testing these specific concepts.` 
    : '';
  
  return `Generate ${count} multiple-choice English questions for a level ${level} learner. The questions should focus on building correct sentences through a mix of:
1. Grammar (fill-in-the-blank with ___ to test verb tenses, prepositions, and articles)
2. Sentence Structure (choose the option that correctly completes the phrase logically and syntactically)
3. Vocabulary (choose the word that best fits the context of the sentence)

${weaknessPrompt}

Return ONLY a valid JSON array of objects with keys: 
- 'sentence' (the question text or sentence with exactly one ___ for the blank)
- 'options' (array of 4 distinct and realistic string options)
- 'correctAnswer' (the correct option)
- 'explanation' (a concise 1-2 sentence explanation of why this answer is right)
- 'topic' (a short 1-3 word description of the rule being tested, e.g. "Past Perfect", "Phrasal Verbs", "Prepositions")
- 'type' (must be exactly one of: "grammar", "structure", "vocabulary")

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
    { sentence: "A person who studies the stars is an ___.", options: ["astrologer", "astronaut", "astronomer", "archaeologist"], correctAnswer: "astronomer", explanation: "An astronomer studies stars and the universe.", topic: "Vocabulary", type: "vocabulary" },
    { sentence: "Neither the teacher nor the students ___ happy about the test.", options: ["was", "were", "is", "be"], correctAnswer: "were", explanation: "With neither/nor, the verb agrees with the closest subject.", topic: "Subject-Verb Agreement", type: "grammar" },
    { sentence: "He asked me what ___ doing.", options: ["am I", "was I", "I am", "I was"], correctAnswer: "I was", explanation: "Reported speech statement order is subject + verb.", topic: "Reported Speech", type: "grammar" },
    { sentence: "She has been working here ___ 2015.", options: ["since", "for", "from", "in"], correctAnswer: "since", explanation: "Use 'since' for a specific point in time.", topic: "Prepositions of Time", type: "grammar" },
    { sentence: "I have lived here ___ 10 years.", options: ["since", "for", "from", "in"], correctAnswer: "for", explanation: "Use 'for' with a duration of time.", topic: "Prepositions of Time", type: "grammar" },
    { sentence: "By the time we arrived, the movie ___ already started.", options: ["has", "had", "have", "was"], correctAnswer: "had", explanation: "Past perfect 'had' is used for an action completed before another past action.", topic: "Past Perfect", type: "grammar" },
    { sentence: "That's a very ___ response to the problem.", options: ["logical", "logic", "logics", "logically"], correctAnswer: "logical", explanation: "'Logical' is the correct adjective form.", topic: "Vocabulary", type: "vocabulary" },
    { sentence: "My friend and I ___ going to the cinema tonight.", options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: "Plural subject 'My friend and I' takes 'are'.", topic: "Subject-Verb Agreement", type: "grammar" },
    { sentence: "This is the most ___ book I have ever read.", options: ["fascinate", "fascinated", "fascinating", "fascination"], correctAnswer: "fascinating", explanation: "Use the -ing adjective to describe the book.", topic: "Adjectives", type: "grammar" },
    { sentence: "I prefer coffee ___ tea.", options: ["than", "to", "over", "from"], correctAnswer: "to", explanation: "The correct preposition after 'prefer' is 'to'.", topic: "Prepositions", type: "grammar" },
    { sentence: "He is a very ___ person; he loves talking to people.", options: ["introverted", "gregarious", "shy", "timid"], correctAnswer: "gregarious", explanation: "Gregarious means fond of company; sociable.", topic: "Vocabulary", type: "vocabulary" },
    { sentence: "She ___ to the store yesterday.", options: ["go", "goes", "went", "gone"], correctAnswer: "went", explanation: "The simple past of 'go' is 'went'.", topic: "Past Simple", type: "grammar" },
    { sentence: "They will arrive ___ Monday.", options: ["in", "on", "at", "by"], correctAnswer: "on", explanation: "Use 'on' for days of the week.", topic: "Prepositions of Time", type: "grammar" },
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
  } else if (lowerMsg.includes("how are you")) {
    return { response: "I'm doing great, thank you for asking! How is your English learning going?" };
  } else if (lowerMsg.includes("weather")) {
    return { response: "The weather is always a great topic! Do you prefer hot or cold weather?" };
  } else if (lowerMsg.includes("name")) {
    return { response: "I'm EnglishBuddy, your friendly AI language tutor!" };
  } else if (lowerMsg.includes("hobby") || lowerMsg.includes("hobbies")) {
    return { response: "Hobbies are fantastic! Reading and practicing languages are my favorites. What about you?" };
  }
  
  const genericResponses = [
    "That's very interesting! Tell me more about it.",
    "I see. Could you explain that in a bit more detail?",
    "Fascinating! How did you come to feel that way?",
    "That's a great point. Have you always thought that?",
    "I'm listening! Please, continue."
  ];
  return { response: genericResponses[Math.floor(Math.random() * genericResponses.length)] };
};
