import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/tokens';

type Props = { onStart: () => void };

// Splash UX:
//   1. Content fades in over 600ms (rather than appearing instantly).
//   2. Sits visible for 900ms so the brand registers.
//   3. Fades out over 350ms.
//   4. onStart() fires after the fade-out completes → App swaps to next
//      screen (Home if logged in, Login otherwise).
//   5. Tap-to-skip: a Pressable wraps the whole screen. Tapping during the
//      fade-in/hold triggers the fade-out + onStart immediately.

const FADE_IN_MS = 600;
const HOLD_MS = 900;
const FADE_OUT_MS = 350;

export function SplashScreen({ onStart }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const advancedRef = useRef(false);

  useEffect(() => {
    const advance = () => {
      if (advancedRef.current) return;
      advancedRef.current = true;
      Animated.timing(fade, {
        toValue: 0,
        duration: FADE_OUT_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onStart();
      });
    };

    Animated.timing(fade, {
      toValue: 1,
      duration: FADE_IN_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(advance, FADE_IN_MS + HOLD_MS);
    // expose for tap-to-skip
    (SplashScreen as unknown as { __advance: () => void }).__advance = advance;
    return () => clearTimeout(timer);
  }, [fade, onStart]);

  const skip = () => {
    (SplashScreen as unknown as { __advance?: () => void }).__advance?.();
  };

  return (
    <Pressable style={styles.root} onPress={skip}>
      <Animated.View style={[styles.center, { opacity: fade }]}>
        <Text style={styles.label}>— A BOLLYWOOD GAME —</Text>
        <Text style={styles.title}>
          Naam <Text style={styles.gold}>Bolo.</Text>
        </Text>
        <Text style={styles.sub}>
          Play the song. Name the movie. First team to shout wins.
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.gold, fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  title: {
    color: colors.ink,
    fontSize: 72,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 14,
    lineHeight: 76,
  },
  gold: { color: colors.gold },
  sub: {
    color: colors.inkDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 20,
  },
});
