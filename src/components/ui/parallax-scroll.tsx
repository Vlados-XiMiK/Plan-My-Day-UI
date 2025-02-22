"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ParallaxPanelProps {
  title: string
  description: string
  details: string
  imageSrc: string
  imageAlt: string
  index: number
  accent?: string
}

const ParallaxPanel: React.FC<ParallaxPanelProps> = ({
  title,
  description,
  details,
  imageSrc,
  imageAlt,
  index,
  accent = "#ef4444",
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  return (
    <motion.div
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-40 px-6 md:px-8 bg-white/80 dark:bg-gray-900/80"
      style={{
        opacity,
      }}
    >
      <div className="container mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          style={{
            scale,
          }}
        >
          <motion.div
            className={`order-2 md:order-${index % 2 === 0 ? 2 : 1}`}
            style={{ y }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="relative aspect-[4/3] rounded-lg overflow-hidden transform transition-transform duration-500 hover:rotate-1"
              style={{
                boxShadow: `0 25px 50px -12px ${accent}25`,
              }}
            >
              <Image
                src={imageSrc || "/placeholder.svg"}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-110"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300 hover:opacity-50"
                style={{
                  background: `linear-gradient(45deg, ${accent}50, transparent)`,
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className={`space-y-4 order-1 md:order-${index % 2 === 0 ? 1 : 2}`}
            style={{ y: useTransform(y, (value) => value * -0.5) }}
          >
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-clip-text text-transparent leading-tight mb-8"
              style={{
                backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {title}
            </motion.h2>
            <motion.p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-10">
              {description}
            </motion.p>

            <Button variant="ghost" className="mt-4" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? (
                <>
                  Hide Details <ChevronUp className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-6">
                    <div>
                      <h4 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">Details</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{details}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 -z-10 opacity-50 dark:opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${accent}15 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1 }}
      />
    </motion.div>
  )
}

export function ParallaxScroll({ features }) {
  return (
    <div>
      {features.map((feature, index) => (
        <ParallaxPanel
          key={index}
          title={feature.title}
          description={feature.description}
          details={feature.details}
          imageSrc={`/placeholder.svg?height=800&width=1200&text=${feature.title}`}
          imageAlt={feature.title}
          index={index}
          accent={feature.color}
        />
      ))}
    </div>
  )
}

