// ui.jsx — Visual primitives for Naam Bolo
// Buttons, chip toggles, waveform, mystery card art, vinyl, timer ring, etc.

// ── Bollywood-show "bulb" frame — a strip of warm bulbs around content ──
function BulbStrip({ count = 14, color = '#ffd166', glow = '#ff8c42', size = 8, gap = 18 }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: '50%', background: color,
          boxShadow: `0 0 6px ${glow}, 0 0 12px ${glow}aa, inset 0 0 2px rgba(255,255,255,0.6)`,
          animation: `bulb-pulse 1.6s ${i * 0.08}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Animated waveform bars — used during playback ──
function WaveBars({ bars = 32, height = 56, color = '#faf3e0', accent = '#ff2d6f', playing = true, intensity = 1 }) {
  // Use a stable per-bar phase
  const phases = React.useMemo(
    () => Array.from({ length: bars }).map(() => Math.random()),
    [bars],
  );
  return (
    <div style={{
      display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center',
      height, width: '100%',
    }}>
      {phases.map((p, i) => {
        const distFromCenter = Math.abs(i - bars / 2) / (bars / 2);
        const baseH = (1 - distFromCenter * 0.55) * height * 0.85;
        const grad = i % 5 === 2 ? accent : color;
        return (
          <div key={i} style={{
            width: 3,
            height: Math.max(4, baseH),
            borderRadius: 3,
            background: grad,
            opacity: 0.55 + 0.45 * (1 - distFromCenter),
            transformOrigin: 'center',
            animation: playing
              ? `wave-bar ${0.6 + p * 0.8}s ${p * 0.4}s cubic-bezier(.5,0,.5,1) infinite alternate`
              : 'none',
            // CSS var that the keyframes read, so intensity is animatable
            '--wave-min': 0.3,
            '--wave-max': 0.4 + 0.6 * intensity,
          }} />
        );
      })}
    </div>
  );
}

// ── Spinning vinyl with a question mark label ──
function VinylDisc({ size = 220, color1 = '#ff2d6f', color2 = '#ffd166', spinning = true, label = '?' }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      animation: spinning ? 'vinyl-spin 6s linear infinite' : 'none',
      filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.4))',
    }}>
      {/* outer disc */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 50%, #1a0a2e 0%, #0a0414 80%, #000 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }} />
      {/* concentric grooves */}
      {[0.92, 0.84, 0.76, 0.68, 0.6, 0.52].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', inset: `${(1 - s) * size / 2}px`,
          borderRadius: '50%',
          border: '0.5px solid rgba(255,255,255,0.04)',
        }} />
      ))}
      {/* label */}
      <div style={{
        position: 'absolute', inset: `${size * 0.32}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle at 30% 30%, ${color2}, ${color1} 80%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2), 0 0 24px rgba(255,45,111,0.4)',
      }}>
        <span style={{
          fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
          fontSize: size * 0.22, color: '#160828',
        }}>{label}</span>
      </div>
      {/* spindle */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 6, height: 6,
        background: '#160828', borderRadius: '50%', transform: 'translate(-50%, -50%)',
      }} />
      {/* sheen */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.08) 30deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.04) 210deg, transparent 240deg)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ── Mystery card — tarot-style hidden card with filigree ──
