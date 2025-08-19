import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Reunião online",
    description: "Reuniões leves com LiveKit e links compartilháveis",
    applicationName: "Reunião online",
    icons: { icon: "/favicon.ico" },
    manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    colorScheme: "light dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-[--background] text-[--foreground]`}>
        <div className="min-h-dvh flex flex-col">
            {children}
        </div>
        </body>
        </html>
    )
}
