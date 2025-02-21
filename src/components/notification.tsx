"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle, CheckCircle, Info, X, XCircle, Bell } from "lucide-react"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import { HTMLAttributes } from "react"
import { useTheme } from "next-themes"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export type NotificationType = "success" | "error" | "warning" | "info" | "welcome"

export interface NotificationProps {
  id: string
  type: NotificationType
  message: string
  title: string
  duration?: number
  onClose: (id: string) => void
  index: number
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    darkColor: "from-green-500 to-green-600",
    lightColor: "from-green-400 to-green-500",
    effect: "rotate-z-6",
  },
  error: {
    icon: XCircle,
    darkColor: "from-red-500 to-red-600",
    lightColor: "from-red-400 to-red-500",
    effect: "-rotate-x-6",
  },
  warning: {
    icon: AlertCircle,
    darkColor: "from-yellow-500 to-orange-500",
    lightColor: "from-yellow-400 to-orange-400",
    effect: "rotate-x-6",
  },
  info: {
    icon: Info,
    darkColor: "from-cyan-500 to-blue-500",
    lightColor: "from-cyan-400 to-blue-400",
    effect: "-rotate-y-6",
  },
  welcome: {
    icon: Bell,
    darkColor: "from-blue-500 to-purple-600",
    lightColor: "from-blue-400 to-purple-500",
    effect: "rotate-y-6",
  },
}

export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 2500,
  onClose,
  index,
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)
  const { theme } = useTheme()
  const { icon: Icon, darkColor, lightColor, effect } = typeConfig[type]
  const isDarkTheme = theme === "dark"

  useEffect(() => {
    const startTime = Date.now()
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose(id)
    }, duration)

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(progressInterval)
      }
    }, 10)

    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [duration, id, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0, scale: 0.8 }}
          animate={{
            x: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{ x: 300, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.5,
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
          className={`w-80 mb-2 ${effect}`}
          {...({} as MotionDivProps)}
        >
          <div
            className={`rounded-lg shadow-lg ${
              isDarkTheme
                ? "bg-gradient-to-r from-gray-800 to-gray-900 text-white"
                : "bg-gradient-to-r from-white to-gray-100 text-gray-800"
            } backdrop-blur-md border ${isDarkTheme ? "border-gray-700" : "border-gray-200"} overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <motion.div
                  className="flex-shrink-0"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    transition: { duration: 0.5, delay: 0.2 },
                  }}
                  {...({} as MotionDivProps)}
                >
                  <div
                    className={`h-8 w-8 rounded-full bg-gradient-to-r ${isDarkTheme ? darkColor : lightColor} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </motion.div>
                <div className="ml-3 w-full">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">{title}</p>
                    <button
                      onClick={() => {
                        setIsVisible(false)
                        onClose(id)
                      }}
                      className={`ml-2 ${
                        isDarkTheme ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
                      } transition-colors`}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className={`mt-1 text-xs ${isDarkTheme ? "text-gray-300" : "text-gray-600"}`}>{message}</p>
                </div>
              </div>
            </div>
            <motion.div
              className={`h-1 bg-gradient-to-r ${isDarkTheme ? darkColor : lightColor}`}
              initial={{ width: "100%" }}
              animate={{
                width: `${progress}%`,
                transition: { duration: 0.01, ease: "linear" },
              }}
              {...({} as MotionDivProps)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const NotificationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
      {children}
    </div>
  )
}