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
  { label: 'Revenue MTD',     value: 'R 42,800', change: '+12%',        up: true,  grad: 'linear-gradient(135deg,#00b894,#00CC66)' },
  { label: 'Expenses MTD',    value: 'R 18,200', change: '−5%',         up: false, grad: 'linear-gradient(135deg,#e17055,#FF5B5B)' },
  { label: 'Active Invoices', value: '24',        change: '+3 new',      up: true,  grad: 'linear-gradient(135deg,#0984e3,#38AAFF)' },
  { label: 'Social Posts',    value: '38',        change: '+8 this wk',  up: true,  grad: 'linear-gradient(135deg,#f9ca24,#FFAA00)' },
];

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'];
const REV =  [28, 32, 29, 38, 35, 40, 42.8];
const EXP =  [16, 18, 15, 20, 17, 19, 18.2];
const MAX = 50; const W = 340; const H = 100;

function ptStr(data: number[]) {
  return data.map((v,i)=>`${(i/(data.length-1))*W},${H-(v/MAX)*H}`).join(' ');
}
function areaPath(data: number[]) {
  return `M ${ptStr(data).split(' ').join(' L ')} L ${W},${H} L 0,${H} Z`;
}
function linePath(data: number[]) {
  return `M ${ptStr(data).split(' ').join(' L ')}`;
}

const ACTIVITY = [
  { dot:'#00CC66', text:'Payment received — Invoice #1042', meta:'+R 8,500', time:'2h ago' },
  { dot:'#FF5B5B', text:'Expense — Office supplies',        meta:'-R 420',   time:'5h ago' },
  { dot:'#38AAFF', text:'New client — Sizwe Engineering',   meta:'',         time:'1d ago' },
  { dot:'#FFAA00', text:'Invoice #1043 — Khumalo Ltd',      meta:'R 12,000', time:'1d ago' },
];

