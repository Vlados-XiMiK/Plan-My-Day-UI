"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type CalendarHeaderProps = {
  monthName: string
  currentYear: number
  currentMonth: number
  isMobile: boolean
  goToToday: () => void
  prevMonth: () => void
  nextMonth: () => void
  changeMonth: (month: number) => void
  changeYear: (year: number) => void
  getYearOptions: number[]
}

// Animation for month name
const monthVariants = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
}

export default function CalendarHeader({
  monthName,
  currentYear,
  currentMonth,
  isMobile,
  goToToday,
  prevMonth,
  nextMonth,
  changeMonth,
  changeYear,
  getYearOptions,
}: CalendarHeaderProps) {

  return (
    <div className="p-4 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
      <div className="flex items-center mb-2 sm:mb-0">
        <div className="flex items-center">
          {/* Month Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-bold text-xl hover:bg-white/20 rounded-xl">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={monthName}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={monthVariants}
                    transition={{ duration: 0.3 }}
                  >
                    {isMobile ? monthName.substring(0, 3) : monthName}
                  </motion.span>
                </AnimatePresence>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl">
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date(currentYear, i, 1)
                const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date)
                return (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => changeMonth(i)}
                    className={cn(
                      "cursor-pointer rounded-lg",
                      i === currentMonth &&
                        "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-medium",
                    )}
                  >
                    {monthName}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Year Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-1 font-bold text-xl hover:bg-white/20 rounded-xl">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentYear}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={monthVariants}
                    transition={{ duration: 0.3 }}
                  >
                    {currentYear}
                  </motion.span>
                </AnimatePresence>
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="h-[300px] overflow-y-auto rounded-xl">
              {getYearOptions.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => changeYear(year)}
                  className={cn(
                    "cursor-pointer rounded-lg",
                    year === currentYear &&
                      "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100 font-medium",
                  )}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="bg-white/20 hover:bg-white/30 text-white border-white/40 rounded-xl"
        >
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white/20 text-white rounded-xl">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-white/20 text-white rounded-xl">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
