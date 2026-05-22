// screens.jsx — All screens in the Naam Bolo flow.
// Each screen takes (state, actions) and renders a full mobile screen.
// Screens render inside the IOSDevice frame.

// ─────────────────────────────────────────────────────────────
// Layout helpers
// ─────────────────────────────────────────────────────────────
function Screen({ children, padTop = 64, padBottom = 40, bg, ink = '#faf3e0' }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      paddingTop: padTop, paddingBottom: padBottom,
      paddingLeft: 22, paddingRight: 22,
      boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
      color: ink,
      background: bg,
      position: 'relative',
      overflow: 'hidden',
    }}>{children}</div>
  );
}

const SCREEN_BG = `
  radial-gradient(800px 500px at 0% 0%, rgba(255,45,111,0.18), transparent 50%),
  radial-gradient(800px 600px at 100% 100%, rgba(255,209,102,0.10), transparent 55%),
  #160828
`;

// ─────────────────────────────────────────────────────────────
// 01. SPLASH
// ─────────────────────────────────────────────────────────────
function SplashScreen({ onStart }) {
  return (
    <Screen padTop={70} padBottom={50} bg={SCREEN_BG}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <BulbStrip count={11} color="#ffd166" glow="#ff8c42" size={6} gap={14} />
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        gap: 16,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.4em', color: '#ffd166', textTransform: 'uppercase',
          opacity: 0.9,
        }}>— A Bollywood Game —</div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: 76, lineHeight: 0.92, margin: 0,
          color: '#faf3e0', letterSpacing: '-0.02em',
          textShadow: '0 4px 24px rgba(255,45,111,0.5)',
        }}>
          Naam<br/>
          <span style={{ color: '#ff2d6f' }}>Bolo</span>
          <span style={{ color: '#ffd166' }}>.</span>
        </h1>

        <p style={{
          fontFamily: 'Manrope', fontSize: 15, lineHeight: 1.4,
          color: 'rgba(250,243,224,0.7)', margin: '8px 0 0',
          maxWidth: 280,
        }}>
          Play the song. Name the movie.<br/>First team to shout wins.
        </p>

        {/* spinning sub-marquee */}
        <div style={{ marginTop: 24, position: 'relative', width: 160, height: 160 }}>
          <div style={{
            position: 'absolute', inset: 0,
            border: '1px dashed rgba(255,209,102,0.35)', borderRadius: '50%',
            animation: 'vinyl-spin 18s linear infinite',
          }} />
          <div style={{ position: 'absolute', inset: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VinylDisc size={120} label="♪" />
          </div>
        </div>
      </div>

      <FilmiButton onClick={onStart} kind="primary">
        Tap to begin
        <span style={{ marginLeft: 4 }}>→</span>
      </FilmiButton>
      <div style={{ height: 8 }} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BulbStrip count={11} color="#ff2d6f" glow="#ff2d6f" size={6} gap={14} />
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 01b. LOGIN / SIGN-UP
// ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onBack }) {
  const [email, setEmail] = React.useState('');
  return (
    <Screen padTop={62} padBottom={32} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.3em', color: '#ffd166', textTransform: 'uppercase',
          marginBottom: 8,
        }}>Welcome back</div>

        <SectionTitle size={42}>Sign in to<br/>play.</SectionTitle>

        <p style={{
          fontFamily: 'Manrope', fontSize: 13, color: 'rgba(250,243,224,0.6)',
          margin: '12px 0 28px', lineHeight: 1.5,
        }}>
          Your account saves teams, song history, and your music connection across devices.
        </p>

        {/* Social */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SocialButton onClick={() => onLogin('apple')} bg="#000" color="#fff" icon=""
            label="Continue with Apple" />
          <SocialButton onClick={() => onLogin('google')} bg="#fff" color="#1a1a1a" icon="G"
            label="Continue with Google" />
          <SocialButton onClick={() => onLogin('phone')} bg="rgba(255,255,255,0.06)" color="#faf3e0" icon="📱"
            label="Continue with phone" />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0',
        }}>
          <div style={{ flex: 1, height: 0.5, background: 'rgba(250,243,224,0.12)' }} />
          <span style={{ fontSize: 10, color: 'rgba(250,243,224,0.4)', letterSpacing: '0.2em', fontFamily: "'JetBrains Mono', monospace" }}>OR</span>
          <div style={{ flex: 1, height: 0.5, background: 'rgba(250,243,224,0.12)' }} />
        </div>

        {/* Email */}
        <label style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.2em', color: 'rgba(250,243,224,0.55)', textTransform: 'uppercase',
        }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aarav@example.com"
          style={{
            marginTop: 6, padding: '14px 16px', borderRadius: 12, border: 0,
            background: 'rgba(255,255,255,0.05)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
            color: '#faf3e0', fontSize: 15, fontFamily: 'Manrope', outline: 'none',
          }} />
      </div>

      <FilmiButton onClick={() => onLogin('email')} kind="primary">
        {email ? 'Send magic link' : 'Continue'}
      </FilmiButton>
      <p style={{
        fontSize: 11, color: 'rgba(250,243,224,0.4)', textAlign: 'center',
        margin: '12px 0 0', lineHeight: 1.5,
      }}>
        By continuing you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
      </p>
    </Screen>
  );
}

