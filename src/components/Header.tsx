import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WalletSession } from '../utils/mwa';
import { Sparkles, ShieldCheck, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  session: WalletSession | null;
  skrBalance: number;
  onConnectPress: () => void;
  onSkrPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  skrBalance,
  onConnectPress,
  onSkrPress,
}) => {
  const shortAddress = session
    ? `${session.publicKey.toBase58().slice(0, 4)}...${session.publicKey.toBase58().slice(-4)}`
    : 'Connect Wallet';

  return (
    <View style={styles.container}>
      {/* Top Network & $SKR Chips Row */}
      <View style={styles.topStatusRow}>
        <View style={styles.networkBadge}>
          <View style={styles.networkPulse} />
          <Text style={styles.networkText}>Solana Devnet</Text>
        </View>

        <TouchableOpacity
          style={styles.skrChip}
          onPress={() => {
            Haptics.selectionAsync();
            onSkrPress();
          }}
          activeOpacity={0.8}
        >
          <Sparkles size={11} color="#00F0FF" />
          <Text style={styles.skrChipText}>
            $SKR Balance: <Text style={styles.skrChipBold}>{skrBalance.toLocaleString()} SKR</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Brand Logo & MWA Wallet Connect */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <Text style={styles.brandLogo}>
            Stock<Text style={styles.brandLogoCyan}>Pilot</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Autonomous 24/7 AI Robo-Advisor</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.walletBtn,
            session ? styles.walletBtnConnected : styles.walletBtnDisconnected,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onConnectPress();
          }}
          activeOpacity={0.85}
        >
          {session ? (
            <>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.walletTextConnected}>{shortAddress}</Text>
            </>
          ) : (
            <>
              <Wallet size={14} color="#00F0FF" />
              <Text style={styles.walletTextDisconnected}>Connect Seeker</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  topStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  networkPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  networkText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    fontFamily: 'monospace',
  },
  skrChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 5,
  },
  skrChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  skrChipBold: {
    color: '#00F0FF',
    fontWeight: '900',
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandLeft: {
    flexDirection: 'column',
  },
  brandLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandLogoCyan: {
    color: '#00F0FF',
  },
  brandSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  walletBtnDisconnected: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderColor: 'rgba(0, 240, 255, 0.35)',
  },
  walletBtnConnected: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  walletTextDisconnected: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
  },
  walletTextConnected: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: 'monospace',
  },
});
