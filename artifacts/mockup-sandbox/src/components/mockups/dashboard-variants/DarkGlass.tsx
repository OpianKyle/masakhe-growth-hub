import './_group.css';

const NAV = [
  { icon: '⬡', label: 'Overview',     active: true  },
  { icon: '🌐', label: 'Website',      active: false },
  { icon: '📄', label: 'Invoices',     active: false },
  { icon: '👥', label: 'Clients',      active: false },
  { icon: '💰', label: 'Finance',      active: false },
  { icon: '📱', label: 'Social Media', active: false },
  { icon: '👔', label: 'Payroll',      active: false },
];

const STATS = [
  { label: 'Revenue MTD',    value: 'R 42,800', change: '▲ 12%',       color: '#00CC66' },
  { label: 'Expenses MTD',   value: 'R 18,200', change: '▼ 5%',        color: '#FF5B5B' },
  { label: 'Active Invoices',value: '24',        change: '+3 new',      color: '#38AAFF' },
  { label: 'Social Posts',   value: '38',        change: '+8 this week', color: '#FFAA00' },
];

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'];
const REV =  [28, 32, 29, 38, 35, 40, 42.8];
const EXP =  [16, 18, 15, 20, 17, 19, 18.2];
const MAX = 50;
const W = 360; const H = 110;

function pts(data: number[]) {
  return data.map((v, i) => `${(i / (data.length - 1)) * W},${H - (v / MAX) * H}`).join(' ');
}
function area(data: number[]) {
  return `M ${pts(data).split(' ').join(' L ')} L ${W},${H} L 0,${H} Z`;
}
function line(data: number[]) {
  return `M ${pts(data).split(' ').join(' L ')}`;
}

const ACTIVITY = [
  { dot: '#00CC66', text: 'Payment received — Invoice #1042', meta: '+R 8,500', time: '2h ago' },
  { dot: '#FF5B5B', text: 'Expense added — Office supplies',  meta: '-R 420',   time: '5h ago' },
  { dot: '#38AAFF', text: 'New client — Sizwe Engineering',   meta: '',         time: '1d ago' },
  { dot: '#FFAA00', text: 'Invoice sent — #1043 Khumalo Ltd', meta: 'R 12,000', time: '1d ago' },
];

