import './_group.css';

const SA_RINGS = [
  { color: '#007A40', delay: '0s' },
  { color: '#FFAA00', delay: '0.8s' },
  { color: '#00008B', delay: '1.6s' },
];

export function PulseM() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
    }}>
      <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Expanding glow rings — each in its own SA flag colour */}
        {SA_RINGS.map((ring, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2.5px solid ${ring.color}`,
            animation: `ringExpand 2.4s ease-out infinite`,
            animationDelay: ring.delay,
          }} />
        ))}

        {/* Subtle inner circle */}
        <div style={{
          position: 'absolute',
          inset: 28,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,122,64,0.07) 0%, rgba(0,0,139,0.05) 100%)',
        }} />

        {/* Animated M */}
        <svg
          width="80"
          height="72"
          viewBox="0 0 80 72"
          fill="none"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <defs>
            <linearGradient id="mGrad" x1="0" y1="0" x2="80" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#007A40" />
              <stop offset="50%" stopColor="#FFAA00" />
              <stop offset="100%" stopColor="#00008B" />
            </linearGradient>
          </defs>
          <path
            d="M8 66 L8 12 L40 46 L72 12 L72 66"
            stroke="url(#mGrad)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="200"
            strokeDashoffset="200"
            style={{ animation: 'drawM 2.8s ease-in-out infinite' }}
          />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          color: '#1a2340',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.4em',
          animation: 'textPulse 2.8s ease-in-out infinite',
          textTransform: 'uppercase',
        }}>
          MASAKHE
        </div>
        <div style={{
          color: '#9aa0b4',
          fontSize: 10,
          letterSpacing: '0.2em',
          marginTop: 6,
          textTransform: 'uppercase',
        }}>
          Loading...
        </div>
      </div>
    </div>
  );
}
