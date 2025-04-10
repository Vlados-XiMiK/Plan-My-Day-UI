"use client"

import type React from "react"
import { HTMLAttributes } from "react"
import { motion, MotionProps } from "framer-motion"
import { AlertCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTaskStatus } from "@/lib/calendar-data"
import { getPriorityColorClass } from "@/lib/calendar-utils"
import type { Task } from "@/lib/calendar-data"
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/calendar/tooltip"
import { Checkbox } from "@/components/ui/calendar/checkbox"

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

// Pulse animation for approaching deadlines
const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop" as const,
    },
  },
}

type TaskItemProps = {
  task: Task
  categoryStyle: { color: string }
  openTaskDetail: (task: Task) => void
  toggleTaskCompletion: (taskId: number) => void
  view: "month" | "list"
  isTaskToday?: boolean
}

export default function TaskItem({
  task,
  categoryStyle,
  openTaskDetail,
  toggleTaskCompletion,
  view,
  isTaskToday = false,
}: TaskItemProps) {
  const status = getTaskStatus(task)

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleTaskCompletion(task.id)
  }

  // Update the month view task item to ensure text fits better and improve tooltip behavior
  if (view === "month") {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={status === "approaching" ? "pulse" : { opacity: 1, y: 0 }}
              variants={pulseVariants}
              transition={{ duration: 0.3 }}
              className={cn(
                "px-2 py-1 text-xs rounded-lg flex items-center cursor-pointer transform transition-transform hover:scale-[1.02] active:scale-[0.98]",
                categoryStyle.color,
                getPriorityColorClass(task.priority, true),
                status === "overdue" && "border-l-4 border-red-500 dark:border-red-700",
                status === "approaching" && "border-l-4 border-amber-500 dark:border-amber-700",
                task.completed && "opacity-60 line-through",
                task.priority === "high" && "font-bold",
              )}
              onClick={() => openTaskDetail(task)}
              {...({} as MotionDivProps)}
            >
              <div className="flex-shrink-0 mr-1" onClick={handleCheckboxClick}>
                {task.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <Checkbox checked={task.completed} className="h-3.5 w-3.5 rounded-sm" onClick={handleCheckboxClick} />
                )}
              </div>
              <div className="flex items-center truncate flex-1">
                <span className="truncate">{task.title}</span>
              </div>
              {status === "overdue" && (
                <AlertCircle className="h-3 w-3 ml-1 flex-shrink-0 text-red-600 dark:text-red-400" />
              )}
              {status === "approaching" && (
                <AlertTriangle className="h-3 w-3 ml-1 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              )}
            </motion.div>
          </TooltipTrigger>
          
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, y: 20 }}
      animate={status === "approaching" ? "pulse" : { opacity: 1, y: 0 }}
      variants={pulseVariants}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-center p-3 rounded-xl border transition-colors cursor-pointer transform transition-transform hover:scale-[1.01] active:scale-[0.99]",
        isTaskToday
          ? "border-indigo-300 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-900/20 shadow-[0_0_10px_rgba(99,102,241,0.3)]"
          : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900",
        status === "overdue" && "border-l-4 border-red-500 dark:border-red-700",
        status === "approaching" && "border-l-4 border-amber-500 dark:border-amber-700",
        task.completed && "opacity-70",
        task.priority === "high" &&
          !task.completed &&
          "border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10",
      )}
      onClick={() => openTaskDetail(task)}
      {...({} as MotionDivProps)}
    >
      <div className="flex-shrink-0 mr-3 flex items-center gap-2">
        <div onClick={handleCheckboxClick}>
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <Checkbox checked={task.completed} className="h-5 w-5 rounded-md" onClick={handleCheckboxClick} />
          )}
        </div>
        <span className={cn("w-2 h-2 rounded-full", getPriorityColorClass(task.priority))}></span>
      </div>
      <div className="flex-grow">
        <div className="flex items-center">
          <h3
            className={cn(
              "font-medium",
              isTaskToday && "text-indigo-700 dark:text-indigo-300",
              status === "overdue" && "text-red-700 dark:text-red-300",
              status === "approaching" && "text-amber-700 dark:text-amber-300",
              task.completed && "line-through",
              task.priority === "high" && !task.completed && "font-bold",
            )}
          >
            {task.title}
          </h3>
          {status === "overdue" && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Overdue
            </span>
          )}
          {status === "approaching" && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Soon
            </span>
          )}
          {task.completed && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Completed
            </span>
          )}
        </div>
        <div className="flex items-center">
          <p
            className={cn(
              "text-sm",
              isTaskToday ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-500 dark:text-gray-400",
              status === "overdue" && "text-red-600 dark:text-red-400",
              status === "approaching" && "text-amber-600 dark:text-amber-400",
            )}
          >
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }).format(new Date(task.date))}
            {isTaskToday && " (Today)"}
          </p>
          {task.time && (
            <div
              className={cn(
                "flex items-center text-sm ml-2",
                status === "overdue"
                  ? "text-red-600 dark:text-red-400"
                  : status === "approaching"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-500 dark:text-gray-400",
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              {task.time}
            </div>
          )}
        </div>
      </div>
      <span
        className={cn(
          "px-2 py-0.5 text-xs font-medium rounded-lg",
          task.priority === "high"
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            : task.priority === "medium"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        )}
      >
        {task.priority}
      </span>
    </motion.div>
  )
}
