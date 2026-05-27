import { Component, useEffect, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  PostHogProvider,
  identify,
  initPostHog,
  resetPostHog,
  track,
} from './src/lib/posthog';
import { initSentry, reportError, wrap } from './src/lib/sentry';
import { useAppleMusic } from './src/state/useAppleMusic';
import { useAuthSession } from './src/state/useAuthSession';
import { useGameAudio } from './src/state/useGameAudio';
import { useGameState } from './src/state/useGameState';
import { createSessionFromUrl, signOut as supabaseSignOut } from './src/state/auth';

// Initialize Sentry as the very first thing — before any other module
// has a chance to throw — so the first crash on app load is captured.
initSentry();

// Initialize PostHog once. The same instance powers both the Provider
// (autocapture + breadcrumbs) and the imperative `track()` helper.
const posthog = initPostHog();
import { AddSongScreen } from './src/screens/AddSongScreen';
import { BuzzedOverlay } from './src/screens/BuzzedOverlay';
import { ConnectScreen } from './src/screens/ConnectScreen';
import { FiltersScreen } from './src/screens/FiltersScreen';
import { HintsOverlay } from './src/screens/HintsOverlay';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { PlayingScreen } from './src/screens/PlayingScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { RoundReadyScreen } from './src/screens/RoundReadyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SplashScreen as AppSplashScreen } from './src/screens/SplashScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { colors } from './src/theme/tokens';

// Catches any render-time error from the inner app and shows it on screen
// instead of leaving the user stuck on the native splash forever. Also
// force-hides the splash so the error message is actually visible.
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    SplashScreen.hideAsync().catch(() => {});
    reportError(error, { source: 'AppErrorBoundary' });
    if (__DEV__) console.error('[App ErrorBoundary]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={errorStyles.root}>
          <ScrollView contentContainerStyle={errorStyles.body}>
            <Text style={errorStyles.heading}>App crashed at startup</Text>
            <Text style={errorStyles.label}>Error</Text>
            <Text style={errorStyles.message}>
              {String((this.state.error as Error).message ?? this.state.error)}
            </Text>
            <Text style={errorStyles.label}>Stack</Text>
            <Text style={errorStyles.stack}>
              {String((this.state.error as Error).stack ?? '(no stack)')}
            </Text>
          </ScrollView>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

function App() {
  // Force-hide the native splash as soon as React mounts. Belt-and-braces
  // against situations where the inner app fails to render and the splash
  // would otherwise stay visible forever.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureTouches: true,
      }}
    >
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </PostHogProvider>
  );
}

// Sentry.wrap automatically captures touch events as breadcrumbs and
// installs an error boundary at the root. Our inner ErrorBoundary still
// renders the user-facing crash screen.
export default wrap(App);

