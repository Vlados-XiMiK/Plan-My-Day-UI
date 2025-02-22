"use client"

import type React from "react"

import { useState, HTMLAttributes } from "react"
import { motion, MotionProps } from "framer-motion"
import { Calendar, ListTodo, Sparkles, Zap, Users, Bell } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import en from "@/translations/en.json"
import uk from "@/translations/uk.json"
import type { Feature, Features } from "@/types"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

// type for motion.h2
type MotionH2Props = MotionProps & HTMLAttributes<HTMLHeadingElement>

const featureIcons = {
  smartCalendar: Calendar,
  taskManagement: ListTodo,
  aiAssistant: Sparkles,
  teamCollaboration: Users,
  quickActions: Zap,
  smartNotifications: Bell,
}

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  details: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, details }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="p-6 rounded-xl bg-white dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 transition-all duration-300 border border-purple-100 dark:border-white/10 shadow-sm h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...({} as MotionDivProps)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 overflow-hidden"
          {...({} as MotionDivProps)}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">{details}</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function Features() {
  const { language } = useLanguage()
  const t = language === "uk" ? uk : en

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        {...({} as MotionH2Props)}
        >
          {t.features.title}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          {...({} as MotionDivProps)}
        >
          {Object.entries(t.features).map(([key, feature]) => {
            if (key === "title") return null
            const Icon = featureIcons[key as keyof typeof featureIcons]
            return (
              <FeatureCard
                key={key}
                icon={Icon}
                title={(feature as Feature).title}
                  description={(feature as Feature).description}
                  details={(feature as Feature).details}
              />
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

