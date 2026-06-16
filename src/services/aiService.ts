import { GEMINI_API_KEY as API_KEY } from '@env';

// You can swap this to true and add your Gemini API key to test real AI calls
const USE_REAL_AI = true;
export interface Question {
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const generateQuestions = async (level: number, count: number = 5): Promise<Question[]> => {
  if (USE_REAL_AI && API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${count} fill-in-the-blank English grammar questions for a level ${level} learner. Return ONLY a valid JSON array of objects with keys: 'sentence' (use ___ for the blank), 'options' (array of 4 strings), 'correctAnswer', and 'explanation' (a concise 1-2 sentence explanation of why this answer is right and why others are wrong). Do not include markdown tags like \`\`\`json, just return the raw JSON.`
            }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });
      const data = await response.json();
      console.log("GEMINI GENERATE QUESTIONS RESPONSE:", JSON.stringify(data, null, 2));
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(rawText);
      }
    } catch (error) {
      console.error("Gemini AI Generation failed, falling back to mock data", error);
    }
  }

  // Simulated AI Processing Delay (Fallback)
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1500));

  // Dynamic fallback pool based on level
  const dynamicPool = [
    { sentence: "The dog ___ loudly when the postman arrives.", options: ["bark", "barks", "barking", "barked"], correctAnswer: "barks" },
    { sentence: "If it rains tomorrow, we ___ at home.", options: ["stay", "stayed", "will stay", "staying"], correctAnswer: "will stay" },
    { sentence: "I have never ___ to Paris before.", options: ["be", "was", "been", "being"], correctAnswer: "been" },
    { sentence: "By the time you arrive, I ___ cooking dinner.", options: ["will finish", "finished", "will have finished", "finishing"], correctAnswer: "will have finished" },
    { sentence: "She ___ playing the piano since she was five.", options: ["is", "has been", "was", "had been"], correctAnswer: "has been" },
    { sentence: "Neither the teacher nor the students ___ happy about the test.", options: ["was", "were", "is", "be"], correctAnswer: "were" },
    { sentence: "He asked me what ___ doing.", options: ["am I", "was I", "I am", "I was"], correctAnswer: "I was" },
    { sentence: "Despite ___ tired, he finished the marathon.", options: ["to be", "was", "being", "been"], correctAnswer: "being" },
  ];

  // Shuffle and pick requested count to simulate dynamic generation
  const shuffled = dynamicPool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getChatResponse = async (userMessage: string, history: { role: string, text: string }[] = []): Promise<{ response: string, correction?: string }> => {
  if (USE_REAL_AI && API_KEY) {
    try {
      // Collapse history into a robust string context to avoid Gemini's strict alternating roles requirement
      const conversationContext = history.map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.text}`).join('\n');

      const prompt = `You are an English tutor. Reply to the user. If they make a grammar mistake in the latest message, provide a 'correction' field in your JSON response along with your conversational 'response' field. Otherwise, leave 'correction' empty. Return ONLY valid JSON without any markdown formatting.\n\n[CONVERSATION HISTORY]\n${conversationContext}\n\n[LATEST USER MESSAGE]\nUser: ${userMessage}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });
      const data = await response.json();
      console.log("GEMINI CHAT RESPONSE:", JSON.stringify(data, null, 2));

      if (data.error) {
        return { response: `[API Error from Gemini]: ${data.error.message}` };
      }

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let rawText = data.candidates[0].content.parts[0].text;
        rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
          return JSON.parse(rawText);
        } catch (e: any) {
          return { response: `[JSON Parse Error]: Could not parse response: ${rawText}` };
        }
      }

      return { response: `[Unexpected API Response]: ${JSON.stringify(data)}` };
    } catch (error: any) {
      console.error("Gemini AI Chat failed", error);
      return { response: `[Fetch Error]: ${error.message}` };
    }
  }

  // Simulated AI Chat (Fallback)
  await new Promise(resolve => setTimeout(() => resolve(undefined), 1200));

  const lowerMsg = userMessage.toLowerCase();
  let correction;
  let response = "That's very interesting! Tell me more about it.";

  if (lowerMsg.includes("i goes")) {
    correction = "You should say 'I go' instead of 'I goes'.";
    response = "I understand what you mean. Where do you usually go?";
  } else if (lowerMsg.includes("he don't")) {
    correction = "Use 'He doesn't' instead of 'He don't'.";
    response = "Really? Why doesn't he?";
  } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    response = "Hello! How is your day going? Ready to practice English?";
  }

  return { response, correction };
};
