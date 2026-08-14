import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = "https://escrowflow.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EscrowFlow — Get paid safely for freelance work, anywhere",
    template: "%s · EscrowFlow",
  },
  description:
    "EscrowFlow is a decentralized escrow platform for freelance payments on Stellar. Clients lock USDC into Soroban smart contracts, funds release automatically as milestones are approved, and freelancers withdraw to a bank, mobile money, or crypto wallet.",
  keywords: [
    "escrow",
    "freelance payments",
    "Stellar",
    "Soroban",
    "USDC",
    "smart contract escrow",
    "milestone payments",
  ],
  openGraph: {
    title: "EscrowFlow — Get paid safely for freelance work, anywhere",
    description:
      "Smart-contract escrow for freelance payments on Stellar. Lock funds, release on milestone approval, withdraw anywhere.",
    url: SITE_URL,
    siteName: "EscrowFlow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EscrowFlow — Get paid safely for freelance work, anywhere",
    description:
      "Smart-contract escrow for freelance payments on Stellar. Lock funds, release on milestone approval, withdraw anywhere.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
