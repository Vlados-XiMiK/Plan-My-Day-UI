"use client"

import { useState, useEffect, HTMLAttributes } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, MotionProps } from "framer-motion"
import { Button } from "@/components/ui/button"
import Logo from "@/components/shared/logo"
import { ThemeLanguageToggle } from "@/components/shared/theme-language-toggle"
import { useLanguage } from "@/contexts/LanguageContext"
import { Menu } from "lucide-react"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export default function Header() {
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 0)
    })
  }, [scrollY])

  return (
    <motion.header
      className={`fixed top-0 w-full z-30 transition-all duration-300 ${
        isScrolled ? "bg-white/50 dark:bg-black/50" : "bg-transparent"
      } backdrop-blur-md`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...({} as MotionDivProps)}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo size={40} />
          <div className="hidden md:flex items-center space-x-4">
            <ThemeLanguageToggle />
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/login")}
              className="text-gray-700 hover:bg-purple-50 dark:text-white dark:hover:bg-white/10"
            >
              {t.header.signIn}
            </Button>
            <Button
              onClick={() => router.push("/auth/register")}
              className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-white/10 dark:backdrop-blur-md dark:hover:bg-white/20"
            >
              {t.header.getStarted}
            </Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white dark:bg-gray-800 py-4"
          {...({} as MotionDivProps)}
        >
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <ThemeLanguageToggle />
            <Button
              variant="ghost"
              onClick={() => {
                router.push("/auth/login")
                setIsMobileMenuOpen(false)
              }}
              className="w-full text-left text-gray-700 hover:bg-purple-50 dark:text-white dark:hover:bg-white/10"
            >
              {t.header.signIn}
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/register")
                setIsMobileMenuOpen(false)
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white dark:bg-white/10 dark:backdrop-blur-md dark:hover:bg-white/20"
            >
              {t.header.getStarted}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