export function DarkGlass() {
  return (
    <div style={{ display:'flex', height:'100vh', background:'#060d1c', fontFamily:"'Ubuntu','Segoe UI',sans-serif", overflow:'hidden' }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width:220, flexShrink:0, display:'flex', flexDirection:'column',
        background:'rgba(255,255,255,0.028)', borderRight:'1px solid rgba(255,255,255,0.065)',
        animation:'dv-slideLeft 0.45s ease-out',
      }}>
        <div style={{ padding:'22px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.055)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
              background:'linear-gradient(135deg,#00CC66,#0055DD)', color:'#fff', fontWeight:800, fontSize:16,
              animation:'dv-glow 2.5s ease-in-out infinite',
            }}>M</div>
            <div>
              <div style={{ color:'#e4ecff', fontWeight:700, fontSize:13 }}>Masakhe</div>
              <div style={{ color:'rgba(228,236,255,0.38)', fontSize:10 }}>Growth Hub</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'14px 10px', display:'flex', flexDirection:'column', gap:3 }}>
          {NAV.map((n, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, cursor:'pointer',
              background: n.active ? 'rgba(0,204,102,0.11)' : 'transparent',
              borderLeft: n.active ? '3px solid #00CC66' : '3px solid transparent',
              color: n.active ? '#00CC66' : 'rgba(228,236,255,0.45)',
              fontSize:13, fontWeight: n.active ? 600 : 400,
              animation:`dv-fadeUp 0.4s ease-out ${i*0.06}s both`,
            }}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>

        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.055)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#007A40,#00008B)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:11, fontWeight:700 }}>TM</div>
          <div>
            <div style={{ color:'#e4ecff', fontSize:11, fontWeight:600 }}>Thabo Mokoena</div>
            <div style={{ color:'rgba(228,236,255,0.35)', fontSize:10 }}>Pro Plan</div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'18px 28px', borderBottom:'1px solid rgba(255,255,255,0.055)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.018)', animation:'dv-fadeIn 0.5s ease-out' }}>
          <div>
            <div style={{ color:'#e4ecff', fontSize:18, fontWeight:700 }}>Good morning, Thabo 👋</div>
            <div style={{ color:'rgba(228,236,255,0.38)', fontSize:11, marginTop:2 }}>January 2026 · Masakhe Growth Hub</div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button style={{ padding:'8px 16px', borderRadius:8, background:'rgba(0,204,102,0.14)', border:'1px solid rgba(0,204,102,0.28)', color:'#00CC66', fontSize:12, cursor:'pointer', fontWeight:600 }}>+ New Invoice</button>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(255,255,255,0.055)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🔔</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.045)', border:'1px solid rgba(255,255,255,0.07)',
                borderTop:`2.5px solid ${s.color}`, borderRadius:14, padding:'16px 18px',
                animation:`dv-fadeUp 0.5s ease-out ${0.2+i*0.1}s both`,
              }}>
                <div style={{ color:'rgba(228,236,255,0.4)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
                <div style={{ color:'#e4ecff', fontSize:22, fontWeight:800, margin:'7px 0 5px', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
                <div style={{ color:s.color, fontSize:12, fontWeight:600 }}>{s.change}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 22px', animation:'dv-fadeUp 0.5s ease-out 0.6s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ color:'#e4ecff', fontWeight:600, fontSize:13 }}>Revenue vs Expenses</div>
                <div style={{ display:'flex', gap:14, fontSize:11 }}>
                  <span style={{ color:'#00CC66' }}>● Revenue</span>
                  <span style={{ color:'#FF5B5B' }}>● Expenses</span>
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height:110 }}>
                <defs>
                  <linearGradient id="dg-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00CC66" stopOpacity="0.28"/><stop offset="100%" stopColor="#00CC66" stopOpacity="0"/></linearGradient>
                  <linearGradient id="dg-exp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF5B5B" stopOpacity="0.18"/><stop offset="100%" stopColor="#FF5B5B" stopOpacity="0"/></linearGradient>
                </defs>
                <path d={area(EXP)} fill="url(#dg-exp)"/>
                <path d={line(EXP)} fill="none" stroke="#FF5B5B" strokeWidth="1.8"/>
                <path d={area(REV)} fill="url(#dg-rev)"/>
                <path d={line(REV)} fill="none" stroke="#00CC66" strokeWidth="2"/>
              </svg>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                {MONTHS.map(m => <span key={m} style={{ color:'rgba(228,236,255,0.28)', fontSize:10 }}>{m}</span>)}
              </div>
            </div>

            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 22px', animation:'dv-fadeUp 0.5s ease-out 0.7s both' }}>
              <div style={{ color:'#e4ecff', fontWeight:600, fontSize:13, marginBottom:14 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {[['New Invoice','#00CC66'],['Add Expense','#FF5B5B'],['Schedule Post','#38AAFF'],['Add Client','#FFAA00']].map(([l,c],i)=>(
                  <button key={i} style={{ padding:'9px 13px', borderRadius:9, background:`${c}18`, border:`1px solid ${c}30`, color:c, fontSize:12, fontWeight:600, textAlign:'left', cursor:'pointer' }}>→ {l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'18px 22px', animation:'dv-fadeUp 0.5s ease-out 0.8s both' }}>
            <div style={{ color:'#e4ecff', fontWeight:600, fontSize:13, marginBottom:12 }}>Recent Activity</div>
            {ACTIVITY.map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:a.dot, flexShrink:0 }}/>
                  <span style={{ color:'rgba(228,236,255,0.65)', fontSize:12 }}>{a.text}</span>
                </div>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  {a.meta && <span style={{ color:a.dot, fontSize:12, fontWeight:600 }}>{a.meta}</span>}
                  <span style={{ color:'rgba(228,236,255,0.28)', fontSize:11 }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
