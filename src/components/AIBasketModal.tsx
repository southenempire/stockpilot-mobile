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
import { StockBasket, StockAsset } from '../types';
import { X, Sparkles, Wand2, CheckCircle2, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface AIBasketModalProps {
  visible: boolean;
  onClose: () => void;
  onBasketCreated: (basket: StockBasket) => void;
}

export const AIBasketModal: React.FC<AIBasketModalProps> = ({
  visible,
  onClose,
  onBasketCreated,
}) => {
  const [prompt, setPrompt] = useState('Next-gen AI datacenters, liquid cooling, and quantum computing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBasket, setGeneratedBasket] = useState<StockBasket | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate AI LLM reasoning and allocation synthesis
    setTimeout(async () => {
      const newBasket: StockBasket = {
        id: `ai-custom-${Date.now()}`,
        name: 'AI Quantum Infrastructure',
        tagline: prompt.slice(0, 45) + '...',
        category: 'AI Generated',
        apy: '38.6%',
        risk: 'High',
        color: '#A855F7',
        description: `Custom algorithmic thematic basket generated from prompt: "${prompt}"`,
        assets: [
          { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 35, price: 128.50, change24h: 3.42, mint: 'NVDA_DEVNET_MINT' },
          { symbol: 'SMCI', name: 'Super Micro Computer', weight: 25, price: 44.80, change24h: 6.15, mint: 'SMCI_DEVNET_MINT' },
          { symbol: 'VRT', name: 'Vertiv Holdings', weight: 20, price: 104.20, change24h: 2.80, mint: 'VRT_DEVNET_MINT' },
          { symbol: 'IONQ', name: 'IonQ Quantum', weight: 20, price: 12.90, change24h: 8.40, mint: 'IONQ_DEVNET_MINT' },
        ]
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
                <Sparkles size={20} color="#A855F7" />
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
                Describe any investment thesis or market sector. The AI model will calculate optimal asset weights and mint a non-custodial strategy.
              </Text>

              {/* Prompt Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Investment Thesis / Macro Theme</Text>
                <TextInput
                  style={styles.input}
                  multiline
                  numberOfLines={3}
                  value={prompt}
                  onChangeText={setPrompt}
                  placeholder="e.g. Autonomous robotics, drones, and battery supply chains"
                  placeholderTextColor="#475569"
                />
              </View>

              {/* Presets */}
              <View style={styles.presetsRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPrompt('Space exploration, satellite telecom & lunar logistics');
                  }}
                >
                  <Text style={styles.presetText}>🚀 Space & Satellites</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPrompt('Biotech breakthroughs, GLP-1 & longevity genomics');
                  }}
                >
                  <Text style={styles.presetText}>🧬 Bio & Genomics</Text>
                </TouchableOpacity>
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
                    <Text style={styles.generateBtnText}>Generate Custom Basket</Text>
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
                  <Text style={styles.previewApy}>Target APY: {generatedBasket.apy}</Text>

                  <View style={styles.previewAssets}>
                    {generatedBasket.assets.map((a) => (
                      <View key={a.symbol} style={styles.previewAssetRow}>
                        <Text style={styles.previewSymbol}>{a.symbol} ({a.name})</Text>
                        <Text style={styles.previewWeight}>{a.weight}%</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.useStrategyBtn}
                    onPress={handleUseBasket}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.useStrategyText}>Allocate USDC to This Strategy</Text>
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
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
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
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#06080F',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#F8FAFC',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
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
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    textTransform: 'uppercase',
  },
  previewBasketName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  previewApy: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00F0FF',
    marginTop: 2,
    marginBottom: 10,
  },
  previewAssets: {
    backgroundColor: '#06080F',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  previewAssetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewSymbol: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  previewWeight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#A855F7',
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
    fontWeight: '800',
    color: '#06080F',
  },
});
