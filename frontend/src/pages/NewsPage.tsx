import newsData from '../data/news.json'
import type { NewsItem } from '../types'

const news = newsData as NewsItem[]

export function NewsPage() {
  return <div className="container-page py-10"><p className="eyebrow">Research feed</p><h1 className="mt-2 text-3xl font-bold">Market News & Insights</h1><p className="mt-2 text-sm text-slate-500">Concise market context from the StockWise demo research desk.</p><div className="mt-7 grid gap-5 lg:grid-cols-2">{[...news, ...news.map((item) => ({ ...item, id: item.id + 10, published: 'Yesterday' }))].map((item) => <article key={item.id} className="card card-lift p-6"><div className="flex justify-between"><span className="text-xs font-bold uppercase text-emerald">{item.category}</span><span className="text-xs text-slate-400">{item.published}</span></div><h2 className="mt-3 text-lg font-bold leading-7">{item.headline}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p><p className="mt-5 text-xs font-semibold text-slate-500">{item.source}</p></article>)}</div></div>
}
