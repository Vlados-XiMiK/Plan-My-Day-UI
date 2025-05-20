import type { Project, User, Task, ProjectShareLink } from '@/types/project';
import type { ProjectMember, Role } from '@/types/roles';

// Roles definition
export const roles: Role[] = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Moderator' },
  { id: 3, name: 'Member' },
  { id: 4, name: 'Viewer' },
];

// Sample projects
export const initialProjects: Project[] = [
  {
    id: 11,
    name: 'Test Project 3',
    description: 'Это тестовое описание проекта',
    owner: 20,
    tasks_count: 4,
    created_at: '2025-05-16T10:02:20.153068+03:00',
  },
];

// Sample tasks (separated from projects)
export const projectTasks: Task[] = [
  {
    id: 4,
    title: 'Create wireframes',
    description: 'Design wireframes for all app screens',
    category: 'design',
    due_date: '2023-11-10T18:00:00Z',
    priority: 'H',
    completed: true,
    is_favorite: false,
    user: 20,
    user_name: 'tvladislav0504',
    created_at: '2023-11-05T11:30:00Z',
    updated_at: '2023-11-09T16:45:00Z',
    completed_at: '2023-11-09T16:45:00Z',
    completed_by: 20,
    completed_by_name: 'tvladislav0504',
  },
  {
    id: 5,
    title: 'Develop UI components',
    description: 'Build reusable UI components for the app',
    category: 'development',
    due_date: '2023-11-20T18:00:00Z',
    priority: 'M',
    completed: true,
    is_favorite: false,
    user: 20,
    user_name: 'tvladislav0504',
    created_at: '2023-11-11T09:45:00Z',
    updated_at: '2023-11-18T11:30:00Z',
    completed_at: '2023-11-18T11:30:00Z',
    completed_by: 20,
    completed_by_name: 'tvladislav0504',
  },
  {
    id: 6,
    title: 'Implement authentication',
    description: 'Add user login and registration functionality',
    category: 'development',
    due_date: '2023-12-01T18:00:00Z',
    priority: 'H',
    completed: false,
    is_favorite: false,
    user: 20,
    user_name: 'tvladislav0504',
    created_at: '2023-11-21T14:15:00Z',
    updated_at: '2023-11-21T14:15:00Z',
    completed_at: null,
    completed_by: null,
    completed_by_name: null,
  },
  {
    id: 7,
    title: 'Test on different devices',
    description: 'Ensure app works on various device sizes and OS versions',
    category: 'testing',
    due_date: '2023-12-10T18:00:00Z',
    priority: 'M',
    completed: false,
    is_favorite: false,
    user: 20,
    user_name: 'tvladislav0504',
    created_at: '2023-11-25T10:00:00Z',
    updated_at: '2023-11-25T10:00:00Z',
    completed_at: null,
    completed_by: null,
    completed_by_name: null,
  },
];

// Sample project share links
export const projectShareLinks: ProjectShareLink[] = [
  {
    id: 7,
    share_url: 'http://localhost:8000/api/v1/projects/join/11542c8d-69bc-488c-926d-fa96d61eee16/',
    role_name: 'Viewer',
    max_uses: 5,
    expires_at: '2025-05-16T13:47:08.184647+03:00',
    is_active: true,
    created_by: 'tvladislav0504',
    created_at: '2025-05-16T12:07:08.185067+03:00',
    project: 0,
    role: 0
  },
];

// Sample project members (from separate API call)
export const projectMembers: ProjectMember[] = [
  {
    id: 3,
    user: 20,
    user_name: 'tvladislav0504',
    user_details: {
      id: 20,
      username: 'tvladislav0504',
      email: 'tvladislav0504@gmail.com',
      avatar: ''
    },
    project: 11,
    role: 1,
    role_name: 'Admin',
  },
  {
    id: 4,
    user: 22,
    user_name: 'testinguser52',
    user_details: {
      id: 22,
      username: 'testinguser52',
      email: 'testinguser52@gmail.com',
      avatar: '',
    },
    project: 11,
    role: 4,
    role_name: 'Viewer',
  },
];

// Current user
export const currentUser: User = {
  id: 20,
  username: 'tvladislav0504',
  email: 'tvladislav0504@gmail.com',
  avatar: '',
};