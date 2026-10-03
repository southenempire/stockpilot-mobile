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
  Dimensions,
  Platform,
} from 'react-native';
import { Header } from './src/components/Header';
import { PortfolioCard } from './src/components/PortfolioCard';
import { BasketCard } from './src/components/BasketCard';
import { InvestModal } from './src/components/InvestModal';
import { AIBasketModal } from './src/components/AIBasketModal';
import { SkrPerksModal } from './src/components/SkrPerksModal';
import { AILabScreen } from './src/components/AILabScreen';
import { VaultScreen } from './src/components/VaultScreen';
import { STOCK_BASKETS } from './src/constants/baskets';
import { StockBasket, PortfolioPosition } from './src/types';
import { MobileWalletManager, WalletSession } from './src/utils/mwa';
import { simulateMarketMovement } from './src/utils/vault';
import {
  BarChart3,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type TabId = 'portfolio' | 'baskets' | 'ai' | 'vault';
type FilterCategory = 'ALL' | 'TECH' | 'SEEKER' | 'ENERGY';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');
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

  // ── Handlers ──────────────────────────────────────────────

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

  const handleTabPress = (tab: TabId) => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
    }
  };

  // AI Lab suggestion handler
  const handleAiSuggestion = (text: string) => {
    setIsAiModalVisible(true);
  };

  // Filtered baskets
  const filteredBaskets = baskets.filter((b) => {
    if (filter === 'TECH') return b.category.includes('Tech') || b.category.includes('Semiconductors');
    if (filter === 'SEEKER') return b.isSkrExclusive || b.category.includes('Seeker');
    if (filter === 'ENERGY') return b.category.includes('Energy');
    return true;
  });

  // AI-generated baskets (those not in original STOCK_BASKETS)
  const aiBaskets = baskets.filter(
    (b) => !STOCK_BASKETS.some((sb) => sb.id === b.id)
  );

  // ── Tab Content Renderers ─────────────────────────────────

  const renderPortfolioTab = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContentContainer}
    >
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
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderBasketsTab = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContentContainer}
    >
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

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderAiLabTab = () => (
    <AILabScreen
      onOpenAiModal={() => setIsAiModalVisible(true)}
      onSuggestionPress={handleAiSuggestion}
      aiBaskets={aiBaskets}
      onSelectBasket={handleSelectBasket}
    />
  );

  const renderVaultTab = () => (
    <VaultScreen
      skrBalance={skrBalance}
      solBalance={solBalance}
      usdcBalance={usdcBalance}
      position={position}
      onClaimSkr={handleClaimSkr}
      onFaucetPress={handleFaucetPress}
      onWithdrawPress={handleWithdrawPress}
      onSkrPress={() => setIsSkrModalVisible(true)}
    />
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'portfolio':
        return renderPortfolioTab();
      case 'baskets':
        return renderBasketsTab();
      case 'ai':
        return renderAiLabTab();
      case 'vault':
        return renderVaultTab();
    }
  };

  // ── Tab Configuration ─────────────────────────────────────

  const TABS: { id: TabId; label: string; Icon: typeof BarChart3 }[] = [
    { id: 'portfolio', label: 'Portfolio', Icon: BarChart3 },
    { id: 'baskets', label: 'Trade', Icon: Layers },
    { id: 'ai', label: 'AI Lab', Icon: Sparkles },
    { id: 'vault', label: 'Vault', Icon: ShieldCheck },
  ];

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

      {/* Active Tab Content */}
      <View style={styles.tabBody}>
        {renderActiveTab()}
      </View>

      {/* ── Floating Bottom Tab Dock ── */}
      <View style={styles.bottomDockContainer}>
        <View style={styles.bottomDock}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                  <tab.Icon
                    size={isActive ? 20 : 18}
                    color={isActive ? '#00F0FF' : '#64748B'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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

// ── Responsive Sizing Helpers ─────────────────────────────

const hp = (percentage: number) => {
  const { height } = Dimensions.get('window');
  return (percentage / 100) * height;
};

const wp = (percentage: number) => {
  return (percentage / 100) * SCREEN_WIDTH;
};

const scale = (size: number) => {
  const baseWidth = 375; // iPhone standard
  return (SCREEN_WIDTH / baseWidth) * size;
};

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

  // ── Tab Content Area ──
  tabBody: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },

  // ── Section Headers (Baskets tab) ──
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: wp(4.3),
    marginTop: scale(14),
    marginBottom: scale(10),
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontSize: scale(11),
    fontWeight: '800',
    color: '#00F0FF',
    fontFamily: 'monospace',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: wp(4.3),
    marginBottom: scale(12),
    gap: scale(6),
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(8),
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderColor: '#00F0FF',
  },
  filterText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },

  // ── Bottom Navigation Dock ──
  bottomDockContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? hp(3.5) : hp(1.5),
    left: wp(4),
    right: wp(4),
  },
  bottomDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(10, 16, 28, 0.92)',
    borderRadius: scale(22),
    paddingVertical: scale(8),
    paddingHorizontal: scale(6),
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    // Glass shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(4),
    position: 'relative',
  },
  tabButtonActive: {
    // active tab styling handled by children
  },
  tabIconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
  },
  tabLabel: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#64748B',
    marginTop: scale(2),
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: scale(-2),
    width: scale(16),
    height: scale(2.5),
    borderRadius: scale(2),
    backgroundColor: '#00F0FF',
  },
});
