import './_group.css';

const DOTS = [
  { color: '#007A40', glowColor: 'rgba(0,122,64,0.6)', angleDeg: -90 },
  { color: '#FFAA00', glowColor: 'rgba(255,170,0,0.65)', angleDeg: 30 },
  { color: '#00008B', glowColor: 'rgba(0,0,139,0.55)', angleDeg: 150 },
];

export function OrbitDots() {
  const orbitRadius = 58;
  const containerSize = 200;
  const cx = containerSize / 2;
  const cy = containerSize / 2;
  const dotSize = 14;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 36,
      fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
    }}>

      {/* Orbit area */}
      <div style={{ position: 'relative', width: containerSize, height: containerSize }}>

        {/* Subtle orbit ring guide */}
        <div style={{
          position: 'absolute',
          top: cy - orbitRadius,
          left: cx - orbitRadius,
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          borderRadius: '50%',
          border: '1px dashed rgba(0,0,0,0.08)',
        }} />

        {/* Spinning dot group */}
        <div style={{
          position: 'absolute',
          inset: 0,
          animation: 'spinOrbit 2.2s linear infinite',
        }}>
          {DOTS.map((dot, i) => {
            const rad = (dot.angleDeg * Math.PI) / 180;
            const x = cx + orbitRadius * Math.cos(rad) - dotSize / 2;
            const y = cy + orbitRadius * Math.sin(rad) - dotSize / 2;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  background: dot.color,
                  boxShadow: `0 0 10px ${dot.glowColor}, 0 0 20px ${dot.glowColor}`,
                  animation: `dotGlow 2.2s ease-in-out infinite`,
                  animationDelay: `${-i * (2.2 / 3)}s`,
                }}
              />
            );
          })}
        </div>

        {/* Central M */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'centerPulse 2.2s ease-in-out infinite',
        }}>
          <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
            <defs>
              <linearGradient id="mGrad3" x1="0" y1="0" x2="56" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#007A40" />
                <stop offset="50%" stopColor="#0066CC" />
                <stop offset="100%" stopColor="#00008B" />
              </linearGradient>
            </defs>
            <path
              d="M5 43 L5 7 L28 30 L51 7 L51 43"
              stroke="url(#mGrad3)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          color: '#0f1a2e',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
        }}>
          MASAKHE
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          marginTop: 8,
        }}>
          {[0, 0.3, 0.6].map((delay, i) => (
            <div key={i} style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: DOTS[i].color,
              animation: `dotGlow 1s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
