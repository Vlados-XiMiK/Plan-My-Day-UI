'use client'

import { motion } from 'framer-motion'
import Header from '@/components/landing/header'
import Footer from '@/components/shared/footer'
import { useTranslation } from 'react-i18next'

export default function TermsContent() {
  const { t, i18n } = useTranslation('legal')

  // Debug translations
  console.log('Terms Translations:', t('terms.title'), i18n.language)

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white">
      <Header />
      <main className="container mx-auto px-4 py-16 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-bold mb-8">{t('terms.title')}</h1>
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section1.title')}</h2>
              <p>{t('terms.section1.content')}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section2.title')}</h2>
              <p>{t('terms.section2.content')}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section3.title')}</h2>
              <p>{t('terms.section3.content')}</p>
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-4">{t('terms.section4.title')}</h2>
              <p>{t('terms.section4.content')}</p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}