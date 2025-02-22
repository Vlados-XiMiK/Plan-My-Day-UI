import { Inter } from "next/font/google"
import { NotificationProvider } from '@/contexts/notification-context'
import { ThemeProvider } from "@/components/theme-provider"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { LightAnimatedBackground } from "@/components/ui/animated-background"
import { LanguageProvider } from "@/contexts/LanguageContext"
import "./globals.css"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
      <NotificationProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            <div className="relative">
              <div className="dark:hidden">
                <LightAnimatedBackground />
              </div>
              <div className="hidden dark:block">
                <AnimatedBackground />
              </div>
              <div className="relative z-10">{children}</div>
            </div>
          </LanguageProvider>
        </ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}

