const SA_RINGS = [
  { color: '#007A40', delay: '0s' },
  { color: '#FFAA00', delay: '0.8s' },
  { color: '#00008B', delay: '1.6s' },
];

const KEYFRAMES = `
@keyframes masakhe-ring-expand {
  0%   { transform: scale(0.9); opacity: 0.7; }
  100% { transform: scale(2.4); opacity: 0; }
}
@keyframes masakhe-draw-m {
  0%, 5%   { stroke-dashoffset: 200; }
  45%, 55% { stroke-dashoffset: 0; }
  95%, 100%{ stroke-dashoffset: 200; }
}
`;

export function MasakheLoader() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: "'Ubuntu', 'Segoe UI', sans-serif",
      }}>
        <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {SA_RINGS.map((ring, i) => (
            <div key={i} style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2.5px solid ${ring.color}`,
              animation: `masakhe-ring-expand 2.4s ease-out infinite`,
              animationDelay: ring.delay,
            }} />
          ))}

          <div style={{
            position: 'absolute',
            inset: 28,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,122,64,0.07) 0%, rgba(0,0,139,0.05) 100%)',
          }} />

          <svg width="80" height="72" viewBox="0 0 80 72" fill="none" style={{ position: 'relative', zIndex: 1 }}>
            <defs>
              <linearGradient id="masakhe-m-grad" x1="0" y1="0" x2="80" y2="72" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="#00CC66" />
                <stop offset="50%"  stopColor="#00AAFF" />
                <stop offset="100%" stopColor="#0055DD" />
              </linearGradient>
            </defs>
            <path
              d="M8 66 L8 12 L40 46 L72 12 L72 66"
              stroke="url(#masakhe-m-grad)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="200"
              strokeDashoffset="200"
              style={{ animation: 'masakhe-draw-m 2.8s ease-in-out infinite' }}
            />
          </svg>
        </div>
      </div>
    </>
  );
}
