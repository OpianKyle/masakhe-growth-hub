import './_group.css';

export function PulseM() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #04111f 0%, #081c34 60%, #050d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
    }}>
      <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Expanding glow rings */}
        {[0, 0.6, 1.2].map((delay, i) => (
          <div key={i} style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(0, 170, 80, 0.5)',
            animation: `ringExpand 2.4s ease-out infinite`,
            animationDelay: `${delay}s`,
          }} />
        ))}

        {/* Background circle */}
        <div style={{
          position: 'absolute',
          inset: 24,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,122,64,0.18) 0%, rgba(0,21,148,0.12) 100%)',
          boxShadow: '0 0 40px rgba(0, 122, 64, 0.25), inset 0 0 30px rgba(0, 21, 148, 0.15)',
        }} />

        {/* Animated M */}
        <svg
          width="80"
          height="72"
          viewBox="0 0 80 72"
          fill="none"
          style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 12px rgba(0,200,100,0.6))' }}
        >
          <defs>
            <linearGradient id="mGrad" x1="0" y1="0" x2="80" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00CC66" />
              <stop offset="50%" stopColor="#00AAFF" />
              <stop offset="100%" stopColor="#0055DD" />
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

      <div style={{ textAlign: 'center', animation: 'fadeUp 0.8s ease-out forwards' }}>
        <div style={{
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.35em',
          animation: 'textPulse 2.8s ease-in-out infinite',
          textTransform: 'uppercase',
        }}>
          MASAKHE
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.35)',
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
