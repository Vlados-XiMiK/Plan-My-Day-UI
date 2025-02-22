'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from "next/link"
import { motion, MotionProps } from 'framer-motion'
import { HTMLAttributes } from 'react'

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export default function Logo() {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center gap-4">
      <motion.div 
        className="relative w-16 h-16" // Уменьшил размер для лучшего соответствия шапке
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        {...({} as MotionDivProps)}
      >
        {!imageError ? (
          <Image
            src="/logo.png"
            alt="Plan My Day Logo"
            width={64} // Уменьшил ширину для пропорций
            height={64} // Уменьшил высоту для пропорций
            className="object-contain rounded-full"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-16 h-16 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 shadow-lg"></div>
            
            <motion.div 
              className="absolute -top-1 -right-1 w-8 h-8"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              {...({} as MotionDivProps)}
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-0"></div>
              <div className="w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
              <div className="w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90"></div>
              <div className="w-4 h-0.5 bg-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-135"></div>
            </motion.div>
          </div>
        )}
      </motion.div>
      <Link href="/" className="flex items-center">
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 dark:from-purple-400 dark:to-blue-400">
          Plan My Day
        </span>
      </Link>
    </div>
  )
}