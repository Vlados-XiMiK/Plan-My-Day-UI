import { useState, useCallback, useMemo } from "react"
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

// Get tasks for a specific day
export function getTasksForDay(
  day: number,
  currentYear: number,
  currentMonth: number,
  tasks: Task[],
  filterTasks: (tasks: Task[]) => Task[]
) {
  const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return filterTasks(tasks.filter((task) => task.date === date))
}

// Get all tasks for the current month
export function getMonthTasks(currentYear: number, currentMonth: number, tasks: Task[], filterTasks: (tasks: Task[]) => Task[]) {
  const monthStart = new Date(currentYear, currentMonth, 1)
  const monthEnd = new Date(currentYear, currentMonth + 1, 0)

  return filterTasks(
    tasks.filter((task) => {
      const taskDate = new Date(task.date)
      return taskDate >= monthStart && taskDate <= monthEnd
    })
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Get all unique categories from tasks
export function getAllCategories(tasks: Task[]): string[] {
  return Array.from(new Set(tasks.map((task) => task.category)))
}

// Day names
export const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const shortDayNames = ["S", "M", "T", "W", "T", "F", "S"]

// Animation variants for month transitions
export const calendarVariants = {
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

// Хук для управления текущей датой и навигацией
export const useCalendarNavigation = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [animationKey, setAnimationKey] = useState(0)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const prevMonth = useCallback(() => {
    setDirection("right")
    setTimeout(() => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() - 1)
        return newDate
      })
      setAnimationKey((prev) => prev + 1)
    }, 50)
  }, [])

  const nextMonth = useCallback(() => {
    setDirection("left")
    setTimeout(() => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev)
        newDate.setMonth(prev.getMonth() + 1)
        return newDate
      })
      setAnimationKey((prev) => prev + 1)
    }, 50)
  }, [])

  const goToToday = useCallback(() => {
    const today = new Date()
    if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear) {
      if (today.getTime() < currentDate.getTime()) {
        setDirection("right")
      } else {
        setDirection("left")
      }
      setTimeout(() => {
        setCurrentDate(today)
        setAnimationKey((prev) => prev + 1)
      }, 50)
    }
  }, [currentDate, currentMonth, currentYear])

  const changeYear = useCallback((year: number) => {
    if (year !== currentYear) {
      setDirection(year < currentYear ? "right" : "left")
      setTimeout(() => {
        setCurrentDate((prev) => {
          const newDate = new Date(prev)
          newDate.setFullYear(year)
          return newDate
        })
        setAnimationKey((prev) => prev + 1)
      }, 50)
    }
  }, [currentYear])

  const changeMonth = useCallback((monthIndex: number) => {
    if (monthIndex !== currentMonth) {
      setDirection(monthIndex < currentMonth ? "right" : "left")
      setTimeout(() => {
        setCurrentDate((prev) => {
          const newDate = new Date(prev)
          newDate.setMonth(monthIndex)
          return newDate
        })
        setAnimationKey((prev) => prev + 1)
      }, 50)
    }
  }, [currentMonth])

  return {
    currentDate,
    setCurrentDate,
    direction,
    setDirection,
    animationKey,
    prevMonth,
    nextMonth,
    goToToday,
    changeYear,
    changeMonth,
  }
}

// Хук для получения данных календаря
export const useCalendarData = (currentDate: Date) => {
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = useMemo(() => new Date(currentYear, currentMonth, 1), [currentMonth, currentYear])
  const startingDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth])
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentMonth, currentYear])
  const monthName = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate),
    [currentDate]
  )

  const getYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  }, [])

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }, [daysInMonth, startingDayOfWeek])

  return {
    currentMonth,
    currentYear,
    firstDayOfMonth,
    startingDayOfWeek,
    daysInMonth,
    monthName,
    getYearOptions,
    calendarDays,
  }
}

// Хук для фильтрации задач
export const useTaskFilter = (tasks: Task[], showCompleted: boolean, searchQuery: string, selectedCategories: string[]) => {
  const filterTasks = useCallback(
    (taskList: Task[]) => {
      let filtered = [...taskList]

      if (!showCompleted) {
        filtered = filtered.filter((task) => !task.completed)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
        )
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter((task) => selectedCategories.includes(task.category))
      }

      return filtered
    },
    [searchQuery, selectedCategories, showCompleted]
  )

  return { filterTasks }
}

// Хук для управления задачами
export const useTaskManagement = (initialTasks: Task[]) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const toggleTaskCompletion = useCallback((taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task))
    )
  }, [])

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...task,
        id: prevTasks.length + 1,
        completed: false,
      },
    ])
  }, [])

  return {
    tasks,
    setTasks,
    toggleTaskCompletion,
    addTask,
  }
}