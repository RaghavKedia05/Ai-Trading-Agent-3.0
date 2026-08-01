import { Link } from '../router'
import stocksData from '../data/stocks.json'
import { useWatchlist } from '../state/WatchlistContext'
import type { Stock } from '../types'
import { Change, EmptyState, RecommendationBadge, WatchlistButton, money } from '../components/UI'

const stocks = stocksData as Stock[]

export function WatchlistPage() {
  const { symbols } = useWatchlist()
  const items = stocks.filter((stock) => symbols.includes(stock.symbol))
  return <div className="container-page py-10"><p className="eyebrow">Personal research</p><h1 className="mt-2 text-3xl font-bold">Your Watchlist</h1><p className="mt-2 text-sm text-slate-500">Monitor companies you want to research more closely.</p>{items.length ? <div className="card mt-7 overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Day</th><th className="px-5 py-3">Recommendation</th><th className="px-5 py-3">Confidence</th><th className="px-5 py-3">Actions</th></tr></thead><tbody>{items.map((stock) => <tr key={stock.symbol} className="border-t border-line"><td className="px-5 py-4"><p className="font-semibold">{stock.name}</p><p className="text-xs text-slate-500">{stock.symbol} · {stock.exchange}</p></td><td className="px-5 py-4 font-semibold">{money(stock.price)}</td><td className="px-5 py-4"><Change value={stock.change} /></td><td className="px-5 py-4"><RecommendationBadge value={stock.recommendation} /></td><td className="px-5 py-4">{stock.confidence}%</td><td className="px-5 py-4"><div className="flex gap-2"><Link to={`/stocks/${stock.symbol}`} className="font-semibold text-emerald">View</Link><WatchlistButton symbol={stock.symbol} compact /></div></td></tr>)}</tbody></table></div></div> : <div className="mt-7"><EmptyState title="Your watchlist is empty" message="Add stocks from recommendations, the screener, or a company analysis page." /></div>}</div>
}
