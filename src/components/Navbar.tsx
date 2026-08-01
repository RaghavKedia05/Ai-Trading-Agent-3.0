import { Bell, ChevronDown, Menu, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from '../router'
import stocksData from '../data/stocks.json'
import type { Stock } from '../types'

const stocks = stocksData as Stock[]
const links = [
  ['Dashboard', '/dashboard'], ['Stock Screener', '/screener'], ['Recommendations', '/recommendations'],
  ['Watchlist', '/watchlist'], ['Market News', '/news'],
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const matches = stocks.filter((stock) => `${stock.name} ${stock.symbol}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5)

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const openStock = (symbol: string) => { setQuery(''); setSearchOpen(false); setMobileOpen(false); navigate(`/stocks/${symbol}`) }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="StockWise home">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-navy text-sm font-extrabold text-white">SW</span>
          <span className="text-lg font-extrabold text-navy">StockWise</span>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
          {links.map(([label, href]) => <NavLink key={href} to={href} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-slate-100 text-navy' : 'text-slate-600 hover:text-navy'}`}>{label}</NavLink>)}
        </nav>
        <div ref={searchRef} className="relative ml-auto hidden w-full max-w-xs md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <label htmlFor="global-search" className="sr-only">Search stocks, companies, or symbols</label>
          <input id="global-search" value={query} onFocus={() => setSearchOpen(true)} onChange={(event) => { setQuery(event.target.value); setSearchOpen(true) }} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) openStock(matches[0].symbol) }} placeholder="Search stocks or symbols" className="h-10 w-full rounded-md border border-line bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-400" />
          {searchOpen && query && <div className="absolute top-12 w-full overflow-hidden rounded-md border border-line bg-white shadow-card">{matches.length ? matches.map((stock) => <button key={stock.symbol} onClick={() => openStock(stock.symbol)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"><span><span className="block text-sm font-semibold">{stock.name}</span><span className="text-xs text-slate-500">{stock.symbol} · {stock.exchange}</span></span><span className="text-xs text-slate-500">₹{stock.price.toLocaleString('en-IN')}</span></button>) : <p className="px-4 py-5 text-center text-sm text-slate-500">No matching companies</p>}</div>}
        </div>
        <button className="hidden rounded-md p-2 text-slate-600 hover:bg-slate-100 sm:block" aria-label="Notifications"><Bell size={20} /></button>
        <button className="hidden items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm font-semibold text-ink lg:flex" aria-label="Open user menu"><span className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-xs">RK</span><ChevronDown size={14} /></button>
        <Link to="/recommendations" className="btn-primary hidden 2xl:inline-flex">Get Started</Link>
        <button onClick={() => setMobileOpen((open) => !open)} className="rounded-md p-2 text-navy xl:hidden" aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
      </div>
      {mobileOpen && <div className="border-t border-line bg-white xl:hidden"><div className="container-page py-4"><div className="relative mb-4 md:hidden"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stocks" className="h-11 w-full rounded-md border border-line pl-10 pr-3 text-sm" />{query && <div className="mt-2 rounded-md border border-line">{matches.map((stock) => <button key={stock.symbol} onClick={() => openStock(stock.symbol)} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50">{stock.name} · {stock.symbol}</button>)}</div>}</div><nav className="grid gap-1">{links.map(([label, href]) => <NavLink key={href} to={href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{label}</NavLink>)}</nav></div></div>}
    </header>
  )
}
