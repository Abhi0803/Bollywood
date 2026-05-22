import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme/tokens';

type Props = {
  children: ReactNode;
  onBack?: () => void;
  scroll?: boolean;
};

export function ScreenLayout({ children, onBack, scroll }: Props) {
  const back = onBack ? (
    <Pressable onPress={onBack} style={styles.back} hitSlop={12}>
      <Text style={styles.backText}>← Back</Text>
    </Pressable>
  ) : null;

  if (scroll) {
    return (
      <View style={styles.root}>
        {back}
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>{children}</ScrollView>
      </View>
    );
  }
  return (
    <View style={styles.root}>
      {back}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: spacing.screenSide,
    paddingTop: spacing.screenTop,
  },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgCard,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },
  backText: {
    color: colors.inkDim,
    fontSize: 13,
    fontWeight: '600',
  },
});
