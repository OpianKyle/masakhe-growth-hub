import './_group.css';

const Ic = {
  grid:   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/></svg>,
  globe:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7.5" cy="7.5" r="6"/><ellipse cx="7.5" cy="7.5" rx="3" ry="6"/><line x1="1.5" y1="7.5" x2="13.5" y2="7.5"/></svg>,
  file:   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 1h6l3 3v10H3V1z"/><polyline points="9,1 9,4 12,4"/><line x1="5" y1="7" x2="10" y2="7"/><line x1="5" y1="10" x2="8" y2="10"/></svg>,
  users:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="5" r="2.5"/><path d="M1 13c0-2.5 2-4.5 4.5-4.5S10 10.5 10 13"/><path d="M10 5a2.5 2.5 0 0 1 0 5M12 13a3.5 3.5 0 0 0-2-3"/></svg>,
  chart:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><polyline points="1.5,12 5,7 8.5,9.5 13,4"/><line x1="1.5" y1="13.5" x2="13.5" y2="13.5"/></svg>,
  share:  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="3" r="1.5"/><circle cx="3" cy="7.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><line x1="4.5" y1="6.8" x2="10.5" y2="3.7"/><line x1="4.5" y1="8.2" x2="10.5" y2="11.3"/></svg>,
  wallet: <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="4" width="13" height="9" rx="1"/><path d="M4 4V2.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1V4"/><circle cx="11" cy="8.5" r="1"/></svg>,
  bell:   <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7.5 1.5a5 5 0 0 1 5 5v3l1 1.5H1.5L2.5 9.5v-3a5 5 0 0 1 5-1z"/><path d="M6 12.5a1.5 1.5 0 0 0 3 0"/></svg>,
  plus:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>,
  up:     <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,8 5.5,3.5 9,8"/></svg>,
  down:   <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,3.5 5.5,8 9,3.5"/></svg>,
};

const NAV = [
  { icon: Ic.grid,   label: 'Overview',     active: true  },
  { icon: Ic.globe,  label: 'Website',      active: false },
  { icon: Ic.file,   label: 'Invoices',     active: false },
  { icon: Ic.users,  label: 'Clients',      active: false },
  { icon: Ic.chart,  label: 'Finance',      active: false },
  { icon: Ic.share,  label: 'Social Media', active: false },
  { icon: Ic.wallet, label: 'Payroll',      active: false },
];

const STATS = [
  { label: 'Revenue',           value: 'R 42,800',  trend: '+12.4%',  up: true  },
  { label: 'Expenses',          value: 'R 18,200',  trend: '−5.2%',   up: false },
  { label: 'Outstanding Inv.',  value: 'R 286,400', trend: '24 open', up: true  },
  { label: 'Client Retention',  value: '94.2%',     trend: '+1.8pp',  up: true  },
];

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'];
const REV = [28, 32, 29, 38, 35, 40, 42.8];
const EXP = [16, 18, 15, 20, 17, 19, 18.2];
const MAX = 46; const CW = 360; const CH = 100;

