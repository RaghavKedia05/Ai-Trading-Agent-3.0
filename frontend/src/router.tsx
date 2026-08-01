import { createContext, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

interface RouterValue {
  path: string
  navigate: (path: string) => void
}

const RouterContext = createContext<RouterValue | null>(null)

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(window.location.pathname)
  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const value = useMemo(() => ({
    path,
    navigate: (nextPath: string) => {
      if (nextPath === window.location.pathname) return
      window.history.pushState({}, '', nextPath)
      setPath(nextPath)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
  }), [path])
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) throw new Error('useRouter must be used within RouterProvider')
  return context
}

export function useNavigate() { return useRouter().navigate }

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> { to: string }

export function Link({ to, onClick, children, ...props }: LinkProps) {
  const navigate = useNavigate()
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...props}>{children}</a>
}

interface NavLinkProps extends Omit<LinkProps, 'className'> { className: string | ((state: { isActive: boolean }) => string) }

export function NavLink({ className, to, ...props }: NavLinkProps) {
  const { path } = useRouter()
  const isActive = path === to || (to !== '/' && path.startsWith(`${to}/`))
  return <Link to={to} className={typeof className === 'function' ? className({ isActive }) : className} {...props} />
}
