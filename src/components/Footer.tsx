import { Globe2, MessageCircle } from 'lucide-react'
import { Link } from '../router'

const columns = [
  { title: 'Product', links: ['Dashboard', 'Stock Screener', 'Recommendations', 'Watchlist'] },
  { title: 'Research', links: ['Market News', 'Methodology', 'Learning Centre', 'Market Calendar'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact', 'Press'] },
  { title: 'Support', links: ['Help Centre', 'Data Sources', 'Privacy Policy', 'Terms'] },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_3fr]">
          <div><Link to="/" className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-md bg-navy text-xs font-bold text-white">SW</span><span className="text-lg font-extrabold text-navy">StockWise</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">Clear, explainable market research for better-informed investment decisions.</p><div className="mt-5 flex gap-2"><a href="#" aria-label="StockWise community" className="rounded-md border border-line p-2 text-slate-500 hover:text-navy"><MessageCircle size={17} /></a><a href="#" aria-label="StockWise website" className="rounded-md border border-line p-2 text-slate-500 hover:text-navy"><Globe2 size={17} /></a></div></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">{columns.map((column) => <div key={column.title}><h3 className="text-sm font-bold text-ink">{column.title}</h3><ul className="mt-4 space-y-3">{column.links.map((item) => <li key={item}><a href="#" className="text-sm text-slate-500 hover:text-navy">{item}</a></li>)}</ul></div>)}</div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs leading-5 text-slate-500"><p><strong>Risk disclaimer:</strong> StockWise provides research and educational information only. It does not constitute investment advice. Investments in securities are subject to market risks.</p><div className="mt-4 flex flex-col justify-between gap-2 sm:flex-row"><span>© 2026 StockWise. Demo product interface.</span><span>All prices and recommendations shown are sample data.</span></div></div>
      </div>
    </footer>
  )
}
