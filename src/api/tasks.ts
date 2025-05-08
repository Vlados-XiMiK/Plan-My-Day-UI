// api/tasks.ts
import { AxiosError } from "axios";
import axios from "axios";
import axiosClient from "@/api/axiosClient";
import { Task } from "@/types";

// Интерфейс для структуры ответа об ошибке
interface ErrorResponse {
    detail?: string;
    [key: string]: string | undefined;
}

// Интерфейс для ответа API с пагинацией
interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Task[];
  }

// Получение списка задач
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await axiosClient.get("/tasks/");
    const data: PaginatedResponse = response.data;
    console.log("Tasks API response:", data); // Логируем ответ для отладки

    // Извлекаем массив из поля results, если оно есть
    const tasks = Array.isArray(data.results) ? data.results : [];
    if (!tasks.length) {
      console.warn("No tasks found in response:", data);
    }

    return tasks.map((task: Task) => ({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      createdAt: task.createdAt || new Date().toISOString(),
      dueDate: task.dueDate || new Date().toISOString(),
      category: task.category || "Uncategorized",
      priority: task.priority || "medium",
      completed: task.completed || false,
      starred: task.starred || false,
      date: task.dueDate
        ? task.dueDate.split("T")[0]
        : new Date().toISOString().split("T")[0],
    }));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to fetch tasks:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to fetch tasks",
        {
          cause: { detail: axiosError.response?.data },
        }
      );
    }
    console.error("Failed to fetch tasks:", error);
    throw new Error("Failed to fetch tasks");
  }
}