function smooth(data: number[], close = false) {
  const pts = data.map((v, i) => [(i/(data.length-1))*CW, CH-(v/MAX)*CH] as [number,number]);
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1][0]+pts[i][0])/2;
    d += ` C ${cpx},${pts[i-1][1]} ${cpx},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
  }
  return close ? d+` L ${CW},${CH} L 0,${CH} Z` : d;
}

const ACTIVITY = [
  { date:'18 Jan', ref:'INV-1042', desc:'Payment — Khumalo Ltd',   amount:'+R 8,500', debit:false },
  { date:'18 Jan', ref:'EXP-0215', desc:'Office supplies',          amount:'−R 420',   debit:true  },
  { date:'17 Jan', ref:'INV-1043', desc:'Invoice — Nkosi Construct',amount:'R 12,000', debit:false },
  { date:'16 Jan', ref:'CLT-0082', desc:'New client — Sizwe Eng.',  amount:'',         debit:false },
];

/* Light sidebar, white main — reversed contrast from the other two */
const C = {
  sb:'#F4F6F8', sbActive:'#E8ECF0', sbBorder:'#E2E6EA',
  main:'#FFFFFF', hdrBorder:'#E8ECF0',
  card:'#FFFFFF', cardBorder:'#E8ECF0',
  accent:'#1E4A8C', accentDim:'rgba(30,74,140,0.07)',
  textPrimary:'#111827', textSec:'#6B7280',
  navText:'#6B7280', navActive:'#111827',
  up:'#15803D', down:'#B91C1C',
};

export function GradientFlow() {
  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:"Inter,'Segoe UI',system-ui,sans-serif", overflow:'hidden', fontSize:13 }}>

      {/* Sidebar — light */}
      <aside style={{ width:216, flexShrink:0, background:C.sb, display:'flex', flexDirection:'column', borderRight:`1px solid ${C.sbBorder}`, animation:'dv-slideLeft 0.4s ease-out' }}>
        <div style={{ padding:'20px 16px 18px', borderBottom:`1px solid ${C.sbBorder}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:C.accent, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:15, letterSpacing:'-0.5px' }}>M</div>
            <div>
              <div style={{ color:C.textPrimary, fontWeight:600, fontSize:13, letterSpacing:'-0.2px' }}>Masakhe</div>
              <div style={{ color:C.textSec, fontSize:10.5, marginTop:1 }}>Growth Hub</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {NAV.map((n, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:7, cursor:'pointer',
              background: n.active ? C.sbActive : 'transparent',
              color: n.active ? C.navActive : C.navText,
              fontWeight: n.active ? 600 : 400, fontSize:12.5,
              borderLeft: n.active ? `2px solid ${C.accent}` : '2px solid transparent',
              animation:`dv-fadeUp 0.35s ease-out ${i*0.05}s both`,
            }}>
              {n.icon}{n.label}
            </div>
          ))}
        </nav>

        {/* Plan badge */}
        <div style={{ margin:'0 8px 10px', borderRadius:8, background:C.accentDim, border:`1px solid rgba(30,74,140,0.12)`, padding:'10px 12px' }}>
          <div style={{ color:C.accent, fontSize:11, fontWeight:600 }}>Pro Plan</div>
          <div style={{ color:C.textSec, fontSize:10.5, marginTop:2 }}>Renews 1 Feb 2026</div>
        </div>

        <div style={{ padding:'12px 16px', borderTop:`1px solid ${C.sbBorder}`, display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:C.accentDim, border:`1px solid rgba(30,74,140,0.2)`, display:'flex', alignItems:'center', justifyContent:'center', color:C.accent, fontSize:11, fontWeight:700 }}>TM</div>
          <div>
            <div style={{ color:C.textPrimary, fontSize:12, fontWeight:500 }}>Thabo Mokoena</div>
            <div style={{ color:C.textSec, fontSize:10.5 }}>Owner</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, background:C.main, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'14px 28px', borderBottom:`1px solid ${C.hdrBorder}`, display:'flex', alignItems:'center', justifyContent:'space-between', animation:'dv-fadeIn 0.4s ease-out' }}>
          <div>
            <div style={{ color:C.textPrimary, fontSize:16, fontWeight:600, letterSpacing:'-0.4px' }}>Overview</div>
            <div style={{ color:C.textSec, fontSize:11.5, marginTop:2 }}>January 2026 · Financial year to date</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <button style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, background:C.accent, border:'none', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:'-0.1px' }}>{Ic.plus} New Invoice</button>
            <div style={{ width:32, height:32, borderRadius:7, border:`1px solid ${C.hdrBorder}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.textSec, cursor:'pointer' }}>{Ic.bell}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 28px', display:'flex', flexDirection:'column', gap:18 }}>

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:'16px 18px', animation:`dv-fadeUp 0.4s ease-out ${0.15+i*0.08}s both` }}>
                <div style={{ color:C.textSec, fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:500 }}>{s.label}</div>
                <div style={{ color:C.textPrimary, fontSize:22, fontWeight:700, margin:'8px 0 6px', letterSpacing:'-0.5px', fontVariantNumeric:'tabular-nums' }}>{s.value}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4, color: s.up ? C.up : C.down, fontSize:11.5, fontWeight:500 }}>
                  {s.up ? Ic.up : Ic.down}<span>{s.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + pending */}
          <div style={{ display:'grid', gridTemplateColumns:'1.55fr 1fr', gap:12 }}>
            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:'18px 22px', animation:'dv-fadeUp 0.4s ease-out 0.5s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div>
                  <div style={{ color:C.textPrimary, fontWeight:600, fontSize:13, letterSpacing:'-0.2px' }}>Revenue & Expenses</div>
                  <div style={{ color:C.textSec, fontSize:11, marginTop:2 }}>Last 7 months</div>
                </div>
                <div style={{ display:'flex', gap:14, fontSize:11, color:C.textSec }}>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:20, height:2, background:C.accent, display:'inline-block', borderRadius:2 }}/> Revenue</span>
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:20, height:2, background:C.down, display:'inline-block', borderRadius:2 }}/> Expenses</span>
                </div>
              </div>
              <svg width="100%" viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none" style={{ height:100, display:'block' }}>
                <defs>
                  <linearGradient id="gf-rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.accent} stopOpacity="0.12"/><stop offset="100%" stopColor={C.accent} stopOpacity="0"/></linearGradient>
                  <linearGradient id="gf-exp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.down} stopOpacity="0.08"/><stop offset="100%" stopColor={C.down} stopOpacity="0"/></linearGradient>
                </defs>
                <path d={smooth(EXP, true)} fill="url(#gf-exp)"/>
                <path d={smooth(EXP)} fill="none" stroke={C.down} strokeWidth="1.5"/>
                <path d={smooth(REV, true)} fill="url(#gf-rev)"/>
                <path d={smooth(REV)} fill="none" stroke={C.accent} strokeWidth="1.8"/>
              </svg>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                {MONTHS.map(m => <span key={m} style={{ color:C.textSec, fontSize:10, opacity:0.7 }}>{m}</span>)}
              </div>
            </div>

            <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, padding:'18px 22px', animation:'dv-fadeUp 0.4s ease-out 0.6s both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ color:C.textPrimary, fontWeight:600, fontSize:13, letterSpacing:'-0.2px' }}>Pending Invoices</div>
                <span style={{ fontSize:10.5, color:C.accent, fontWeight:600, cursor:'pointer' }}>View all →</span>
              </div>
              {[
                { client:'Khumalo Ltd',     ref:'INV-1043', amt:'R 12,000', due:'23 Jan', overdue:false },
                { client:'Nkosi Construct', ref:'INV-1038', amt:'R 28,500', due:'10 Jan', overdue:true  },
                { client:'Sithole Trading', ref:'INV-1041', amt:'R 8,200',  due:'25 Jan', overdue:false },
                { client:'Ubuntu Freight',  ref:'INV-1039', amt:'R 15,750', due:'12 Jan', overdue:true  },
              ].map((inv, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:`1px solid ${C.cardBorder}` }}>
                  <div>
                    <div style={{ color:C.textPrimary, fontSize:12, fontWeight:500 }}>{inv.client}</div>
                    <div style={{ color:C.textSec, fontSize:10.5, marginTop:2 }}>{inv.ref} · Due {inv.due}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ color:C.textPrimary, fontSize:12, fontWeight:600 }}>{inv.amt}</div>
                    <div style={{ fontSize:10, marginTop:2, color: inv.overdue ? C.down : C.textSec, fontWeight: inv.overdue ? 600 : 400 }}>{inv.overdue ? 'Overdue' : 'Pending'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background:C.card, border:`1px solid ${C.cardBorder}`, borderRadius:10, overflow:'hidden', animation:'dv-fadeUp 0.4s ease-out 0.7s both' }}>
            <div style={{ padding:'14px 22px', borderBottom:`1px solid ${C.cardBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ color:C.textPrimary, fontWeight:600, fontSize:13, letterSpacing:'-0.2px' }}>Recent Transactions</div>
              <span style={{ fontSize:10.5, color:C.accent, fontWeight:600, cursor:'pointer' }}>View ledger →</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F9FAFB' }}>
                  {['Date','Reference','Description','Amount'].map(h => (
                    <th key={h} style={{ padding:'8px 22px', textAlign:'left', color:C.textSec, fontSize:10.5, fontWeight:500, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVITY.map((a, i) => (
                  <tr key={i} style={{ borderTop:`1px solid ${C.cardBorder}` }}>
                    <td style={{ padding:'11px 22px', color:C.textSec, fontSize:12 }}>{a.date}</td>
                    <td style={{ padding:'11px 22px', color:C.textSec, fontSize:11.5, fontFamily:'monospace' }}>{a.ref}</td>
                    <td style={{ padding:'11px 22px', color:C.textPrimary, fontSize:12 }}>{a.desc}</td>
                    <td style={{ padding:'11px 22px', color: a.debit ? C.down : C.up, fontSize:12, fontWeight:600 }}>{a.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
