import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Wand2, Sparkles, Brain, Lightbulb, Zap, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { StockBasket } from '../types';

interface AILabScreenProps {
  onOpenAiModal: () => void;
  onSuggestionPress: (text: string) => void;
  aiBaskets: StockBasket[];
  onSelectBasket: (basket: StockBasket) => void;
}

const { width } = Dimensions.get('window');

const suggestions = [
  "Nuclear energy renaissance play",
  "AI infrastructure picks 2025",
  "Solana DePIN ecosystem basket",
  "Clean energy + semiconductors"
];

export const AILabScreen: React.FC<AILabScreenProps> = ({
  onOpenAiModal,
  onSuggestionPress,
  aiBaskets,
  onSelectBasket
}) => {
  const handleOpenAiModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenAiModal();
  };

  const handleSuggestionPress = (text: string) => {
    Haptics.selectionAsync();
    onSuggestionPress(text);
  };

  const handleSelectBasket = (basket: StockBasket) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectBasket(basket);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <View style={styles.iconContainer}>
            <Wand2 size={28} color="#A855F7" />
          </View>
          <Text style={styles.heroTitle}>AI Strategy Architect</Text>
        </View>
        <Text style={styles.heroSubtitle}>
          Synthesize custom stock baskets from plain English macro ideas.
        </Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenAiModal} activeOpacity={0.8}>
          <Sparkles size={20} color="#000" />
          <Text style={styles.ctaText}>Create AI Basket</Text>
        </TouchableOpacity>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Describe Your Thesis</Text>
            <Text style={styles.stepDescription}>e.g. "AI chips will dominate in 2025"</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>AI Generates Basket</Text>
            <Text style={styles.stepDescription}>Gemini Pro synthesizes optimal allocation</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumberContainer}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Deploy to Vault</Text>
            <Text style={styles.stepDescription}>One-tap investment via Anchor PDA</Text>
          </View>
        </View>
      </View>

      {/* Example Prompts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lightbulb size={20} color="#A855F7" />
          <Text style={styles.sectionTitleWithIcon}>Quick Ideas</Text>
        </View>
        <View style={styles.chipsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.chip}
              onPress={() => handleSuggestionPress(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Brain size={20} color="#A855F7" />
          <Text style={styles.sectionTitleWithIcon}>Generated Baskets</Text>
        </View>

        {aiBaskets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No AI baskets created yet.</Text>
            <Text style={styles.emptyStateSubtext}>Tap the button above to generate one.</Text>
          </View>
        ) : (
          aiBaskets.map((basket) => (
            <View key={basket.id} style={styles.basketCard}>
              <View style={styles.basketInfo}>
                <Text style={styles.basketName}>{basket.name}</Text>
                <Text style={styles.basketAssets}>
                  {basket.assets.length} assets • {basket.apy} APY Target
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.investButton}
                onPress={() => handleSelectBasket(basket)}
              >
                <Text style={styles.investButtonText}>Invest</Text>
                <ChevronRight size={16} color="#A855F7" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: width * 0.04,
    paddingTop: 8,
    paddingBottom: 110, // For bottom tab
  },
  heroCard: {
    backgroundColor: '#161224', // Dark purple tint
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#3B2164',
    marginBottom: 24,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#A855F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitleWithIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  stepNumber: {
    color: '#A855F7',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#6B7280',
    fontSize: 14,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chipText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#6B7280',
    fontSize: 14,
  },
  basketCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  basketInfo: {
    flex: 1,
  },
  basketName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  basketAssets: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  investButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    gap: 4,
  },
  investButtonText: {
    color: '#A855F7',
    fontWeight: '600',
    fontSize: 14,
  },
});
