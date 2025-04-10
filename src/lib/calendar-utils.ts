import type { Task } from "./calendar-data"
import { getTaskStatus } from "./calendar-data"

// Format date for display
export function formatDateString(dateString: string, includeTime?: boolean, timeString?: string) {
  const date = new Date(dateString)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)

  if (!includeTime || !timeString) return formattedDate

  return `${formattedDate}, ${formatTimeString(timeString)}`
}

// Format time for display
export function formatTimeString(timeString?: string) {
  if (!timeString) return null

  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${minutes} ${ampm}`
}

// Check if a day is today
export function isToday(day: number, currentMonth: number, currentYear: number) {
  const today = new Date()
  return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
}

// Check if a day has overdue or approaching tasks
export function getDayStatus(dayTasks: Task[]) {
  const hasOverdue = dayTasks.some((task) => getTaskStatus(task) === "overdue")
  const hasApproaching = dayTasks.some((task) => getTaskStatus(task) === "approaching")
  const hasCompleted = dayTasks.some((task) => task.completed)

  if (hasOverdue) return "overdue"
  if (hasApproaching) return "approaching"
  if (hasCompleted && dayTasks.every((task) => task.completed)) return "completed"
  return "normal"
}

// Get priority color classes
export function getPriorityColorClass(priority: "high" | "medium" | "low", isBackground = false) {
  if (isBackground) {
    return priority === "high"
      ? "bg-red-50/60 dark:bg-red-900/10"
      : priority === "medium"
        ? "bg-amber-50/60 dark:bg-amber-900/10"
        : "bg-blue-50/60 dark:bg-blue-900/10"
  }

  return priority === "high"
    ? "text-red-600 dark:text-red-400"
    : priority === "medium"
      ? "text-amber-600 dark:text-amber-400"
      : "text-blue-600 dark:text-blue-400"
}
