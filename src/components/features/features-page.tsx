"use client"

import { useRef, useState, useCallback, HTMLAttributes } from "react"
import { motion, useScroll, useTransform, AnimatePresence, MotionProps } from "framer-motion"
import Image from "next/image"
import Header from "@/components/landing/header"
import Footer from "@/components/shared/footer"
import { useTranslation } from "react-i18next"
import { AnimatedBackground, LightAnimatedBackground } from "@/components/ui/animated-background"
import { useTheme } from "next-themes"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export default function FeaturesPage() {
  const { t } = useTranslation("welcome")
  const { theme } = useTheme()
  
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({})

  // Refs for parallax effect
  const containerRef = useRef<HTMLElement>(null!);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Parallax transformations
  const headerY = useTransform(scrollYProgress, [0, 0.5], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  const features = [
    "smartCalendar",
    "taskManagement",
    "categoryManagement",
    "teamCollaboration",
    "smartNotifications",
    "statistics",
  ].map((key) => {
    const images: Record<string, string> = {
      smartCalendar: "/features-page/calendar.png",
      taskManagement: "/features-page/tasks.png",
      categoryManagement: "/features-page/categories.png",
      teamCollaboration: "/features-page/projects.png",
      smartNotifications: "/features-page/notification.png",
      statistics: "/features-page/stats.png",
    }
  
    return {
      key,
      title: t(`features.${key}.title`),
      description: t(`features.${key}.description`),
      details: t(`features.${key}.details`),
      image: images[key], // Bind the image by key
      color:
        key === "smartCalendar"
          ? "#ef4444"
          : key === "taskManagement"
            ? "#8b5cf6"
            : key === "categoryManagement"
              ? "#06b6d4"
              : key === "teamCollaboration"
                ? "#10b981"
                : key === "smartNotifications"
                  ? "#f59e0b"
                  : key === "statistics"
                    ? "#f50e0b"
                    : "#ec4899",
    }
  })

  // Create individual transform values for each card
  const card0Y = useTransform(scrollYProgress, [0, 1], [0, -40])
  const card1Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  const card2Y = useTransform(scrollYProgress, [0, 1], [0, 40])
  const card3Y = useTransform(scrollYProgress, [0, 1], [0, -40])
  const card4Y = useTransform(scrollYProgress, [0, 1], [0, 0])
  const card5Y = useTransform(scrollYProgress, [0, 1], [0, 40])

  // Create an array of transform values
  const cardYTransforms = [card0Y, card1Y, card2Y, card3Y, card4Y, card5Y]

  // Toggle expanded state for a feature
  const toggleFeatureExpanded = useCallback((key: string) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 z-0">
        {theme === "dark" ? <AnimatedBackground /> : <LightAnimatedBackground />}
        <div className="absolute inset-0 bg-black opacity-0 dark:opacity-60 z-10"></div>
      </div>
      <div className="relative z-20">
        <Header />
        <main ref={containerRef} className="relative">
          <motion.div
            className="relative container mx-auto px-4 pt-36 pb-20 text-center"
            style={{ y: headerY, opacity }}
            {...({} as MotionDivProps)}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 leading-tight">
              {t("features.title")}
            </h1>

            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 leading-relaxed mb-16">
              {t("features.subtitle")}
            </p>
          </motion.div>
          
          <div className="container mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const cardY = cardYTransforms[index % cardYTransforms.length]
                const isExpanded = expandedFeatures[feature.key]

                return (
                  <motion.div
                    key={feature.key}
                    className="feature-card"
                    style={{ y: cardY }}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    {...({} as MotionDivProps)}
                  >
                    <div className="h-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800/90 backdrop-blur-sm border border-gray-100 dark:border-gray-700">
                      <div
                        className="h-2 w-full"
                        style={{
                          background: `linear-gradient(to right, ${feature.color}, ${feature.color}aa)`,
                        }}
                      />

                      {/* Image Section */}
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                        />
                        <div
                          className="absolute inset-0 opacity-30 transition-opacity duration-300 hover:opacity-0"
                          style={{
                            background: `linear-gradient(to bottom, ${feature.color}80, transparent)`,
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                          <h3 className="text-xl font-bold text-white drop-shadow-md">{feature.title}</h3>
                        </div>
                      </div>

                      <div className="p-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{feature.description}</p>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full flex items-center justify-center mb-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                          onClick={() => toggleFeatureExpanded(feature.key)}
                        >
                          {isExpanded ? t("features.hideDetails") : t("features.showDetails")}
                          {isExpanded ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                              {...({} as MotionDivProps)}
                            >
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                  {feature.details}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}