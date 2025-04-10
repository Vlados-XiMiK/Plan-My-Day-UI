"use client"

import { useState, useEffect, HTMLAttributes } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/calendar/dialog"
import { Badge } from "@/components/ui/calendar/badge"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { Clock, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { getTaskStatus, formatTime } from "@/lib/calendar-data"
import { Checkbox } from "@/components/ui/calendar/checkbox"
import type { Task } from "@/lib/calendar-data"

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

type Categories = {
  [key: string]: {
    color: string
    icon: string
  }
}

type TaskDetailModalProps = {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  toggleTaskCompletion: (taskId: number) => void
  categories: Categories
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  toggleTaskCompletion,
}: TaskDetailModalProps) {
  // Локальное состояние для хранения копии задачи
  const [localTask, setLocalTask] = useState<Task | null>(task)

  // Синхронизируем локальное состояние с пропсом task, когда он меняется
  useEffect(() => {
    setLocalTask(task)
  }, [task])

  if (!localTask) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const taskStatus = getTaskStatus(localTask)

  const handleCheckboxChange = () => {
    toggleTaskCompletion(localTask.id)
    // Обновляем локальное состояние, чтобы чекбокс сразу отобразил изменение
    setLocalTask((prev) => (prev ? { ...prev, completed: !prev.completed } : prev))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl overflow-hidden p-0">
        <div
          className={cn(
            "p-4",
            localTask.priority === "high"
              ? "bg-red-50 dark:bg-red-900/20"
              : localTask.priority === "medium"
                ? "bg-amber-50 dark:bg-amber-900/20"
                : "bg-blue-50 dark:bg-blue-900/20",
            taskStatus === "overdue" && "border-l-4 border-red-500 dark:border-red-700",
            taskStatus === "approaching" && "border-l-4 border-amber-500 dark:border-amber-700",
          )}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle
              className={cn(
                "text-xl font-bold flex items-center gap-2",
                localTask.completed && "line-through opacity-70",
              )}
            >
              <div className="cursor-pointer">
                <Checkbox
                  checked={localTask.completed}
                  onCheckedChange={handleCheckboxChange}
                  className="h-6 w-6 rounded-md"
                />
              </div>
              <span
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{
                  backgroundColor:
                    localTask.priority === "high"
                      ? "rgb(220, 38, 38)"
                      : localTask.priority === "medium"
                        ? "rgb(217, 119, 6)"
                        : "rgb(37, 99, 235)",
                }}
              ></span>
              {localTask.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              className={cn(
                "rounded-lg",
                localTask.priority === "high"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  : localTask.priority === "medium"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              )}
            >
              {localTask.priority} priority
            </Badge>
            <Badge variant="outline" className="rounded-lg">
              {localTask.category}
            </Badge>
            {taskStatus === "overdue" && (
              <Badge variant="destructive" className="rounded-lg flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Overdue
              </Badge>
            )}
            {taskStatus === "approaching" && (
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <Badge className="rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Due soon
                </Badge>
              </motion.div>
            )}
            {localTask.completed && (
              <Badge className="rounded-lg bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(localTask.date)}</p>
            {localTask.time && (
              <div
                className={cn(
                  "flex items-center text-sm",
                  taskStatus === "overdue"
                    ? "text-red-500 dark:text-red-400"
                    : taskStatus === "approaching"
                      ? "text-amber-500 dark:text-amber-400"
                      : "text-gray-500 dark:text-gray-400",
                )}
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(localTask.time)}
              </div>
            )}
          </div>
        </div>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn("text-gray-700 dark:text-gray-300", localTask.completed && "opacity-70")}
            {...({} as MotionDivProps)}
          >
            {localTask.description || "No description provided."}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}