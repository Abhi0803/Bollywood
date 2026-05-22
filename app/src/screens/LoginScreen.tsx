import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { colors, radius } from '../theme/tokens';

type Props = {
  onLogin: (method: string, email: string) => void;
  onBack: () => void;
};

export function LoginScreen({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState('');

  return (
    <ScreenLayout onBack={onBack}>
      <Text style={styles.label}>WELCOME</Text>
      <Text style={styles.title}>Sign in to play.</Text>

      <View style={{ gap: 10, marginTop: 24 }}>
        <FilmiButton
          label=" Continue with Apple"
          variant="dark"
          onPress={() => onLogin('apple', 'player@icloud.com')}
        />
        <FilmiButton
          label="G  Continue with Google"
          variant="ghost"
          onPress={() => onLogin('google', 'player@gmail.com')}
        />
        <FilmiButton
          label="✆  Continue with phone"
          variant="ghost"
          onPress={() => onLogin('phone', 'phone@local')}
        />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.or}>OR</Text>
        <View style={styles.divider} />
      </View>

      <Text style={styles.fieldLabel}>EMAIL</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={colors.inkFaint}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />
      <FilmiButton
        label="Email me a magic link"
        variant="primary"
        onPress={() => onLogin('email', email || 'guest@local')}
        style={{ marginTop: 12 }}
      />

      <Text style={styles.tos}>
        By continuing you agree to the Terms and Privacy Policy.
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 36, fontStyle: 'italic', marginTop: 6 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { color: colors.inkFaint, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  fieldLabel: { color: colors.inkDim, fontSize: 10, letterSpacing: 2, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: colors.bgCard,
    color: colors.ink,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  tos: { color: colors.inkFaint, fontSize: 11, marginTop: 18, textAlign: 'center', lineHeight: 16 },
});
