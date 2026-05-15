import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Demandas — Saint Germain',
  description: 'Controle de demandas e entregas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
