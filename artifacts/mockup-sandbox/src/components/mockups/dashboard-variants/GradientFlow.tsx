import './_group.css';

const Ic = {
  grid:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="5" height="5" rx="0.8"/><rect x="8" y="1" width="5" height="5" rx="0.8"/><rect x="1" y="8" width="5" height="5" rx="0.8"/><rect x="8" y="8" width="5" height="5" rx="0.8"/></svg>,
  globe:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="5.5"/><ellipse cx="7" cy="7" rx="2.8" ry="5.5"/><line x1="1.5" y1="7" x2="12.5" y2="7"/></svg>,
  file:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 1h5l3 3v9H3V1z"/><polyline points="8,1 8,4 11,4"/><line x1="5" y1="7" x2="9" y2="7"/><line x1="5" y1="9.5" x2="9" y2="9.5"/></svg>,
  users:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5" cy="4.5" r="2.2"/><path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4"/><path d="M9.5 4.5a2.2 2.2 0 0 1 0 4.4M11.5 12a3.2 3.2 0 0 0-2-3"/></svg>,
  chart:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><polyline points="1.5,11 5,6.5 8,8.5 12.5,3.5"/><line x1="1.5" y1="12.5" x2="12.5" y2="12.5"/></svg>,
  share:  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="11" cy="2.5" r="1.4"/><circle cx="3" cy="7" r="1.4"/><circle cx="11" cy="11.5" r="1.4"/><line x1="4.4" y1="6.2" x2="9.6" y2="3.3"/><line x1="4.4" y1="7.8" x2="9.6" y2="10.7"/></svg>,
  wallet: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="4" width="12" height="8" rx="1"/><path d="M4 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><circle cx="10.5" cy="8" r="0.9" fill="currentColor"/></svg>,
  bell:   <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 1.5a4.5 4.5 0 0 1 4.5 4.5v2.5l1 1.5H1.5L2.5 8.5V6A4.5 4.5 0 0 1 7 1.5z"/><path d="M5.5 11.5a1.5 1.5 0 0 0 3 0"/></svg>,
  plus:   <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="6.5" y1="1.5" x2="6.5" y2="11.5"/><line x1="1.5" y1="6.5" x2="11.5" y2="6.5"/></svg>,
  up:     <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1.5,7.5 5,3 8.5,7.5"/></svg>,
  down:   <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="1.5,3 5,7.5 8.5,3"/></svg>,
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
  { label: 'Revenue MTD',      value: 'R 42,800',  trend: '+12.4%',  up: true  },
  { label: 'Expenses MTD',     value: 'R 18,200',  trend: '−5.2%',   up: false },
  { label: 'Outstanding',      value: 'R 286,400', trend: '24 open', up: true  },
  { label: 'Client Retention', value: '94.2%',     trend: '+1.8pp',  up: true  },
];

const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan'];
const REV = [28,32,29,38,35,40,42.8];
const EXP = [16,18,15,20,17,19,18.2];
const MAX = 46; const W = 320; const H = 95;

function sp(data: number[], close = false) {
  const p = data.map((v,i) => [(i/(data.length-1))*W, H-(v/MAX)*H] as [number,number]);
  let d = `M ${p[0][0]},${p[0][1]}`;
  for (let i=1;i<p.length;i++){const cx=(p[i-1][0]+p[i][0])/2;d+=` C ${cx},${p[i-1][1]} ${cx},${p[i][1]} ${p[i][0]},${p[i][1]}`;}
  return close ? d+` L ${W},${H} L 0,${H} Z`:d;
}

const TXN = [
  { date:'18 Jan', ref:'INV-1042', desc:'Payment — Khumalo Ltd',    amt:'+R 8,500', dr:false },
  { date:'18 Jan', ref:'EXP-0215', desc:'Expense — Office supplies', amt:'−R 420',   dr:true  },
  { date:'17 Jan', ref:'INV-1043', desc:'Invoice — Nkosi Construct', amt:'R 12,000', dr:false },
  { date:'16 Jan', ref:'CLT-0082', desc:'New client — Sizwe Eng.',   amt:'',         dr:false },
];

const INVOICES = [
  { client:'Khumalo Ltd',     ref:'INV-1043', amt:'R 12,000', due:'23 Jan', late:false },
  { client:'Nkosi Construct', ref:'INV-1038', amt:'R 28,500', due:'10 Jan', late:true  },
  { client:'Sithole Trading', ref:'INV-1041', amt:'R 8,200',  due:'25 Jan', late:false },
  { client:'Ubuntu Freight',  ref:'INV-1039', amt:'R 15,750', due:'12 Jan', late:true  },
];

