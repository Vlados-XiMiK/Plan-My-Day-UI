// data/tasks-data.ts
import { Task, Category } from "@/types";
import { fetchTasks as fetchTasksFromApi } from "@/api/tasks";
import { fetchCategories as fetchCategoriesFromApi } from "@/api/categories";

// Получение списка задач
export async function fetchTasks(): Promise<Task[]> {
  try {
    return await fetchTasksFromApi();
  } catch (error) {
    console.error("Error in fetchTasks:", error);
    throw error;
  }
}

// Получение списка категорий
export async function fetchCategories(): Promise<Category[]> {
  try {
    return await fetchCategoriesFromApi();
  } catch (error) {
    console.error("Error in fetchCategories:", error);
    throw error;
  }
}

// Утилита для подсчета времени до дедлайна
export function calculateTimeRemaining(dueDate: string): {
  days: number;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}
