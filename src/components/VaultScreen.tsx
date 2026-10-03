import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Wallet, Gem, ArrowDownToLine, ArrowUpRight, CheckCircle2, Activity } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PortfolioPosition } from '../types';
import { SKR_TIERS } from '../constants/baskets';

const { width } = Dimensions.get('window');

interface VaultScreenProps {
  skrBalance: number;
  solBalance: number;
  usdcBalance: number;
  position: PortfolioPosition | null;
  onClaimSkr: () => void;
  onFaucetPress: () => void;
  onWithdrawPress: () => void;
  onSkrPress: () => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  skrBalance,
  solBalance,
  usdcBalance,
  position,
  onClaimSkr,
  onFaucetPress,
  onWithdrawPress,
  onSkrPress,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const currentTier = React.useMemo(() => {
    const sortedTiers = [...SKR_TIERS].sort((a, b) => b.minSkr - a.minSkr);
    return sortedTiers.find(tier => skrBalance >= tier.minSkr) || sortedTiers[sortedTiers.length - 1];
  }, [skrBalance]);

  const nextTier = React.useMemo(() => {
    const sortedTiers = [...SKR_TIERS].sort((a, b) => a.minSkr - b.minSkr);
    return sortedTiers.find(tier => tier.minSkr > skrBalance) || null;
  }, [skrBalance]);

  const progress = nextTier
    ? ((skrBalance - currentTier.minSkr) / (nextTier.minSkr - currentTier.minSkr)) * 100
    : 100;

  const handleClaim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClaimSkr();
  };

  const handleFaucet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFaucetPress();
  };
  
  const handleWithdraw = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWithdrawPress();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Vault & $SKR</Text>

      {/* $SKR Token Balance Card */}
      <View style={[styles.card, styles.skrCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Gem color="#A855F7" size={24} />
            <Text style={styles.cardTitle}>$SKR Balance</Text>
          </View>
          <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
            <Text style={styles.claimButtonText}>Claim Faucet</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.skrBalance}>{skrBalance.toLocaleString()} $SKR</Text>
        
        <View style={styles.tierContainer}>
          <View style={styles.tierRow}>
            <Text style={styles.tierName}>{currentTier.name} Tier</Text>
            {nextTier && (
              <Text style={styles.tierProgressText}>
                {(nextTier.minSkr - skrBalance).toLocaleString()} to {nextTier.name}
              </Text>
            )}
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
          </View>
        </View>
      </View>

      {/* Devnet Wallet Balances */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Wallet color="#00F0FF" size={20} />
            <Text style={styles.cardTitle}>Devnet Wallet</Text>
          </View>
          <TouchableOpacity style={styles.faucetButton} onPress={handleFaucet}>
            <ArrowDownToLine color="#00F0FF" size={16} />
            <Text style={styles.faucetButtonText}>Faucet</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>SOL Balance</Text>
            <Text style={styles.balanceValue}>{solBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>USDC Balance</Text>
            <Text style={styles.balanceValue}>{formatCurrency(usdcBalance)}</Text>
          </View>
        </View>
      </View>

      {/* Active Vault Position Summary */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Activity color="#00F0FF" size={20} />
            <Text style={styles.cardTitle}>Active Vault Position</Text>
          </View>
        </View>
        {position ? (
          <View style={styles.positionContainer}>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Basket</Text>
              <Text style={styles.positionValue}>{position.basketId}</Text>
            </View>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Invested</Text>
              <Text style={styles.positionValue}>{formatCurrency(position.investedUsdc)}</Text>
            </View>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>Current Value</Text>
              <Text style={styles.positionValue}>{formatCurrency(position.currentNav)}</Text>
            </View>
            <View style={styles.positionRow}>
              <Text style={styles.positionLabel}>P&L</Text>
              <Text style={[
                styles.positionValue, 
                { color: position.pnlUsdc >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {position.pnlUsdc >= 0 ? '+' : ''}{formatCurrency(position.pnlUsdc)} ({position.pnlPercent.toFixed(2)}%)
              </Text>
            </View>
            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
              <ArrowUpRight color="#0A101C" size={20} />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.emptyStateText}>No active vault positions.</Text>
        )}
      </View>

      {/* $SKR Fee Discount Tiers */}
      <Text style={styles.sectionTitle}>$SKR Fee Discount Tiers</Text>
      <View style={styles.tiersList}>
        {SKR_TIERS.map((tier, index) => {
          const isActive = tier.name === currentTier.name;
          return (
            <TouchableOpacity 
              key={tier.name} 
              style={[styles.tierCard, isActive && styles.tierCardActive]}
              onPress={() => {
                Haptics.selectionAsync();
                onSkrPress();
              }}
            >
              <View style={styles.tierCardHeader}>
                <View style={styles.titleRow}>
                  {isActive && <CheckCircle2 color="#A855F7" size={16} style={{ marginRight: 8 }} />}
                  <Text style={[styles.tierCardTitle, isActive && styles.tierCardTitleActive]}>{tier.name}</Text>
                </View>
                <Text style={styles.tierMinSkr}>{tier.minSkr.toLocaleString()} $SKR</Text>
              </View>
              <View style={styles.tierDetails}>
                <View style={styles.tierDetailItem}>
                  <Text style={styles.tierDetailLabel}>Fee Discount</Text>
                  <Text style={styles.tierDetailValue}>{tier.feeDiscount}</Text>
                </View>
                <View style={styles.tierDetailItem}>
                  <Text style={styles.tierDetailLabel}>Rebalance</Text>
                  <Text style={styles.tierDetailValue}>{tier.rebalanceFrequency}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: width * 0.04,
    paddingTop: 8,
    paddingBottom: 110,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    fontFamily: 'System',
  },
  card: {
    backgroundColor: '#0A101C',
    borderRadius: 16,
    padding: width * 0.04,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  skrCard: {
    borderColor: 'rgba(168, 85, 247, 0.3)',
    backgroundColor: '#0c0b1a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  claimButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  claimButtonText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '600',
  },
  faucetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    gap: 4,
  },
  faucetButtonText: {
    color: '#00F0FF',
    fontSize: 12,
    fontWeight: '600',
  },
  skrBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  tierContainer: {
    marginTop: 8,
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A855F7',
  },
  tierProgressText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 3,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  balanceItem: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  positionContainer: {
    gap: 12,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  positionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  withdrawButtonText: {
    color: '#0A101C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 16,
  },
  tiersList: {
    gap: 12,
  },
  tierCard: {
    backgroundColor: '#0A101C',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tierCardActive: {
    borderColor: '#A855F7',
    backgroundColor: '#0f0b1a',
  },
  tierCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tierCardTitleActive: {
    color: '#A855F7',
  },
  tierMinSkr: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  tierDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
  },
  tierDetailItem: {
    flex: 1,
  },
  tierDetailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  tierDetailValue: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },
});
