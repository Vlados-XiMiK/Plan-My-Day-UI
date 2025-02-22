"use client"

import { HTMLAttributes } from "react"
import { motion, MotionProps } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export default function Hero() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            {...({} as MotionDivProps)}
          >
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 dark:from-blue-400 dark:to-purple-600 filter drop-shadow-lg py-2">
              {t.hero.title}
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              {t.hero.description}
            </p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              {...({} as MotionDivProps)}
            >
              <Button
                size="lg"
                onClick={() => router.push("/auth/register")}
                className="text-base md:text-lg bg-purple-600 hover:bg-purple-700 text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-blue-600 dark:hover:from-purple-700 dark:hover:to-blue-700 border-0 px-6 py-3 w-full sm:w-auto"
              >
                {t.hero.getStartedFree}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/features")}
                className="text-base md:text-lg border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20 px-6 py-3 w-full sm:w-auto"
              >
                {t.hero.learnMore}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

