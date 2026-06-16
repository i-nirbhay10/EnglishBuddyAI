# EnglishBuddyAI 🤖🌍

EnglishBuddyAI is a gamified, interactive English learning companion built with React Native and powered by Google's Gemini AI. It helps users master English through dynamic challenges, boss battles, and a conversational AI tutor.

## 🌟 Key Features

- **Gamified Progression Map**: Navigate through regions like "Beginner Kingdom" and "Grammar Forest", unlocking new nodes and earning XP as you go. Progress is securely saved on your device using `AsyncStorage`.
- **AI-Powered Grammar Challenges**: Play fill-in-the-blank style games where questions are dynamically generated on-the-fly by the Gemini AI based on your current level.
- **Smart Feedback**: The AI doesn't just tell you if you're right or wrong—it provides a concise, tailored explanation for *why* an answer is correct or incorrect.
- **Conversational AI Companion**: Practice your speaking and typing skills by chatting with an AI English Tutor designed to correct grammar and provide conversational practice.
- **Modern UI**: A premium, responsive design featuring bottom-tab navigation, floating cards, subtle animations via `react-native-reanimated`, and fluid gradients.

## 🛠 Tech Stack

- **Framework**: React Native (Bare Workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack & Bottom Tabs)
- **AI Integration**: Google Gemini API (`gemini-flash-latest`)
- **Animations**: React Native Reanimated
- **Storage**: `@react-native-async-storage/async-storage`
- **Environment**: `react-native-dotenv`

## 🚀 Getting Started

### Prerequisites
Make sure you have your React Native development environment set up for Android and/or iOS.

### 1. Clone & Install
```bash
# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory of the project and add your Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Note: You can get a free API key from [Google AI Studio](https://aistudio.google.com/)).*

### 3. Run the App

Start the Metro bundler:
```bash
# It is recommended to clear the cache if you just added the .env file
npm start -- --reset-cache
```

Run on your preferred platform:
```bash
# Android
npm run android

# iOS
cd ios && pod install && cd ..
npm run ios
```

## 📂 Project Structure

- `/src/components` - Reusable UI elements (Icons, Progress Bars, Stat Cards)
- `/src/screens` - Main app screens (Home, Map, Game, AI Chat, Profile, Onboarding)
- `/src/navigation` - Tab and Stack navigators routing logic
- `/src/services` - API logic (`aiService.ts`) and local persistence (`storageService.ts`)
- `/src/theme` - Centralized color palettes, spacing, and typography

## 🎮 How to Play
1. **Start the Adventure**: Go through the onboarding and open the World Map.
2. **Play a Node**: Tap the glowing blue node on the map to start an AI-generated grammar quiz.
3. **Earn XP**: Answer correctly to gain XP. Read the explanations to improve your skills.
4. **Level Up**: Earn enough XP and watch your global level increase on the Home and Profile screens!

---
*Built with ❤️ using React Native & Gemini AI.*
