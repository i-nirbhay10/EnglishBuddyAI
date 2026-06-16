import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChatResponse } from '../services/aiService';
import { ChatMessage, Message } from '../components/ChatMessage';
import { getChatHistory, saveChatHistory } from '../services/storageService';

export const AIChatScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showScenarios, setShowScenarios] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  React.useEffect(() => {
    const loadHistory = async () => {
      const history = await getChatHistory();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          { id: '1', text: "Hello there! I'm your EnglishBuddy. How can I help you practice today?", isUser: false },
        ]);
      }
      setIsLoadingHistory(false);
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      saveChatHistory(newMessages);
      return newMessages;
    });
    setInputText('');
    setIsTyping(true);
    
    await sendMessageToAI(userMessage.text, messages);
  };

  const startRoleplay = async (scenario: string) => {
    const prompt = `Let's do a roleplay scenario: ${scenario}. You start the conversation.`;
    const userMessage: Message = { id: Date.now().toString(), text: prompt, isUser: true };
    
    setMessages([userMessage]);
    await saveChatHistory([userMessage]);
    setIsTyping(true);
    setShowScenarios(false);
    
    await sendMessageToAI(prompt, []);
  };

  const sendMessageToAI = async (text: string, currentMessages: Message[]) => {
    try {
      const historyForAi = currentMessages.map(m => ({
        role: m.isUser ? 'user' : 'model',
        text: m.text
      }));

      const { response, correction } = await getChatResponse(text, historyForAi);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        correction,
      };

      setMessages(prev => {
        const newMessages = [...prev, botMessage];
        saveChatHistory(newMessages);
        return newMessages;
      });
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const newMessages = [...prev, { id: Date.now().toString(), text: "I'm sorry, I'm having trouble connecting to my brain right now.", isUser: false }];
        saveChatHistory(newMessages);
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    const defaultMsg = [{ id: '1', text: "Hello there! I'm your EnglishBuddy. How can I help you practice today?", isUser: false }];
    setMessages(defaultMsg);
    await saveChatHistory(defaultMsg);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md), paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerTitleContainer}>
          <Icon name="robot" family="FontAwesome5" size={24} color={colors.primaryNeon} />
          <Text style={[styles.headerTitle, { color: colors.text, marginLeft: spacing.sm }]}>AI Conversation</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}
            onPress={() => setShowScenarios(true)}
          >
            <Icon name="book-open" family="FontAwesome5" size={16} color={colors.primaryNeon} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}
            onPress={handleClearChat}
          >
            <Icon name="trash" family="FontAwesome5" size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoadingHistory ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color={colors.primaryNeon} />
          </View>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            
            {messages.length === 1 && (
              <View style={{ marginTop: spacing.xl }}>
                <Text style={{ color: colors.textMuted, fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: spacing.md, letterSpacing: 1 }}>Or try a Roleplay Scenario:</Text>
                
                <TouchableOpacity onPress={() => startRoleplay("I am at a coffee shop ordering a drink and a pastry")} style={[styles.scenarioBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                  <Icon name="coffee" family="FontAwesome5" size={16} color={colors.primary} />
                  <Text style={[styles.scenarioText, { color: colors.text }]}>Coffee Shop Order</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => startRoleplay("I am at a job interview for a software developer position")} style={[styles.scenarioBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                  <Icon name="briefcase" family="FontAwesome5" size={16} color={colors.accent} />
                  <Text style={[styles.scenarioText, { color: colors.text }]}>Job Interview</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => startRoleplay("I am checking into a hotel but they can't find my reservation")} style={[styles.scenarioBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                  <Icon name="hotel" family="FontAwesome5" size={16} color={colors.warning} />
                  <Text style={[styles.scenarioText, { color: colors.text }]}>Hotel Check-in Problem</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={colors.primaryNeon} />
            <Text style={{ color: colors.textMuted, marginLeft: 8 }}>Buddy is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: 10, backgroundColor: colors.surface, borderTopColor: colors.cardBorder }]}>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background, borderColor: colors.cardBorder, borderRadius: borderRadius.round }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.surfaceHighlight, borderRadius: borderRadius.round }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Icon name="paper-plane" family="FontAwesome5" size={16} color={inputText.trim() ? '#FFF' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {showScenarios && (
        <View style={styles.overlayBackdrop}>
          <TouchableOpacity style={styles.backdropPressable} onPress={() => setShowScenarios(false)} />
          <View style={[styles.sheetContainer, { backgroundColor: colors.surface, borderTopColor: colors.cardBorder, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose a Roleplay Scenario</Text>
              <TouchableOpacity onPress={() => setShowScenarios(false)} style={{ padding: 4 }}>
                <Icon name="times" family="FontAwesome5" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 350, paddingHorizontal: 16 }}>
              <TouchableOpacity onPress={() => startRoleplay("I am at a coffee shop ordering a drink and a pastry")} style={[styles.scenarioBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <Icon name="coffee" family="FontAwesome5" size={16} color={colors.primary} />
                <Text style={[styles.scenarioText, { color: colors.text }]}>Coffee Shop Order</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => startRoleplay("I am at a job interview for a software developer position")} style={[styles.scenarioBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <Icon name="briefcase" family="FontAwesome5" size={16} color={colors.accent} />
                <Text style={[styles.scenarioText, { color: colors.text }]}>Job Interview</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => startRoleplay("I am checking into a hotel but they can't find my reservation")} style={[styles.scenarioBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <Icon name="hotel" family="FontAwesome5" size={16} color={colors.warning} />
                <Text style={[styles.scenarioText, { color: colors.text }]}>Hotel Reservation Issue</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => startRoleplay("I am at the airport customs control answering officer questions")} style={[styles.scenarioBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <Icon name="plane" family="FontAwesome5" size={16} color={colors.success} />
                <Text style={[styles.scenarioText, { color: colors.text }]}>Airport Customs Control</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => startRoleplay("I am asking a local for walking directions to Times Square")} style={[styles.scenarioBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.cardBorder, borderRadius: borderRadius.lg }]}>
                <Icon name="map-marked-alt" family="FontAwesome5" size={16} color={colors.error} />
                <Text style={[styles.scenarioText, { color: colors.text }]}>Asking for Directions</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    alignSelf: 'flex-start',
  },
  scenarioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  scenarioText: {
    marginLeft: 12,
    fontWeight: '600',
    fontSize: 15,
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopWidth: 1.5,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
