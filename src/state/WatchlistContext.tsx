import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface WatchlistValue {
  symbols: string[]
  toggle: (symbol: string) => void
  contains: (symbol: string) => boolean
}

const WatchlistContext = createContext<WatchlistValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [symbols, setSymbols] = useState<string[]>(['RELIANCE', 'ICICIBANK'])
  const value = useMemo(
    () => ({
      symbols,
      toggle: (symbol: string) =>
        setSymbols((current) =>
          current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol],
        ),
      contains: (symbol: string) => symbols.includes(symbol),
    }),
    [symbols],
  )
  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider')
  return context
}