export function GradientFlow() {
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Ubuntu','Segoe UI',sans-serif", overflow:'hidden' }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width:225, flexShrink:0,
        background:'linear-gradient(165deg,#007A40 0%,#00305A 55%,#001489 100%)',
        backgroundSize:'200% 200%',
        display:'flex', flexDirection:'column',
        animation:'dv-slideLeft 0.45s ease-out, dv-gradShift 8s ease infinite',
        position:'relative', overflow:'hidden',
      }}>
        {/* Subtle grid texture overlay */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'22px 22px', pointerEvents:'none' }}/>

        <div style={{ padding:'22px 18px 20px', borderBottom:'1px solid rgba(255,255,255,0.12)', position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:18 }}>M</div>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:14 }}>Masakhe</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Growth Hub</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'16px 10px', display:'flex', flexDirection:'column', gap:3, position:'relative' }}>
          {NAV.map((n, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:11, cursor:'pointer',
              background: n.active ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: n.active ? '#fff' : 'rgba(255,255,255,0.52)',
              fontSize:13, fontWeight: n.active ? 700 : 400,
              backdropFilter: n.active ? 'blur(6px)' : 'none',
              border: n.active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
              animation:`dv-fadeUp 0.4s ease-out ${i*0.06}s both`,
            }}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>

        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.12)', display:'flex', alignItems:'center', gap:10, position:'relative' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:800, border:'1px solid rgba(255,255,255,0.3)' }}>TM</div>
          <div>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>Thabo Mokoena</div>
            <div style={{ color:'rgba(255,255,255,0.45)', fontSize:10 }}>Pro Plan</div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={{ flex:1, background:'#F0F6FF', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'18px 28px', background:'#fff', borderBottom:'1px solid #e0eaf8', display:'flex', alignItems:'center', justifyContent:'space-between', animation:'dv-fadeIn 0.5s ease-out' }}>
          <div>
            <div style={{ color:'#0f1c3a', fontSize:19, fontWeight:800 }}>Good morning, Thabo 👋</div>
            <div style={{ color:'#7a93b8', fontSize:11, marginTop:2 }}>January 2026 · Masakhe Growth Hub</div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button style={{ padding:'9px 18px', borderRadius:9, background:'linear-gradient(135deg,#007A40,#001489)', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,122,64,0.35)' }}>+ New Invoice</button>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#e8f0fe', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🔔</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                background:'#fff', borderRadius:16, overflow:'hidden',
                boxShadow:'0 2px 12px rgba(0,50,160,0.08)',
                animation:`dv-fadeUp 0.5s ease-out ${0.2+i*0.1}s both`,
              }}>
                <div style={{ height:4, background:s.grad }}/>
                <div style={{ padding:'16px 18px' }}>
                  <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#7a93b8', fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:'#0f1c3a', margin:'7px 0 5px', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
                  <div style={{ fontSize:12, fontWeight:600, color: s.up ? '#00994D' : '#CC2200' }}>{s.up ? '▲' : '▼'} {s.change}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
            <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 2px 12px rgba(0,50,160,0.08)', animation:'dv-fadeUp 0.5s ease-out 0.6s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ color:'#0f1c3a', fontWeight:800, fontSize:14 }}>Revenue vs Expenses</div>
                <div style={{ display:'flex', gap:14, fontSize:11 }}>
                  <span style={{ color:'#00994D', fontWeight:600 }}>● Revenue</span>
                  <span style={{ color:'#CC2200', fontWeight:600 }}>● Expenses</span>
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height:100 }}>
                <defs>
                  <linearGradient id="gf-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00CC66" stopOpacity="0.2"/><stop offset="100%" stopColor="#00CC66" stopOpacity="0"/></linearGradient>
                  <linearGradient id="gf-exp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF5B5B" stopOpacity="0.14"/><stop offset="100%" stopColor="#FF5B5B" stopOpacity="0"/></linearGradient>
                </defs>
                <path d={areaPath(EXP)} fill="url(#gf-exp)"/>
                <path d={linePath(EXP)} fill="none" stroke="#FF5B5B" strokeWidth="2"/>
                <path d={areaPath(REV)} fill="url(#gf-rev)"/>
                <path d={linePath(REV)} fill="none" stroke="#00CC66" strokeWidth="2.2"/>
              </svg>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
                {MONTHS.map(m => <span key={m} style={{ color:'#b0c4de', fontSize:10 }}>{m}</span>)}
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 2px 12px rgba(0,50,160,0.08)', animation:'dv-fadeUp 0.5s ease-out 0.7s both' }}>
              <div style={{ color:'#0f1c3a', fontWeight:800, fontSize:14, marginBottom:16 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  { l:'New Invoice',   g:'linear-gradient(135deg,#007A40,#00994D)' },
                  { l:'Add Expense',   g:'linear-gradient(135deg,#C0392B,#e17055)' },
                  { l:'Schedule Post', g:'linear-gradient(135deg,#0984e3,#38AAFF)' },
                  { l:'Add Client',    g:'linear-gradient(135deg,#f39c12,#FFAA00)' },
                ].map((a,i)=>(
                  <button key={i} style={{ padding:'10px 14px', borderRadius:10, background:a.g, border:'none', color:'#fff', fontSize:12, fontWeight:700, textAlign:'left', cursor:'pointer', boxShadow:'0 3px 10px rgba(0,0,0,0.12)' }}>+ {a.l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 2px 12px rgba(0,50,160,0.08)', animation:'dv-fadeUp 0.5s ease-out 0.8s both' }}>
            <div style={{ color:'#0f1c3a', fontWeight:800, fontSize:14, marginBottom:14 }}>Recent Activity</div>
            {ACTIVITY.map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid #eef3fc' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:a.dot, flexShrink:0, boxShadow:`0 0 6px ${a.dot}80` }}/>
                  <span style={{ color:'#2d3f6a', fontSize:12 }}>{a.text}</span>
                </div>
                <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                  {a.meta && <span style={{ color:a.dot, fontWeight:700, fontSize:12 }}>{a.meta}</span>}
                  <span style={{ color:'#b0c4de', fontSize:11 }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