function AppInner() {
  const { state, actions } = useGameState();
  const { status: authStatus, user: authUser } = useAuthSession();

  // Mirror the Supabase auth session into our game-state's `user`. Supabase
  // is the source of truth; this just keeps the rest of the app's screens
  // unchanged (they read from `state.user` as before).
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'signed-in' && authUser) {
      actions.setUser(authUser);
      // PostHog: link this device's prior anonymous events to the user.
      identify(authUser.email, { name: authUser.name });
      track('signed_in', { email_domain: authUser.email.split('@')[1] });
      // Route away from auth screens once signed in.
      if (state.screen === 'login' || state.screen === 'splash') {
        actions.go('home');
      }
    } else {
      actions.setUser(null);
      // PostHog: forget the user so the next session is fresh.
      resetPostHog();
    }
  }, [authStatus, authUser, actions, state.screen]);

  // OAuth deep-link fallback. WebBrowser.openAuthSessionAsync normally
  // captures the redirect and we never need this — but on iOS / Expo Go
  // the in-app browser sometimes fails to return cleanly, and iOS re-opens
  // Expo Go via the exp:// URL instead. This listener catches that case
  // and finishes the sign-in by parsing tokens from the URL.
  useEffect(() => {
    const handle = (url: string | null) => {
      if (!url) return;
      if (!url.includes('access_token') && !url.includes('error')) return;
      void createSessionFromUrl(url);
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, []);

  // PostHog: track screen views. We don't use react-navigation so the
  // Provider's `captureScreens` doesn't pick these up automatically.
  useEffect(() => {
    track('screen_viewed', { screen: state.screen });
  }, [state.screen]);

  const currentSong = state.songDeck[state.songIdx] ?? null;
  const shouldPlay =
    state.screen === 'playing' &&
    state.buzzed === null &&
    !state.showHints &&
    !state.isPaused;
  const apple = useAppleMusic();
  const useAppleMusicForPlayback =
    state.service === 'apple' && apple.canPlayFull;
  const { trackId, replay } = useGameAudio(
    currentSong,
    shouldPlay,
    useAppleMusicForPlayback,
  );

  const replayAndResetTimer = () => {
    replay();
    actions.resetTimer();
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.content}>{renderScreen()}</View>
      <StatusBar style="light" />
    </SafeAreaView>
  );

  function renderScreen() {
    const s = state;
    const a = actions;
    switch (s.screen) {
      case 'splash':
        return (
          <AppSplashScreen
            onStart={() => a.go(s.user ? 'home' : 'login')}
          />
        );
      case 'login':
        return <LoginScreen onBack={() => a.go('splash')} />;
      case 'connect':
        return (
          <ConnectScreen
            currentService={s.service}
            onBack={() => a.go(s.prevScreen === 'settings' ? 'settings' : 'login')}
            onConnect={(svc) => {
              a.setService(svc);
              a.go(s.prevScreen === 'settings' ? 'settings' : 'home');
            }}
          />
        );
      case 'home':
        return (
          <HomeScreen
            user={s.user}
            service={s.service}
            onNewGame={() => a.go('teams')}
            onSettings={() => a.go('settings')}
            onAddSong={() => a.go('addsong')}
          />
        );
      case 'addsong':
        return (
          <AddSongScreen
            onBack={() => a.go('home')}
            onSaved={async () => {
              await a.refreshUserCatalog();
              a.go('home');
            }}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={s.user}
            service={s.service}
            onChangeService={() => a.go('connect')}
            onDisconnect={() => a.setService(null)}
            onSignOut={async () => {
              await supabaseSignOut();
              a.signOut();
            }}
            onBack={() => a.go('home')}
          />
        );
      case 'teams':
        return (
          <TeamsScreen
            teams={s.teams}
            setTeams={a.setTeams}
            onContinue={() => a.go('filters')}
            onBack={() => a.go('home')}
          />
        );
      case 'filters':
        return (
          <FiltersScreen
            filters={s.filters}
            setFilters={a.setFilters}
            fullSongMode={useAppleMusicForPlayback}
            onStart={a.startGame}
            onBack={() => a.go('teams')}
          />
        );
      case 'ready':
        return (
          <RoundReadyScreen
            round={s.round}
            totalRounds={s.filters.rounds}
            teams={s.teams}
            onPlay={a.playRound}
            onBack={() => a.go('filters')}
          />
        );
      case 'playing':
        return (
          <>
            <PlayingScreen
              song={currentSong!}
              teams={s.teams}
              round={s.round}
              totalRounds={s.filters.rounds}
              timeLeft={s.timeLeft}
              maxTime={s.maxTime}
              hintsOn={s.filters.hintsOn}
              hintsUsedCount={s.hintsUsed.length}
              onBuzz={a.onBuzz}
              onHints={() => a.setShowHints(true)}
              onSkip={a.finishRoundMiss}
              onCancel={a.cancelRound}
              onReplay={replayAndResetTimer}
              onQuit={a.quitGame}
              onBlock={a.blockCurrentSong}
              isPaused={s.isPaused}
              onTogglePause={a.togglePause}
            />
            {s.showHints ? (
              <HintsOverlay
                song={currentSong!}
                hintsUsed={s.hintsUsed}
                onReveal={a.revealHint}
                onClose={() => a.setShowHints(false)}
              />
            ) : null}
            {s.buzzed !== null ? (
              <BuzzedOverlay
                team={s.teams[s.buzzed]}
                song={currentSong!}
                onCorrect={a.onCorrect}
                onWrong={a.onWrong}
                onCancel={a.cancelRound}
              />
            ) : null}
          </>
        );
      case 'reveal':
        return (
          <RevealScreen
            song={currentSong!}
            winner={s.lastWin?.winner ?? null}
            points={s.lastWin?.points ?? 0}
            itunesTrackId={trackId ?? undefined}
            isLast={s.round >= s.filters.rounds}
            wasCancelled={s.lastWasCancelled}
            onNext={a.nextRound}
            onQuit={a.quitGame}
            onBlock={() => a.blockSongById(currentSong!.id)}
          />
        );
      case 'summary':
        return (
          <SummaryScreen
            teams={s.teams}
            history={s.history}
            onRestart={() => a.go('teams')}
            onHome={() => a.go('home')}
          />
        );
    }
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  content: {
    flex: 1,
  },
});

const errorStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
  },
  body: {
    padding: 22,
    paddingTop: 60,
  },
  heading: {
    color: colors.danger,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
  },
  label: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 4,
  },
  message: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  stack: {
    color: colors.inkDim,
    fontSize: 11,
    fontFamily: 'Courier',
    lineHeight: 16,
  },
});
