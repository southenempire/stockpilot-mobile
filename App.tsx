import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Header } from './src/components/Header';
import { PortfolioCard } from './src/components/PortfolioCard';
import { BasketCard } from './src/components/BasketCard';
import { InvestModal } from './src/components/InvestModal';
import { AIBasketModal } from './src/components/AIBasketModal';
import { SkrPerksModal } from './src/components/SkrPerksModal';
import { STOCK_BASKETS } from './src/constants/baskets';
import { StockBasket, PortfolioPosition } from './src/types';
import { MobileWalletManager, WalletSession } from './src/utils/mwa';
import { simulateMarketMovement } from './src/utils/vault';
import { Sparkles, Wand2, Layers } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type FilterCategory = 'ALL' | 'TECH' | 'SEEKER' | 'ENERGY';

export default function App() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [skrBalance, setSkrBalance] = useState(1250);
  const [solBalance, setSolBalance] = useState(2.45);
  const [usdcBalance, setUsdcBalance] = useState(1500.0);
  const [baskets, setBaskets] = useState<StockBasket[]>(STOCK_BASKETS);
  const [selectedBasket, setSelectedBasket] = useState<StockBasket | null>(null);
  const [filter, setFilter] = useState<FilterCategory>('ALL');

  // Active Portfolio State
  const [position, setPosition] = useState<PortfolioPosition | null>({
    basketId: 'semi-supremacy',
    basketName: 'Semiconductor Supremacy',
    investedUsdc: 250,
    currentNav: 268.45,
    pnlUsdc: 18.45,
    pnlPercent: 7.38,
    targetWeights: { NVDA: 40, TSM: 25, AVGO: 20, AMD: 15 },
    currentWeights: { NVDA: 45, TSM: 24, AVGO: 19, AMD: 12 },
    drift: 5.0,
  });

  const [isRebalancing, setIsRebalancing] = useState(false);

  // Modals
  const [isInvestModalVisible, setIsInvestModalVisible] = useState(false);
  const [isAiModalVisible, setIsAiModalVisible] = useState(false);
  const [isSkrModalVisible, setIsSkrModalVisible] = useState(false);

  const walletManager = MobileWalletManager.getInstance();

  const handleConnectWallet = async () => {
    try {
      const sess = await walletManager.connect();
      setSession(sess);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      console.warn(e);
    }
  };

  const handleSelectBasket = (basket: StockBasket) => {
    setSelectedBasket(basket);
    setIsInvestModalVisible(true);
  };

  const handleConfirmInvest = async (amount: number) => {
    if (!selectedBasket) return;

    const weights: { [s: string]: number } = {};
    selectedBasket.assets.forEach((a) => {
      weights[a.symbol] = a.weight;
    });

    const newPosition: PortfolioPosition = {
      basketId: selectedBasket.id,
      basketName: selectedBasket.name,
      investedUsdc: (position?.investedUsdc || 0) + amount,
      currentNav: (position?.currentNav || 0) + amount,
      pnlUsdc: position?.pnlUsdc || 0,
      pnlPercent: position?.pnlPercent || 0,
      targetWeights: weights,
      currentWeights: weights,
      drift: 0.0,
    };

    setPosition(newPosition);
    setUsdcBalance((prev) => Math.max(0, prev - amount));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Deposit Confirmed! 🎉',
      `Allocated $${amount} USDC to ${selectedBasket.name} via non-custodial Anchor vault PDA.`
    );
  };

  const handleRebalance = async () => {
    if (!position) return;
    setIsRebalancing(true);

    setTimeout(async () => {
      setPosition({
        ...position,
        currentWeights: { ...position.targetWeights },
        drift: 0.0,
      });
      setIsRebalancing(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Portfolio Rebalanced! ⚡',
        'Atomic swaps routed through Jupiter DEX. Portfolio weights restored to target allocations with 0% slippage.'
      );
    }, 1500);
  };

  const handleSimulateShock = () => {
    if (!position) return;
    const shocked = simulateMarketMovement(position);
    setPosition(shocked);
  };

  const handleAiBasketCreated = (newBasket: StockBasket) => {
    setBaskets([newBasket, ...baskets]);
    setSelectedBasket(newBasket);
    setIsInvestModalVisible(true);
  };

  const handleClaimSkr = () => {
    setSkrBalance((prev) => prev + 1000);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Faucet Claimed! 💎', 'Added 1,000 $SKR tokens to your Seeker wallet.');
  };

  const handleFaucetPress = () => {
    setSolBalance((prev) => prev + 1.0);
    setUsdcBalance((prev) => prev + 500.0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Devnet Faucet Funded! 🚰', 'Received 1.0 Devnet SOL & $500 Devnet USDC.');
  };

  const handleWithdrawPress = () => {
    if (!position || position.currentNav <= 0) {
      Alert.alert('Vault Empty', 'No active position to withdraw.');
      return;
    }
    const withdrawAmount = position.currentNav;
    setUsdcBalance((prev) => prev + withdrawAmount);
    setPosition(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Withdrawal Complete 💰',
      `Withdrew $${withdrawAmount.toFixed(2)} USDC from Anchor Vault to your connected wallet.`
    );
  };

  // Filtered baskets
  const filteredBaskets = baskets.filter((b) => {
    if (filter === 'TECH') return b.category.includes('Tech') || b.category.includes('Semiconductors');
    if (filter === 'SEEKER') return b.isSkrExclusive || b.category.includes('Seeker');
    if (filter === 'ENERGY') return b.category.includes('Energy');
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06080F" />

      {/* Atmospheric Anime City Skyline Wallpaper */}
      <Image
        source={require('./assets/anime-city-bg.jpg')}
        style={styles.bgWallpaper}
        resizeMode="cover"
      />
      <View style={styles.bgOverlay} />

      {/* Header */}
      <Header
        session={session}
        skrBalance={skrBalance}
        onConnectPress={handleConnectWallet}
        onSkrPress={() => setIsSkrModalVisible(true)}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Main Hero Portfolio Card */}
        <PortfolioCard
          position={position}
          solBalance={solBalance}
          usdcBalance={usdcBalance}
          isRebalancing={isRebalancing}
          onDepositPress={() => {
            if (baskets.length > 0) {
              setSelectedBasket(baskets[0]);
              setIsInvestModalVisible(true);
            }
          }}
          onWithdrawPress={handleWithdrawPress}
          onRebalance={handleRebalance}
          onFaucetPress={handleFaucetPress}
          onSimulateShock={handleSimulateShock}
        />

        {/* AI Strategy Generator Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsAiModalVisible(true);
          }}
          activeOpacity={0.88}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiIconBadge}>
              <Wand2 size={16} color="#A855F7" />
            </View>
            <View style={styles.aiTextContainer}>
              <View style={styles.aiTitleRow}>
                <Text style={styles.aiBannerTitle}>AI Strategy Architect</Text>
                <Sparkles size={12} color="#C084FC" />
              </View>
              <Text style={styles.aiBannerDesc}>
                Synthesize custom stock baskets from plain English macro ideas
              </Text>
            </View>
          </View>

          <View style={styles.aiCreatePill}>
            <Text style={styles.aiCreateText}>Create ›</Text>
          </View>
        </TouchableOpacity>

        {/* Section Heading & Category Filters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thematic Equity Baskets</Text>
          <Text style={styles.sectionCount}>{filteredBaskets.length} Strategies</Text>
        </View>

        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'All Baskets' },
            { id: 'TECH', label: '⚡ Tech' },
            { id: 'SEEKER', label: '💎 $SKR Alpha' },
            { id: 'ENERGY', label: '🌿 Energy' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterPill,
                filter === item.id && styles.filterPillActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(item.id as FilterCategory);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item.id && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Baskets Cards List */}
        {filteredBaskets.map((basket) => (
          <BasketCard
            key={basket.id}
            basket={basket}
            onSelect={handleSelectBasket}
          />
        ))}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Modals */}
      <InvestModal
        visible={isInvestModalVisible}
        basket={selectedBasket}
        skrBalance={skrBalance}
        onClose={() => setIsInvestModalVisible(false)}
        onConfirmInvest={handleConfirmInvest}
      />

      <AIBasketModal
        visible={isAiModalVisible}
        onClose={() => setIsAiModalVisible(false)}
        onBasketCreated={handleAiBasketCreated}
      />

      <SkrPerksModal
        visible={isSkrModalVisible}
        skrBalance={skrBalance}
        onClose={() => setIsSkrModalVisible(false)}
        onClaimSkr={handleClaimSkr}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06080F',
  },
  bgWallpaper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.35,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 8, 15, 0.70)',
  },
  scrollBody: {
    flex: 1,
  },
  aiBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#0E0A1E',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  aiIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  aiBannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 14,
  },
  aiCreatePill: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  aiCreateText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00F0FF',
    fontFamily: 'monospace',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
});
