import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import type { Team } from '../data/teams';
import { colors } from '../theme/tokens';

type Props = {
  team: Team;
  size?: number;
  style?: ViewStyle;
};

export function TeamAvatar({ team, size = 56, style }: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: team.color1,
          shadowColor: team.color1,
        },
        style,
      ]}>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            backgroundColor: team.color2,
            opacity: 0.55,
          },
        ]}
      />
      <Text style={[styles.label, { fontSize: size * 0.48 }]}>{team.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  label: {
    color: colors.ink,
    fontStyle: 'italic',
    fontWeight: '700',
  },
});
