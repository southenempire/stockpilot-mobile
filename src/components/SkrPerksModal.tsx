import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SKR_TIERS } from '../constants/baskets';
import { X, Sparkles, ShieldCheck, Zap, Gift, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface SkrPerksModalProps {
  visible: boolean;
  skrBalance: number;
  onClose: () => void;
  onClaimSkr: () => void;
}

export const SkrPerksModal: React.FC<SkrPerksModalProps> = ({
  visible,
  skrBalance,
  onClose,
  onClaimSkr,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Sparkles size={22} color="#A855F7" />
              <View>
                <Text style={styles.kicker}>SOLANA SEEKER ECOSYSTEM</Text>
                <Text style={styles.title}>$SKR Token Utility</Text>
              </View>
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
            {/* User Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>YOUR SEEKER STAKING BALANCE</Text>
              <Text style={styles.balanceValue}>{skrBalance} $SKR</Text>
              <Text style={styles.balanceStatus}>
                {skrBalance >= 2500
                  ? '👑 Genesis VIP Tier Active (0% Protocol Fees)'
                  : skrBalance >= 500
                  ? '⭐ Radiant Gold Tier Active (50% Fee Discount)'
                  : '⚡ Standard Seeker Tier'}
              </Text>
            </View>

            {/* Faucet for Judges */}
            <TouchableOpacity
              style={styles.faucetBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onClaimSkr();
              }}
              activeOpacity={0.85}
            >
              <Gift size={16} color="#06080F" />
              <Text style={styles.faucetBtnText}>+ Faucet: Claim 1,000 $SKR (Devnet)</Text>
            </TouchableOpacity>

            {/* Tiers List */}
            <Text style={styles.sectionTitle}>$SKR Fee Discount Tiers</Text>

            <View style={styles.tiersList}>
              {SKR_TIERS.map((tier) => {
                const isActive = skrBalance >= tier.minSkr;
                return (
                  <View
                    key={tier.name}
                    style={[
                      styles.tierCard,
                      isActive && styles.tierCardActive,
                    ]}
                  >
                    <View style={styles.tierHeader}>
                      <View style={styles.tierNameRow}>
                        <View style={[styles.tierDot, { backgroundColor: tier.badgeColor }]} />
                        <Text style={styles.tierName}>{tier.name}</Text>
                      </View>
                      <Text style={styles.tierRequirement}>
                        {tier.minSkr === 0 ? 'Default' : `${tier.minSkr} $SKR`}
                      </Text>
                    </View>

                    <View style={styles.tierFeatures}>
                      <View style={styles.featureRow}>
                        <Check size={13} color={isActive ? '#10B981' : '#64748B'} />
                        <Text style={styles.featureText}>Fee: {tier.feeDiscount}</Text>
                      </View>
                      <View style={styles.featureRow}>
                        <Zap size={13} color={isActive ? '#00F0FF' : '#64748B'} />
                        <Text style={styles.featureText}>Rebalance Engine: {tier.rebalanceFrequency}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  kicker: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.8,
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
  balanceCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    alignItems: 'center',
    marginBottom: 14,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    marginVertical: 4,
  },
  balanceStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  faucetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
    marginBottom: 18,
  },
  faucetBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06080F',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  tiersList: {
    gap: 10,
    marginBottom: 20,
  },
  tierCard: {
    backgroundColor: '#06080F',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tierCardActive: {
    borderColor: '#00F0FF',
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  tierRequirement: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tierFeatures: {
    gap: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
