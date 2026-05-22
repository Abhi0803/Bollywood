import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colors, radius } from '../theme/tokens';

type Variant = 'primary' | 'gold' | 'ghost' | 'dark' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
};

export function FilmiButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, labelVariant[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.filmi },
  gold: { backgroundColor: colors.gold },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.line,
  },
  dark: { backgroundColor: colors.bgCard },
  danger: { backgroundColor: 'transparent' },
};

const labelVariant: Record<Variant, { color: string }> = {
  primary: { color: colors.ink },
  gold: { color: '#160828' },
  ghost: { color: colors.ink },
  dark: { color: colors.ink },
  danger: { color: colors.danger },
};
