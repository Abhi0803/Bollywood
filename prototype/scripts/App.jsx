// App.jsx — Naam Bolo main orchestrator.
// Drives the screen state machine, timer, scoring, and Tweaks panel.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "filmi",
  "antiSpoiler": "mystery",
  "hintsOn": true,
  "teamCount": 2,
  "timer": 30,
  "showFrame": "iphone"
}/*EDITMODE-END*/;

const SCREEN_FLOW = [
  'splash', 'login', 'connect', 'home', 'settings',
  'teams', 'filters', 'ready', 'playing', 'reveal', 'summary',
];

const SCREEN_LABELS = {
  splash: 'Splash',
  login: 'Sign in',
  connect: 'Connect music',
  home: 'Home',
  settings: 'Settings',
  teams: 'Team setup',
  filters: 'Filters',
  ready: 'Round ready',
  playing: 'Now playing',
  reveal: 'Reveal',
  summary: 'Final',
};

const DEFAULT_TEAMS_BY_COUNT = {
  2: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
  ],
  3: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
    { name: 'Baraat', score: 0, emoji: 'B', color1: '#ff8c42', color2: '#ffd166' },
  ],
  4: [
    { name: 'Mehndi', score: 0, emoji: 'M', color1: '#ff2d6f', color2: '#ffd166' },
    { name: 'Sangeet', score: 0, emoji: 'S', color1: '#2cd4c0', color2: '#7a3eb1' },
    { name: 'Baraat', score: 0, emoji: 'B', color1: '#ff8c42', color2: '#ffd166' },
    { name: 'Vidaai', score: 0, emoji: 'V', color1: '#3dffb1', color2: '#2cd4c0' },
  ],
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ── Game state ──────────────────────────────────────────────
  const [screen, setScreen] = React.useState('splash');
  const [service, setService] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [prevScreen, setPrevScreen] = React.useState('home');
  const [teams, setTeams] = React.useState(DEFAULT_TEAMS_BY_COUNT[t.teamCount]);
  const [filters, setFilters] = React.useState({
    eras: ['90s', '2000s', '2010s'],
    moods: [],
    rounds: 5,
    timer: t.timer,
    hintsOn: t.hintsOn,
  });
  const [round, setRound] = React.useState(1);
  const [songDeck, setSongDeck] = React.useState(SONGS);
  const [songIdx, setSongIdx] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(30);
  const [maxTime, setMaxTime] = React.useState(30);
  const [hintsUsed, setHintsUsed] = React.useState([]);
  const [showHints, setShowHints] = React.useState(false);
  const [buzzed, setBuzzed] = React.useState(null);  // team index or null
  const [history, setHistory] = React.useState([]);
  const [lastWin, setLastWin] = React.useState(null); // {winner, points}

  // Re-sync teams when teamCount tweak changes (only outside of an active game)
  React.useEffect(() => {
    if (screen === 'splash' || screen === 'connect' || screen === 'home' || screen === 'teams') {
      setTeams(DEFAULT_TEAMS_BY_COUNT[t.teamCount]);
    }
  }, [t.teamCount]);

  // ── Timer tick ─────────────────────────────────────────────
  React.useEffect(() => {
    if (screen !== 'playing' || buzzed !== null || showHints) return;
    if (timeLeft <= 0) {
      // No one buzzed; reveal as a miss
      finishRound(null, 0);
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, timeLeft, buzzed, showHints]);

  // ── Sampled mock songs (just a filtered deck) ──────────────
  const buildDeck = React.useCallback(() => {
    let deck = SONGS;
    if (filters.eras.length) deck = deck.filter((s) => filters.eras.includes(s.era));
    if (filters.moods.length) deck = deck.filter((s) => filters.moods.includes(s.mood));
    if (deck.length === 0) deck = SONGS;
    // shuffle
    deck = [...deck].sort(() => Math.random() - 0.5);
    return deck.slice(0, filters.rounds);
  }, [filters]);

  // ── Actions ─────────────────────────────────────────────────
  const startGame = () => {
    const deck = buildDeck();
    setSongDeck(deck);
    setSongIdx(0);
    setRound(1);
    setHistory([]);
    setTeams(teams.map((tm) => ({ ...tm, score: 0 })));
    setHintsUsed([]);
    setMaxTime(filters.timer);
    setTimeLeft(filters.timer);
    setScreen('ready');
  };

  const playRound = () => {
    setHintsUsed([]);
    setTimeLeft(filters.timer);
    setMaxTime(filters.timer);
    setBuzzed(null);
    setShowHints(false);
    setScreen('playing');
  };

  const onBuzz = (i) => {
    setBuzzed(i);
  };

  const onCorrect = () => {
    const teamIdx = buzzed;
    const cost = hintsUsed.reduce((acc, k) => acc + (HINTS.find((h) => h.key === k)?.cost || 0), 0);
    const pts = Math.max(20, 100 - cost);
    const newTeams = teams.map((tm, idx) => idx === teamIdx ? { ...tm, score: tm.score + pts } : tm);
    setTeams(newTeams);
    setHistory((h) => [...h, { song: songDeck[songIdx], winner: newTeams[teamIdx], points: pts }]);
    setLastWin({ winner: newTeams[teamIdx], points: pts });
    setBuzzed(null);
    setScreen('reveal');
  };

  const onWrong = () => {
    // Penalty -10
    const teamIdx = buzzed;
    setTeams(teams.map((tm, idx) => idx === teamIdx ? { ...tm, score: Math.max(0, tm.score - 10) } : tm));
    setBuzzed(null);
    // Resume playing
  };

  const finishRound = (winner, points) => {
    setHistory((h) => [...h, { song: songDeck[songIdx], winner, points }]);
    setLastWin(winner ? { winner, points } : null);
    setScreen('reveal');
  };

  const nextRound = () => {
    if (round >= filters.rounds || songIdx >= songDeck.length - 1) {
      setScreen('summary');
      return;
    }
    setRound((r) => r + 1);
    setSongIdx((i) => i + 1);
    setLastWin(null);
    setScreen('ready');
  };

  const onRevealHint = (key) => setHintsUsed((h) => [...h, key]);

  // ── Render screen ───────────────────────────────────────────
  const currentSong = songDeck[songIdx] || SONGS[0];
  const isLast = round >= filters.rounds;

  let body;
  switch (screen) {
    case 'splash':
      body = <SplashScreen onStart={() => setScreen(user ? 'home' : 'login')} />;
      break;
    case 'login':
      body = <LoginScreen onLogin={(method) => {
        setUser({ name: 'Aarav', email: 'aarav@example.com', method });
        setScreen(service ? 'home' : 'connect');
      }} onBack={() => setScreen('splash')} />;
      break;
    case 'connect':
      body = <ConnectScreen currentService={service} onConnect={(s) => {
        setService(s);
        setScreen(prevScreen === 'settings' ? 'settings' : 'home');
      }} onBack={() => setScreen(prevScreen === 'settings' ? 'settings' : 'login')} />;
      break;
    case 'home':
      body = <HomeScreen service={service} user={user}
        onNewGame={() => setScreen('teams')}
        onContinue={() => setScreen('teams')}
        onSettings={() => { setPrevScreen('home'); setScreen('settings'); }} />;
      break;
    case 'settings':
      body = <SettingsScreen user={user} service={service}
        onChangeService={() => { setPrevScreen('settings'); setScreen('connect'); }}
        onSignOut={() => { setUser(null); setService(null); setScreen('splash'); }}
        onBack={() => setScreen('home')} />;
      break;
    case 'teams':
      body = <TeamsScreen teams={teams} setTeams={setTeams} onContinue={() => setScreen('filters')} onBack={() => setScreen('home')} />;
      break;
    case 'filters':
      body = <FiltersScreen filters={filters} setFilters={setFilters} onStart={startGame} onBack={() => setScreen('teams')} />;
      break;
    case 'ready':
      body = <ReadyScreen round={round} totalRounds={filters.rounds} teams={teams} onPlay={playRound} onBack={() => setScreen('filters')} />;
      break;
    case 'playing':
      body = (
        <>
          <PlayingScreen
            song={currentSong} teams={teams}
            round={round} totalRounds={filters.rounds}
            timer={timeLeft} maxTimer={maxTime}
            antiSpoilerStyle={t.antiSpoiler}
            hintsOn={filters.hintsOn}
            hintsUsed={hintsUsed}
            onBuzz={onBuzz}
            onHints={() => setShowHints(true)}
            onSkip={() => finishRound(null, 0)}
          />
          {showHints && (
            <HintsOverlay song={currentSong} hintsUsed={hintsUsed}
              onReveal={onRevealHint} onClose={() => setShowHints(false)} />
          )}
          {buzzed !== null && (
            <BuzzedScreen team={teams[buzzed]} onCorrect={onCorrect} onWrong={onWrong} />
          )}
        </>
      );
      break;
    case 'reveal':
      body = (
        <RevealScreen
          song={currentSong}
          winner={lastWin?.winner}
          points={lastWin?.points || 0}
          onNext={nextRound}
          isLast={isLast}
        />
      );
      break;
    case 'summary':
      body = (
        <SummaryScreen
          teams={teams} history={history}
          onRestart={() => { setScreen('teams'); }}
          onHome={() => setScreen('home')}
        />
      );
      break;
    default:
      body = <SplashScreen onStart={() => setScreen('connect')} />;
  }

  // ── Header — describes the design + frames the prototype ──
  return (
    <>
      <KeyframesStyle />

      <div className="stage" style={{ flexDirection: 'column' }}>
        <Header />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36, flexWrap: 'wrap', justifyContent: 'center' }}>
          <DesignNotes screen={screen} />

          <div className="device-col">
            <IOSDevice width={402} height={874} dark={true}>
              {body}
            </IOSDevice>
            <div className="caption">
              <span style={{ color: 'var(--ink-faint)' }}>SCREEN:</span> <b>{SCREEN_LABELS[screen]}</b>
              {screen === 'playing' && ` · ${round}/${filters.rounds}`}
            </div>
          </div>

          <Legend />
        </div>
      </div>

      <TweaksPanel title="Naam Bolo — Tweaks">
        <TweakSection label="Visual theme" />
        <TweakRadio label="Anti-spoiler style" value={t.antiSpoiler}
          options={[
            { value: 'mystery', label: 'Mystery card' },
            { value: 'vinyl', label: 'Vinyl' },
            { value: 'visualizer', label: 'Visualizer' },
            { value: 'curtain', label: 'Curtain' },
          ]}
          onChange={(v) => setTweak('antiSpoiler', v)} />

        <TweakSection label="Gameplay" />
        <TweakToggle label="Hints enabled" value={t.hintsOn}
          onChange={(v) => { setTweak('hintsOn', v); setFilters(f => ({ ...f, hintsOn: v })); }} />
        <TweakRadio label="Teams" value={t.teamCount}
          options={[{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }]}
          onChange={(v) => setTweak('teamCount', v)} />
        <TweakSlider label="Round timer" value={t.timer} min={15} max={90} step={5} unit="s"
          onChange={(v) => { setTweak('timer', v); setFilters(f => ({ ...f, timer: v })); }} />

        <TweakSection label="Jump to screen" />
        <TweakSelect label="Screen" value={screen}
          options={SCREEN_FLOW.map((s) => ({ value: s, label: SCREEN_LABELS[s] }))}
          onChange={(v) => {
            // Soft-reset relevant state when jumping
            if (v === 'playing') { setTimeLeft(filters.timer); setMaxTime(filters.timer); setBuzzed(null); setShowHints(false); setHintsUsed([]); }
            if (v === 'reveal' && !lastWin) {
              setLastWin({ winner: teams[0], points: 100 });
            }
            if (v === 'summary' && history.length === 0) {
              // Seed fake history so summary screen is interesting
              setHistory(SONGS.slice(0, 5).map((song, i) => ({
                song,
                winner: i % 2 === 0 ? teams[0] : (i === 3 ? null : teams[1]),
                points: [100, 80, 70, 0, 100][i],
              })));
              setTeams(teams.map((tm, i) => ({ ...tm, score: i === 0 ? 280 : 170 })));
            }
            setScreen(v);
          }} />
      </TweaksPanel>
    </>
  );
}

