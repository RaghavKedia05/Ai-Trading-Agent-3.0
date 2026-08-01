import { Activity, ArrowRight, BarChart3, BellRing, BookOpenCheck, Gauge, LineChart, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from '../router'
import marketsData from '../data/markets.json'
import newsData from '../data/news.json'
import stocksData from '../data/stocks.json'
import type { MarketIndex, NewsItem, Stock } from '../types'
import { PriceChart, Sparkline } from '../components/Charts'
import { Change, RecommendationBadge, SectionHeading, StockCard, money } from '../components/UI'

const markets = marketsData as MarketIndex[]
const stocks = stocksData as Stock[]
const news = newsData as NewsItem[]
const moverTabs = ['Top Gainers', 'Top Losers', 'Most Active', '52-Week High'] as const

export function HomePage() {
  const [moverTab, setMoverTab] = useState<(typeof moverTabs)[number]>('Top Gainers')
  const movers = useMemo(() => {
    const copy = [...stocks]
    if (moverTab === 'Top Gainers') return copy.sort((a, b) => b.change - a.change)
    if (moverTab === 'Top Losers') return copy.sort((a, b) => a.change - b.change)
    if (moverTab === '52-Week High') return copy.sort((a, b) => b.price / b.fiftyTwoWeekHigh - a.price / a.fiftyTwoWeekHigh)
    return copy.sort((a, b) => Number.parseFloat(b.volume) - Number.parseFloat(a.volume))
  }, [moverTab])

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald/20 bg-emerald/5 px-3 py-1.5 text-xs font-semibold text-emerald"><Activity size={14} /> Indian market research, simplified</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[56px]">Smarter Stock Research. Better-Informed Decisions.</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Combine company fundamentals, technical indicators, market trends, and analyst-style insights in one clear research workspace.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/recommendations" className="btn-primary">Explore Recommendations <ArrowRight size={17} /></Link><Link to="/screener" className="btn-secondary"><Search size={17} /> Open Stock Screener</Link></div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500"><span>Transparent scoring</span><span>Risk-aware research</span><span>Demo market data</span></div>
          </div>
          <div className="card overflow-hidden border-slate-300 bg-white shadow-[0_24px_60px_rgba(18,32,51,0.14)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><p className="text-xs font-semibold text-slate-500">RELIANCE · NSE</p><p className="mt-1 text-lg font-bold">Reliance Industries</p></div><RecommendationBadge value="Buy" /></div>
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4"><div className="bg-white p-4"><p className="data-label">Price</p><p className="mt-1 font-bold">₹2,984.35</p></div><div className="bg-white p-4"><p className="data-label">Day</p><p className="mt-1 font-bold positive">+1.84%</p></div><div className="bg-white p-4"><p className="data-label">Target</p><p className="mt-1 font-bold">₹3,320</p></div><div className="bg-white p-4"><p className="data-label">Confidence</p><p className="mt-1 font-bold">86%</p></div></div>
            <div className="h-64 p-4"><PriceChart data={stocks[0].priceHistory} /></div>
            <div className="grid grid-cols-3 border-t border-line px-5 py-4 text-center"><div><p className="data-label">Fundamental</p><p className="mt-1 font-bold">88/100</p></div><div className="border-x border-line"><p className="data-label">Technical</p><p className="mt-1 font-bold">82/100</p></div><div><p className="data-label">Risk</p><p className="mt-1 font-bold">Moderate</p></div></div>
          </div>
        </div>
      </section>

      <section className="container-page py-14"><SectionHeading eyebrow="Markets today" title="Market overview" action="Demo data · NSE indices" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{markets.map((market) => <article key={market.name} className="card card-lift p-5"><div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-600">{market.name}</p><p className="mt-2 text-2xl font-bold">{market.value.toLocaleString('en-IN')}</p></div><span className="h-fit rounded bg-emerald/5 px-2 py-1 text-[10px] font-semibold text-emerald">{market.status}</span></div><div className="mt-1"><Change value={market.change} /></div><div className="mt-4 h-12"><Sparkline data={market.history} positive={market.change >= 0} /></div></article>)}</div></section>

      <section className="border-y border-line bg-white py-16"><div className="container-page"><SectionHeading eyebrow="Research desk" title="Top stock recommendations" action="View all recommendations" /><div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{stocks.slice(0, 3).map((stock) => <StockCard stock={stock} key={stock.symbol} />)}</div></div></section>

      <section className="container-page py-16"><SectionHeading eyebrow="Market activity" title="Market movers" /><div className="card overflow-hidden"><div className="hide-scrollbar flex overflow-x-auto border-b border-line px-3">{moverTabs.map((tab) => <button key={tab} onClick={() => setMoverTab(tab)} className={`shrink-0 border-b-2 px-4 py-4 text-sm font-semibold ${moverTab === tab ? 'border-emerald text-emerald' : 'border-transparent text-slate-500 hover:text-ink'}`}>{tab}</button>)}</div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Change</th><th className="px-5 py-3">Volume</th><th className="px-5 py-3">52W High</th><th className="px-5 py-3">View</th></tr></thead><tbody>{movers.map((stock) => <tr key={stock.symbol} className="border-t border-line hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold">{stock.name}</p><p className="text-xs text-slate-500">{stock.symbol}</p></td><td className="px-5 py-4 font-medium">{money(stock.price)}</td><td className="px-5 py-4"><Change value={stock.change} /></td><td className="px-5 py-4">{stock.volume}</td><td className="px-5 py-4">{money(stock.fiftyTwoWeekHigh)}</td><td className="px-5 py-4"><Link to={`/stocks/${stock.symbol}`} className="font-semibold text-emerald">Analysis</Link></td></tr>)}</tbody></table></div></div></section>

      <section className="bg-navy py-16 text-white"><div className="container-page"><SectionHeading eyebrow="Research with context" title="Why investors choose StockWise" /><div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{[
        [BookOpenCheck, 'Fundamental analysis', 'Evaluate quality, growth, profitability, and balance-sheet strength.'], [LineChart, 'Technical indicators', 'Understand momentum, trend, volume, and important price levels.'], [ShieldCheck, 'Risk assessment', 'See volatility, downside factors, and risk labels before acting.'], [BarChart3, 'Analyst-style insights', 'Read concise bull, base, and bear-case research summaries.'], [Gauge, 'Market tracking', 'Monitor index direction, movers, and the latest available prices.'], [BellRing, 'Personal watchlists', 'Track companies and organize ideas around your own research process.'],
      ].map(([Icon, title, text]) => { const FeatureIcon = Icon as typeof Activity; return <div key={title as string} className="bg-navy p-7"><FeatureIcon className="text-emerald-300" size={24} /><h3 className="mt-4 font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{text as string}</p></div> })}</div></div></section>

      <section className="container-page py-16"><SectionHeading eyebrow="Research feed" title="Latest market insights" action="Explore market news" /><div className="grid gap-5 md:grid-cols-2">{news.map((item) => <article key={item.id} className="card card-lift p-6"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase text-emerald">{item.category}</span><span className="text-xs text-slate-400">{item.published}</span></div><h3 className="mt-3 text-lg font-bold leading-6">{item.headline}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p><p className="mt-5 text-xs font-semibold text-slate-500">{item.source}</p></article>)}</div></section>
    </>
  )
}
