import { AlertCircle, BellPlus, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useRouter } from '../router'
import stocksData from '../data/stocks.json'
import newsData from '../data/news.json'
import type { NewsItem, Stock } from '../types'
import { FinancialChart, PriceChart } from '../components/Charts'
import { Change, Metric, RecommendationBadge, RiskBadge, WatchlistButton, money } from '../components/UI'

const stocks = stocksData as Stock[]
const news = newsData as NewsItem[]
const periods = ['1D', '1W', '1M', '3M', '1Y', '5Y']
const quarterly = [{ quarter: 'Q1 FY25', revenue: 258000, profit: 19100 }, { quarter: 'Q2 FY25', revenue: 264800, profit: 19650 }, { quarter: 'Q3 FY25', revenue: 267200, profit: 20310 }, { quarter: 'Q4 FY25', revenue: 273400, profit: 21620 }]

export function StockDetailsPage() {
  const { path } = useRouter()
  const symbol = path.split('/')[2]
  const stock = stocks.find((item) => item.symbol === symbol) ?? stocks[0]
  const [period, setPeriod] = useState('1Y')
  const upside = ((stock.target / stock.price) - 1) * 100
  const metrics = [
    ['Market Capitalization', `₹${(stock.marketCap / 100000).toFixed(2)}L Cr`, 'Total market value of outstanding shares'],
    ['P/E Ratio', `${stock.pe.toFixed(1)}x`, 'Price relative to earnings per share'], ['EPS', money(stock.eps), 'Profit attributable to each share'],
    ['ROE', `${stock.roe}%`, 'Profit generated from shareholder equity'], ['Debt / Equity', `${stock.debtEquity.toFixed(2)}x`, 'Debt relative to shareholder equity'],
    ['Dividend Yield', `${stock.dividendYield}%`, 'Annual dividend relative to share price'], ['Revenue Growth', `${stock.revenueGrowth}%`, 'Year-over-year revenue growth'],
    ['Profit Growth', `${stock.profitGrowth}%`, 'Year-over-year profit growth'],
  ] as const
  const peers = stocks.filter((item) => item.sector === stock.sector && item.symbol !== stock.symbol)

  return <div className="container-page py-8">
    <nav className="mb-6 flex items-center gap-1 text-xs text-slate-500"><Link to="/">Home</Link><ChevronRight size={13} /><span>Stocks</span><ChevronRight size={13} /><span className="text-ink">{stock.symbol}</span></nav>
    <section className="card overflow-hidden">
      <div className="flex flex-col justify-between gap-6 p-6 lg:flex-row lg:items-start"><div className="flex gap-4"><div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg font-extrabold text-navy">{stock.initials}</div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold sm:text-3xl">{stock.name}</h1><span className="rounded bg-emerald/5 px-2 py-1 text-[10px] font-semibold text-emerald">MARKET OPEN</span></div><p className="mt-1 text-sm text-slate-500">{stock.symbol} · {stock.exchange} · {stock.sector}</p></div></div><div className="flex flex-wrap gap-2"><WatchlistButton symbol={stock.symbol} /><button className="btn-secondary"><BellPlus size={17} /> Create Price Alert</button></div></div>
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3"><div className="bg-white p-5"><p className="data-label">Current market price</p><p className="mt-1 text-3xl font-bold">{money(stock.price)}</p><div className="mt-1"><Change value={stock.change} /></div></div><div className="bg-white p-5"><p className="data-label">Research recommendation</p><div className="mt-2"><RecommendationBadge value={stock.recommendation} /></div><p className="mt-2 text-xs text-slate-500">{stock.confidence}% confidence · {stock.horizon}</p></div><div className="bg-white p-5"><p className="data-label">Target price</p><p className="mt-1 text-2xl font-bold">{money(stock.target)}</p><p className={`mt-1 text-sm font-semibold ${upside >= 0 ? 'positive' : 'negative'}`}>{upside >= 0 ? '+' : ''}{upside.toFixed(1)}% expected return</p></div></div>
    </section>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <section className="card p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="eyebrow">Price performance</p><h2 className="mt-1 text-lg font-bold">{stock.symbol} price chart</h2></div><div className="flex rounded-md border border-line p-1">{periods.map((item) => <button key={item} onClick={() => setPeriod(item)} className={`rounded px-2.5 py-1.5 text-xs font-semibold ${period === item ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</button>)}</div></div><div className="mt-5 h-80"><PriceChart data={stock.priceHistory} /></div></section>
      <aside className="card p-5"><p className="eyebrow">Recommendation</p><div className="mt-3 flex items-center justify-between"><RecommendationBadge value={stock.recommendation} /><RiskBadge value={stock.risk} /></div><div className="mt-5 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full rounded bg-emerald" style={{ width: `${stock.confidence}%` }} /></div><div className="mt-2 flex justify-between text-xs"><span className="text-slate-500">Confidence</span><span className="font-bold">{stock.confidence}%</span></div><p className="mt-5 text-sm leading-6 text-slate-600">{stock.rationale}</p><div className="mt-5 rounded-md bg-slate-50 p-4 text-xs leading-5 text-slate-500">Sample research generated from demo fundamentals and technical indicators. Not investment advice.</div></aside>
    </div>

    <section className="mt-6"><div className="mb-4"><p className="eyebrow">Company snapshot</p><h2 className="mt-1 text-xl font-bold">Key financial metrics</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label, value, hint]) => <Metric key={label} label={label} value={value} hint={hint} />)}</div></section>

    <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Fundamental', stock.fundamentalScore], ['Technical', stock.technicalScore], ['Valuation', stock.valuationScore], ['Risk', stock.riskScore]].map(([label, score]) => <div key={label} className="card p-5"><div className="flex justify-between"><span className="text-sm font-semibold">{label} score</span><span className="font-bold">{score}/100</span></div><div className="mt-4 h-2 overflow-hidden rounded bg-slate-100"><div className="h-full rounded bg-blue-600" style={{ width: `${score}%` }} /></div></div>)}</section>

    <section className="mt-8 grid gap-6 lg:grid-cols-3"><div className="card p-6"><h2 className="flex items-center gap-2 font-bold"><CheckCircle2 size={19} className="text-emerald" /> Key strengths</h2><ul className="mt-4 space-y-3">{stock.strengths.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald" />{item}</li>)}</ul></div><div className="card p-6"><h2 className="flex items-center gap-2 font-bold"><ShieldAlert size={19} className="text-red-600" /> Key risks</h2><ul className="mt-4 space-y-3">{stock.risks.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />{item}</li>)}</ul></div><div className="card p-6"><h2 className="flex items-center gap-2 font-bold"><AlertCircle size={19} className="text-blue-600" /> Scenario view</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Bull case</span><span className="font-semibold positive">{money(stock.target * 1.08)}</span></div><div className="flex justify-between"><span className="text-slate-500">Base case</span><span className="font-semibold">{money(stock.target)}</span></div><div className="flex justify-between"><span className="text-slate-500">Bear case</span><span className="font-semibold negative">{money(stock.price * 0.82)}</span></div></div></div></section>

    <section className="mt-8 grid gap-6 xl:grid-cols-2"><div className="card p-6"><h2 className="text-lg font-bold">Quarterly performance</h2><p className="mt-1 text-xs text-slate-500">Illustrative ₹ crore values</p><div className="mt-5 h-72"><FinancialChart data={quarterly} /></div></div><div className="card overflow-hidden"><div className="p-6"><h2 className="text-lg font-bold">Peer comparison</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">P/E</th><th className="px-5 py-3">ROE</th></tr></thead><tbody>{[stock, ...peers].map((item) => <tr key={item.symbol} className="border-t border-line"><td className="px-5 py-4 font-semibold">{item.symbol}</td><td className="px-5 py-4">{money(item.price)}</td><td className="px-5 py-4">{item.pe}x</td><td className="px-5 py-4">{item.roe}%</td></tr>)}</tbody></table></div></div></section>

    <section className="mt-8"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Market context</p><h2 className="mt-1 text-xl font-bold">Recent news & analyst consensus</h2></div><span className="text-sm font-semibold text-emerald">7 Buy · 3 Hold · 1 Sell</span></div><div className="grid gap-4 md:grid-cols-3">{news.slice(0, 3).map((item) => <article className="card p-5" key={item.id}><span className="text-xs font-bold text-emerald">{item.category}</span><h3 className="mt-3 font-bold leading-6">{item.headline}</h3><p className="mt-3 text-xs text-slate-500">{item.source} · {item.published}</p></article>)}</div></section>
  </div>
}
