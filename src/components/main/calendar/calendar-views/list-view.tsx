"use client"

import { motion, AnimatePresence, MotionProps } from "framer-motion"
import TaskItem from "@/components/main/calendar/task-item"
import type { Task } from "@/types"

import { HTMLAttributes } from 'react'

// type for motion.div
type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

type ListViewProps = {
  getMonthTasks: () => Task[]
  direction: "left" | "right" | null
  animationKey: number
  openTaskDetail: (task: Task) => void
  toggleTaskCompletion: (taskId: number) => void
  categoryColorMap: Record<string, { color: string; icon: string }>
  showCompleted: boolean
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

export default function ListView({
  getMonthTasks,
  direction,
  animationKey,
  openTaskDetail,
  toggleTaskCompletion,
  showCompleted,
}: ListViewProps) {
  const tasks = getMonthTasks()

  return (
    <AnimatePresence initial={false} custom={direction} mode="wait">
      <motion.div
        key={`list-${animationKey}`}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        className="p-4 space-y-4"
        {...({} as MotionDivProps)}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const isTaskToday = new Date(task.dueDate.split("T")[0]).toDateString() === new Date().toDateString()

            return (
              <TaskItem
                key={task.id}
                task={task}
                openTaskDetail={openTaskDetail}
                toggleTaskCompletion={toggleTaskCompletion}
                view="list"
                isTaskToday={isTaskToday}
              />
            )
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {showCompleted ? "No tasks found for this month" : "No incomplete tasks found for this month"}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
