import { Filter, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from '../router'
import stocksData from '../data/stocks.json'
import type { Recommendation, Risk, Stock } from '../types'
import { Change, RecommendationBadge, RiskBadge, money } from '../components/UI'

const stocks = stocksData as Stock[]

export function ScreenerPage() {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All')
  const [recommendation, setRecommendation] = useState('All')
  const [risk, setRisk] = useState('All')
  const [maxPe, setMaxPe] = useState(80)
  const [minRoe, setMinRoe] = useState(0)
  const sectors = ['All', ...new Set(stocks.map((stock) => stock.sector))]
  const filtered = useMemo(() => stocks.filter((stock) =>
    `${stock.name} ${stock.symbol}`.toLowerCase().includes(query.toLowerCase()) &&
    (sector === 'All' || stock.sector === sector) && (recommendation === 'All' || stock.recommendation === recommendation) &&
    (risk === 'All' || stock.risk === risk) && stock.pe <= maxPe && stock.roe >= minRoe,
  ), [query, sector, recommendation, risk, maxPe, minRoe])
  const reset = () => { setQuery(''); setSector('All'); setRecommendation('All'); setRisk('All'); setMaxPe(80); setMinRoe(0) }

  return <div className="container-page py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Find opportunities</p><h1 className="mt-2 text-3xl font-bold">Stock Screener</h1><p className="mt-2 text-sm text-slate-500">Filter demo Indian companies by quality, valuation, growth, recommendation, and risk.</p></div><span className="rounded bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Demo dataset · {stocks.length} companies</span></div>
    <section className="card mt-7 p-5"><div className="mb-5 flex items-center justify-between"><h2 className="flex items-center gap-2 font-bold"><Filter size={18} /> Filters</h2><button onClick={reset} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-ink"><RotateCcw size={14} /> Reset</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><label className="text-xs font-semibold text-slate-600"><span>Company or symbol</span><div className="relative mt-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-md border border-line pl-9 pr-3 text-sm" placeholder="Search companies" /></div></label><Select label="Sector" value={sector} onChange={setSector} options={sectors} /><Select label="Recommendation" value={recommendation} onChange={setRecommendation} options={['All', 'Buy', 'Hold', 'Sell']} /><Select label="Risk level" value={risk} onChange={setRisk} options={['All', 'Low', 'Moderate', 'High']} /><Range label={`Maximum P/E: ${maxPe}x`} value={maxPe} min={10} max={100} onChange={setMaxPe} /><Range label={`Minimum ROE: ${minRoe}%`} value={minRoe} min={0} max={50} onChange={setMinRoe} /></div></section>
    <section className="card mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-line p-5"><div><h2 className="font-bold">Screening results</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} companies match your filters</p></div><select aria-label="Sort results" className="rounded-md border border-line px-3 py-2 text-sm"><option>Market cap: High to low</option><option>Upside: High to low</option><option>ROE: High to low</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Day</th><th className="px-5 py-3">Market Cap</th><th className="px-5 py-3">P/E</th><th className="px-5 py-3">ROE</th><th className="px-5 py-3">Recommendation</th><th className="px-5 py-3">Risk</th><th className="px-5 py-3">Action</th></tr></thead><tbody>{filtered.map((stock) => <tr key={stock.symbol} className="border-t border-line hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold">{stock.name}</p><p className="text-xs text-slate-500">{stock.symbol} · {stock.sector}</p></td><td className="px-5 py-4 font-medium">{money(stock.price)}</td><td className="px-5 py-4"><Change value={stock.change} /></td><td className="px-5 py-4">₹{(stock.marketCap / 100000).toFixed(1)}L Cr</td><td className="px-5 py-4">{stock.pe}x</td><td className="px-5 py-4">{stock.roe}%</td><td className="px-5 py-4"><RecommendationBadge value={stock.recommendation as Recommendation} /></td><td className="px-5 py-4"><RiskBadge value={stock.risk as Risk} /></td><td className="px-5 py-4"><Link to={`/stocks/${stock.symbol}`} className="font-semibold text-emerald">View Analysis</Link></td></tr>)}</tbody></table></div>{!filtered.length && <div className="py-16 text-center"><p className="font-semibold">No companies match these filters</p><button onClick={reset} className="mt-2 text-sm font-semibold text-emerald">Clear filters</button></div>}<div className="flex justify-between border-t border-line p-4 text-xs text-slate-500"><span>Page 1 of 1</span><span>Showing {filtered.length} results</span></div></section>
  </div>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="text-xs font-semibold text-slate-600"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select></label> }
function Range({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) { return <label className="text-xs font-semibold text-slate-600"><span>{label}</span><input type="range" value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} className="mt-4 w-full accent-emerald" /></label> }
