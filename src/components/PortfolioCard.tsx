import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PortfolioPosition } from '../types';
import { RefreshCw, TrendingUp, AlertTriangle, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface PortfolioCardProps {
  position: PortfolioPosition | null;
  isRebalancing: boolean;
  onRebalance: () => void;
  onSimulateShock: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  position,
  isRebalancing,
  onRebalance,
  onSimulateShock,
}) => {
  if (!position) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Active Portfolio Vault</Text>
        <Text style={styles.emptySubtitle}>
          Select any thematic stock basket below to initialize your non-custodial Anchor vault.
        </Text>
      </View>
    );
  }

  const isDrifted = position.drift >= 3.0;

  return (
    <View style={styles.container}>
      {/* Top Status */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.sectionLabel}>NON-CUSTODIAL VAULT (NAV)</Text>
          <Text style={styles.navValue}>${position.currentNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={[styles.pnlBadge, position.pnlUsdc >= 0 ? styles.pnlPositive : styles.pnlNegative]}>
          <TrendingUp size={13} color={position.pnlUsdc >= 0 ? '#10B981' : '#EF4444'} />
          <Text style={[styles.pnlText, position.pnlUsdc >= 0 ? styles.pnlTextPositive : styles.pnlTextNegative]}>
            {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent}% (${position.pnlUsdc})
          </Text>
        </View>
      </View>

      {/* Active Basket Info */}
      <View style={styles.basketInfoRow}>
        <Text style={styles.activeBasketLabel}>Active Strategy:</Text>
        <Text style={styles.activeBasketName}>{position.basketName}</Text>
      </View>

      {/* Drift Indicator Bar */}
      <View style={[styles.driftBox, isDrifted ? styles.driftBoxWarning : styles.driftBoxNormal]}>
        <View style={styles.driftHeader}>
          <View style={styles.driftHeaderLeft}>
            {isDrifted ? (
              <AlertTriangle size={15} color="#F59E0B" />
            ) : (
              <Zap size={15} color="#00F0FF" />
            )}
            <Text style={[styles.driftTitle, isDrifted ? styles.driftTitleWarning : styles.driftTitleNormal]}>
              {isDrifted ? `Portfolio Drift Alert (+${position.drift}%)` : `Portfolio Balanced (Drift ${position.drift}%)`}
            </Text>
          </View>
          <Text style={styles.driftStatusText}>
            {isDrifted ? 'Rebalance Needed' : 'Target Weights Met'}
          </Text>
        </View>
        <Text style={styles.driftExplanation}>
          {isDrifted
            ? 'Asset price changes caused weights to deviate from target. Rebalancing executes atomic Jupiter swaps.'
            : 'All stock allocations are within acceptable 3.0% tolerance.'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.rebalanceBtn, isRebalancing && styles.btnDisabled]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onRebalance();
          }}
          disabled={isRebalancing}
          activeOpacity={0.85}
        >
          {isRebalancing ? (
            <ActivityIndicator size="small" color="#06080F" />
          ) : (
            <>
              <RefreshCw size={15} color="#06080F" />
              <Text style={styles.rebalanceBtnText}>Rebalance via Jupiter</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shockBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSimulateShock();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.shockBtnText}>⚡ Simulate Drift</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  navValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 4,
  },
  pnlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  pnlPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pnlNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  pnlText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pnlTextPositive: {
    color: '#10B981',
  },
  pnlTextNegative: {
    color: '#EF4444',
  },
  basketInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  activeBasketLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  activeBasketName: {
    fontSize: 13,
    color: '#00F0FF',
    fontWeight: '700',
  },
  driftBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  driftBoxWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  driftBoxNormal: {
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  driftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  driftHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  driftTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  driftTitleWarning: {
    color: '#F59E0B',
  },
  driftTitleNormal: {
    color: '#00F0FF',
  },
  driftStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  driftExplanation: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  rebalanceBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  rebalanceBtnText: {
    color: '#06080F',
    fontWeight: '800',
    fontSize: 14,
  },
  shockBtn: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 12,
    borderRadius: 12,
  },
  shockBtnText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 12,
  },
});
