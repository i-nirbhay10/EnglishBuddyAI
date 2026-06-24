import Tts from 'react-native-tts';
import { getPreferences } from '../services/storageService';

let ttsInitialized = false;

const initTts = async () => {
  if (ttsInitialized) return true;
  try {
    await Tts.getInitStatus();
    await Tts.setDefaultLanguage('en-US');
    await Tts.setDefaultRate(0.5);
    await Tts.setDefaultPitch(1.0);
    ttsInitialized = true;
    return true;
  } catch (err) {
    if ((err as any).code === 'no_engine') {
      Tts.requestInstallEngine();
    }
    console.warn("TTS init failed", err);
    return false;
  }
};

export const playSpeech = async (text: string) => {
  try {
    console.log("TTS Triggered with text:", text);
    const isReady = await initTts();
    if (!isReady) {
      console.warn("TTS init failed, cannot speak");
      return;
    }
    
    Tts.stop();
    Tts.speak(text);
  } catch (error) {
    console.warn("TTS failed to play:", error);
  }
};
