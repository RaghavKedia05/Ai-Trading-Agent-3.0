import { Link } from '../router'

export function NotFoundPage() { return <div className="container-page py-24 text-center"><p className="text-6xl font-extrabold text-slate-200">404</p><h1 className="mt-4 text-2xl font-bold">Page not found</h1><p className="mt-2 text-sm text-slate-500">The page you requested does not exist.</p><Link to="/" className="btn-primary mt-6">Return home</Link></div> }
