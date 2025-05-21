export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  category: string | number | null;
  due_date: string | null;
  priority: 'H' | 'M' | 'L';
  completed: boolean;
  is_favorite: boolean;
  user: number;
  user_name: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: number | null;
  completed_by_name: string | null;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  owner: number;
  tasks_count: number;
  created_at: string;
}

export interface ProjectShareLink {
  id: number
  project: number
  share_url: string
  role: number
  role_name: string // Добавлено для соответствия ответу сервера
  max_uses: number
  expires_at: string
  is_active: boolean // Добавлено
  created_by: string // Добавлено
  created_at: string
}

export interface PaginatedProjects {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export interface PaginatedTasks {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

export interface PaginatedProjectShareLinks {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProjectShareLink[];
}