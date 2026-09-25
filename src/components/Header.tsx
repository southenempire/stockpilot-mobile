import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WalletSession } from '../utils/mwa';
import { Sparkles, ShieldCheck, Wallet, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  session: WalletSession | null;
  skrBalance: number;
  onConnectPress: () => void;
  onSkrPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, skrBalance, onConnectPress, onSkrPress }) => {
  const shortAddress = session
    ? `${session.publicKey.toBase58().slice(0, 4)}...${session.publicKey.toBase58().slice(-4)}`
    : 'Connect Wallet';

  return (
    <View style={styles.container}>
      {/* Brand & Devnet Status */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>⚡</Text>
          <View>
            <Text style={styles.brandTitle}>STOCKPILOT</Text>
            <View style={styles.liveIndicatorRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Solana Seeker • Devnet</Text>
            </View>
          </View>
        </View>

        {/* SKR VIP Badge */}
        <TouchableOpacity
          style={styles.skrBadge}
          onPress={() => {
            Haptics.selectionAsync();
            onSkrPress();
          }}
          activeOpacity={0.8}
        >
          <Sparkles size={13} color="#A855F7" />
          <Text style={styles.skrText}>{skrBalance} $SKR</Text>
          <ChevronRight size={11} color="#A855F7" />
        </TouchableOpacity>
      </View>

      {/* Wallet Connect Bar */}
      <TouchableOpacity
        style={[styles.walletButton, session ? styles.walletConnected : styles.walletDisconnected]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onConnectPress();
        }}
        activeOpacity={0.85}
      >
        <View style={styles.walletLeft}>
          <Wallet size={15} color={session ? '#00F0FF' : '#94A3B8'} />
          <Text style={[styles.walletText, session ? styles.walletTextActive : styles.walletTextInactive]}>
            {shortAddress}
          </Text>
        </View>
        {session ? (
          <View style={styles.connectedTag}>
            <ShieldCheck size={13} color="#10B981" />
            <Text style={styles.connectedTagText}>MWA Active</Text>
          </View>
        ) : (
          <Text style={styles.connectCta}>1-Tap Connect ›</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#06080F',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    fontSize: 22,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    gap: 4,
  },
  skrText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletDisconnected: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: '#334155',
  },
  walletConnected: {
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletText: {
    fontSize: 13,
    fontWeight: '600',
  },
  walletTextActive: {
    color: '#F1F5F9',
  },
  walletTextInactive: {
    color: '#94A3B8',
  },
  connectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  connectedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  connectCta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00F0FF',
  },
});
