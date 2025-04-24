import { Task, Category } from '@/types';


const tasks: Task[] = [
  {
    id: 1,
    title: 'Завершить проектное предложение',
    description: 'Завершить черновик и отправить на проверку.',
    createdAt: '2024-06-08T10:00:00',
    dueDate: '2025-04-24T15:00:00',
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
    dueDate: '2025-04-10T18:00:00',
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
    dueDate: '2025-04-20T15:00:00',
    category: 'Личное',
    priority: 'low',
    completed: false,
    starred: false,
  },
];

const categories: Category[] = [
  { name: 'Работа', color: '#9d75b5' },
  { name: 'Покупки', color: '#9d75b5' },
  { name: 'Личное', color: '#9d75b5' },
  { name: 'Прикол', color: '#9d75b5' },
];

// Simulate an API request for tasks
export async function fetchTasks(): Promise<Task[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Преобразуем задачи, добавляя поле date на основе dueDate
      const transformedTasks = tasks.map((task) => ({
        ...task,
        date: task.dueDate.split('T')[0], // Извлекаем дату (YYYY-MM-DD) из dueDate
      }));
      resolve(transformedTasks);
    }, 500);
  });
}

// Simulate API request for categories
export async function fetchCategories(): Promise<Category[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const defaultColor = '#9d75b5';
      const normalized = categories.map((cat) => ({
        ...cat,
        color: cat.color || defaultColor,
      }));
      resolve(normalized);
    }, 500);
  });
}

export function calculateTimeRemaining(dueDate: string): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes }
}