// ── Page chrome ───────────────────────────────────────────────
function Header() {
  return (
    <div className="head" style={{ marginBottom: 8 }}>
      <div className="legend"><b>iOS prototype</b> · Naam Bolo · v1</div>
      <h1 className="title">
        Play the song. <em>Naam bolo.</em>
      </h1>
      <p className="sub">
        A two-team Bollywood guessing game. Songs stream from the player's own Apple Music or Spotify
        subscription via MusicKit / Web Playback SDK — the app itself holds no audio.
        Tap inside the phone to walk the flow, or jump screens from Tweaks.
      </p>
    </div>
  );
}

function DesignNotes({ screen }) {
  const notes = {
    splash: 'Marquee bulbs + spinning vinyl set the game-show tone. Tapping Begin goes to Sign In on first launch, Home thereafter.',
    login: 'Social-first (Apple, Google, phone) with email fallback. The auth payload is what unlocks cross-device team history and the music link.',
    connect: 'Two-tier choice. Free 30s clips use Apple\'s public preview API (legal, no subscription, anyone can play). Full songs link Apple Music or Spotify Premium — pays the labels through the user\'s existing subscription.',
    home: 'The avatar pill (top-right) opens Settings — where the user can swap or disconnect their music service. Hero card starts a new round; secondary cards surface continuity and competitive context.',
    settings: 'Profile · Connected music (with "Change source" / "Disconnect" rows the user asked for) · Preferences · Account. Sign out returns to Splash and clears the linked service.',
    teams: 'Editable team names · tap avatar to cycle palette · scores are zero pre-game. Designed to feel like setting up a cricket match scorecard.',
    filters: 'Era chips + mood chips + round count + timer + hints toggle. Filters drive the song deck for the game.',
    ready: 'Big round number is the pacing beat between songs — every team can see who leads.',
    playing: 'The critical anti-spoiler screen. Movie title, poster, year — all hidden. Only an abstract visual + waveform + buzz buttons. Try changing "Anti-spoiler style" in Tweaks.',
    reveal: 'Faux movie-poster card with film-strip edges. Score badge animates in for the winner.',
    summary: 'Trophy + ranked scoreboard + full song log. Restart preserves teams.',
  };
  return (
    <div style={{
      width: 280, padding: 22, borderRadius: 18,
      background: 'rgba(255,255,255,0.025)',
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
      color: 'var(--ink)', alignSelf: 'flex-start',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8,
      }}>Design note</div>
      <div style={{
        fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
        fontSize: 22, lineHeight: 1.1, marginBottom: 10, color: 'var(--ink)',
      }}>{SCREEN_LABELS[screen]}</div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--ink-dim)' }}>{notes[screen]}</div>
    </div>
  );
}

