"use client"

import { motion, AnimatePresence, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import TaskItem from "@/components/main/calendar/task-item"
import { isToday, getDayStatus } from "@/lib/calendar-utils"
import type { Task, Category } from "@/types"
import { HTMLAttributes } from "react"

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

type MonthViewProps = {
  calendarDays: (number | null)[]
  currentMonth: number
  currentYear: number
  direction: "left" | "right" | null
  animationKey: number
  getTasksForDay: (day: number) => Task[]
  openAddTaskModal: (day: number) => void
  openTaskDetail: (task: Task) => void
  toggleTaskCompletion: (taskId: number) => void
  categoryColorMap: Record<string, { color: string; icon: string }>
  dayNames: string[]
  isMobile: boolean
  categories: Category[]
  refreshCategories: () => Promise<void> 
}

// Animation variants for month transitions
const variants = {
  enter: (direction: "left" | "right" | null) => ({
    x: direction === "left" ? 1000 : direction === "right" ? -1000 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "left" | "right" | null) => ({
    x: direction === "left" ? -1000 : direction === "right" ? 1000 : 0,
    opacity: 0,
  }),
}

export default function MonthView({
  calendarDays,
  currentMonth,
  currentYear,
  direction,
  animationKey,
  getTasksForDay,
  openAddTaskModal,
  openTaskDetail,
  toggleTaskCompletion,
  dayNames,
  isMobile,
  categories,
  refreshCategories,
}: MonthViewProps) {
  // Handler for clicking on the add task button
  const handleAddTask = async (e: React.MouseEvent, day: number) => {
    e.stopPropagation()
    await refreshCategories() // Update categories before opening modal window
    openAddTaskModal(day)
  }

  return (
    <>
      {/* Day names */}
      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-900">
        {dayNames.map((day, index) => (
          <div key={index} className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with animation */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={animationKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="grid grid-cols-7 gap-1 p-1 bg-gray-200 dark:bg-gray-800"
          {...({} as MotionDivProps)}
        >
          {calendarDays.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${index}`}
                  className={cn("bg-gray-50 dark:bg-gray-900 rounded-xl", isMobile ? "h-20" : "h-24 sm:h-28 md:h-32")}
                />
              )
            }

            const dayTasks = getTasksForDay(day)
            const today = isToday(day, currentMonth, currentYear)
            const dayStatus = getDayStatus(dayTasks)

            // Determine how many tasks to show based on screen size
            const maxVisibleTasks = isMobile ? 1 : 3
            const visibleTasks = dayTasks.slice(0, maxVisibleTasks)
            const hiddenTasksCount = dayTasks.length - maxVisibleTasks

            return (
              <motion.div
                key={`day-${day}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className={cn(
                  "bg-white dark:bg-gray-950 p-2 relative transition-all duration-200 group rounded-xl",
                  isMobile ? "h-20" : "h-24 sm:h-28 md:h-32",
                  today &&
                    "ring-2 ring-indigo-500 ring-inset shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_15px_rgba(99,102,241,0.3)] z-5",
                  dayStatus === "overdue" && "ring-2 ring-red-500 ring-inset",
                  dayStatus === "approaching" && "ring-2 ring-amber-500 ring-inset",
                  dayStatus === "completed" && "ring-2 ring-green-500 ring-inset",
                  "hover:bg-gray-50 dark:hover:bg-gray-900",
                )}
                {...({} as MotionDivProps)}
              >
                <div className="flex justify-between items-start">
                  <div
                    className={cn(
                      "relative",
                      today &&
                        "after:content-[''] after:absolute after:top-[-4px] after:left-[-4px] after:right-[-4px] after:bottom-[-4px] after:bg-indigo-500/20 after:rounded-full after:animate-pulse",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full text-xs md:text-sm relative z-10",
                        today ? "bg-indigo-500 text-white font-bold shadow-md" : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      {day}
                    </span>
                  </div>
                </div>

                <div className="relative h-[calc(100%-24px)]">
                  {isMobile && dayTasks.length > 0 ? (
                    // On mobile, just show the task count as a badge (non-interactive)
                    <div className="absolute top-1 left-0 right-0 flex justify-center">
                      <div
                        className={cn(
                          "px-1.5 py-0.5 text-2xs leading-none font-medium rounded-full inline-flex items-center justify-center",
                          dayStatus === "overdue"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : dayStatus === "approaching"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                              : dayStatus === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
                        )}
                      >
                        {dayTasks.length}
                      </div>
                    </div>
                  ) : (
                    // On desktop, show the actual tasks
                    <div className="absolute inset-0 overflow-y-auto space-y-1 pr-1 pt-1 custom-scrollbar">
                      {visibleTasks.map((task) => {
                        return (
                          <TaskItem
                            key={task.id}
                            task={task}
                            openTaskDetail={openTaskDetail}
                            toggleTaskCompletion={toggleTaskCompletion}
                            view="month"
                            categories={categories}
                          />
                        )
                      })}

                      {/* Show indicator for hidden tasks */}
                      {hiddenTasksCount > 0 && !isMobile && (
                        <div
                          className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                          onClick={() => openTaskDetail(dayTasks[maxVisibleTasks])}
                        >
                          +{hiddenTasksCount} more
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add task button at bottom right - only on desktop */}
                  {!isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg absolute bottom-0 right-0"
                      onClick={(e) => handleAddTask(e, day)} // Use the new handler
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Show scroll indicator if there are more tasks than can fit */}
                  {dayTasks.length > maxVisibleTasks && !isMobile && (
                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Status indicators - positioned differently to avoid overlap */}
                <div className="absolute top-1 right-1 flex items-center gap-1">
                  {dayStatus === "overdue" && (
                    <AlertCircle className="h-3 w-3 md:h-4 md:w-4 text-red-600 dark:text-red-400" />
                  )}

                  {dayStatus === "approaching" && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                  )}

                  {dayStatus === "completed" && (
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </>
  )
}