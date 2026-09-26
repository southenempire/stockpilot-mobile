import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PortfolioPosition } from '../types';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Droplets,
  AlertTriangle,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface PortfolioCardProps {
  position: PortfolioPosition | null;
  solBalance?: number;
  usdcBalance?: number;
  isRebalancing: boolean;
  onDepositPress: () => void;
  onWithdrawPress: () => void;
  onRebalance: () => void;
  onFaucetPress: () => void;
  onSimulateShock: () => void;
}

type Timeframe = '1D' | '1W' | '1M' | '1Y' | 'ALL';

const SPARKLINE_DATA: Record<Timeframe, number[]> = {
  '1D': [250, 252, 251, 255, 258, 254, 260, 265, 263, 268.45],
  '1W': [240, 243, 248, 245, 252, 258, 261, 260, 264, 268.45],
  '1M': [210, 220, 218, 230, 235, 242, 240, 255, 260, 268.45],
  '1Y': [150, 165, 180, 175, 195, 215, 230, 245, 255, 268.45],
  'ALL': [100, 120, 145, 160, 185, 210, 235, 250, 260, 268.45],
};

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  position,
  solBalance = 2.45,
  usdcBalance = 1500.0,
  isRebalancing,
  onDepositPress,
  onWithdrawPress,
  onRebalance,
  onFaucetPress,
  onSimulateShock,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');

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
  const isPositivePnl = position.pnlUsdc >= 0;

  // Generate SVG Sparkline Path
  const data = SPARKLINE_DATA[selectedTimeframe];
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal || 1;
  const cardWidth = Dimensions.get('window').width - 72; // Padding consideration
  const chartHeight = 54;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * cardWidth;
    const y = chartHeight - ((val - minVal) / range) * (chartHeight - 12) - 6;
    return { x, y };
  });

  // Smooth bezier curve path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const areaD = `${pathD} L ${cardWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <View style={styles.container}>
      {/* Top Header Label & Devnet Badge */}
      <View style={styles.headerRow}>
        <View style={styles.headerLabelGroup}>
          <Text style={styles.portfolioLabel}>PORTFOLIO VALUE (USDC)</Text>
          <View style={styles.devnetTag}>
            <View style={styles.devnetDot} />
            <Text style={styles.devnetTagText}>SOLANA DEVNET</Text>
          </View>
        </View>

        {/* Live Devnet Balances Split */}
        <View style={styles.balanceSplit}>
          <Text style={styles.solBalanceText}>{solBalance.toFixed(3)} SOL</Text>
          <Text style={styles.usdcBalanceText}>${usdcBalance.toLocaleString()} USDC</Text>
        </View>
      </View>

      {/* Main Net Asset Value Row */}
      <View style={styles.navRow}>
        <Text style={styles.navSymbol}>$</Text>
        <Text style={styles.navAmount}>
          {position.currentNav.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>

        {/* 24h PnL Badge */}
        <View style={[styles.pnlPill, isPositivePnl ? styles.pnlPositive : styles.pnlNegative]}>
          {isPositivePnl ? (
            <TrendingUp size={12} color="#10B981" />
          ) : (
            <TrendingDown size={12} color="#EF4444" />
          )}
          <Text style={[styles.pnlText, isPositivePnl ? styles.pnlTextPos : styles.pnlTextNeg]}>
            {isPositivePnl ? '+' : ''}${Math.abs(position.pnlUsdc).toFixed(2)} ({isPositivePnl ? '+' : ''}{position.pnlPercent}%)
          </Text>
        </View>
      </View>

      {/* Strategy Subtitle */}
      <View style={styles.strategyRow}>
        <Text style={styles.strategyPrefix}>Active Basket:</Text>
        <Text style={styles.strategyName}>{position.basketName}</Text>
      </View>

      {/* Sparkline & Timeframe Control */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>TOKENIZED EQUITY INDEX</Text>
          <View style={styles.timeframeGroup}>
            {(['1D', '1W', '1M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframePill,
                  selectedTimeframe === tf && styles.timeframePillActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedTimeframe(tf);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    selectedTimeframe === tf && styles.timeframeTextActive,
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Glowing SVG Curve */}
        <View style={styles.svgContainer}>
          <Svg width={cardWidth} height={chartHeight} viewBox={`0 0 ${cardWidth} ${chartHeight}`}>
            <Defs>
              <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#00F0FF" stopOpacity="0.3" />
                <Stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
              </LinearGradient>
            </Defs>
            <Path d={areaD} fill="url(#chartGradient)" />
            <Path
              d={pathD}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>

      {/* Drift Meter Warning / Status */}
      <View style={[styles.driftContainer, isDrifted ? styles.driftWarning : styles.driftNormal]}>
        <View style={styles.driftTopRow}>
          <View style={styles.driftLabelLeft}>
            {isDrifted ? (
              <AlertTriangle size={14} color="#F59E0B" />
            ) : (
              <Zap size={14} color="#00F0FF" />
            )}
            <Text style={[styles.driftHeading, isDrifted ? styles.driftTextWarn : styles.driftTextNorm]}>
              {isDrifted ? `Portfolio Drift Alert (+${position.drift}%)` : `Target Allocation Met (${position.drift}% drift)`}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shockPill}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSimulateShock();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.shockPillText}>⚡ Shock</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.driftSub}>
          {isDrifted
            ? 'Asset weights deviated from target. 1-tap rebalance executes atomic Jupiter swaps.'
            : 'All stock allocations are within acceptable 3.0% rebalance tolerance.'}
        </Text>
      </View>

      {/* 4-Column Quick Action Bar (Deposit, Withdraw, Rebalance, Faucet) */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDepositPress();
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, styles.depositBg]}>
            <ArrowUpRight size={16} color="#10B981" />
          </View>
          <Text style={styles.actionItemLabel}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onWithdrawPress();
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, styles.withdrawBg]}>
            <ArrowDownLeft size={16} color="#A855F7" />
          </View>
          <Text style={styles.actionItemLabel}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onRebalance();
          }}
          disabled={isRebalancing}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, styles.rebalanceBg]}>
            {isRebalancing ? (
              <ActivityIndicator size="small" color="#00F0FF" />
            ) : (
              <RefreshCw size={15} color="#00F0FF" />
            )}
          </View>
          <Text style={styles.actionItemLabel}>Rebalance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onFaucetPress();
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, styles.faucetBg]}>
            <Droplets size={15} color="#38BDF8" />
          </View>
          <Text style={styles.actionItemLabel}>Faucet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#0A101C',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 24,
    borderRadius: 22,
    backgroundColor: '#0A101C',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabelGroup: {
    flexDirection: 'column',
    gap: 4,
  },
  portfolioLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  devnetTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  devnetDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#00F0FF',
  },
  devnetTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
    fontFamily: 'monospace',
  },
  balanceSplit: {
    alignItems: 'flex-end',
    gap: 2,
  },
  solBalanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A855F7',
    fontFamily: 'monospace',
  },
  usdcBalanceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
    gap: 2,
  },
  navSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  navAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'monospace',
    letterSpacing: -0.5,
  },
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginLeft: 8,
  },
  pnlPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pnlNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  pnlText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  pnlTextPos: {
    color: '#10B981',
  },
  pnlTextNeg: {
    color: '#EF4444',
  },
  strategyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  strategyPrefix: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  strategyName: {
    fontSize: 12,
    color: '#00F0FF',
    fontWeight: '700',
  },
  chartSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    fontFamily: 'monospace',
  },
  timeframeGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  timeframePill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  timeframePillActive: {
    backgroundColor: '#00F0FF',
  },
  timeframeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  timeframeTextActive: {
    color: '#06080F',
    fontWeight: '800',
  },
  svgContainer: {
    height: 54,
    width: '100%',
    overflow: 'hidden',
    marginTop: 4,
  },
  driftContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  driftWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  driftNormal: {
    backgroundColor: 'rgba(0, 240, 255, 0.04)',
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  driftTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  driftLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  driftHeading: {
    fontSize: 11,
    fontWeight: '800',
  },
  driftTextWarn: {
    color: '#F59E0B',
  },
  driftTextNorm: {
    color: '#00F0FF',
  },
  shockPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  shockPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  driftSub: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 8,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  depositBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  withdrawBg: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  rebalanceBg: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  faucetBg: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  actionItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
});
