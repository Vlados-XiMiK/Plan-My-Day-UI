"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion, MotionProps, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { HTMLAttributes } from 'react'
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { enUS, uk } from "date-fns/locale"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

interface CustomCalendarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date) => void
  className?: string
}

export default function CustomCalendar({ selectedDate, onDateSelect, className }: CustomCalendarProps) {
  const { t, i18n } = useTranslation('projects')
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date())
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([])
  const [animationDirection, setAnimationDirection] = useState<"left" | "right">("right")

  // Generate day names for the header based on locale
  const getDayNames = () => {
    const locale = i18n.language === 'ua' ? uk : enUS
    const days: string[] = []
    const baseDate = new Date(2025, 0, 5) // Start from Sunday, Jan 5, 2025
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + i)
      days.push(format(date, 'EEEEEE', { locale }))
    }
    return days
  }

  const dayNames = getDayNames()

  // Generate calendar days for the current month
  useEffect(() => {
    const days: Array<Date | null> = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Fill in days from previous month to start on the correct day of week
    const firstDayOfWeek = firstDay.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Fill in all days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Fill in remaining days to complete the grid (optional)
    const remainingDays = 42 - days.length // 6 rows of 7 days
    for (let i = 0; i < remainingDays; i++) {
      days.push(null)
    }

    setCalendarDays(days)
  }, [currentMonth])

  // Navigate to previous month
  const goToPreviousMonth = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event propagation
    setAnimationDirection("left")
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Navigate to next month
  const goToNextMonth = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event propagation
    setAnimationDirection("right")
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Format month and year for display with locale
  const formatMonthYear = (date: Date) => {
    const locale = i18n.language === 'ua' ? uk : enUS
    return format(date, 'MMMM yyyy', { locale })
  }

  return (
    <div className={cn("p-3 bg-white dark:bg-gray-950 rounded-lg shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">{t('custom_calendar.previousMonth')}</span>
        </Button>

        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{formatMonthYear(currentMonth)}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault() // Prevent any form submission
              e.stopPropagation() // Stop event propagation
              const today = new Date()
              if (today.getMonth() !== currentMonth.getMonth() || today.getFullYear() !== currentMonth.getFullYear()) {
                setAnimationDirection(today.getTime() < currentMonth.getTime() ? "left" : "right")
                setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
              }
              // Select today's date without closing the calendar
              onDateSelect(today)
            }}
            className="h-6 text-xs px-2 hover:bg-purple-100 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300"
          >
            {t('custom_calendar.today')}
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/20"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">{t('custom_calendar.nextMonth')}</span>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${currentMonth.getMonth()}-${currentMonth.getFullYear()}`}
          initial={{
            x: animationDirection === "right" ? 20 : -20,
            opacity: 0,
          }}
          animate={{
            x: 0,
            opacity: 1,
          }}
          exit={{
            x: animationDirection === "right" ? -20 : 20,
            opacity: 0,
          }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
          {...({} as MotionDivProps)}
        >
          {calendarDays.map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDateSelect(date)
                  }}
                  className={cn(
                    "h-full w-full p-0 rounded-md text-sm font-medium transition-all duration-200",
                    isToday(date) && !isSelected(date) && "border border-purple-500/50",
                    isSelected(date) && "bg-purple-500 text-white hover:bg-purple-600",
                    !isSelected(date) && "hover:bg-purple-100 dark:hover:bg-purple-900/20",
                  )}
                >
                  {date.getDate()}
                </Button>
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}