import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StockBasket } from '../types';
import { TrendingUp, Layers, Sparkles, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface BasketCardProps {
  basket: StockBasket;
  onSelect: (basket: StockBasket) => void;
}

export const BasketCard: React.FC<BasketCardProps> = ({ basket, onSelect }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#10B981';
      case 'Medium': return '#3B82F6';
      case 'High': return '#F59E0B';
      case 'Degen': return '#A855F7';
      default: return '#94A3B8';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        basket.isSkrExclusive && styles.cardSkrExclusive
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(basket);
      }}
      activeOpacity={0.88}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText}>{basket.category}</Text>
            {basket.isSkrExclusive && (
              <View style={styles.skrTag}>
                <Sparkles size={10} color="#C084FC" />
                <Text style={styles.skrTagText}>Seeker Alpha</Text>
              </View>
            )}
          </View>
          <Text style={styles.basketName}>{basket.name}</Text>
        </View>

        <View style={styles.apyContainer}>
          <Text style={styles.apyLabel}>Target APY</Text>
          <Text style={styles.apyValue}>{basket.apy}</Text>
        </View>
      </View>

      <Text style={styles.tagline}>{basket.tagline}</Text>

      {/* Asset Allocation Weight Bars */}
      <View style={styles.assetsContainer}>
        <View style={styles.assetsHeader}>
          <Text style={styles.assetsTitle}>Target Allocations</Text>
          <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(basket.risk)}20` }]}>
            <Text style={[styles.riskText, { color: getRiskColor(basket.risk) }]}>{basket.risk} Risk</Text>
          </View>
        </View>

        <View style={styles.barsContainer}>
          {basket.assets.map((asset) => (
            <View key={asset.symbol} style={styles.assetRow}>
              <View style={styles.assetMeta}>
                <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                <Text style={styles.assetPrice}>${asset.price} ({asset.change24h >= 0 ? '+' : ''}{asset.change24h}%)</Text>
              </View>

              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${asset.weight}%`,
                      backgroundColor: basket.color || '#00F0FF',
                    },
                  ]}
                />
              </View>

              <Text style={styles.weightText}>{asset.weight}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom CTA Bar */}
      <View style={styles.ctaRow}>
        <Text style={styles.ctaText}>Tap to Allocate Vault USDC</Text>
        <ChevronRight size={15} color="#00F0FF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cardSkrExclusive: {
    borderColor: 'rgba(168, 85, 247, 0.5)',
    backgroundColor: '#120D24',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skrTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  skrTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
  },
  basketName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  apyContainer: {
    alignItems: 'flex-end',
  },
  apyLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  apyValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#10B981',
  },
  tagline: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 16,
  },
  assetsContainer: {
    marginTop: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  assetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  assetsTitle: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barsContainer: {
    gap: 8,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assetMeta: {
    width: 80,
  },
  assetSymbol: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  assetPrice: {
    fontSize: 9,
    color: '#64748B',
  },
  barBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  weightText: {
    width: 32,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F0FF',
  },
});
