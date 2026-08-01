import { useState } from 'react'
import stocksData from '../data/stocks.json'
import type { Recommendation, Stock } from '../types'
import { StockCard } from '../components/UI'

const stocks = stocksData as Stock[]
const tabs: ('All' | Recommendation)[] = ['All', 'Buy', 'Hold', 'Sell']

export function RecommendationsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('All')
  const results = tab === 'All' ? stocks : stocks.filter((stock) => stock.recommendation === tab)
  return <div className="container-page py-10"><p className="eyebrow">Research desk</p><h1 className="mt-2 text-3xl font-bold">Stock Recommendations</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Explore transparent sample recommendations with target prices, risk levels, time horizons, confidence, and supporting analysis.</p><div className="mt-7 flex w-fit rounded-md border border-line bg-white p-1">{tabs.map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded px-5 py-2 text-sm font-semibold ${tab === item ? 'bg-navy text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{item}</button>)}</div><div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{results.map((stock) => <StockCard key={stock.symbol} stock={stock} />)}</div>{!results.length && <div className="card mt-6 py-16 text-center"><p className="font-semibold">No {tab.toLowerCase()} recommendations in the demo dataset.</p></div>}</div>
}
