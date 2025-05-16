import type { Project, User } from '@/types/project';
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
    tasks_count: 4, // Updated to reflect number of tasks
    created_at: '2025-05-16T10:02:20.153068+03:00',
    tasks: [
      {
        id: 'task4',
        title: 'Create wireframes',
        description: 'Design wireframes for all app screens',
        completed: true,
        created_at: '2023-11-05T11:30:00Z',
        due_date: '2023-11-10T18:00:00Z',
        priority: 'high',
        category: 'design',
        completion: {
          completedBy: '20', // Replaced "user1" with user id from availableUsers
          completedAt: '2023-11-09T16:45:00Z',
        },
      },
      {
        id: 'task5',
        title: 'Develop UI components',
        description: 'Build reusable UI components for the app',
        completed: true,
        created_at: '2023-11-11T09:45:00Z',
        due_date: '2023-11-20T18:00:00Z',
        priority: 'medium',
        category: 'development',
        completion: {
          completedBy: '20',
          completedAt: '2023-11-18T11:30:00Z',
        },
      },
      {
        id: 'task6',
        title: 'Implement authentication',
        description: 'Add user login and registration functionality',
        completed: false,
        created_at: '2023-11-21T14:15:00Z',
        due_date: '2023-12-01T18:00:00Z',
        priority: 'high',
        category: 'development',
      },
      {
        id: 'task7',
        title: 'Test on different devices',
        description: 'Ensure app works on various device sizes and OS versions',
        completed: false,
        created_at: '2023-11-25T10:00:00Z',
        due_date: '2023-12-10T18:00:00Z',
        priority: 'medium',
        category: 'testing',
      },
    ],
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
  avatar: '', // Added for custom avatar
  age: null,
  place_of_work: '',
  phone_number: '',
  last_login_at: '2025-05-16T10:28:15.467777+03:00',
  last_profile_edit_at: null,
  last_task_completed_at: '2025-05-16T11:28:30.061339+03:00',
};

// Available users
export const availableUsers: User[] = [
  {
    id: 20,
    username: 'tvladislav0504',
    email: 'tvladislav0504@gmail.com',
    avatar: '', // Added for custom avatar
    age: null,
    place_of_work: '',
    phone_number: '',
  },
  {
    id: 22,
    username: 'testinguser52',
    email: 'testinguser52@gmail.com',
    avatar: '', // Added for custom avatar
    age: null,
    place_of_work: '',
    phone_number: '',
    last_login_at: '2025-05-16T10:28:15.467777+03:00',
    last_profile_edit_at: null,
    last_task_completed_at: '2025-05-16T11:28:30.061339+03:00',
  },
];