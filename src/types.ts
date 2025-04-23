// WELCOME PAGE AND TRANSLATE

export interface Feature {
  key: string;
  image?: string;
  title: string;
  subtitle?: string;
  description: string;
  details: string;
  color?: string;
}

export interface Features {
  title: string;
  [key: string]: Feature | string;
}

export interface FeaturesPage {
  subtitle: string;
  [key: string]: Feature | string;
}

export interface Translation {
  features: Features;
  featuresPage: FeaturesPage;
}

// END WELCOME PAGE AND TRANSLATE

// TASKS AND CATEGORY

export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  starred: boolean;
  date?: string
}

export interface Category {
  name: string;
  color: string;
}

// END TASKS AND CATEGORY


// PROFILE

export interface User {
  name: string;
  email: string;
  phone: string;
  workplace: string;
  age: number;
  avatarUrl?: string;
}

export interface ProfileStats {
  completedTasks: number;
  ongoingTasks: number;
  totalTasks: number;
}

export interface UserContextType {
  user: User | null;
  stats: ProfileStats;
  setUser: (user: User | null) => void;
  setStats: (stats: ProfileStats) => void;
}

export interface AvatarProps {
  name: string;
  surname?: string;
  size?: "small" | "large";
}

// END PROFILE

















// Helper functions for the calendar
export function getTaskStatus(task: Task) {
  // If task is completed, it's no longer overdue or approaching
  if (task.completed) {
    return "completed"
  }

  const now = new Date()
  const taskDate = new Date(task.dueDate)

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
export function formatDate(dateString: string, includeTime?: boolean) {
  const date = new Date(dateString)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)

  if (!includeTime) return formattedDate

  return `${formattedDate}, ${formatTime(dateString)}`
}

// Format time for display
export function formatTime(dateTimeString: string) {
  const date = new Date(dateTimeString)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const hour12 = hours % 12 || 12

  return `${hour12}:${minutes} ${ampm}`
}