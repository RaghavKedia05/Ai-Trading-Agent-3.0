import { BellRing, BriefcaseBusiness, ChevronRight, Eye, Plus, Star } from 'lucide-react'
import { Link } from '../router'
import marketsData from '../data/markets.json'
import newsData from '../data/news.json'
import stocksData from '../data/stocks.json'
import { useWatchlist } from '../state/WatchlistContext'
import type { MarketIndex, NewsItem, Stock } from '../types'
import { Sparkline } from '../components/Charts'
import { Change, RecommendationBadge, SectionHeading, StockCard, money } from '../components/UI'

const stocks = stocksData as Stock[]
const markets = marketsData as MarketIndex[]
const news = newsData as NewsItem[]

export function DashboardPage() {
  const { symbols } = useWatchlist()
  const watchlist = stocks.filter((stock) => symbols.includes(stock.symbol))
  return <div className="container-page py-10"><div><p className="eyebrow">Investor workspace</p><h1 className="mt-2 text-3xl font-bold">Good morning, Raghav</h1><p className="mt-2 text-sm text-slate-500">Here is your market and research summary for today.</p></div>
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={Star} label="Watchlist" value={`${watchlist.length} stocks`} detail="2 moving higher" /><Summary icon={Eye} label="Recently viewed" value="4 companies" detail="Reliance viewed last" /><Summary icon={BellRing} label="Price alerts" value="3 active" detail="No alerts triggered" /><Summary icon={BriefcaseBusiness} label="Portfolio" value="Connect holdings" detail="Portfolio placeholder" /></section>
    <section className="mt-10"><SectionHeading eyebrow="Actionable research" title="Recommended opportunities" /><div className="grid gap-5 lg:grid-cols-3">{stocks.filter((stock) => stock.recommendation === 'Buy').slice(0, 3).map((stock) => <StockCard key={stock.symbol} stock={stock} />)}</div></section>
    <div className="mt-10 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-line p-5"><div><p className="eyebrow">Personal list</p><h2 className="mt-1 text-lg font-bold">Watchlist summary</h2></div><Link to="/watchlist" className="text-sm font-semibold text-emerald">Open watchlist</Link></div><div className="divide-y divide-line">{watchlist.map((stock) => <Link to={`/stocks/${stock.symbol}`} key={stock.symbol} className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 hover:bg-slate-50 sm:grid-cols-[1.4fr_.7fr_.7fr_auto]"><div><p className="font-semibold">{stock.name}</p><p className="text-xs text-slate-500">{stock.symbol}</p></div><div className="hidden sm:block"><p className="font-semibold">{money(stock.price)}</p><Change value={stock.change} /></div><div className="hidden sm:block"><RecommendationBadge value={stock.recommendation} /></div><ChevronRight size={17} className="text-slate-400" /></Link>)}</div></section>
      <section className="card p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Portfolio overview</p><h2 className="mt-1 text-lg font-bold">Your holdings</h2></div><BriefcaseBusiness className="text-slate-300" /></div><div className="mt-8 rounded-md border border-dashed border-slate-300 p-8 text-center"><p className="font-semibold">Portfolio connection coming soon</p><p className="mt-2 text-sm leading-6 text-slate-500">Connect or add holdings to evaluate allocation, concentration, and portfolio-level risk.</p><button className="btn-secondary mt-5"><Plus size={16} /> Add holdings</button></div></section>
    </div>
    <section className="mt-10"><SectionHeading eyebrow="Market pulse" title="Indices and sector performance" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{markets.map((market) => <div className="card p-4" key={market.name}><p className="text-sm font-semibold">{market.name}</p><div className="mt-2 flex items-end justify-between"><div><p className="text-lg font-bold">{market.value.toLocaleString('en-IN')}</p><Change value={market.change} /></div><div className="h-10 w-24"><Sparkline data={market.history} positive={market.change >= 0} /></div></div></div>)}</div><div className="card mt-5 p-5"><p className="text-sm font-bold">Sector performance</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{[['Telecom', 2.1], ['Energy', 1.4], ['Financials', .7], ['Auto', .2], ['Pharma', -.4], ['Technology', -1.1]].map(([sector, change]) => <div key={sector as string} className={`rounded-md p-4 text-center ${Number(change) >= 0 ? 'bg-emerald/10' : 'bg-red-50'}`}><p className="text-xs font-semibold text-slate-600">{sector}</p><p className={`mt-1 font-bold ${Number(change) >= 0 ? 'positive' : 'negative'}`}>{Number(change) >= 0 ? '+' : ''}{change}%</p></div>)}</div></div></section>
    <section className="mt-10"><SectionHeading eyebrow="Daily briefing" title="Market news" /><div className="grid gap-4 md:grid-cols-2">{news.slice(0, 4).map((item) => <article className="card p-5" key={item.id}><div className="flex justify-between"><span className="text-xs font-bold text-emerald">{item.category}</span><span className="text-xs text-slate-400">{item.published}</span></div><h3 className="mt-3 font-bold leading-6">{item.headline}</h3></article>)}</div></section>
  </div>
}

function Summary({ icon: Icon, label, value, detail }: { icon: typeof Star; label: string; value: string; detail: string }) { return <div className="card p-5"><div className="flex items-center justify-between"><span className="data-label">{label}</span><Icon size={19} className="text-emerald" /></div><p className="mt-3 text-xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div> }
