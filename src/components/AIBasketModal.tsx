import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { StockBasket } from '../types';
import { X, Sparkles, Wand2, CheckCircle2, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface AIBasketModalProps {
  visible: boolean;
  onClose: () => void;
  onBasketCreated: (basket: StockBasket) => void;
}

const QUICK_SUGGESTIONS = [
  '⚡ Nuclear Energy powering AI Data Centers',
  '🚀 Space exploration, satellites & lunar supply',
  '🧬 Biotech GLP-1 & longevity therapeutics',
  '🤖 Humanoid robotics & battery supply chains',
];

export const AIBasketModal: React.FC<AIBasketModalProps> = ({
  visible,
  onClose,
  onBasketCreated,
}) => {
  const [prompt, setPrompt] = useState('Nuclear energy powering AI data centers');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBasket, setGeneratedBasket] = useState<StockBasket | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setTimeout(async () => {
      const newBasket: StockBasket = {
        id: `ai-custom-${Date.now()}`,
        name: 'AI Nuclear Energy Grid',
        tagline: prompt.slice(0, 48) + '...',
        category: 'AI Synthesized',
        apy: '+44.2% APY',
        risk: 'High',
        color: '#A855F7',
        description: `Autonomous algorithmic strategy synthesized from prompt: "${prompt}"`,
        assets: [
          { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 35, price: 128.50, change24h: 3.42, mint: 'NVDA_DEVNET_MINT' },
          { symbol: 'CEG', name: 'Constellation Energy', weight: 30, price: 268.40, change24h: 5.12, mint: 'CEG_DEVNET_MINT' },
          { symbol: 'VST', name: 'Vistra Corp', weight: 20, price: 118.90, change24h: 4.80, mint: 'VST_DEVNET_MINT' },
          { symbol: 'CCJ', name: 'Cameco Uranium', weight: 15, price: 54.20, change24h: 2.10, mint: 'CCJ_DEVNET_MINT' },
        ],
      };

      setGeneratedBasket(newBasket);
      setIsGenerating(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1200);
  };

  const handleUseBasket = () => {
    if (generatedBasket) {
      onBasketCreated(generatedBasket);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Sparkles size={18} color="#A855F7" />
                <Text style={styles.title}>AI Thesis Architect</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  Haptics.selectionAsync();
                  onClose();
                }}
              >
                <X size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>
                Type any macro investment thesis. The AI engine dynamically parses market drivers and computes optimal equity weights.
              </Text>

              {/* Prompt Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Macro Thesis or Market Sector</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="e.g. Next-gen nuclear SMRs for hyperscaler AI data centers"
                  placeholderTextColor="#475569"
                />
              </View>

              {/* Quick Suggestions */}
              <Text style={styles.suggestionsLabel}>Quick Ideas</Text>
              <View style={styles.suggestionsList}>
                {QUICK_SUGGESTIONS.map((sugg) => (
                  <TouchableOpacity
                    key={sugg}
                    style={styles.suggChip}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setPrompt(sugg.replace(/^[^\w]+/, '').trim());
                    }}
                  >
                    <Text style={styles.suggText}>{sugg}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Generate CTA */}
              <TouchableOpacity
                style={[styles.generateBtn, isGenerating && styles.btnDisabled]}
                onPress={handleGenerate}
                disabled={isGenerating}
                activeOpacity={0.85}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Wand2 size={16} color="#FFFFFF" />
                    <Text style={styles.generateBtnText}>Synthesize Custom Strategy</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Generated Basket Preview */}
              {generatedBasket && (
                <View style={styles.previewBox}>
                  <View style={styles.previewHeader}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text style={styles.previewTitle}>Strategy Synthesized</Text>
                  </View>

                  <Text style={styles.previewBasketName}>{generatedBasket.name}</Text>
                  <Text style={styles.previewApy}>Target: {generatedBasket.apy}</Text>

                  {/* Weights Breakdown */}
                  <View style={styles.previewAssets}>
                    {generatedBasket.assets.map((a) => (
                      <View key={a.symbol} style={styles.previewAssetRow}>
                        <View style={styles.symbolTag}>
                          <Text style={styles.previewSymbol}>{a.symbol}</Text>
                          <Text style={styles.previewName}>{a.name}</Text>
                        </View>
                        <Text style={styles.previewWeight}>{a.weight}%</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.useStrategyBtn}
                    onPress={handleUseBasket}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.useStrategyText}>Allocate Vault USDC to This Strategy</Text>
                    <ArrowRight size={14} color="#06080F" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 8, 15, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0A101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    maxHeight: '90%',
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#06080F',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  suggestionsList: {
    gap: 6,
    marginBottom: 16,
  },
  suggChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  suggText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A855F7',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  previewBasketName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  previewApy: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F0FF',
    marginTop: 2,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  previewAssets: {
    backgroundColor: '#06080F',
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  previewAssetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewSymbol: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  previewName: {
    fontSize: 11,
    color: '#64748B',
  },
  previewWeight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A855F7',
    fontFamily: 'monospace',
  },
  useStrategyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  useStrategyText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#06080F',
  },
});
