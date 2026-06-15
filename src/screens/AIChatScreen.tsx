import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from '../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChatResponse } from '../services/aiService';
import { ChatMessage, Message } from '../components/ChatMessage';

export const AIChatScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello there! I'm your EnglishBuddy. How can I help you practice today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const historyForAi = messages.map(m => ({
        role: m.isUser ? 'user' : 'model',
        text: m.text
      }));

      const { response, correction } = await getChatResponse(userMessage.text, historyForAi);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        correction,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm sorry, I'm having trouble connecting to my brain right now.", isUser: false }]);
    } finally {
      setIsTyping(false);
    }
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
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round }]}>
          <Icon name="ellipsis-v" family="FontAwesome5" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
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
    padding: 12,
  },
});
