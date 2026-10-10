import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Solana ETF Intelligence | BTC · ETH · SOL',description:'ChatGPTと実データを共有する暗号資産分析パネル。開発版。'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ja"><body style={{margin:0}}>{children}</body></html>;}
