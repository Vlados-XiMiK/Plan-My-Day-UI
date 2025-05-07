"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} enableSystem={true} attribute="class">
      <div className="min-h-screen bg-background font-sans antialiased">{children}</div>
    </NextThemesProvider>
  )
}

