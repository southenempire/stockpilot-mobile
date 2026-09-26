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
import { X, ShieldCheck, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface InvestModalProps {
  visible: boolean;
  basket: StockBasket | null;
  skrBalance: number;
  onClose: () => void;
  onConfirmInvest: (amount: number) => Promise<void>;
}

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000];

export const InvestModal: React.FC<InvestModalProps> = ({
  visible,
  basket,
  skrBalance,
  onClose,
  onConfirmInvest,
}) => {
  const [amount, setAmount] = useState('250');
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
                <Text style={styles.kicker}>ALLOCATE TO ANCHOR VAULT</Text>
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

            {/* Quick Amount Pills */}
            <Text style={styles.sectionLabel}>Quick Deposit Amount</Text>
            <View style={styles.presetRow}>
              {PRESET_AMOUNTS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetPill,
                    numAmount === preset && styles.presetPillActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAmount(preset.toString());
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.presetText,
                      numAmount === preset && styles.presetTextActive,
                    ]}
                  >
                    ${preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Input Box */}
            <View style={styles.inputContainer}>
              <Text style={styles.currencyPrefix}>$</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="250"
                placeholderTextColor="#475569"
              />
              <Text style={styles.currencySuffix}>USDC</Text>
            </View>

            {/* Deposit Summary & Fee Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Allocated to Equities:</Text>
                <Text style={styles.breakdownValue}>${netAmount.toFixed(2)} USDC</Text>
              </View>

              <View style={styles.breakdownRow}>
                <View style={styles.feeLabelRow}>
                  <Text style={styles.breakdownLabel}>Protocol Fee ({bps} bps):</Text>
                  {bps === 0 && (
                    <View style={styles.vipTag}>
                      <Sparkles size={9} color="#C084FC" />
                      <Text style={styles.vipTagText}>Genesis VIP 0%</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.breakdownFee}>${fee.toFixed(4)} USDC</Text>
              </View>

              <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                <View style={styles.securityRow}>
                  <ShieldCheck size={14} color="#10B981" />
                  <Text style={styles.totalLabel}>Non-Custodial PDA Security</Text>
                </View>
                <Text style={styles.verifiedTag}>Audited</Text>
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
                <Text style={styles.confirmBtnText}>Confirm Deposit to Anchor Vault</Text>
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
    backgroundColor: '#0A101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  kicker: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  basketTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6,
  },
  presetPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  presetPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  presetTextActive: {
    color: '#00F0FF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06080F',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00F0FF',
    marginRight: 6,
    fontFamily: 'monospace',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  currencySuffix: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  breakdownCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 18,
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
    fontWeight: '800',
    color: '#F1F5F9',
    fontFamily: 'monospace',
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
    fontWeight: '800',
    color: '#C084FC',
    fontFamily: 'monospace',
  },
  breakdownFee: {
    fontSize: 12,
    fontWeight: '800',
    color: '#CBD5E1',
    fontFamily: 'monospace',
  },
  breakdownTotalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  verifiedTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  confirmBtn: {
    backgroundColor: '#00F0FF',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#06080F',
    letterSpacing: 0.2,
  },
});
