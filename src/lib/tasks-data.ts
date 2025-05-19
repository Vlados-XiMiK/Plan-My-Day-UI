import { Task, Category, TaskFilterParams } from "@/types";
import { fetchTasks as fetchTasksFromApi } from "@/api/tasks";
import { fetchCategories as fetchCategoriesFromApi } from "@/api/categories";

// Getting a list of tasks (with pagination, for other components)
export async function fetchTasks(filters: TaskFilterParams = {}): Promise<Task[]> {
  try {
    const paginatedResponse = await fetchTasksFromApi(filters);
    return paginatedResponse.results; // Return only tasks
  } catch (error) {
    // console.error("Error in fetchTasks:", error);
    throw error;
  }
}

// New function to get all tasks (for calendar)
export async function fetchAllTasks(): Promise<Task[]> {
  try {
    let allTasks: Task[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const paginatedResponse = await fetchTasksFromApi({ page });
      allTasks = [...allTasks, ...paginatedResponse.results];
      hasNext = paginatedResponse.next !== null;
      page += 1;
    }

    // console.log(`Fetched ${allTasks.length} tasks in total for calendar`);
    return allTasks;
  } catch (error) {
    // console.error("Error in fetchAllTasks:", error);
    throw error;
  }
}

// Getting a list of categories
export async function fetchCategories(): Promise<Category[]> {
  try {
    return await fetchCategoriesFromApi();
  } catch (error) {
    // console.error("Error in fetchCategories:", error);
    throw error;
  }
}

// Utility for calculating time until deadline
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