export function GradientFlow() {
  return (
    <div data-theme="nord" className="flex h-screen overflow-hidden" style={{ fontFamily:"Inter,'Segoe UI',system-ui,sans-serif", fontSize:13 }}>

      {/* ── Sidebar ── */}
      <aside className="w-[216px] shrink-0 flex flex-col bg-base-200 border-r border-base-300" style={{ animation:'dv-slideLeft 0.4s ease-out' }}>
        <div className="px-4 py-4 border-b border-base-300">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-extrabold text-sm">M</div>
            <div>
              <div className="text-base-content font-semibold text-[13px] tracking-tight">Masakhe</div>
              <div className="text-base-content/40 text-[10px] mt-0.5">Growth Hub</div>
            </div>
          </div>
        </div>

        <ul className="menu menu-sm p-2 flex-1 gap-0.5 mt-1">
          {NAV.map((n,i) => (
            <li key={i} style={{ animation:`dv-fadeUp 0.35s ease-out ${i*0.05}s both` }}>
              <a className={n.active ? 'active font-semibold' : 'text-base-content/40 hover:text-base-content/70 hover:bg-base-300/60'}>
                <span className="opacity-70">{n.icon}</span>{n.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Plan badge */}
        <div className="mx-2 mb-2 rounded-lg bg-primary/10 border border-primary/15 px-3 py-2.5">
          <div className="text-primary text-[11px] font-semibold">Pro Plan</div>
          <div className="text-base-content/40 text-[10px] mt-0.5">Renews 1 Feb 2026</div>
        </div>

        <div className="px-4 py-3 border-t border-base-300 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[11px] font-semibold">TM</div>
          <div>
            <div className="text-base-content text-xs font-medium">Thabo Mokoena</div>
            <div className="text-base-content/40 text-[10px]">Owner</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-base-100">
        <div className="flex items-center justify-between px-7 py-3 border-b border-base-300" style={{ animation:'dv-fadeIn 0.4s ease-out' }}>
          <div>
            <div className="text-base-content font-semibold tracking-tight">Overview</div>
            <div className="text-base-content/40 text-[11px] mt-0.5">January 2026 · Financial year to date</div>
          </div>
          <div className="flex gap-2 items-center">
            <button className="btn btn-sm btn-primary gap-1.5 text-xs">{Ic.plus} New Invoice</button>
            <button className="btn btn-sm btn-ghost btn-square text-base-content/50">{Ic.bell}</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          <div className="stats stats-horizontal bg-base-200 border border-base-300 rounded-xl shadow-none w-full">
            {STATS.map((s,i) => (
              <div key={i} className="stat" style={{ animation:`dv-fadeUp 0.4s ease-out ${0.1+i*0.08}s both` }}>
                <div className="stat-title text-[10px] tracking-widest uppercase font-medium">{s.label}</div>
                <div className="stat-value text-xl font-bold tracking-tight">{s.value}</div>
                <div className={`stat-desc flex items-center gap-1 font-medium ${s.up ? 'text-success' : 'text-error'}`}>
                  {s.up ? Ic.up : Ic.down} {s.trend}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 card bg-base-100 border border-base-300 shadow-none" style={{ animation:'dv-fadeUp 0.4s ease-out 0.44s both' }}>
              <div className="card-body p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-[13px] tracking-tight text-base-content">Revenue & Expenses</h3>
                    <p className="text-base-content/40 text-[11px] mt-0.5">Last 7 months</p>
                  </div>
                  <div className="flex gap-4 text-[11px] text-base-content/40">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 rounded bg-primary"/> Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0.5 rounded bg-error"/> Expenses</span>
                  </div>
                </div>
                <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height:H }}>
                  <defs>
                    <linearGradient id="nd-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5e81ac" stopOpacity="0.2"/><stop offset="100%" stopColor="#5e81ac" stopOpacity="0"/></linearGradient>
                    <linearGradient id="nd-e" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bf616a" stopOpacity="0.1"/><stop offset="100%" stopColor="#bf616a" stopOpacity="0"/></linearGradient>
                  </defs>
                  <path d={sp(EXP,true)} fill="url(#nd-e)"/>
                  <path d={sp(EXP)} fill="none" stroke="#bf616a" strokeWidth="1.5"/>
                  <path d={sp(REV,true)} fill="url(#nd-r)"/>
                  <path d={sp(REV)} fill="none" stroke="#5e81ac" strokeWidth="1.8"/>
                </svg>
                <div className="flex justify-between mt-2">
                  {MONTHS.map(m=><span key={m} className="text-base-content/30 text-[10px]">{m}</span>)}
                </div>
              </div>
            </div>

            <div className="col-span-2 card bg-base-100 border border-base-300 shadow-none" style={{ animation:'dv-fadeUp 0.4s ease-out 0.54s both' }}>
              <div className="card-body p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[13px] tracking-tight text-base-content">Pending Invoices</h3>
                  <a className="text-[11px] font-medium text-primary cursor-pointer">View all →</a>
                </div>
                <div className="flex flex-col divide-y divide-base-300">
                  {INVOICES.map((inv,i) => (
                    <div key={i} className="flex justify-between items-center py-2.5">
                      <div>
                        <div className="text-base-content text-[12px] font-medium">{inv.client}</div>
                        <div className="text-base-content/40 text-[10.5px] mt-0.5">{inv.ref} · Due {inv.due}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base-content text-[12px] font-semibold">{inv.amt}</div>
                        <div className={`text-[10px] mt-0.5 font-medium ${inv.late ? 'text-error' : 'text-base-content/40'}`}>{inv.late ? 'Overdue' : 'Pending'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-none overflow-hidden" style={{ animation:'dv-fadeUp 0.4s ease-out 0.64s both' }}>
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-base-300">
              <h3 className="font-semibold text-[13px] tracking-tight text-base-content">Recent Transactions</h3>
              <a className="text-[11px] font-medium text-primary cursor-pointer">View ledger →</a>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-base-content/40 border-base-300">
                    <th>Date</th><th>Reference</th><th>Description</th><th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {TXN.map((t,i) => (
                    <tr key={i} className="border-base-300 hover:bg-base-200/80">
                      <td className="text-base-content/50 text-xs">{t.date}</td>
                      <td className="font-mono text-[11px] text-base-content/40">{t.ref}</td>
                      <td className="text-[12px] text-base-content">{t.desc}</td>
                      <td className={`text-xs font-semibold ${t.dr ? 'text-error' : t.amt ? 'text-success' : 'text-base-content/30'}`}>{t.amt || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
