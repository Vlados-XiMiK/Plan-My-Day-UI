import { Task, Category } from '@/types';


const tasks: Task[] = [
  {
    id: 1,
    title: 'Завершить проектное предложение',
    description: 'Завершить черновик и отправить на проверку.',
    createdAt: '2024-06-08T10:00:00',
    dueDate: '2025-04-25T23:00:00',
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
  { name: 'Покупки', color: '#4CAF50' },
  { name: 'Личное', color: '#2196F3' },
  { name: 'Прикол', color: '#757575' },
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
    setTimeout(() => resolve(categories), 500);
  });
}