function MysteryCard({ width = 240, height = 320, color1 = '#ff2d6f', color2 = '#ffd166' }) {
  return (
    <div style={{
      width, height, position: 'relative',
      borderRadius: 16,
      background: `linear-gradient(155deg, #2a1448 0%, #4a1f6e 60%, #2a1448 100%)`,
      boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)',
      overflow: 'hidden',
      animation: 'mystery-breathe 4s ease-in-out infinite alternate',
    }}>
      {/* corner filigree */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 10, left: 10, width: 36, height: 36, opacity: 0.6 }}>
        <path d="M5 50 Q5 5 50 5 M5 30 Q5 20 20 20 M5 50 Q15 50 15 40" fill="none" stroke={color2} strokeWidth="1.5"/>
        <circle cx="50" cy="5" r="2" fill={color2}/>
      </svg>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: 10, right: 10, width: 36, height: 36, opacity: 0.6, transform: 'scaleX(-1)' }}>
        <path d="M5 50 Q5 5 50 5 M5 30 Q5 20 20 20 M5 50 Q15 50 15 40" fill="none" stroke={color2} strokeWidth="1.5"/>
        <circle cx="50" cy="5" r="2" fill={color2}/>
      </svg>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', bottom: 10, left: 10, width: 36, height: 36, opacity: 0.6, transform: 'scaleY(-1)' }}>
        <path d="M5 50 Q5 5 50 5 M5 30 Q5 20 20 20 M5 50 Q15 50 15 40" fill="none" stroke={color2} strokeWidth="1.5"/>
        <circle cx="50" cy="5" r="2" fill={color2}/>
      </svg>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', bottom: 10, right: 10, width: 36, height: 36, opacity: 0.6, transform: 'scale(-1, -1)' }}>
        <path d="M5 50 Q5 5 50 5 M5 30 Q5 20 20 20 M5 50 Q15 50 15 40" fill="none" stroke={color2} strokeWidth="1.5"/>
        <circle cx="50" cy="5" r="2" fill={color2}/>
      </svg>
      {/* center medallion */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '60%', aspectRatio: '1',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color1}55 0%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '70%', aspectRatio: '1', borderRadius: '50%',
          border: `1.5px solid ${color2}aa`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 30px ${color1}66`,
        }}>
          <span style={{
            fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
            fontSize: width * 0.34, color: color2,
            textShadow: `0 0 16px ${color1}cc`,
          }}>?</span>
        </div>
      </div>
      {/* twinkling dots */}
      {[
        { top: '15%', left: '40%' }, { top: '25%', left: '70%' },
        { top: '70%', left: '20%' }, { top: '80%', left: '60%' },
        { top: '40%', left: '12%' }, { top: '55%', left: '85%' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos, width: 4, height: 4,
          borderRadius: '50%', background: color2,
          boxShadow: `0 0 8px ${color2}`,
          animation: `twinkle 2.4s ${i * 0.3}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Cinema curtain (third anti-spoiler option) ──
function CinemaCurtains({ width = 260, height = 320 }) {
  return (
    <div style={{
      width, height, position: 'relative', overflow: 'hidden',
      borderRadius: 16,
      background: '#0a0414',
      boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
    }}>
      {/* left curtain */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%',
        background: `
          repeating-linear-gradient(90deg, #6b0e1a 0px, #8b1925 14px, #5a0a14 28px),
          linear-gradient(180deg, #4a0510 0%, #2a020a 100%)
        `,
        boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)',
        borderRight: '1px solid rgba(0,0,0,0.4)',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%',
        background: `
          repeating-linear-gradient(90deg, #6b0e1a 0px, #8b1925 14px, #5a0a14 28px),
          linear-gradient(180deg, #4a0510 0%, #2a020a 100%)
        `,
        boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.5)',
        borderLeft: '1px solid rgba(0,0,0,0.4)',
      }} />
      {/* gold trim top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 14,
        background: 'linear-gradient(180deg, #ffd166 0%, #b88714 100%)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
      }} />
      {/* center seal */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
        color: '#ffd166', fontSize: 14, letterSpacing: '0.3em',
        background: 'rgba(0,0,0,0.4)', padding: '8px 14px',
        borderRadius: 999, border: '1px solid #ffd16655',
      }}>NAAM&nbsp;BOLO</div>
    </div>
  );
}

// ── Circular timer ring ──
function TimerRing({ size = 64, progress = 0.6, color = '#ff2d6f', track = 'rgba(255,255,255,0.12)', children, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s linear' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.28, fontWeight: 700, color: '#faf3e0',
      }}>{children}</div>
    </div>
  );
}

// ── Big filmi button ──
function FilmiButton({ children, onClick, kind = 'primary', full = true, style = {} }) {
  const styles = {
    primary: {
      background: 'linear-gradient(180deg, #ff2d6f 0%, #c81d77 100%)',
      color: '#fff',
      boxShadow: '0 8px 20px rgba(255,45,111,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    gold: {
      background: 'linear-gradient(180deg, #ffd166 0%, #e6a833 100%)',
      color: '#160828',
      boxShadow: '0 8px 20px rgba(255,209,102,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
    },
    ghost: {
      background: 'transparent', color: '#faf3e0',
      boxShadow: 'inset 0 0 0 1px rgba(250,243,224,0.25)',
    },
    dark: {
      background: 'rgba(255,255,255,0.06)', color: '#faf3e0',
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
    },
  };
  return (
    <button onClick={onClick} style={{
      width: full ? '100%' : 'auto',
      height: 52,
      padding: '0 22px',
      border: 0,
      borderRadius: 16,
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: 16, fontWeight: 700,
      letterSpacing: '0.02em',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...styles[kind],
      ...style,
    }}>{children}</button>
  );
}

// ── Team avatar (geometric, no photo) ──
function TeamAvatar({ team, size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${team.color1} 0%, ${team.color2} 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
      color: '#160828', fontSize: size * 0.42, fontWeight: 600,
      boxShadow: `0 8px 16px ${team.color1}55, inset 0 1px 0 rgba(255,255,255,0.3)`,
      flexShrink: 0,
    }}>{team.emoji}</div>
  );
}

