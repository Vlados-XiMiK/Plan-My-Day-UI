import { Task } from '@/types';

export interface Category {
  name: string;
  color: string;
}

const tasks: Task[] = [
  {
    id: 1,
    title: 'Завершить проектное предложение',
    description: 'Завершить черновик и отправить на проверку.',
    createdAt: '2024-06-08T10:00:00',
    dueDate: '2025-02-25T23:00:00',
    date: '2025-02-25', // Added for calendar
    category: 'Работа',
    priority: 'high',
    completed: false,
    starred: false,
  },
  {
    id: 2,
    title: 'Купить продукты',
    description: 'Купить продукты на неделю.',
    createdAt: '2024-06-09T14:30:00',
    dueDate: '2026-06-10T18:00:00',
    date: '2026-06-10',
    category: 'Покупки',
    priority: 'medium',
    completed: true,
    starred: true,
  },
  {
    id: 3,
    title: 'Записаться к стоматологу',
    description: 'Позвонить в клинику для записи на осмотр.',
    createdAt: '2024-06-10T09:15:00',
    dueDate: '2025-02-25T15:00:00',
    date: '2025-02-25',
    category: 'Личное',
    priority: 'low',
    completed: false,
    starred: false,
  },
];

const categories: Category[] = [
  { name: 'Работа', color: '#9d75b5' },
  { name: 'Покупки', color: '#4CAF50' },
  { name: 'Личное', color: '#2196F3' },
  { name: 'Прикол', color: '#757575' },
];

// Simulate an API request for tasks
export async function fetchTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(tasks), 500); // Delay to simulate network request
  });
}

// Simulate API request for categories
export async function fetchCategories(): Promise<Category[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(categories), 500);
  });
}