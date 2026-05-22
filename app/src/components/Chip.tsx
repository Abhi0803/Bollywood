import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '../theme/tokens';

type Props = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function Chip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.active : styles.inactive,
        pressed && { opacity: 0.85 },
      ]}>
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  active: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  inactive: {
    backgroundColor: 'transparent',
    borderColor: colors.line,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: { color: '#160828' },
  labelInactive: { color: colors.inkDim },
});
