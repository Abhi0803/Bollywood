import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { sendMagicLink, signInWithApple, signInWithGoogle, verifyOtpCode } from '../state/auth';
import { colors, radius } from '../theme/tokens';

type Props = {
  onBack: () => void;
  onSkip: () => void;
};

type Stage = 'enter-email' | 'enter-code' | 'submitting';

export function LoginScreen({ onBack, onSkip }: Props) {
  const [stage, setStage] = useState<Stage>('enter-email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onApple = async () => {
    setError(null);
    setStage('submitting');
    const result = await signInWithApple();
    if (!result.ok) {
      setError(result.error ?? 'Could not sign in with Apple.');
      setStage('enter-email');
      return;
    }
    // Success: useAuthSession picks up the new session → App routes onward.
  };

  const onGoogle = async () => {
    setError(null);
    setStage('submitting');
    const result = await signInWithGoogle();
    if (!result.ok) {
      setError(result.error ?? 'Could not sign in with Google.');
      setStage('enter-email');
      return;
    }
    // Success: useAuthSession picks up the new session → App routes onward.
  };

  const onSendCode = async () => {
    setError(null);
    setStage('submitting');
    const result = await sendMagicLink(email);
    if (!result.ok) {
      setError(result.error ?? 'Could not send the code. Try again.');
      setStage('enter-email');
      return;
    }
    setStage('enter-code');
  };

  const onVerifyCode = async () => {
    setError(null);
    setStage('submitting');
    const result = await verifyOtpCode(email, code);
    if (!result.ok) {
      setError(result.error ?? 'Code didn’t match. Check your email and try again.');
      setStage('enter-code');
      return;
    }
    // Success: useAuthSession picks up the new session → App routes onward.
  };

  const onResetToEmail = () => {
    setCode('');
    setError(null);
    setStage('enter-email');
  };

  return (
    <ScreenLayout onBack={onBack}>
      <Text style={styles.label}>WELCOME</Text>
      <Text style={styles.title}>Sign in to play.</Text>

      {stage === 'enter-code' ? (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.info}>
            We sent a 6-digit code to <Text style={styles.emailHighlight}>{email}</Text>. Check your inbox (and spam) and type it below.
          </Text>
          <Text style={styles.fieldLabel}>6-DIGIT CODE</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FilmiButton
            label="Verify and sign in"
            variant="gold"
            onPress={onVerifyCode}
            disabled={code.length !== 6}
            style={{ marginTop: 18 }}
          />
          <FilmiButton
            label="Use a different email"
            variant="ghost"
            onPress={onResetToEmail}
            style={{ marginTop: 10 }}
          />
        </View>
      ) : (
        <View style={{ marginTop: 24 }}>
          <View style={{ gap: 10 }}>
            <FilmiButton
              label={stage === 'submitting' ? 'Opening Apple…' : ' Continue with Apple'}
              variant="dark"
              onPress={onApple}
              disabled={stage === 'submitting'}
            />
            <FilmiButton
              label={stage === 'submitting' ? 'Opening Google…' : 'G  Continue with Google'}
              variant="ghost"
              onPress={onGoogle}
              disabled={stage === 'submitting'}
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
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FilmiButton
            label={stage === 'submitting' ? 'Sending…' : 'Email me a sign-in code'}
            variant="primary"
            onPress={onSendCode}
            disabled={stage === 'submitting' || !email.trim()}
            style={{ marginTop: 12 }}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.divider} />
          </View>

          <FilmiButton
            label="Skip · Play as guest"
            variant="ghost"
            onPress={onSkip}
            disabled={stage === 'submitting'}
          />
          <Text style={styles.guestNote}>
            Jump straight into a game. Sign in later if you want to save scores
            across devices.
          </Text>

          <Text style={styles.tos}>
            By continuing you agree to the Terms and Privacy Policy at{'\n'}
            abhi0803.github.io/Bollywood
          </Text>
        </View>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 36, fontStyle: 'italic', marginTop: 6 },
  info: { color: colors.inkDim, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  emailHighlight: { color: colors.gold, fontWeight: '700' },
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
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  error: { color: colors.danger, fontSize: 13, marginTop: 10 },
  guestNote: { color: colors.inkDim, fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 16 },
  tos: { color: colors.inkFaint, fontSize: 11, marginTop: 18, textAlign: 'center', lineHeight: 16 },
});
