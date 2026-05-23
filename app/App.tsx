import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { useGameAudio } from './src/state/useGameAudio';
import { useGameState } from './src/state/useGameState';
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
import { SplashScreen } from './src/screens/SplashScreen';
import { SummaryScreen } from './src/screens/SummaryScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { colors } from './src/theme/tokens';

export default function App() {
  const { state, actions } = useGameState();
  const currentSong = state.songDeck[state.songIdx] ?? null;
  const shouldPlay =
    state.screen === 'playing' && state.buzzed === null && !state.showHints;
  const { trackId } = useGameAudio(currentSong, shouldPlay);

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
          <SplashScreen
            onStart={() => a.go(s.user ? 'home' : 'login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => a.go('splash')}
            onLogin={(method, email) => {
              a.setUser({ name: email.split('@')[0] || 'Player', email });
              a.go(s.service ? 'home' : 'connect');
            }}
          />
        );
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
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            user={s.user}
            service={s.service}
            onChangeService={() => a.go('connect')}
            onDisconnect={() => a.setService(null)}
            onSignOut={() => a.signOut()}
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
