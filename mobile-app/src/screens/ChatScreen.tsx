import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Send,
  Bot,
  User as UserIcon,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Languages,
  Gauge,
} from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { api, ChatMessage } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

type SupportedLanguage = 'en' | 'hi' | 'bn' | 'hinglish';

interface LanguageConfig {
  code: SupportedLanguage;
  speechCode: string;
  label: string;
}

const LANGUAGES: LanguageConfig[] = [
  { code: 'en', speechCode: 'en-IN', label: 'English' },
  { code: 'hi', speechCode: 'hi-IN', label: 'हिन्दी' },
  { code: 'bn', speechCode: 'bn-IN', label: 'বাংলা' },
  { code: 'hinglish', speechCode: 'hi-IN', label: 'Hinglish' },
];

const SUGGESTIONS = [
  'Interpret blood pressure 138/88 mmHg',
  'Common side effects of Metformin 500mg',
  'Persistent dry cough with mild evening fever',
  'Mera blood report explain karo',
  'Dietary tips for Type 2 Diabetes',
];

export const ChatScreen: React.FC = () => {
  const { patient } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [urgencyNotice, setUrgencyNotice] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial welcome message
    const welcomeMsg: ChatMessage = {
      id: 'welcome-1',
      sender: 'ai',
      text: `Hello ${patient?.name?.split(' ')[0] || 'there'}. I am your Clinical AI Triage Assistant.\n\nYou can describe any symptoms, inquire about medication interactions, or review lab report markers in English, Hindi, Bengali, or Hinglish. How can I assist your health inquiry today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([welcomeMsg]);

    return () => {
      Speech.stop();
    };
  }, [patient?.name]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    if (!overrideText) setInput('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build conversation history for multi-turn clinical context
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const response = await api.sendChatMessage(textToSend, {
        language: selectedLanguage,
        history,
        patientId: patient?.id,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.urgency === 'high') {
        setUrgencyNotice(
          'Clinical triage alert: Elevated urgency symptoms detected. If this is an acute crisis, access Emergency SOS or contact local emergency services immediately.'
        );
      } else {
        setUrgencyNotice(null);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'Unable to reach the clinical AI intelligence engine. Please verify local connectivity with the Medical AI server and retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const confirmClearChat = () => {
    Alert.alert(
      'Reset Consultation',
      'Clear the current triage conversation history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Speech.stop();
            setSpeakingMessageId(null);
            setMessages([
              {
                id: 'welcome-reset',
                sender: 'ai',
                text: 'Consultation context reset. What symptoms or medical topics would you like to review?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            setUrgencyNotice(null);
          },
        },
      ]
    );
  };

  const toggleSpeak = async (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      await Speech.stop();
      setSpeakingMessageId(null);
    } else {
      await Speech.stop();
      setSpeakingMessageId(msgId);
      const langConfig = LANGUAGES.find((l) => l.code === selectedLanguage);
      
      // Clean markdown asterisks and hash symbols before speech synthesis
      const speechCleaned = text
        .replace(/[*#_~`>]/g, '')
        .replace(/\n\n+/g, '. ')
        .replace(/\n/g, ', ');

      Speech.speak(speechCleaned, {
        language: langConfig?.speechCode || 'en-IN',
        pitch: 1.0,
        rate: speechRate,
        onDone: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    }
  };

  const cycleSpeed = () => {
    const nextRate = speechRate === 0.95 ? 1.2 : speechRate === 1.2 ? 0.8 : 0.95;
    setSpeechRate(nextRate);
    if (speakingMessageId) {
      Speech.stop();
      setSpeakingMessageId(null);
    }
  };

  const handleCopy = async (msgId: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiBadge}>
            <Sparkles size={16} color="#0D9488" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Clinical AI Triage Assistant</Text>
            <Text style={styles.headerSubtitle}>Grounded Multilingual Intelligence</Text>
          </View>
        </View>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.rateButton}
            onPress={cycleSpeed}
            accessibilityLabel="Speech Speed"
          >
            <Gauge size={12} color="#0D9488" />
            <Text style={styles.rateText}>{speechRate.toFixed(1)}x</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={confirmClearChat}
            accessibilityLabel="Restart Chat"
          >
            <RotateCcw size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Multilingual Selector Bar */}
      <View style={styles.languageBar}>
        <View style={styles.langLabelRow}>
          <Languages size={14} color="#0D9488" />
          <Text style={styles.langLabel}>Reasoning Language:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langPills}>
          {LANGUAGES.map((lang) => {
            const active = selectedLanguage === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langPill, active && styles.langPillActive]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={[styles.langText, active && styles.langTextActive]}>{lang.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Urgency Alert Banner */}
      {urgencyNotice && (
        <View style={styles.urgencyBanner}>
          <ShieldAlert size={16} color="#EF4444" />
          <Text style={styles.urgencyText}>{urgencyNotice}</Text>
        </View>
      )}

      {/* Messages Feed */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isAi = item.sender === 'ai';
          const isSpeaking = speakingMessageId === item.id;
          const isCopied = copiedMessageId === item.id;

          return (
            <View style={[styles.messageRow, isAi ? styles.aiRow : styles.userRow]}>
              <View style={[styles.avatar, isAi ? styles.aiAvatar : styles.userAvatar]}>
                {isAi ? <Bot size={15} color="#0D9488" /> : <UserIcon size={15} color="#2563EB" />}
              </View>

              <View style={[styles.bubble, isAi ? styles.aiBubble : styles.userBubble]}>
                <Text style={[styles.bubbleText, isAi ? styles.aiText : styles.userText]}>
                  {item.text}
                </Text>

                <View style={styles.bubbleFooter}>
                  <Text style={[styles.timestamp, isAi ? styles.aiTimestamp : styles.userTimestamp]}>
                    {item.timestamp}
                  </Text>

                  {isAi && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() => toggleSpeak(item.id, item.text)}
                        style={styles.iconAction}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isSpeaking ? (
                          <VolumeX size={14} color="#EF4444" />
                        ) : (
                          <Volume2 size={14} color="#94A3B8" />
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleCopy(item.id, item.text)}
                        style={styles.iconAction}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isCopied ? (
                          <Check size={14} color="#10B981" />
                        ) : (
                          <Copy size={14} color="#94A3B8" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Quick Clinical Prompts Chips */}
      {messages.length <= 2 && (
        <View style={styles.suggestionsWrapper}>
          <Text style={styles.suggestionsHeader}>Suggested Clinical Queries:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {SUGGESTIONS.map((sug, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionChip}
                onPress={() => handleSend(sug)}
                disabled={loading}
              >
                <Text style={styles.suggestionText}>{sug}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Tray */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={`Type symptoms in ${LANGUAGES.find((l) => l.code === selectedLanguage)?.label}...`}
            placeholderTextColor="#64748B"
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  rateText: {
    color: '#0D9488',
    fontSize: 10,
    fontWeight: '700',
  },
  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
  },
  resetButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B/50',
    gap: 8,
  },
  langLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  langPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langPillActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  langText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  urgencyText: {
    flex: 1,
    fontSize: 11,
    color: '#FCA5A5',
    fontWeight: '600',
    lineHeight: 14,
  },
  messageList: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  aiAvatar: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  userAvatar: {
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  userBubble: {
    backgroundColor: '#0D9488',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 20,
  },
  aiText: {
    color: '#F1F5F9',
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  timestamp: {
    fontSize: 9,
  },
  aiTimestamp: {
    color: '#64748B',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconAction: {
    padding: 2,
  },
  suggestionsWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  suggestionsHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  suggestionsScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  suggestionText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 13,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
});
