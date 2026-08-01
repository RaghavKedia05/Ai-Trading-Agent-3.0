import { lazy, Suspense, type ReactNode } from 'react'
import { Layout } from './components/Layout'
import { useRouter } from './router'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const NewsPage = lazy(() => import('./pages/NewsPage').then((module) => ({ default: module.NewsPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })))
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then((module) => ({ default: module.RecommendationsPage })))
const ScreenerPage = lazy(() => import('./pages/ScreenerPage').then((module) => ({ default: module.ScreenerPage })))
const StockDetailsPage = lazy(() => import('./pages/StockDetailsPage').then((module) => ({ default: module.StockDetailsPage })))
const WatchlistPage = lazy(() => import('./pages/WatchlistPage').then((module) => ({ default: module.WatchlistPage })))

function LoadingScreen() {
  return <div className="container-page animate-pulse py-10"><div className="h-4 w-28 rounded bg-slate-200" /><div className="mt-4 h-9 w-80 max-w-full rounded bg-slate-200" /><div className="mt-8 grid gap-5 md:grid-cols-3"><div className="h-56 rounded-lg bg-slate-200" /><div className="h-56 rounded-lg bg-slate-200" /><div className="h-56 rounded-lg bg-slate-200" /></div></div>
}

function pageForPath(path: string): ReactNode {
  if (path === '/') return <HomePage />
  if (path === '/dashboard') return <DashboardPage />
  if (path === '/screener' || path === '/stock-screener') return <ScreenerPage />
  if (path === '/recommendations') return <RecommendationsPage />
  if (path === '/watchlist') return <WatchlistPage />
  if (path === '/news') return <NewsPage />
  if (/^\/stocks\/[^/]+$/.test(path)) return <StockDetailsPage />
  return <NotFoundPage />
}

export default function App() {
  const { path } = useRouter()
  return <Layout><Suspense fallback={<LoadingScreen />}>{pageForPath(path)}</Suspense></Layout>
}
