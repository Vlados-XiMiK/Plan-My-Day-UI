// Sample task data with categories
export type Task = {
  id: number
  title: string
  date: string
  time?: string
  priority: "low" | "medium" | "high"
  category: string
  description?: string
  completed?: boolean
}

// Sample task data with categories and times
export const INITIAL_TASKS: Task[] = [
  {
    id: 1,
    title: "Team Meeting",
    date: "2025-04-08",
    time: "10:00",
    priority: "high",
    category: "work",
    description: "Weekly team sync to discuss project progress and blockers. Prepare status update for your tasks.",
    completed: false,
  },
  {
    id: 2,
    title: "Project Deadline",
    date: "2025-04-15",
    time: "17:00",
    priority: "high",
    category: "work",
    description: "Final submission deadline for the Q2 project. Ensure all deliverables are ready and tested.",
    completed: false,
  },
  {
    id: 3,
    title: "Review Code",
    date: "2025-04-10",
    time: "14:30",
    priority: "medium",
    category: "work",
    description: "Review pull requests from the frontend team and provide feedback.",
    completed: false,
  },
  {
    id: 4,
    title: "Update Documentation",
    date: "2025-04-12",
    time: "11:00",
    priority: "low",
    category: "work",
    description: "Update API documentation with the latest changes and examples.",
    completed: true,
  },
  {
    id: 5,
    title: "Client Call",
    date: "2025-04-07",
    time: "09:30",
    priority: "medium",
    category: "work",
    description: "Call with the client to discuss project requirements and timeline.",
    completed: false,
  },
  {
    id: 6,
    title: "Gym Session",
    date: "2025-04-09",
    time: "18:00",
    priority: "medium",
    category: "personal",
    description: "Leg day workout at the gym. Don't forget to bring water and a towel.",
    completed: false,
  },
  {
    id: 7,
    title: "Dinner with Friends",
    date: "2025-04-11",
    time: "19:00",
    priority: "low",
    category: "personal",
    description: "Dinner at 7 PM at Italian restaurant downtown. Reservation under your name.",
    completed: false,
  },
  {
    id: 8,
    title: "Doctor Appointment",
    date: "2025-04-14",
    time: "15:45",
    priority: "high",
    category: "health",
    description: "Annual checkup with Dr. Smith. Bring your insurance card and arrive 15 minutes early.",
    completed: false,
  },
  {
    id: 9,
    title: "Pay Bills",
    date: "2025-04-05",
    time: "12:00",
    priority: "high",
    category: "finance",
    description: "Pay electricity, internet, and credit card bills before the due date.",
    completed: true,
  },
  {
    id: 10,
    title: "Birthday Party",
    date: "2025-04-18",
    time: "18:00",
    priority: "medium",
    category: "personal",
    description: "Sarah's birthday party at 6 PM. Don't forget to bring the gift you purchased.",
    completed: false,
  },
]

// Category colors with a single icon for all categories
export const CATEGORIES = {
  work: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", icon: "📋" },
  personal: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", icon: "📋" },
  health: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: "📋" },
  finance: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", icon: "📋" },
  other: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", icon: "📋" },
}

// Check if a task is overdue or approaching deadline
export function getTaskStatus(task: Task) {
  // If task is completed, it's no longer overdue or approaching
  if (task.completed) {
    return "completed"
  }

  const now = new Date()
  const taskDate = new Date(task.date)

  // Set the time if available
  if (task.time) {
    const [hours, minutes] = task.time.split(":")
    taskDate.setHours(Number(hours), Number(minutes), 0, 0)
  } else {
    // If no time specified, set to end of day
    taskDate.setHours(23, 59, 59, 999)
  }

  const timeDiff = taskDate.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)

  if (timeDiff < 0) {
    return "overdue" // Past deadline
  } else if (hoursDiff <= 24) {
    return "approaching" // Within 24 hours
  }

  return "normal"
}

// Format date for display
export function formatDate(dateString: string, includeTime?: boolean, timeString?: string) {
  const date = new Date(dateString)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)

  if (!includeTime || !timeString) return formattedDate

  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${formattedDate}, ${hour12}:${minutes} ${ampm}`
}

// Format time for display
export function formatTime(timeString?: string) {
  if (!timeString) return null

  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours, 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12

  return `${hour12}:${minutes} ${ampm}`
}
