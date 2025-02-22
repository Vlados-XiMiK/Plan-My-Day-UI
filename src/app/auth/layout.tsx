'use client'

import type React from "react"
import Logo from "@/components/shared/logo"
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { ThemeLanguageToggle } from "@/components/shared/theme-language-toggle"
import { useTheme } from "next-themes"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1a2e] relative overflow-hidden">
      <div className="absolute inset-0">{theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}</div>
      <div className="w-full max-w-lg p-6 bg-white dark:bg-[#16213e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-6">
          <Logo size={48} />
          <ThemeLanguageToggle />
        </div>
        {children}
      </div>
    </div>
  )
}

