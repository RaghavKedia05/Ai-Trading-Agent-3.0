export type Recommendation = 'Buy' | 'Hold' | 'Sell'
export type Risk = 'Low' | 'Moderate' | 'High'

export interface PricePoint {
  label: string
  value: number
}

export interface Stock {
  symbol: string
  name: string
  initials: string
  exchange: string
  sector: string
  price: number
  change: number
  recommendation: Recommendation
  target: number
  risk: Risk
  horizon: string
  confidence: number
  marketCap: number
  pe: number
  eps: number
  roe: number
  debtEquity: number
  dividendYield: number
  revenueGrowth: number
  profitGrowth: number
  volume: string
  fiftyTwoWeekHigh: number
  technicalScore: number
  fundamentalScore: number
  valuationScore: number
  riskScore: number
  rationale: string
  strengths: string[]
  risks: string[]
  priceHistory: PricePoint[]
}

export interface MarketIndex {
  name: string
  value: number
  change: number
  status: string
  history: PricePoint[]
}

export interface NewsItem {
  id: number
  category: string
  headline: string
  summary: string
  source: string
  published: string
}
