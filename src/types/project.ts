export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string; // Added for custom avatar support
  age?: number | null;
  place_of_work?: string;
  phone_number?: string;
  last_login_at?: string;
  last_profile_edit_at?: string | null;
  last_task_completed_at?: string | null;
}

export interface TaskCompletion {
  completedBy: string; // Changed to string to match task data
  completedAt: string;
}

export interface Task {
  id: string; // Changed to string to match task data
  title: string;
  description: string;
  completed: boolean;
  created_at: string; // Renamed to created_at for API consistency
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  completion?: TaskCompletion;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: number;
  tasks_count: number;
  created_at: string;
  tasks: Task[]; // Added to store tasks in project
}