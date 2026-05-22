import { StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { colors } from '../theme/tokens';

type Props = { onStart: () => void };

export function SplashScreen({ onStart }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Text style={styles.label}>— A BOLLYWOOD GAME —</Text>
        <Text style={styles.title}>
          Naam <Text style={styles.gold}>Bolo.</Text>
        </Text>
        <Text style={styles.sub}>
          Play the song. Name the movie. First team to shout wins.
        </Text>
        <FilmiButton
          label="Tap to begin →"
          variant="primary"
          onPress={onStart}
          style={{ marginTop: 36, alignSelf: 'stretch' }}
        />
      </View>
    </View>
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
