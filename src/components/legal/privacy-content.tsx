"use client"

import { motion } from "framer-motion"
import Header from "@/components/landing/header"
import Footer from "@/components/shared/footer"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"

export default function PrivacyContent() {
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">
      <Header />
      <main className="container mx-auto px-4 py-16 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-8">{t.legal.privacy.title}</h1>
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.section1.title}</h2>
              <p>{t.legal.privacy.section1.content}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.section2.title}</h2>
              <p>{t.legal.privacy.section2.content}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.section3.title}</h2>
              <p>{t.legal.privacy.section3.content}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t.legal.privacy.section4.title}</h2>
              <p>{t.legal.privacy.section4.content}</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