// ── Chip (era / mood selectors) ──
function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 14px', border: 0,
      borderRadius: 999,
      background: active ? 'rgba(255,209,102,0.95)' : 'rgba(255,255,255,0.06)',
      color: active ? '#160828' : '#faf3e0',
      fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: 'pointer',
      boxShadow: active ? '0 4px 10px rgba(255,209,102,0.3)' : 'inset 0 0 0 0.5px rgba(255,255,255,0.12)',
    }}>{children}</button>
  );
}

// ── Score pill ──
function ScorePill({ team, size = 'md' }) {
  const big = size === 'lg';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: big ? '8px 14px' : '6px 10px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.06)',
      boxShadow: `inset 0 0 0 0.5px ${team.color1}66`,
    }}>
      <TeamAvatar team={team} size={big ? 28 : 22} />
      <span style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: big ? 13 : 12, fontWeight: 600, color: '#faf3e0',
      }}>{team.name}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: big ? 15 : 13, fontWeight: 700, color: team.color2,
        marginLeft: 4,
      }}>{team.score}</span>
    </div>
  );
}

// ── Section header (rendered like a marquee title) ──
function SectionTitle({ children, size = 32, accent = '#ff2d6f' }) {
  return (
    <h1 style={{
      fontFamily: "'DM Serif Display', serif", fontStyle: 'italic',
      fontSize: size, fontWeight: 400, lineHeight: 1.02,
      margin: 0, color: '#faf3e0', letterSpacing: '-0.01em',
    }}>{children}</h1>
  );
}

// ── Apple Music / Spotify logo glyphs (simple, recognisable) ──
function AppleMusicLogo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22,
      background: 'linear-gradient(160deg, #fb5c74 0%, #fa233b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 14px rgba(250,35,59,0.35)',
    }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32" fill="#fff">
        <path d="M24 4v16.2a4.3 4.3 0 1 1-2.5-3.9V8.5l-9 1.7V22a4.3 4.3 0 1 1-2.5-3.9V7l14-3z"/>
      </svg>
    </div>
  );
}
function SpotifyLogo({ size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#1db954',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 6px 14px rgba(29,185,84,0.35)',
    }}>
      <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 32 32" fill="#000">
        <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm6.4 20.2c-.3.4-.8.5-1.2.3-3.3-2-7.4-2.5-12.2-1.4-.5.1-.9-.2-1-.6-.1-.5.2-.9.6-1 5.3-1.2 9.9-.7 13.6 1.6.4.3.5.8.2 1.1zm1.7-3.8c-.3.5-.9.6-1.4.4-3.8-2.3-9.5-3-13.9-1.7-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 5.1-1.5 11.4-.8 15.7 1.9.5.2.6.8.3 1.3zm.2-4c-4.5-2.7-12-3-16.3-1.6-.6.2-1.3-.2-1.5-.8-.2-.6.2-1.3.8-1.5 5-1.5 13.2-1.2 18.4 1.9.6.3.8 1.1.4 1.7-.3.5-1.1.7-1.8.3z"/>
      </svg>
    </div>
  );
}

// ── CSS keyframes block — injected once ──
const __keyframes = `
@keyframes bulb-pulse {
  from { opacity: 0.55; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1.05); }
}
@keyframes wave-bar {
  from { transform: scaleY(var(--wave-min, 0.3)); }
  to   { transform: scaleY(var(--wave-max, 1)); }
}
@keyframes vinyl-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes twinkle {
  from { opacity: 0.2; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1.2); }
}
@keyframes mystery-breathe {
  from { box-shadow: 0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 0 rgba(255,45,111,0.0); }
  to   { box-shadow: 0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 40px 4px rgba(255,45,111,0.18); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes buzz-flash {
  0%, 100% { background: rgba(255,255,255,0.04); }
  50%      { background: rgba(255,45,111,0.18); }
}
@keyframes confetti-drop {
  from { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  20%  { opacity: 1; }
  to   { transform: translateY(120vh) rotate(720deg); opacity: 0; }
}
@keyframes pulse-ring {
  0%   { transform: scale(0.7); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
`;
function KeyframesStyle() {
  return <style dangerouslySetInnerHTML={{ __html: __keyframes }} />;
}

Object.assign(window, {
  BulbStrip, WaveBars, VinylDisc, MysteryCard, CinemaCurtains,
  TimerRing, FilmiButton, TeamAvatar, Chip, ScorePill, SectionTitle,
  AppleMusicLogo, SpotifyLogo, KeyframesStyle,
});
