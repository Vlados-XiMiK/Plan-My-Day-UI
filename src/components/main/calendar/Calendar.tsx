"use client"

import { useState, useEffect, useCallback, useMemo, HTMLAttributes } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  Grid,
  Search,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/calendar/badge"
import { cn } from "@/lib/utils"
import TaskModal from "./task-modal"
import { Tabs, TabsContent } from "@/components/ui/calendar/tabs"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/calendar/toggle-group"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import TaskDetailModal from "./task-detail-modal"
import TaskItem from "./task-item"
import { INITIAL_TASKS, CATEGORIES, type Task } from "@/lib/calendar-data"
import { isToday, getDayStatus } from "@/lib/calendar-utils"

type MotionDivProps = MotionProps & HTMLAttributes<HTMLDivElement>

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [view, setView] = useState<"month" | "list">("month")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const isMobile = useMobile()

  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get the first day of the month
  const firstDayOfMonth = useMemo(() => new Date(currentYear, currentMonth, 1), [currentMonth, currentYear])
  const startingDayOfWeek = useMemo(() => firstDayOfMonth.getDay(), [firstDayOfMonth])

  // Get the number of days in the month
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentMonth, currentYear])

  // Get the name of the month
  const monthName = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(currentDate),
    [currentDate],
  )

  // Toggle task completion status
  const toggleTaskCompletion = useCallback((taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)),
    )
  }, [])

  // Filter tasks based on search query, selected categories, and completion status
  const filterTasks = useCallback(
    (taskList: Task[]) => {
      let filtered = [...taskList]

      // Filter by completion status if needed
      if (!showCompleted) {
        filtered = filtered.filter((task) => !task.completed)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query)),
        )
      }

      if (selectedCategories.length > 0) {
        filtered = filtered.filter((task) => selectedCategories.includes(task.category))
      }

      return filtered
    },
    [searchQuery, selectedCategories, showCompleted],
  )

  // Navigate to previous month with animation
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

  // Navigate to next month with animation
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

  // Go to today
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

  // Change year
  const changeYear = useCallback(
    (year: number) => {
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
    },
    [currentYear],
  )

  // Change month
  const changeMonth = useCallback(
    (monthIndex: number) => {
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
    },
    [currentMonth],
  )

  // Generate array of years for the year picker (current year ±10 years)
  const getYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)
  }, [])

  // Reset animation direction after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirection(null)
    }, 500)
    return () => clearTimeout(timer)
  }, [animationKey])

  // Create calendar days array
  const calendarDays = useMemo(() => {
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }, [daysInMonth, startingDayOfWeek])

  // Get tasks for a specific day
  const getTasksForDay = useCallback(
    (day: number) => {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      return filterTasks(tasks.filter((task) => task.date === date))
    },
    [currentMonth, currentYear, tasks, filterTasks],
  )

  // Open modal to add a task for a specific day
  const openAddTaskModal = useCallback(
    (day: number) => {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      setSelectedDate(date)
      setIsModalOpen(true)
    },
    [currentMonth, currentYear],
  )

  // Add a new task
  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      {
        ...task,
        id: prevTasks.length + 1,
        completed: false,
      },
    ])
    setIsModalOpen(false)
  }, [])

  // Get all tasks for the current month
  const getMonthTasks = useCallback(() => {
    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 0)

    return filterTasks(
      tasks.filter((task) => {
        const taskDate = new Date(task.date)
        return taskDate >= monthStart && taskDate <= monthEnd
      }),
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [currentMonth, currentYear, filterTasks, tasks])

  // Toggle category selection
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }, [])

  // Clear all selected categories
  const clearCategoryFilters = useCallback(() => {
    setSelectedCategories([])
  }, [])

  // Get all unique categories from tasks
  const allCategories = useMemo(() => Array.from(new Set(tasks.map((task) => task.category))), [tasks])

  // Get day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  // For mobile, use shorter day names
  const shortDayNames = ["S", "M", "T", "W", "T", "F", "S"]

  // Open task detail modal
  const openTaskDetail = useCallback((task: Task) => {
    setSelectedTask(task)
  }, [])

  // Close task detail modal
  const closeTaskDetail = useCallback(() => {
    setSelectedTask(null)
  }, [])

  // Toggle showing completed tasks
  const toggleShowCompleted = useCallback(() => {
    setShowCompleted((prev) => !prev)
  }, [])

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

  // Animation for month name
  const monthVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  }

  // Ensure theme is properly applied on initial load

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 transition-colors duration-300 flex flex-col h-full overflow-hidden">
      {/* Calendar header */}
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

      {/* Toolbar */}
      <div className="p-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex overflow-x-auto pb-1 gap-1 max-w-[200px] sm:max-w-none">
            {allCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap rounded-lg",
                  selectedCategories.includes(category)
                    ? "bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
                onClick={() => toggleCategory(category)}
              >
                📋 {isMobile ? "" : category}
              </Badge>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCategoryFilters} className="text-xs rounded-lg ml-1">
              Clear filters ({selectedCategories.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleShowCompleted}
            className={cn(
              "text-xs rounded-lg flex items-center gap-1",
              showCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "",
            )}
          >
            {showCompleted ? <CheckCircle2 className="h-3 w-3" /> : null}
            {showCompleted ? "Hide" : "Show"} completed
          </Button>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as "month" | "list")}
          >
            <ToggleGroupItem value="month" aria-label="Month view" className="rounded-l-xl">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="rounded-r-xl">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="flex-1 overflow-y-auto p-4">
      <Tabs value={view} className="w-full" onValueChange={(value) => setView(value as "month" | "list")}>
        {/* Month View */}
        <TabsContent value="month" className="m-0">
          {/* Day names */}
          <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-900">
            {(isMobile ? shortDayNames : dayNames).map((day, index) => (
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
                      className="bg-gray-50 dark:bg-gray-900 h-24 sm:h-28 md:h-32 rounded-xl"
                    />
                  )
                }

                const dayTasks = getTasksForDay(day)
                const today = isToday(day, currentMonth, currentYear)
                const dayStatus = getDayStatus(dayTasks)

                return (
                  <motion.div
                    key={`day-${day}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    className={cn(
                      "bg-white dark:bg-gray-950 h-24 sm:h-28 md:h-32 p-2 relative transition-all duration-200 group rounded-xl",
                      today &&
                        "ring-2 ring-indigo-500 ring-inset shadow-[0_0_15px_rgba(99,102,241,0.5)] dark:shadow-[0_0_15px_rgba(99,102,241,0.3)] z-10",
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
                            "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm relative z-10",
                            today ? "bg-indigo-500 text-white font-bold shadow-md" : "text-gray-700 dark:text-gray-300",
                          )}
                        >
                          {day}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-[calc(100%-28px)]">
                      <div className="absolute inset-0 overflow-y-auto space-y-1 pr-1 pt-1 custom-scrollbar">
                        {dayTasks.map((task) => {
                          const categoryStyle = CATEGORIES[task.category as keyof typeof CATEGORIES] || CATEGORIES.other
                          return (
                            <TaskItem
                              key={task.id}
                              task={task}
                              categoryStyle={categoryStyle}
                              openTaskDetail={openTaskDetail}
                              toggleTaskCompletion={toggleTaskCompletion}
                              view="month"
                            />
                          )
                        })}
                      </div>

                      {/* Add task button at bottom right */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg absolute bottom-0 right-0"
                        onClick={() => openAddTaskModal(day)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>

                      {/* Show scroll indicator if there are more tasks than can fit */}
                      {dayTasks.length > 3 && (
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-950 to-transparent pointer-events-none" />
                      )}
                    </div>

                    {/* Status indicators - positioned differently to avoid overlap */}
                    <div className="absolute top-1 right-1 flex items-center gap-1">
                      {dayStatus === "overdue" && <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}

                      {dayStatus === "approaching" && (
                        <motion.div
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </motion.div>
                      )}

                      {dayStatus === "completed" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="m-0">
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
              {getMonthTasks().length > 0 ? (
                getMonthTasks().map((task) => {
                  const categoryStyle = CATEGORIES[task.category as keyof typeof CATEGORIES] || CATEGORIES.other
                  const isTaskToday = new Date(task.date).toDateString() === new Date().toDateString()

                  return (
                    <TaskItem
                      key={task.id}
                      task={task}
                      categoryStyle={categoryStyle}
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
        </TabsContent>
      </Tabs>
      </div>

      {/* Task modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddTask={addTask}
          selectedDate={selectedDate}
          categories={allCategories}
        />
      )}

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={closeTaskDetail}
        toggleTaskCompletion={toggleTaskCompletion}
        categories={CATEGORIES}
      />
    </div>
  )
}
