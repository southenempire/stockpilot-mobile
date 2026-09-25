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
} from 'react-native';
import { StockBasket } from '../types';
import { calculateProtocolFee } from '../utils/vault';
import { X, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface InvestModalProps {
  visible: boolean;
  basket: StockBasket | null;
  skrBalance: number;
  onClose: () => void;
  onConfirmInvest: (amount: number) => Promise<void>;
}

export const InvestModal: React.FC<InvestModalProps> = ({
  visible,
  basket,
  skrBalance,
  onClose,
  onConfirmInvest,
}) => {
  const [amount, setAmount] = useState('100');
  const [isLoading, setIsLoading] = useState(false);

  if (!basket) return null;

  const numAmount = parseFloat(amount) || 0;
  const { netAmount, fee, bps } = calculateProtocolFee(numAmount, skrBalance);

  const handleInvest = async () => {
    if (numAmount <= 0) return;
    setIsLoading(true);
    try {
      await onConfirmInvest(numAmount);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.kicker}>ALLOCATE TO VAULT</Text>
                <Text style={styles.basketTitle}>{basket.name}</Text>
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

            {/* Input Row */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Deposit Amount (USDC)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="100"
                  placeholderTextColor="#475569"
                />
                <TouchableOpacity
                  style={styles.quickPreset}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAmount('250');
                  }}
                >
                  <Text style={styles.quickPresetText}>MAX</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Breakdown Card */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Allocated to Equities:</Text>
                <Text style={styles.breakdownValue}>${netAmount.toFixed(2)} USDC</Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.feeLabelRow}>
                  <Text style={styles.breakdownLabel}>Protocol Fee Split ({bps} bps):</Text>
                  {bps === 0 && (
                    <View style={styles.vipTag}>
                      <Sparkles size={9} color="#C084FC" />
                      <Text style={styles.vipTagText}>VIP 0%</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.breakdownFee}>${fee.toFixed(4)} USDC</Text>
              </View>

              <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                <Text style={styles.totalLabel}>Non-Custodial Anchor PDA:</Text>
                <View style={styles.pdaTag}>
                  <ShieldCheck size={12} color="#10B981" />
                  <Text style={styles.pdaTagText}>Verified</Text>
                </View>
              </View>
            </View>

            {/* Confirmation CTA */}
            <TouchableOpacity
              style={[styles.confirmBtn, (numAmount <= 0 || isLoading) && styles.btnDisabled]}
              onPress={handleInvest}
              disabled={numAmount <= 0 || isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#06080F" />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Sign with Mobile Wallet Adapter</Text>
                  <ArrowRight size={16} color="#06080F" />
                </>
              )}
            </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  kicker: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  basketTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06080F',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00F0FF',
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  quickPreset: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickPresetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00F0FF',
  },
  breakdownCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  feeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
  },
  vipTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C084FC',
  },
  breakdownFee: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  breakdownTotalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  pdaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  pdaTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#06080F',
  },
});
