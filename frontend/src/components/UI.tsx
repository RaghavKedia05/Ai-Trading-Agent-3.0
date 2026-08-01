import { Bookmark, BookmarkCheck, ChevronRight, Info } from 'lucide-react'
import { Link } from '../router'
import { useWatchlist } from '../state/WatchlistContext'
import type { Recommendation, Risk, Stock } from '../types'
import { Sparkline } from './Charts'

export const money = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

export function Change({ value }: { value: number }) {
  return <span className={`font-semibold ${value >= 0 ? 'positive' : 'negative'}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}%</span>
}

export function RecommendationBadge({ value }: { value: Recommendation }) {
  const styles: Record<Recommendation, string> = {
    Buy: 'bg-emerald/10 text-emerald', Hold: 'bg-amber-100 text-amber-800', Sell: 'bg-red-50 text-red-700',
  }
  return <span className={`inline-flex rounded px-2.5 py-1 text-xs font-bold uppercase ${styles[value]}`}>{value}</span>
}

export function RiskBadge({ value }: { value: Risk }) {
  const styles: Record<Risk, string> = {
    Low: 'text-emerald', Moderate: 'text-amber-700', High: 'text-red-700',
  }
  return <span className={`text-xs font-semibold ${styles[value]}`}>{value} risk</span>
}

export function WatchlistButton({ symbol, compact = false }: { symbol: string; compact?: boolean }) {
  const { contains, toggle } = useWatchlist()
  const active = contains(symbol)
  return (
    <button onClick={() => toggle(symbol)} aria-label={`${active ? 'Remove' : 'Add'} ${symbol} ${active ? 'from' : 'to'} watchlist`} className={compact ? 'rounded-md border border-line p-2.5 text-slate-600 hover:bg-slate-50' : 'btn-secondary flex-1'}>
      {active ? <BookmarkCheck size={17} className="text-emerald" /> : <Bookmark size={17} />}
      {!compact && <span>{active ? 'Watching' : 'Watchlist'}</span>}
    </button>
  )
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>{eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}<h2 className="section-title">{title}</h2></div>
      {action && <span className="hidden text-sm font-semibold text-emerald sm:block">{action}</span>}
    </div>
  )
}

export function Metric({ label, value, hint, change }: { label: string; value: string; hint?: string; change?: number }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">{label}{hint && <span title={hint}><Info size={13} /></span>}</div>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
      {change !== undefined && <div className="mt-1 text-xs"><Change value={change} /></div>}
    </div>
  )
}

export function StockCard({ stock }: { stock: Stock }) {
  const upside = ((stock.target / stock.price) - 1) * 100
  return (
    <article className="card card-lift flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3"><div className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-sm font-bold text-navy">{stock.initials}</div><div><h3 className="font-bold text-ink">{stock.name}</h3><p className="text-xs text-slate-500">{stock.symbol} · {stock.exchange}</p></div></div>
        <RecommendationBadge value={stock.recommendation} />
      </div>
      <div className="mt-5 flex items-end justify-between"><div><p className="text-2xl font-bold">{money(stock.price)}</p><Change value={stock.change} /></div><div className="h-12 w-24"><Sparkline data={stock.priceHistory} positive={stock.change >= 0} /></div></div>
      <div className="my-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-4 text-sm">
        <div><p className="data-label">Target</p><p className="mt-1 font-semibold">{money(stock.target)}</p></div>
        <div><p className="data-label">Potential</p><p className={upside >= 0 ? 'mt-1 font-semibold positive' : 'mt-1 font-semibold negative'}>{upside >= 0 ? '+' : ''}{upside.toFixed(1)}%</p></div>
        <div><p className="data-label">Confidence</p><p className="mt-1 font-semibold">{stock.confidence}%</p></div>
        <div><p className="data-label">Horizon</p><p className="mt-1 font-semibold">{stock.horizon}</p></div>
      </div>
      <div className="mb-4 flex items-center justify-between"><RiskBadge value={stock.risk} /><span className="text-xs text-slate-500">Demo research</span></div>
      <div className="mt-auto flex gap-2"><Link to={`/stocks/${stock.symbol}`} className="btn-primary flex-1">View analysis <ChevronRight size={16} /></Link><WatchlistButton symbol={stock.symbol} compact /></div>
    </article>
  )
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="card py-16 text-center"><Bookmark className="mx-auto text-slate-300" size={34} /><h3 className="mt-4 font-bold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{message}</p></div>
}
