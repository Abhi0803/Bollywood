import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { NaamMusic } from '../../modules/expo-naam-music';
import { track } from '../lib/posthog';
import { useAppleMusic } from '../state/useAppleMusic';
import type { MusicService } from '../state/types';
import { colors, radius } from '../theme/tokens';

type Tier = 'free' | 'pro';

type Props = {
  currentService: MusicService | null;
  onConnect: (s: MusicService) => void;
  onBack: () => void;
};

export function ConnectScreen({ currentService, onConnect, onBack }: Props) {
  const [tier, setTier] = useState<Tier>(
    currentService === '30s' || currentService === null ? 'free' : 'pro',
  );
  const apple = useAppleMusic();

  const onConnectAppleMusic = async () => {
    track('apple_music_connect_tapped');
    const status =
      apple.status === 'authorized'
        ? apple.status
        : await apple.connect();

    if (status === 'denied' || status === 'restricted') {
      track('apple_music_connect_denied', { status });
      Alert.alert(
        'Apple Music access denied',
        'To play full songs, enable Apple Music access for Naam Bolo in iOS Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    if (status !== 'authorized') {
      track('apple_music_connect_other', { status });
      return;
    }

    // Authorized — check subscription directly from native (not from hook
    // state, which is async and may not have re-rendered yet).
    const canPlay = await NaamMusic.canPlayCatalogContent();
    if (!canPlay) {
      track('apple_music_no_subscription');
      Alert.alert(
        'Apple Music subscription needed',
        'We can connect to your account, but full-song playback needs an active Apple Music subscription. Without one, Naam Bolo will keep playing 30-second previews.',
        [
          { text: 'Use previews', onPress: () => onConnect('30s') },
          {
            text: 'Get Apple Music',
            onPress: () => Linking.openURL('https://music.apple.com/subscribe'),
          },
        ],
      );
      return;
    }

    track('apple_music_connected');
    onConnect('apple');
  };

  const appleStatusCopy = () => {
    if (apple.checking) return 'Checking your Apple Music…';
    if (apple.status === 'authorized' && apple.canPlayFull)
      return '✓ Apple Music connected · full songs ready';
    if (apple.status === 'authorized' && !apple.canPlayFull)
      return 'Authorized but no active subscription — previews will be used.';
    if (apple.status === 'denied' || apple.status === 'restricted')
      return 'Access blocked. Enable in iOS Settings → Naam Bolo.';
    return 'Tap to authorize Naam Bolo to play from your Apple Music library.';
  };

  const appleButtonLabel = () => {
    if (apple.checking) return 'Checking…';
    if (currentService === 'apple' && apple.canPlayFull)
      return 'Apple Music connected ✓';
    if (apple.status === 'authorized' && apple.canPlayFull)
      return 'Use Apple Music';
    return 'Connect Apple Music';
  };

  return (
    <ScreenLayout scroll onBack={onBack}>
      <Text style={styles.label}>STEP 2 OF 3</Text>
      <Text style={styles.title}>Connect your music.</Text>

      <View style={styles.tierRow}>
        <Pressable
          onPress={() => setTier('free')}
          style={[styles.tierBtn, tier === 'free' && styles.tierActive]}>
          <Text style={[styles.tierText, tier === 'free' && styles.tierTextActive]}>
            Free · 30s clips
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTier('pro')}
          style={[styles.tierBtn, tier === 'pro' && styles.tierActive]}>
          <Text style={[styles.tierText, tier === 'pro' && styles.tierTextActive]}>
            Full song · linked
          </Text>
        </Pressable>
      </View>

      {tier === 'free' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={[styles.logo, { backgroundColor: colors.gold }]}>
              <Text style={styles.logoText}>30s</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.cardTitle}>30-second previews</Text>
              <Text style={styles.cardSub}>Apple's public preview API · No subscription</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: colors.success }]}>
              <Text style={styles.tagText}>FREE</Text>
            </View>
          </View>
          <FilmiButton
            label={currentService === '30s' ? 'Already connected' : 'Use 30s previews'}
            variant="primary"
            onPress={() => onConnect('30s')}
            disabled={currentService === '30s'}
            style={{ marginTop: 14 }}
          />
        </View>
      ) : (
        <>
          <View style={[styles.card, styles.cardApple]}>
            <View style={styles.cardHead}>
              <View style={[styles.logo, { backgroundColor: '#fc3c44' }]}>
                <Text style={styles.logoText}></Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitle}>Apple Music</Text>
                <Text style={styles.cardSub}>Full songs · your subscription</Text>
              </View>
              <View style={[styles.tag, { backgroundColor: colors.gold }]}>
                <Text style={[styles.tagText, { color: '#160828' }]}>RECOMMENDED</Text>
              </View>
            </View>
            <Text style={styles.proNote}>{appleStatusCopy()}</Text>
            <FilmiButton
              label={appleButtonLabel()}
              variant="primary"
              onPress={onConnectAppleMusic}
              disabled={apple.checking || (currentService === 'apple' && apple.canPlayFull)}
              style={{ marginTop: 12 }}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={[styles.logo, { backgroundColor: '#1DB954' }]}>
                <Text style={styles.logoText}></Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.cardTitle}>Spotify</Text>
                <Text style={styles.cardSub}>Premium only · pending approval</Text>
              </View>
            </View>
            <Text style={styles.proNote}>
              Spotify Premium Mini (the cheap India tier) is not supported. Full Premium required.
              Awaiting commercial-use approval from Spotify.
            </Text>
            <FilmiButton
              label="Coming later"
              variant="ghost"
              onPress={() => {}}
              disabled
              style={{ marginTop: 12 }}
            />
          </View>
        </>
      )}

      <View style={styles.legal}>
        <Text style={styles.legalTitle}>
          {tier === 'free' ? 'Fully legal · Free forever' : 'Why a subscription?'}
        </Text>
        <Text style={styles.legalBody}>
          {tier === 'free'
            ? 'Apple lets any app play the 30-second clips from its iTunes Search API. No login, no cost.'
            : 'We cannot host or stream Bollywood audio ourselves — that needs deals with every label. Linking your Apple Music or Spotify subscription pays the labels through your existing plan.'}
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 32, fontStyle: 'italic', marginTop: 6, marginBottom: 22 },
  tierRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 999, padding: 4, marginBottom: 18 },
  tierBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  tierActive: { backgroundColor: colors.gold },
  tierText: { color: colors.inkDim, fontSize: 13, fontWeight: '600' },
  tierTextActive: { color: '#160828' },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 10,
  },
  cardApple: {
    backgroundColor: '#3a0a18',
    borderWidth: 1,
    borderColor: 'rgba(252,60,68,0.4)',
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  cardSub: { color: colors.inkDim, fontSize: 12, marginTop: 2 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  tagText: { color: '#160828', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  proNote: { color: colors.inkDim, fontSize: 12, marginTop: 12, lineHeight: 18 },
  legal: {
    marginTop: 14,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  legalTitle: { color: colors.gold, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  legalBody: { color: colors.inkDim, fontSize: 12, lineHeight: 18 },
});
