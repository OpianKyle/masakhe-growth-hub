import './_group.css';

const FLAG_STRIPE = ['#000000','#FFB612','#007A40','#FFFFFF','#001489','#E03C31'];

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
  { label: 'Revenue MTD',    value: 'R 42,800', sub: '+12% vs last month', color: '#007A40', bg: '#edf7f1' },
  { label: 'Expenses MTD',   value: 'R 18,200', sub: '−5% vs last month',  color: '#C0392B', bg: '#fdf1f0' },
  { label: 'Active Invoices',value: '24',        sub: '3 new this week',    color: '#1a56db', bg: '#eff5ff' },
  { label: 'Social Posts',   value: '38',        sub: '8 posted this week', color: '#D4960A', bg: '#fef9ed' },
];

const BAR_DATA = [
  { label:'Jul', rev:56, exp:32 },
  { label:'Aug', rev:64, exp:36 },
  { label:'Sep', rev:58, exp:30 },
  { label:'Oct', rev:76, exp:40 },
  { label:'Nov', rev:70, exp:34 },
  { label:'Dec', rev:80, exp:38 },
  { label:'Jan', rev:86, exp:36 },
];

const ACTIVITY = [
  { icon:'💚', text:'Payment received — Invoice #1042', amount:'+R 8,500', time:'2h ago', color:'#007A40' },
  { icon:'🔴', text:'Expense — Office supplies',        amount:'-R 420',   time:'5h ago', color:'#C0392B' },
  { icon:'🔵', text:'New client — Sizwe Engineering',   amount:'',         time:'1d ago', color:'#1a56db' },
  { icon:'🟡', text:'Invoice #1043 sent — Khumalo Ltd', amount:'R 12,000', time:'1d ago', color:'#D4960A' },
];

export function EarthyBold() {
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"'Ubuntu','Segoe UI',sans-serif", overflow:'hidden' }}>

      {/* ─── Sidebar ─── */}
      <aside style={{
        width:230, flexShrink:0, background:'#002510',
        display:'flex', flexDirection:'column', overflow:'hidden',
        animation:'dv-slideLeft 0.45s ease-out',
      }}>
        {/* SA Flag stripe */}
        <div style={{ display:'flex', height:5 }}>
          {FLAG_STRIPE.map((c,i) => <div key={i} style={{ flex:1, background:c }}/>)}
        </div>

        {/* Logo */}
        <div style={{ padding:'20px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:11 }}>
            <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#00CC66,#FFB612)', display:'flex', alignItems:'center', justifyContent:'center', color:'#002510', fontWeight:900, fontSize:18 }}>M</div>
            <div>
              <div style={{ color:'#fff', fontWeight:800, fontSize:15, letterSpacing:'0.01em' }}>Masakhe</div>
              <div style={{ color:'rgba(255,255,255,0.45)', fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase' }}>Growth Hub</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {NAV.map((n, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:11, padding:'11px 13px', borderRadius:10, cursor:'pointer',
              background: n.active ? 'rgba(255,182,18,0.15)' : 'transparent',
              borderLeft: n.active ? '3px solid #FFB612' : '3px solid transparent',
              color: n.active ? '#FFB612' : 'rgba(255,255,255,0.5)',
              fontSize:13, fontWeight: n.active ? 700 : 400,
              animation:`dv-fadeUp 0.4s ease-out ${i*0.07}s both`,
            }}>
              <span>{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>

        <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#FFB612', display:'flex', alignItems:'center', justifyContent:'center', color:'#002510', fontSize:12, fontWeight:800 }}>TM</div>
          <div>
            <div style={{ color:'#fff', fontSize:12, fontWeight:700 }}>Thabo Mokoena</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>Pro Plan</div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main style={{ flex:1, background:'#F5F0E8', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'20px 30px', background:'#fff', borderBottom:'1px solid #e8e2d8', display:'flex', alignItems:'center', justifyContent:'space-between', animation:'dv-fadeIn 0.5s ease-out' }}>
          <div>
            <div style={{ color:'#1a2e1a', fontSize:20, fontWeight:800 }}>Good morning, Thabo 👋</div>
            <div style={{ color:'#8a8070', fontSize:12, marginTop:2 }}>January 2026 · Masakhe Growth Hub</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ padding:'9px 18px', borderRadius:8, background:'#007A40', border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>+ New Invoice</button>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#edf7f1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>🔔</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'24px 30px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                background:'#fff', borderRadius:16, padding:'20px 22px',
                boxShadow:'0 1px 4px rgba(0,0,0,0.07)', borderLeft:`4px solid ${s.color}`,
                animation:`dv-fadeUp 0.5s ease-out ${0.2+i*0.1}s both`,
              }}>
                <div style={{ fontSize:10, textTransform:'uppercase', letterSpacing:'0.1em', color:'#8a8070', fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:26, fontWeight:900, color:'#1a2e1a', margin:'8px 0 5px', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
                <div style={{ fontSize:12, color:s.color, fontWeight:600 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
            {/* Bar chart */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', animation:'dv-fadeUp 0.5s ease-out 0.6s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div style={{ color:'#1a2e1a', fontWeight:800, fontSize:14 }}>Monthly Overview</div>
                <div style={{ display:'flex', gap:14, fontSize:11 }}>
                  <span style={{ color:'#007A40', fontWeight:600 }}>● Revenue</span>
                  <span style={{ color:'#C0392B', fontWeight:600 }}>● Expenses</span>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
                {BAR_DATA.map((d, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <div style={{ width:'100%', display:'flex', gap:2, alignItems:'flex-end', height:90 }}>
                      <div style={{ flex:1, background:'#007A40', borderRadius:'3px 3px 0 0', height:`${d.rev}%`, transformOrigin:'bottom', animation:`dv-barGrow 0.6s ease-out ${i*0.07}s both` }}/>
                      <div style={{ flex:1, background:'#C0392B', borderRadius:'3px 3px 0 0', height:`${d.exp}%`, transformOrigin:'bottom', animation:`dv-barGrow 0.6s ease-out ${i*0.07+0.05}s both` }}/>
                    </div>
                    <span style={{ color:'#8a8070', fontSize:9 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', animation:'dv-fadeUp 0.5s ease-out 0.7s both' }}>
              <div style={{ color:'#1a2e1a', fontWeight:800, fontSize:14, marginBottom:16 }}>Quick Actions</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[['New Invoice','#007A40'],['Add Expense','#C0392B'],['Schedule Post','#1a56db'],['Add Client','#D4960A']].map(([l,c],i)=>(
                  <button key={i} style={{ padding:'11px 14px', borderRadius:10, background:c as string, border:'none', color:'#fff', fontSize:12, fontWeight:700, textAlign:'left', cursor:'pointer' }}>+ {l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity */}
          <div style={{ background:'#fff', borderRadius:16, padding:'20px 24px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', animation:'dv-fadeUp 0.5s ease-out 0.8s both' }}>
            <div style={{ color:'#1a2e1a', fontWeight:800, fontSize:14, marginBottom:14 }}>Recent Activity</div>
            {ACTIVITY.map((a,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 0', borderBottom:'1px solid #f0ece4' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:16 }}>{a.icon}</span>
                  <span style={{ color:'#3d3328', fontSize:13 }}>{a.text}</span>
                </div>
                <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                  {a.amount && <span style={{ color:a.color, fontWeight:700, fontSize:13 }}>{a.amount}</span>}
                  <span style={{ color:'#8a8070', fontSize:11 }}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
