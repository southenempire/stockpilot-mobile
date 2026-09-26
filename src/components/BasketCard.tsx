import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StockBasket } from '../types';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface BasketCardProps {
  basket: StockBasket;
  onSelect: (basket: StockBasket) => void;
}

const STOCK_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  NVDA: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981', bar: '#10B981' },
  TSM: { bg: 'rgba(2, 132, 199, 0.15)', text: '#38BDF8', bar: '#0284C7' },
  AVGO: { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', bar: '#8B5CF6' },
  AMD: { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', bar: '#EF4444' },
  AAPL: { bg: 'rgba(148, 163, 184, 0.15)', text: '#CBD5E1', bar: '#94A3B8' },
  MSFT: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', bar: '#0EA5E9' },
  GOOGL: { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', bar: '#F59E0B' },
  AMZN: { bg: 'rgba(249, 115, 22, 0.15)', text: '#FB923C', bar: '#F97316' },
  CEG: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22D3EE', bar: '#06B6D4' },
  VST: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', bar: '#10B981' },
  NEE: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', bar: '#3B82F6' },
  CCJ: { bg: 'rgba(234, 179, 8, 0.15)', text: '#FACC15', bar: '#EAB308' },
  TSLA: { bg: 'rgba(239, 68, 68, 0.15)', text: '#F87171', bar: '#DC2626' },
  COIN: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', bar: '#2563EB' },
  SKR: { bg: 'rgba(168, 85, 247, 0.2)', text: '#C084FC', bar: '#A855F7' },
};

export const BasketCard: React.FC<BasketCardProps> = ({ basket, onSelect }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return '#10B981';
      case 'Medium':
        return '#38BDF8';
      case 'High':
        return '#F59E0B';
      case 'Degen':
        return '#A855F7';
      default:
        return '#94A3B8';
    }
  };

  return (
    <View style={[styles.card, basket.isSkrExclusive && styles.cardSkrExclusive]}>
      {/* Category & APY Header */}
      <View style={styles.topHeader}>
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryLabel}>{basket.category}</Text>
          {basket.isSkrExclusive && (
            <View style={styles.skrBadge}>
              <Sparkles size={10} color="#C084FC" />
              <Text style={styles.skrBadgeText}>Seeker Alpha</Text>
            </View>
          )}
        </View>

        <View style={styles.apyBadge}>
          <Text style={styles.apyValue}>{basket.apy}</Text>
          <Text style={styles.apyLabel}>Target APY</Text>
        </View>
      </View>

      {/* Basket Name & Tagline */}
      <Text style={styles.basketName}>{basket.name}</Text>
      <Text style={styles.tagline}>{basket.tagline}</Text>

      {/* Ticker Badges Row + Invest CTA */}
      <View style={styles.tickerAndActionRow}>
        <View style={styles.tickersList}>
          {basket.assets.map((asset) => {
            const stockColor = STOCK_COLORS[asset.symbol] || {
              bg: 'rgba(0, 240, 255, 0.1)',
              text: '#00F0FF',
              bar: '#00F0FF',
            };
            return (
              <View key={asset.symbol} style={[styles.tickerChip, { backgroundColor: stockColor.bg }]}>
                <Text style={[styles.tickerText, { color: stockColor.text }]}>{asset.symbol}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.investBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSelect(basket);
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.investBtnText}>Invest</Text>
        </TouchableOpacity>
      </View>

      {/* Visual Multi-Segment Allocation Bar */}
      <View style={styles.segmentedBarContainer}>
        {basket.assets.map((asset, idx) => {
          const stockColor = STOCK_COLORS[asset.symbol] || { bar: '#00F0FF' };
          return (
            <View
              key={asset.symbol}
              style={[
                styles.segmentSlice,
                {
                  flex: asset.weight,
                  backgroundColor: stockColor.bar,
                  borderTopLeftRadius: idx === 0 ? 4 : 0,
                  borderBottomLeftRadius: idx === 0 ? 4 : 0,
                  borderTopRightRadius: idx === basket.assets.length - 1 ? 4 : 0,
                  borderBottomRightRadius: idx === basket.assets.length - 1 ? 4 : 0,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Allocation Percentages Legend */}
      <View style={styles.weightsLegendRow}>
        {basket.assets.map((asset) => {
          const stockColor = STOCK_COLORS[asset.symbol] || { text: '#94A3B8' };
          return (
            <Text key={asset.symbol} style={[styles.legendText, { color: stockColor.text }]}>
              {asset.symbol} {asset.weight}%
            </Text>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#0A101C',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardSkrExclusive: {
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: '#100B22',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  skrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  skrBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    fontFamily: 'monospace',
  },
  apyBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  apyValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
    fontFamily: 'monospace',
  },
  apyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  basketName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  tickerAndActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    gap: 8,
  },
  tickersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  tickerChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tickerText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  investBtn: {
    backgroundColor: '#00F0FF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  investBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#06080F',
    letterSpacing: 0.2,
  },
  segmentedBarContainer: {
    flexDirection: 'row',
    height: 6,
    marginTop: 12,
    gap: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  segmentSlice: {
    height: '100%',
  },
  weightsLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
