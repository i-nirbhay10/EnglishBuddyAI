import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/theme';
import { Icon } from './Icon';
import { playSpeech } from '../utils/audioUtils';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  correction?: string;
}

interface ChatMessageProps {
  msg: Message;
}

export const ChatMessage = ({ msg }: ChatMessageProps) => {
  const { colors, spacing, borderRadius } = useTheme();
  
  return (
    <View style={[styles.messageWrapper, msg.isUser ? styles.messageWrapperUser : styles.messageWrapperBot]}>
      {!msg.isUser && (
        <View style={[styles.botAvatar, { backgroundColor: colors.surfaceHighlight, borderRadius: borderRadius.round, marginRight: spacing.sm }]}>
          <Icon name="robot" family="FontAwesome5" size={14} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1, alignItems: msg.isUser ? 'flex-end' : 'flex-start' }}>
        <View 
          style={[
            styles.messageBubble, 
            msg.isUser 
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 } 
              : { backgroundColor: colors.surfaceHighlight, borderBottomLeftRadius: 4 },
            { borderRadius: borderRadius.lg, ...styles.shadow }
          ]}
        >
          <Text style={[styles.messageText, { color: msg.isUser ? '#FFF' : colors.text }]}>{msg.text}</Text>
        </View>

        {!msg.isUser && (
          <TouchableOpacity onPress={() => playSpeech(msg.text)} style={{ alignSelf: 'flex-start', marginLeft: 8, marginTop: 4 }}>
            <Icon name="volume-up" family="FontAwesome5" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        
        {msg.correction && (
          <View style={[styles.correctionBubble, { backgroundColor: colors.warning + '20', borderColor: colors.warning, borderRadius: borderRadius.md, marginTop: spacing.xs }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Icon name="lightbulb" family="FontAwesome5" size={12} color={colors.warning} />
              <Text style={[styles.correctionTitle, { color: colors.warning, marginLeft: 4 }]}>Grammar Tip</Text>
            </View>
            <Text style={[styles.correctionText, { color: colors.text }]}>{msg.correction}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
  },
  messageWrapperUser: {
    justifyContent: 'flex-end',
  },
  messageWrapperBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  correctionBubble: {
    padding: 12,
    borderWidth: 1,
    maxWidth: '85%',
    marginTop: 8,
  },
  correctionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  correctionText: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