function SocialButton({ onClick, bg, color, icon, label }) {
  return (
    <button onClick={onClick} style={{
      height: 50, border: 0, borderRadius: 14, cursor: 'pointer',
      background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: 'Manrope', fontSize: 15, fontWeight: 600,
      boxShadow: bg === 'rgba(255,255,255,0.06)' ? 'inset 0 0 0 0.5px rgba(255,255,255,0.14)' : 'none',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontWeight: 700,
        fontSize: icon === '' ? 18 : 13,
        background: icon === 'G' ? 'transparent' : 'transparent',
      }}>{icon}</span>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 02. CONNECT MUSIC
// ─────────────────────────────────────────────────────────────
function ConnectScreen({ onConnect, onBack, currentService }) {
  const [tier, setTier] = React.useState(currentService === 'preview' ? 'free' : 'full');
  return (
    <Screen padTop={62} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />
      <StepLabel n={2} of={3} />
      <SectionTitle size={34}>Connect<br/>your music.</SectionTitle>
      <p style={{
        fontFamily: 'Manrope', fontSize: 13, lineHeight: 1.5,
        color: 'rgba(250,243,224,0.6)', margin: '10px 0 18px',
      }}>
        Songs stream through a licensed source — we never host audio ourselves.
      </p>

      {/* Tier segmented */}
      <div style={{
        display: 'flex', padding: 4, borderRadius: 12,
        background: 'rgba(0,0,0,0.22)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
        marginBottom: 14,
      }}>
        {[
          { v: 'free', label: 'Free · 30s clips' },
          { v: 'full', label: 'Full song · linked' },
        ].map((opt) => (
          <button key={opt.v} onClick={() => setTier(opt.v)} style={{
            flex: 1, padding: '10px', border: 0, borderRadius: 8,
            background: tier === opt.v ? '#ffd166' : 'transparent',
            color: tier === opt.v ? '#160828' : 'rgba(250,243,224,0.7)',
            fontFamily: 'Manrope', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
          }}>{opt.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tier === 'free' ? (
          <>
            <ServiceCard
              onClick={() => onConnect('preview')}
              icon={<div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'linear-gradient(160deg, #ffd166, #ff8c42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#160828', fontSize: 24, fontWeight: 800,
              }}>30s</div>}
              title="30-second previews"
              tag="No subscription"
              tagBg="#3dffb1"
              meta="Powered by Apple Music's public preview API · works for everyone"
              accent="rgba(255,209,102,0.4)"
              bg="linear-gradient(135deg, rgba(255,209,102,0.16) 0%, rgba(255,140,66,0.06) 100%)"
            />
            <div style={{
              padding: 14, borderRadius: 14, marginTop: 14,
              background: 'rgba(61,255,177,0.06)',
              boxShadow: 'inset 0 0 0 0.5px rgba(61,255,177,0.22)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                fontSize: 11, fontWeight: 700, color: '#3dffb1', letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>✓ Fully legal · Free forever</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(250,243,224,0.75)' }}>
                Apple exposes 30-second clips publicly. We can't choose which 30 seconds (usually the chorus), but the whole catalog is available. Slightly easier game.
              </div>
            </div>
          </>
        ) : (
          <>
            <ServiceCard
              onClick={() => onConnect('apple')}
              icon={<AppleMusicLogo size={48} />}
              title="Apple Music"
              tag="Recommended"
              tagBg="#ffd166"
              meta="Full songs · iOS, Android & web · Free trial in-app"
              accent="rgba(251,92,116,0.4)"
              bg="linear-gradient(135deg, rgba(251,92,116,0.16) 0%, rgba(250,35,59,0.06) 100%)"
            />
            <div style={{ height: 10 }} />
            <ServiceCard
              onClick={() => onConnect('spotify')}
              icon={<SpotifyLogo size={48} />}
              title="Spotify"
              meta="Full Premium only · Premium Mini not supported"
              bg="rgba(255,255,255,0.04)"
              accent="rgba(255,255,255,0.12)"
            />
            <div style={{
              padding: 14, borderRadius: 14, marginTop: 14,
              background: 'rgba(255,209,102,0.06)',
              boxShadow: 'inset 0 0 0 0.5px rgba(255,209,102,0.25)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                fontSize: 11, fontWeight: 700, color: '#ffd166', letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>ⓘ Why a subscription?</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(250,243,224,0.75)' }}>
                Bollywood music is licensed by labels (T-Series, Saregama, Sony, Zee). Streaming services already pay them per play — we piggyback on yours.
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}

function ServiceCard({ onClick, icon, title, tag, tagBg, meta, accent, bg, connected }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left',
      padding: 18, borderRadius: 18, border: 0,
      background: bg,
      boxShadow: `inset 0 0 0 1px ${accent}`,
      cursor: 'pointer', color: '#faf3e0',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      {icon}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Manrope', fontSize: 16, fontWeight: 700 }}>{title}</span>
          {tag && (
            <span style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: tagBg, color: '#160828', padding: '2px 6px', borderRadius: 4, fontWeight: 700,
            }}>{tag}</span>
          )}
          {connected && (
            <span style={{
              fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#3dffb1', fontWeight: 700,
            }}>● Connected</span>
          )}
        </div>
        {meta && <div style={{ fontSize: 12, color: 'rgba(250,243,224,0.6)', marginTop: 4 }}>{meta}</div>}
      </div>
      <span style={{ color: 'rgba(250,243,224,0.4)', fontSize: 22 }}>›</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 03. HOME
// ─────────────────────────────────────────────────────────────
function HomeScreen({ service, user, onNewGame, onContinue, onSettings }) {
  return (
    <Screen padTop={66} bg={SCREEN_BG}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: '0.3em', color: 'rgba(250,243,224,0.5)',
            textTransform: 'uppercase',
          }}>Good evening</div>
          <div style={{
            fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
            fontSize: 28, color: '#faf3e0', marginTop: 2,
          }}>{user?.name || 'Aarav'}.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '6px 10px', borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            fontSize: 11, color: 'rgba(250,243,224,0.8)',
            display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
          }}>
            {service === 'apple' ? <AppleMusicLogo size={18} /> : service === 'spotify' ? <SpotifyLogo size={18} /> : <span style={{ fontSize: 11 }}>♪</span>}
            {service === 'apple' ? 'Apple Music' : service === 'spotify' ? 'Spotify' : '30s preview'}
          </div>
          <button onClick={onSettings} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: `linear-gradient(135deg, #ff2d6f 0%, #ffd166 100%)`,
            border: 0, cursor: 'pointer',
            color: '#160828', fontWeight: 700,
            fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 16,
            boxShadow: '0 4px 10px rgba(255,45,111,0.35), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>{(user?.name || 'A')[0]}</button>
        </div>
      </div>

      {/* Hero start card */}
      <button onClick={onNewGame} style={{
        position: 'relative',
        width: '100%', minHeight: 220,
        border: 0, borderRadius: 22, cursor: 'pointer', textAlign: 'left',
        padding: 22,
        background: 'linear-gradient(135deg, #ff2d6f 0%, #c81d77 60%, #7a3eb1 100%)',
        boxShadow: '0 16px 36px rgba(255,45,111,0.32)',
        overflow: 'hidden',
        color: '#fff',
      }}>
        {/* decorative vinyl in corner */}
        <div style={{ position: 'absolute', right: -34, bottom: -34, opacity: 0.5, pointerEvents: 'none' }}>
          <VinylDisc size={170} spinning={false} color1="#ffd166" color2="#ff8c42" label="♪" />
        </div>
        {/* corner filigree */}
        <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
          <BulbStrip count={5} color="#ffd166" glow="#ffd166" size={4} gap={8} />
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#ffd166', marginBottom: 8,
        }}>Start a new round</div>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: 38, lineHeight: 1, color: '#fff', maxWidth: 220,
        }}>Tonight's<br/>antakshari.</div>
        <div style={{
          marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 999,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)',
          fontSize: 13, fontWeight: 600,
        }}>
          New Game <span>→</span>
        </div>
      </button>

      {/* Continue + Modes row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        <button onClick={onContinue} style={{
          padding: 14, borderRadius: 16, border: 0, textAlign: 'left',
          background: 'rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
          color: '#faf3e0', cursor: 'pointer',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#ffd166', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Last game</div>
          <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 700, marginTop: 4 }}>Pratik's<br/>Birthday</div>
          <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', marginTop: 6 }}>Resume · 3/12 left</div>
        </button>
        <div style={{
          padding: 14, borderRadius: 16,
          background: 'rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#ffd166', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>Top team</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <TeamAvatar team={{ color1: '#ff2d6f', color2: '#ffd166', emoji: 'M' }} size={24} />
            <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 700 }}>Mehndi</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, marginTop: 4 }}>7<span style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', fontWeight: 500, marginLeft: 4 }}>wins</span></div>
        </div>
      </div>

      {/* Mode list */}
      <div style={{
        marginTop: 14, padding: 4, borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
      }}>
        {[
          { name: 'Classic Antakshari', sub: '2 teams · Buzz to answer', emoji: '🏆', active: true },
          { name: 'Solo Practice', sub: 'Play alone · Track streak', emoji: '∞', active: false },
          { name: 'Era Sprint', sub: 'One decade · 60s rounds', emoji: '⏱', active: false },
        ].map((m, i, arr) => (
          <div key={i} style={{
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: m.active ? 'rgba(255,209,102,0.18)' : 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: m.active ? '#ffd166' : 'rgba(250,243,224,0.5)',
            }}>{m.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#faf3e0' }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', marginTop: 2 }}>{m.sub}</div>
            </div>
            {m.active && <div style={{ fontSize: 10, color: '#ffd166', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}>ACTIVE</div>}
          </div>
        ))}
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 03b. SETTINGS — profile + music + preferences
// ─────────────────────────────────────────────────────────────
function SettingsScreen({ user, service, onChangeService, onSignOut, onBack }) {
  const serviceMeta = {
    apple:    { label: 'Apple Music',      sub: 'Full songs · MusicKit',         logo: <AppleMusicLogo size={36} />, color: '#fb5c74' },
    spotify:  { label: 'Spotify',          sub: 'Full songs · Premium',          logo: <SpotifyLogo    size={36} />, color: '#1db954' },
    preview:  { label: '30-second clips',  sub: 'Apple preview API · Free',
                logo: <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(160deg, #ffd166, #ff8c42)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#160828', fontSize: 12, fontWeight: 800 }}>30s</div>,
                color: '#ffd166' },
  }[service] || { label: 'Not connected', sub: 'Tap to link a service', logo: <span>♪</span>, color: '#999' };

  return (
    <Screen padTop={62} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />

      <SectionTitle size={34}>Settings.</SectionTitle>

      <div style={{ flex: 1, overflow: 'auto', marginTop: 18 }}>
        {/* Profile */}
        <SettingsGroup title="Profile">
          <div style={{
            padding: 14, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff2d6f 0%, #ffd166 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
              fontSize: 28, color: '#160828', fontWeight: 600,
              boxShadow: '0 6px 14px rgba(255,45,111,0.3)',
            }}>{(user?.name || 'A')[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Manrope', fontSize: 16, fontWeight: 700, color: '#faf3e0' }}>{user?.name || 'Aarav Shah'}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,243,224,0.55)', marginTop: 2 }}>{user?.email || 'aarav@example.com'}</div>
            </div>
            <span style={{ color: 'rgba(250,243,224,0.4)', fontSize: 20 }}>›</span>
          </div>
        </SettingsGroup>

        {/* Music — the change-service control the user asked about */}
        <SettingsGroup title="Connected music">
          <div style={{
            padding: 14, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {serviceMeta.logo}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Manrope', fontSize: 15, fontWeight: 700, color: '#faf3e0' }}>{serviceMeta.label}</span>
                {service && <span style={{ fontSize: 9, color: '#3dffb1', fontWeight: 700, letterSpacing: '0.1em' }}>● ACTIVE</span>}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.55)', marginTop: 2 }}>{serviceMeta.sub}</div>
            </div>
          </div>
          <div style={{ height: 0.5, background: 'rgba(255,255,255,0.06)', margin: '0 14px' }} />
          <SettingsRow label="Change music source" onClick={onChangeService} caret accent="#ffd166" />
          <SettingsRow label="Disconnect" onClick={onChangeService} caret danger />
        </SettingsGroup>

        {/* Preferences */}
        <SettingsGroup title="Preferences">
          <SettingsToggle label="Sound effects" subtitle="Buzz / reveal stings" defaultOn />
          <SettingsToggle label="Haptics on buzz" subtitle="Vibrate on the winner's phone" defaultOn />
          <SettingsToggle label="Adult content" subtitle="Allow item songs / mature themes" />
          <SettingsRow label="Default round timer" value="30s" caret />
          <SettingsRow label="Language" value="हिन्दी · English" caret />
        </SettingsGroup>

        {/* Account */}
        <SettingsGroup title="Account">
          <SettingsRow label="Privacy & data" caret />
          <SettingsRow label="Help & feedback" caret />
          <SettingsRow label="About Naam Bolo" value="v0.1.0" caret />
          <SettingsRow label="Sign out" onClick={onSignOut} danger />
        </SettingsGroup>

        <div style={{
          textAlign: 'center', marginTop: 22,
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: '0.25em', color: 'rgba(250,243,224,0.3)',
          textTransform: 'uppercase',
        }}>♪ made with masala</div>
      </div>
    </Screen>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.2em', color: 'rgba(250,243,224,0.45)',
        textTransform: 'uppercase', marginBottom: 6, paddingLeft: 14,
      }}>{title}</div>
      <div style={{
        borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function SettingsRow({ label, value, onClick, caret, danger, accent }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', border: 0, padding: '12px 14px',
      background: 'transparent', cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', gap: 10,
      borderTop: '0.5px solid rgba(255,255,255,0.06)',
      textAlign: 'left',
    }}>
      <span style={{
        flex: 1, fontFamily: 'Manrope', fontSize: 14, fontWeight: 500,
        color: danger ? '#ff5577' : (accent || '#faf3e0'),
      }}>{label}</span>
      {value && <span style={{ fontSize: 12, color: 'rgba(250,243,224,0.5)' }}>{value}</span>}
      {caret && <span style={{ color: 'rgba(250,243,224,0.35)', fontSize: 18 }}>›</span>}
    </button>
  );
}

function SettingsToggle({ label, subtitle, defaultOn = false }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div style={{
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      borderTop: '0.5px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 500, color: '#faf3e0' }}>{label}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      <Toggle on={on} onChange={setOn} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 04. TEAMS
// ─────────────────────────────────────────────────────────────
const TEAM_COLOR_PRESETS = [
  { color1: '#ff2d6f', color2: '#ffd166' },
  { color1: '#2cd4c0', color2: '#7a3eb1' },
  { color1: '#ff8c42', color2: '#ffd166' },
  { color1: '#3dffb1', color2: '#2cd4c0' },
];

function TeamsScreen({ teams, setTeams, onContinue, onBack }) {
  const updateTeam = (i, patch) => {
    setTeams(teams.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  };
  return (
    <Screen padTop={66} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />
      <StepLabel n={2} of={3} />
      <SectionTitle size={34}>The teams.</SectionTitle>
      <p style={{ fontFamily: 'Manrope', fontSize: 13, color: 'rgba(250,243,224,0.6)', margin: '8px 0 22px' }}>
        Tap to rename. Tap the avatar to change the look.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {teams.map((team, i) => (
          <div key={i} style={{
            padding: 16, borderRadius: 18,
            background: `linear-gradient(135deg, ${team.color1}22 0%, ${team.color2}11 100%)`,
            boxShadow: `inset 0 0 0 1px ${team.color1}44`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <button onClick={() => {
              const next = TEAM_COLOR_PRESETS[(TEAM_COLOR_PRESETS.findIndex(p => p.color1 === team.color1) + 1) % TEAM_COLOR_PRESETS.length];
              updateTeam(i, next);
            }} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}>
              <TeamAvatar team={team} size={64} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: '0.2em', color: 'rgba(250,243,224,0.5)',
                textTransform: 'uppercase',
              }}>Team {i + 1}</div>
              <input value={team.name}
                onChange={(e) => updateTeam(i, { name: e.target.value })}
                style={{
                  width: '100%', background: 'transparent', border: 0,
                  fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
                  fontSize: 26, color: '#faf3e0', padding: 0, outline: 'none', marginTop: 2,
                }} />
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24, fontWeight: 700, color: team.color2,
              opacity: 0.85,
            }}>0</div>
          </div>
        ))}

        {teams.length < 4 && (
          <button onClick={() => setTeams([...teams, {
            name: `Team ${teams.length + 1}`, score: 0, emoji: String.fromCharCode(65 + teams.length),
            ...TEAM_COLOR_PRESETS[teams.length % TEAM_COLOR_PRESETS.length],
          }])} style={{
            padding: '14px', borderRadius: 14, border: 0,
            background: 'transparent',
            boxShadow: 'inset 0 0 0 1px rgba(250,243,224,0.16)',
            color: 'rgba(250,243,224,0.6)', fontFamily: 'Manrope', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span> Add a team
          </button>
        )}
      </div>

      <FilmiButton onClick={onContinue} kind="primary" style={{ marginTop: 12 }}>
        Continue
      </FilmiButton>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 05. FILTERS
// ─────────────────────────────────────────────────────────────
function FiltersScreen({ filters, setFilters, onStart, onBack }) {
  const eras = ['90s', '2000s', '2010s', '2020s'];
  const moods = ['Romantic', 'Wedding', 'Party', 'Sufi', 'Anthemic', 'Period', 'Coming-of-age'];
  const toggle = (key, val) => {
    const cur = filters[key];
    setFilters({ ...filters, [key]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val] });
  };
  return (
    <Screen padTop={66} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />
      <StepLabel n={3} of={3} />
      <SectionTitle size={34}>Pick the<br/>flavour.</SectionTitle>

      <div style={{ flex: 1, overflow: 'auto', marginTop: 18 }}>
        <FilterGroup title="Era">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {eras.map(e => (
              <Chip key={e} active={filters.eras.includes(e)} onClick={() => toggle('eras', e)}>{e}</Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Mood">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {moods.map(m => (
              <Chip key={m} active={filters.moods.includes(m)} onClick={() => toggle('moods', m)}>{m}</Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Rounds">
          <div style={{
            display: 'flex', padding: 4, borderRadius: 12,
            background: 'rgba(0,0,0,0.2)',
            boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
          }}>
            {[5, 7, 10, 15].map(n => (
              <button key={n} onClick={() => setFilters({ ...filters, rounds: n })}
                style={{
                  flex: 1, padding: '10px', border: 0, borderRadius: 8,
                  background: filters.rounds === n ? '#ffd166' : 'transparent',
                  color: filters.rounds === n ? '#160828' : 'rgba(250,243,224,0.75)',
                  fontFamily: 'Manrope', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontVariantNumeric: 'tabular-nums',
                }}>{n}</button>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup title="Round timer">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
              fontSize: 36, color: '#ffd166',
            }}>{filters.timer}s</span>
            <span style={{ fontSize: 12, color: 'rgba(250,243,224,0.5)' }}>per song before reveal</span>
          </div>
          <input type="range" min={15} max={90} step={5} value={filters.timer}
            onChange={(e) => setFilters({ ...filters, timer: Number(e.target.value) })}
            style={{ width: '100%', marginTop: 6, accentColor: '#ff2d6f' }} />
        </FilterGroup>

        <FilterGroup title="Hints">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 600 }}>Allow hint cards</div>
              <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', marginTop: 2 }}>Cost points · Don't reveal the movie</div>
            </div>
            <Toggle on={filters.hintsOn} onChange={(v) => setFilters({ ...filters, hintsOn: v })} />
          </div>
        </FilterGroup>
      </div>

      <FilmiButton onClick={onStart} kind="primary" style={{ marginTop: 12 }}>
        Start Round 1
      </FilmiButton>
    </Screen>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.2em', color: '#ffd166', textTransform: 'uppercase',
        marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 48, height: 28, borderRadius: 999,
      border: 0, padding: 2, cursor: 'pointer',
      background: on ? '#ff2d6f' : 'rgba(255,255,255,0.15)',
      transition: 'background 0.18s',
      position: 'relative',
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transform: on ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.18s',
      }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 06. READY (between rounds)
// ─────────────────────────────────────────────────────────────
function ReadyScreen({ round, totalRounds, teams, onPlay, onBack }) {
  const isFirst = round === 1;
  return (
    <Screen padTop={66} bg={SCREEN_BG}>
      <BackPill onBack={onBack} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: '0.4em', color: '#ffd166', textTransform: 'uppercase',
        }}>Round</div>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: 120, lineHeight: 1, color: '#faf3e0',
          textShadow: '0 0 60px rgba(255,209,102,0.5)',
          margin: '4px 0',
        }}>{String(round).padStart(2, '0')}</div>
        <div style={{ fontFamily: 'Manrope', fontSize: 13, color: 'rgba(250,243,224,0.55)' }}>
          of {totalRounds}
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 14, alignItems: 'center' }}>
          {teams.map((t, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', color: 'rgba(250,243,224,0.4)', fontSize: 14 }}>vs</span>}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <TeamAvatar team={t} size={44} />
                <div style={{ fontSize: 11, fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: t.color2 }}>{t.score}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {!isFirst && (
          <div style={{
            marginTop: 22, padding: '8px 14px', borderRadius: 999,
            background: 'rgba(255,209,102,0.12)',
            fontSize: 12, color: '#ffd166',
            fontFamily: 'Manrope', fontWeight: 600,
          }}>
            {teams[0].score > teams[1].score ? `${teams[0].name} leads by ${teams[0].score - teams[1].score}` :
             teams[1].score > teams[0].score ? `${teams[1].name} leads by ${teams[1].score - teams[0].score}` :
             'All square'}
          </div>
        )}
      </div>

      <FilmiButton onClick={onPlay} kind="gold">
        <span style={{ fontSize: 18 }}>▶</span> Play the song
      </FilmiButton>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 07. PLAYING — the anti-spoiler now-playing screen
// ─────────────────────────────────────────────────────────────
function PlayingScreen({
  song, teams, round, totalRounds, timer, maxTimer, antiSpoilerStyle,
  onBuzz, onHints, onSkip, hintsUsed, hintsOn,
}) {
  const remaining = Math.max(0, timer);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <Screen padTop={66} padBottom={28} bg={SCREEN_BG}>
      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: '0.3em', color: 'rgba(250,243,224,0.5)', textTransform: 'uppercase',
          }}>Round {round} / {totalRounds}</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 18, color: '#ffd166', marginTop: 2 }}>
            Now playing.
          </div>
        </div>
        <TimerRing size={62} progress={remaining / maxTimer} color={remaining < 10 ? '#ff2d6f' : '#ffd166'}>
          {mm}:{ss}
        </TimerRing>
      </div>

      {/* anti-spoiler art block */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 18, position: 'relative',
      }}>
        {antiSpoilerStyle === 'mystery' && (
          <MysteryCard width={220} height={300} />
        )}
        {antiSpoilerStyle === 'vinyl' && (
          <VinylDisc size={250} label="♪" />
        )}
        {antiSpoilerStyle === 'visualizer' && (
          <div style={{
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,45,111,0.18) 0%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 30, borderRadius: '50%',
              border: '1px dashed rgba(255,209,102,0.25)',
              animation: 'vinyl-spin 24s linear infinite reverse',
            }} />
            <WaveBars bars={26} height={140} color="#faf3e0" accent="#ff2d6f" intensity={1} />
          </div>
        )}
        {antiSpoilerStyle === 'curtain' && (
          <CinemaCurtains width={260} height={320} />
        )}

        {/* sub waveform indicating audio */}
        <div style={{ width: '100%', height: 32, opacity: 0.8 }}>
          <WaveBars bars={48} height={32} color="rgba(250,243,224,0.7)" accent="#ffd166" intensity={0.7} />
        </div>

        {/* hint chips count */}
        {hintsOn && (
          <button onClick={onHints} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 999,
            background: 'rgba(0,0,0,0.32)',
            boxShadow: 'inset 0 0 0 1px rgba(255,209,102,0.35)',
            color: '#ffd166', fontFamily: 'Manrope', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: 0,
          }}>
            ✦ Need a hint?
            <span style={{ fontSize: 11, color: 'rgba(255,209,102,0.7)', marginLeft: 4 }}>
              {hintsUsed.length}/{HINTS.length} used
            </span>
          </button>
        )}
      </div>

      {/* big buzz buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: teams.length === 2 ? '1fr 1fr' : `repeat(${teams.length}, 1fr)`, gap: 10, marginTop: 16 }}>
        {teams.map((t, i) => (
          <button key={i} onClick={() => onBuzz(i)} style={{
            padding: '18px 8px',
            borderRadius: 18, border: 0, cursor: 'pointer',
            background: `linear-gradient(180deg, ${t.color1} 0%, ${t.color1}dd 100%)`,
            color: '#fff',
            boxShadow: `0 8px 20px ${t.color1}55, inset 0 1px 0 rgba(255,255,255,0.2)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 18,
              boxShadow: `inset 0 0 0 2px ${t.color2}55`,
              pointerEvents: 'none',
            }} />
            <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 24, lineHeight: 1 }}>
              {t.name}!
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>Tap to buzz</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
        <button onClick={onSkip} style={{
          background: 'transparent', border: 0, color: 'rgba(250,243,224,0.5)',
          fontFamily: 'Manrope', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0,
        }}>Skip song</button>
        <button onClick={onSkip} style={{
          background: 'transparent', border: 0, color: 'rgba(250,243,224,0.5)',
          fontFamily: 'Manrope', fontSize: 12, fontWeight: 500, cursor: 'pointer', padding: 0,
        }}>Pass · Reveal</button>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 08. HINTS OVERLAY
// ─────────────────────────────────────────────────────────────
function HintsOverlay({ song, hintsUsed, onReveal, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 70,
      background: 'rgba(10, 4, 20, 0.86)',
      backdropFilter: 'blur(20px)',
      padding: '70px 22px 28px',
      display: 'flex', flexDirection: 'column',
      color: '#faf3e0',
      animation: 'fade-up 0.25s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <SectionTitle size={32}>Hints.</SectionTitle>
        <button onClick={onClose} style={{
          background: 'transparent', border: 0, color: 'rgba(250,243,224,0.6)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
        }}>Close ✕</button>
      </div>
      <p style={{ fontFamily: 'Manrope', fontSize: 12, color: 'rgba(250,243,224,0.55)', margin: '0 0 18px' }}>
        Each hint costs points. Tap to reveal.
      </p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'auto' }}>
        {HINTS.map((h) => {
          const revealed = hintsUsed.includes(h.key);
          return (
            <button key={h.key} onClick={() => !revealed && onReveal(h.key)}
              disabled={revealed}
              style={{
                padding: 14, borderRadius: 14, border: 0, textAlign: 'left',
                background: revealed
                  ? 'linear-gradient(135deg, rgba(255,209,102,0.16) 0%, rgba(255,140,66,0.06) 100%)'
                  : 'rgba(255,255,255,0.05)',
                boxShadow: revealed
                  ? 'inset 0 0 0 1px rgba(255,209,102,0.4)'
                  : 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
                cursor: revealed ? 'default' : 'pointer',
                color: '#faf3e0', display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: revealed ? '#ffd166' : 'rgba(255,255,255,0.05)',
                color: revealed ? '#160828' : 'rgba(250,243,224,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700,
              }}>{h.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 600 }}>{h.label}</div>
                {revealed ? (
                  <div style={{ fontSize: 13, marginTop: 4, color: 'rgba(250,243,224,0.85)' }}>
                    {song[h.key]}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.5)', marginTop: 2 }}>
                    Reveal to read · costs {h.cost} pts
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700,
                color: revealed ? '#ff2d6f' : 'rgba(250,243,224,0.5)',
              }}>{revealed ? `−${h.cost}` : `${h.cost}`}<span style={{ fontSize: 10, marginLeft: 1 }}>pts</span></div>
            </button>
          );
        })}
      </div>

      <FilmiButton onClick={onClose} kind="ghost" style={{ marginTop: 14 }}>
        Back to song
      </FilmiButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 09. BUZZED — team buzzed, paused, naming the movie
// ─────────────────────────────────────────────────────────────
function BuzzedScreen({ team, onCorrect, onWrong }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80,
      background: `radial-gradient(circle at 50% 30%, ${team.color1}55 0%, rgba(10,4,20,0.98) 70%)`,
      backdropFilter: 'blur(8px)',
      padding: '90px 22px 28px',
      display: 'flex', flexDirection: 'column',
      color: '#faf3e0',
      animation: 'fade-up 0.18s ease-out',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: '0.4em', color: '#ffd166', textTransform: 'uppercase',
        marginBottom: 8,
      }}>BUZZED · MUSIC PAUSED</div>

      {/* pulsing ring + avatar */}
      <div style={{ position: 'relative', alignSelf: 'center', marginTop: 10 }}>
        {[0, 0.5, 1].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', inset: '50%', width: 100, height: 100,
            marginTop: -50, marginLeft: -50, borderRadius: '50%',
            border: `2px solid ${team.color1}`,
            animation: `pulse-ring 1.6s ${d}s ease-out infinite`,
          }} />
        ))}
        <TeamAvatar team={team} size={100} />
      </div>

      <div style={{
        fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
        fontSize: 42, color: '#faf3e0', marginTop: 22, lineHeight: 1,
      }}>{team.name}!</div>
      <div style={{ fontFamily: 'Manrope', fontSize: 14, color: 'rgba(250,243,224,0.7)', marginTop: 8 }}>
        Name the movie...
      </div>

      <div style={{
        marginTop: 22, padding: 16, borderRadius: 14,
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.1)',
        fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
        fontSize: 18, color: 'rgba(250,243,224,0.45)',
        textAlign: 'center',
      }}>"________________"</div>

      <div style={{ flex: 1 }} />

      <FilmiButton onClick={onCorrect} kind="gold">
        ✓ Correct — Award the point
      </FilmiButton>
      <div style={{ height: 8 }} />
      <FilmiButton onClick={onWrong} kind="ghost">
        ✗ Wrong — Resume music
      </FilmiButton>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. REVEAL — show the movie
// ─────────────────────────────────────────────────────────────
function RevealScreen({ song, winner, points, onNext, isLast }) {
  return (
    <Screen padTop={62} bg={`
      radial-gradient(800px 400px at 50% 0%, ${winner ? winner.color1 + '55' : 'rgba(255,209,102,0.18)'}, transparent 60%),
      #160828
    `}>
      {/* confetti only on correct */}
      {winner && <Confetti color={winner.color2} />}

      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        letterSpacing: '0.3em', color: '#ffd166', textTransform: 'uppercase',
        textAlign: 'center',
      }}>{winner ? 'Correct!' : 'No one got it'}</div>

      {/* poster card */}
      <div style={{
        marginTop: 16,
        padding: 20, borderRadius: 22,
        background: `linear-gradient(160deg, ${song.swatch[0]} 0%, ${song.swatch[1]} 100%)`,
        boxShadow: '0 16px 36px rgba(0,0,0,0.35)',
        color: '#160828', position: 'relative', overflow: 'hidden',
      }}>
        {/* faux film strip */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: 14,
          background: 'repeating-linear-gradient(0deg, transparent 0 8px, rgba(0,0,0,0.18) 8px 16px)',
        }} />
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0, width: 14,
          background: 'repeating-linear-gradient(0deg, transparent 0 8px, rgba(0,0,0,0.18) 8px 16px)',
        }} />

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(22,8,40,0.7)',
        }}>The song was</div>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: 30, lineHeight: 1.05, marginTop: 4,
        }}>"{song.song}"</div>

        <div style={{ height: 1, background: 'rgba(22,8,40,0.2)', margin: '14px 0' }} />

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: '0.3em', textTransform: 'uppercase',
          color: 'rgba(22,8,40,0.7)',
        }}>from the film</div>
        <div style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: 36, lineHeight: 1.02, marginTop: 4, fontWeight: 700,
          color: '#160828',
        }}>{song.movie}</div>
        <div style={{
          fontFamily: 'Manrope', fontSize: 12, fontWeight: 600, marginTop: 10,
          color: 'rgba(22,8,40,0.78)',
        }}>{song.year} · dir. {song.director}</div>
        <div style={{
          fontFamily: 'Manrope', fontSize: 11, marginTop: 4,
          color: 'rgba(22,8,40,0.65)', lineHeight: 1.4,
        }}>{song.cast}</div>
      </div>

      {/* award badge */}
      {winner && (
        <div style={{
          marginTop: 18,
          padding: '14px 16px', borderRadius: 16,
          background: 'rgba(255,255,255,0.05)',
          boxShadow: `inset 0 0 0 1px ${winner.color1}66`,
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'fade-up 0.4s 0.2s both ease-out',
        }}>
          <TeamAvatar team={winner} size={42} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Manrope', fontSize: 14, fontWeight: 600 }}>{winner.name} scored</div>
            <div style={{ fontSize: 11, color: 'rgba(250,243,224,0.55)', marginTop: 2 }}>
              {points} point{points !== 1 ? 's' : ''} this round
            </div>
          </div>
          <div style={{
            fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
            fontSize: 36, color: winner.color2,
          }}>+{points}</div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <FilmiButton onClick={onNext} kind="primary">
        {isLast ? 'See final scores' : 'Next round'} →
      </FilmiButton>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. SUMMARY — game over
// ─────────────────────────────────────────────────────────────
function SummaryScreen({ teams, history, onRestart, onHome }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const tied = sorted[1] && sorted[0].score === sorted[1].score;
  return (
    <Screen padTop={66} bg={`
      radial-gradient(800px 500px at 50% -10%, ${winner.color1}66, transparent 60%),
      #160828
    `}>
      <Confetti color="#ffd166" />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          letterSpacing: '0.4em', color: '#ffd166', textTransform: 'uppercase',
        }}>{tied ? 'Tied at' : 'Winner'}</div>

        {!tied && (
          <>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
              <TeamAvatar team={winner} size={96} />
            </div>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
              fontSize: 56, lineHeight: 1, color: '#faf3e0', marginTop: 10,
              textShadow: `0 0 32px ${winner.color1}66`,
            }}>{winner.name}.</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 16, color: winner.color2, marginTop: 4,
            }}>{winner.score} POINTS</div>
          </>
        )}
      </div>

      {/* scoreboard */}
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((t, i) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: 12,
            background: i === 0 ? `linear-gradient(135deg, ${t.color1}22 0%, ${t.color2}11 100%)` : 'rgba(255,255,255,0.04)',
            boxShadow: i === 0 ? `inset 0 0 0 1px ${t.color1}55` : 'inset 0 0 0 0.5px rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
              fontSize: 18, color: 'rgba(250,243,224,0.5)', width: 18,
            }}>{i + 1}</div>
            <TeamAvatar team={t} size={32} />
            <div style={{ flex: 1, fontFamily: 'Manrope', fontSize: 14, fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 17, fontWeight: 700, color: t.color2 }}>{t.score}</div>
          </div>
        ))}
      </div>

      {/* songs log */}
      <div style={{
        marginTop: 18, flex: 1, overflow: 'auto', minHeight: 0,
        padding: 4, borderRadius: 14,
        background: 'rgba(0,0,0,0.18)',
        boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.06)',
      }}>
        <div style={{
          padding: '10px 12px 6px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: '0.2em', color: 'rgba(250,243,224,0.4)', textTransform: 'uppercase',
        }}>Songs played</div>
        {history.map((h, i) => (
          <div key={i} style={{
            padding: '8px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: `linear-gradient(135deg, ${h.song.swatch[0]}, ${h.song.swatch[1]})`,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 600, color: '#faf3e0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{h.song.movie}</div>
              <div style={{ fontSize: 10, color: 'rgba(250,243,224,0.4)' }}>"{h.song.song}"</div>
            </div>
            {h.winner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TeamAvatar team={h.winner} size={18} />
                <span style={{ fontSize: 10, color: 'rgba(250,243,224,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>+{h.points}</span>
              </div>
            ) : (
              <span style={{ fontSize: 10, color: 'rgba(250,243,224,0.3)', fontFamily: "'JetBrains Mono', monospace" }}>—</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <FilmiButton onClick={onHome} kind="ghost">Home</FilmiButton>
        <FilmiButton onClick={onRestart} kind="primary">Play again</FilmiButton>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable bits
// ─────────────────────────────────────────────────────────────
function BackPill({ onBack }) {
  return (
    <button onClick={onBack} style={{
      position: 'absolute', top: 60, left: 22, zIndex: 5,
      width: 36, height: 36, borderRadius: 999,
      background: 'rgba(255,255,255,0.06)',
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
      border: 0, color: '#faf3e0', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18,
    }}>‹</button>
  );
}

function StepLabel({ n, of }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      letterSpacing: '0.3em', color: '#ffd166', textTransform: 'uppercase',
      marginBottom: 8, marginLeft: 44, opacity: 0.85,
    }}>Step {n} of {of}</div>
  );
}

function Confetti({ color = '#ffd166' }) {
  const pieces = React.useMemo(() => Array.from({ length: 24 }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 2 + Math.random() * 1.4,
    rot: Math.random() * 360,
    size: 4 + Math.random() * 4,
    color: [color, '#ff2d6f', '#ff8c42', '#2cd4c0'][i % 4],
  })), [color]);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: -10, left: `${p.left}%`,
          width: p.size, height: p.size * 0.4, background: p.color,
          transform: `rotate(${p.rot}deg)`,
          animation: `confetti-drop ${p.dur}s ${p.delay}s linear forwards`,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  SplashScreen, LoginScreen, ConnectScreen, HomeScreen, SettingsScreen,
  TeamsScreen, FiltersScreen,
  ReadyScreen, PlayingScreen, HintsOverlay, BuzzedScreen, RevealScreen, SummaryScreen,
});
