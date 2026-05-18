import './_group.css';

const BARS = [
  { color: '#007A40', shadow: 'rgba(0,122,64,0.4)', delay: '0s', height: '70%' },
  { color: '#FFAA00', shadow: 'rgba(255,170,0,0.5)', delay: '0.22s', height: '100%' },
  { color: '#00008B', shadow: 'rgba(0,0,139,0.4)', delay: '0.44s', height: '55%' },
];

export function FlagStripes() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6f8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
    }}>

      {/* M mark above bars */}
      <svg width="52" height="44" viewBox="0 0 52 44" fill="none" style={{ animation: 'centerPulse 2s ease-in-out infinite' }}>
        <defs>
          <linearGradient id="mGrad2" x1="0" y1="0" x2="52" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#007A40" />
            <stop offset="100%" stopColor="#00008B" />
          </linearGradient>
        </defs>
        <path
          d="M4 40 L4 6 L26 28 L48 6 L48 40"
          stroke="url(#mGrad2)"
          strokeWidth="5.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Equalizer bars */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 10,
        height: 80,
      }}>
        {BARS.map((bar, i) => (
          <div key={i} style={{
            width: 18,
            height: '100%',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'flex-end',
          }}>
            <div style={{
              width: '100%',
              height: bar.height,
              borderRadius: 6,
              background: bar.color,
              boxShadow: `0 4px 16px ${bar.shadow}`,
              transformOrigin: 'bottom center',
              animation: `barDance 1.1s ease-in-out infinite`,
              animationDelay: bar.delay,
            }} />
          </div>
        ))}
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          color: '#1a2340',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
        }}>
          MASAKHE
        </div>
        <div style={{
          color: '#9aa0b4',
          fontSize: 10,
          letterSpacing: '0.15em',
          marginTop: 5,
          textTransform: 'uppercase',
          animation: 'stripeShimmer 1.6s ease-in-out infinite',
        }}>
          Please wait
        </div>
      </div>
    </div>
  );
}
