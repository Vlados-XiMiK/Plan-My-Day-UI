"use client"

import { motion } from "framer-motion"
import Header from "./header"
import Hero from "./hero"
import Features from "./features"
import Footer from "@/components/shared/footer"
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const { theme } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
        <div className="absolute inset-0 bg-black opacity-0 dark:opacity-60 z-10"></div>
      </div>
      <div className="relative z-20">
        <Header />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Hero />
          <Features />
        </motion.div>
        <Footer />
      </div>
    </div>
  )
}

