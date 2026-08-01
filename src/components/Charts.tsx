import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { PricePoint } from '../types'

export function Sparkline({ data, positive = true }: { data: PricePoint[]; positive?: boolean }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={positive ? '#087f5b' : '#dc2626'} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PriceChart({ data }: { data: PricePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e7ebf0" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
        <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #dfe5ec', fontSize: 12 }} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']} />
        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} fill="url(#priceFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function FinancialChart({ data }: { data: { quarter: string; revenue: number; profit: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: -12, right: 8 }}>
        <CartesianGrid stroke="#e7ebf0" vertical={false} />
        <XAxis dataKey="quarter" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #dfe5ec', fontSize: 12 }} />
        <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[3, 3, 0, 0]} />
        <Bar dataKey="profit" name="Profit" fill="#087f5b" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
