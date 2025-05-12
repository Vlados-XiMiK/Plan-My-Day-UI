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
  category?: number | null;
  priority: "high" | "medium" | "low";
  completed: boolean;
  starred: boolean;
  date?: string;
}

export interface APITask {
  id: number;
  title?: string;
  description?: string;
  created_at?: string;
  due_date?: string;
  category?: number | null;
  priority: "H" | "M" | "L";
  completed?: boolean;
  is_favorite?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  due_date?: string;
  category?: number | null;
  priority?: "H" | "M" | "L";
  completed?: boolean;
  is_favorite?: boolean;
}


export interface Category {
  id: number;
  name: string;
  color: string;
}

// END TASKS AND CATEGORY

// PROFILE

export interface User {
  username: string;
  email: string;
  age: number | null;
  place_of_work: string;
  phone_number: string;
  last_login_at: string | null;
  last_profile_edit_at: string | null;
  last_task_completed_at: string | null;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

export interface ProfileStats {
  completedTasks: number;
  ongoingTasks: number;
  totalTasks: number;
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
    return "completed";
  }

  const now = new Date();
  const taskDate = new Date(task.dueDate);

  const timeDiff = taskDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  if (timeDiff < 0) {
    return "overdue"; // Past deadline
  } else if (hoursDiff <= 24) {
    return "approaching"; // Within 24 hours
  }

  return "normal";
}

// Format date for display
export function formatDate(dateString: string, includeTime?: boolean) {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

  if (!includeTime) return formattedDate;

  return `${formattedDate}, ${formatTime(dateString)}`;
}

// Format time for display
export function formatTime(dateTimeString: string) {
  const date = new Date(dateTimeString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
}
