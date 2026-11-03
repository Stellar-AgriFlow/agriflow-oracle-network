import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriFlow Oracle Network | Decentralized Agricultural Feeds on Stellar & Soroban',
  description: 'Parametric agricultural commodity prices and regional weather risk indices for Web3 trade & DeFi on Stellar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0F17] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

