"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useAnimate, MotionProps } from "framer-motion"
import Header from "@/components/landing/header"
import { ChevronDown } from "lucide-react"
import Footer from "@/components/shared/footer"
import { useLanguage } from "@/contexts/LanguageContext"
import { ParallaxScroll } from "@/components/ui/parallax-scroll"
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { useTheme } from "next-themes"
import { HTMLAttributes, ButtonHTMLAttributes } from "react"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"
import type { Feature, Features, Translation } from "@/types"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

// type for motion.h1
type MotionH1Props = MotionProps & HTMLAttributes<HTMLHeadingElement>

// type for motion.p
type MotionPProps = MotionProps & HTMLAttributes<HTMLParagraphElement>

// type for motion.button
type MotionButtonProps = MotionProps & ButtonHTMLAttributes<HTMLButtonElement>

export default function FeaturesPage() {
  
  const { language } = useLanguage()
  const t: Translation = language === "uk" ? uk : en
  const mainRef = useRef<HTMLElement>(null!)
  const featuresRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: mainRef })
  const { theme } = useTheme()
  const [scope, animate] = useAnimate()

  const features = Object.entries(t.features)
    .filter(([key]) => key !== "title")
    .map(([key, feature]) => ({
      ...feature as Feature,
      color:
        key === "smartCalendar"
          ? "#ef4444"
          : key === "taskManagement"
            ? "#8b5cf6"
            : key === "aiAssistant"
              ? "#06b6d4"
              : key === "teamCollaboration"
                ? "#10b981"
                : key === "quickActions"
                  ? "#f59e0b"
                  : "#ec4899",
    }))

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50])

  const handleScrollToFeatures = () => {
    if (featuresRef.current) {
      const yOffset = -100 // Adjust this value to fine-tune the scroll position
      const y = featuresRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }

  const bounceAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse" as const,
    },
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0">
        {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
        <div className="absolute inset-0 bg-black opacity-0 dark:opacity-60 z-10"></div>
      </div>
      <div className="relative z-20">
        <Header />
        <main ref={mainRef}>
          <motion.div
            className="relative min-h-screen py-24 flex items-center justify-center"
            style={{ opacity, scale, y }}
            {...({} as MotionDivProps)}
          >
            <div className="container mx-auto px-6 md:px-8 text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400"
                {...({} as MotionH1Props)}
              >
                {t.features.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-16"
                {...({} as MotionPProps)}
              >
                {t.featuresPage.subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.button
                  onClick={handleScrollToFeatures}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  animate={bounceAnimation}
                  {...({} as MotionButtonProps)}
                >
                  <ChevronDown size={48} />
                  <span className="sr-only">Scroll to features</span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          <div ref={featuresRef}>
            <ParallaxScroll features={features} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

