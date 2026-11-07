import type { Metadata } from "next"
import { Geist, Geist_Mono, Doto } from "next/font/google"
import { ThemeScript } from "@/components/ui/theme-switch"
import { Toaster } from "@/components/ui/toast"
import "./globals.css"

const sans = Geist({ subsets: ["latin"], variable: "--hc-font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--hc-font-mono" })
const dot = Doto({ subsets: ["latin"], weight: ["600", "800", "900"], variable: "--hc-font-dot" })

export const metadata: Metadata = { title: "Halcyon UI on Next.js" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable} ${dot.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
