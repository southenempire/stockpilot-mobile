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
import { Sparkles, Layers, ShieldCheck, Compass, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function App() {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [skrBalance, setSkrBalance] = useState(1250);
  const [baskets, setBaskets] = useState<StockBasket[]>(STOCK_BASKETS);
  const [selectedBasket, setSelectedBasket] = useState<StockBasket | null>(null);
  const [activeTab, setActiveTab] = useState<'baskets' | 'vault'>('baskets');

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

    // Simulate transaction execution
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
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Deposit Successful! 🎉',
      `Allocated $${amount} USDC to ${selectedBasket.name} via non-custodial Anchor vault PDA.`
    );
  };

  const handleRebalance = async () => {
    if (!position) return;
    setIsRebalancing(true);

    setTimeout(async () => {
      // Restore weights to target
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06080F" />

      {/* App Header */}
      <Header
        session={session}
        skrBalance={skrBalance}
        onConnectPress={handleConnectWallet}
        onSkrPress={() => setIsSkrModalVisible(true)}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Portfolio Vault Card */}
        <PortfolioCard
          position={position}
          isRebalancing={isRebalancing}
          onRebalance={handleRebalance}
          onSimulateShock={handleSimulateShock}
        />

        {/* AI Action Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerLeft}>
            <Sparkles size={18} color="#A855F7" />
            <View>
              <Text style={styles.aiBannerTitle}>AI Thesis Generator</Text>
              <Text style={styles.aiBannerDesc}>Synthesize custom stock strategies from natural language</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.aiBannerBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsAiModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.aiBannerBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thematic Equity Baskets</Text>
          <Text style={styles.sectionCount}>{baskets.length} Strategies</Text>
        </View>

        {/* Baskets List */}
        {baskets.map((basket) => (
          <BasketCard
            key={basket.id}
            basket={basket}
            onSelect={handleSelectBasket}
          />
        ))}

        <View style={{ height: 40 }} />
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
  scrollBody: {
    flex: 1,
  },
  aiBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: '#130E26',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  aiBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  aiBannerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  aiBannerBtn: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  aiBannerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F0FF',
  },
});
