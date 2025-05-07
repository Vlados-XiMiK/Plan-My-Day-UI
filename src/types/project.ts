export interface User {
    id: string
    name: string
    email: string
    avatar: string
    role?: "full_access" | "read_only" | "complete_only"
  }
  
  export interface TaskCompletion {
    completedBy: string // User ID
    completedAt: string // ISO date string
  }
  
  export interface Task {
    id: string
    title: string
    description?: string
    completed: boolean
    createdAt: string
    dueDate?: string
    priority?: "low" | "medium" | "high"
    category?: string
    completion?: TaskCompletion
  }
  
  export interface Project {
    id: string
    title: string
    description: string
    createdBy: User
    members: User[]
    tasks: Task[]
    createdAt: string
  }
  