function Legend() {
  const items = [
    { swatch: 'linear-gradient(135deg, #ff2d6f, #ffd166)', label: 'Filmi pink → gold',
      note: 'Primary palette. Pink = action; gold = highlight.' },
    { swatch: 'rgba(255,255,255,0.06)', label: 'Deep eggplant card',
      note: 'Cards sit on top of a midnight gradient with subtle film-grain overlay.' },
    { font: "'DM Serif Display'", label: 'DM Serif Display Italic',
      note: 'Display face — used for movie titles, team names, hero copy.' },
    { font: "'JetBrains Mono'", label: 'JetBrains Mono',
      note: 'Monospaced labels, timers and scores. Echoes scoreboard typography.' },
    { font: 'Manrope', label: 'Manrope', note: 'Body type for buttons, list rows, hints.' },
  ];
  return (
    <div style={{
      width: 280, padding: 22, borderRadius: 18,
      background: 'rgba(255,255,255,0.025)',
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
      color: 'var(--ink)', alignSelf: 'flex-start',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 10,
      }}>System</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {it.swatch ? (
              <div style={{ width: 34, height: 34, borderRadius: 8, background: it.swatch, flexShrink: 0, boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)' }} />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: it.font, fontStyle: it.font.includes('Serif') ? 'italic' : 'normal',
                fontSize: 18, color: 'var(--ink)',
                flexShrink: 0,
              }}>Aa</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{it.label}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-dim)', marginTop: 2, lineHeight: 1.4 }}>{it.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
