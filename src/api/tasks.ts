import { AxiosError } from "axios";
import axiosClient from "@/api/axiosClient";
import { Task } from "@/types";

// Интерфейс для структуры ответа об ошибке
interface ErrorResponse {
  detail?: string;
  [key: string]: string | undefined | any[];
}

// Интерфейс для ответа API с пагинацией
interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

// Преобразование приоритета API в клиентский формат
const mapPriorityToString = (priority: string): "high" | "medium" | "low" => {
  switch (priority) {
    case "H":
      return "high";
    case "M":
      return "medium";
    case "L":
      return "low";
    default:
      return "medium";
  }
};

// Получение списка задач
export async function fetchTasks(): Promise<Task[]> {
  try {
    const response = await axiosClient.get("/tasks/");
    const data: PaginatedResponse = response.data;
    console.log("Tasks API response:", data);

    const tasks = Array.isArray(data.results) ? data.results : [];
    if (!tasks.length) {
      console.warn("No tasks found in response:", data);
    }

    return tasks.map((task: any) => ({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      createdAt: task.created_at || new Date().toISOString(),
      dueDate: task.due_date || new Date().toISOString(),
      category: task.category || undefined,
      priority: mapPriorityToString(task.priority) || "medium",
      completed: task.completed || false,
      starred: task.is_favorite || false,
      date: task.due_date ? task.due_date.split(" ")[0] : new Date().toISOString().split("T")[0],
    }));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
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

// Создание новой задачи
export async function createTask(task: any): Promise<Task> {
  try {
    console.log("Creating task with payload:", task);
    const response = await axiosClient.post("/tasks/", task);
    const createdTask: any = response.data;
    console.log("Created task:", createdTask);
    return {
      id: createdTask.id,
      title: createdTask.title || "",
      description: createdTask.description || "",
      createdAt: createdTask.created_at || new Date().toISOString(),
      dueDate: createdTask.due_date || new Date().toISOString(),
      category: createdTask.category || undefined,
      priority: mapPriorityToString(createdTask.priority) || "medium",
      completed: createdTask.completed || false,
      starred: createdTask.is_favorite || false,
      date: createdTask.due_date
        ? createdTask.due_date.split(" ")[0]
        : new Date().toISOString().split("T")[0],
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to create task:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(axiosError.response?.data?.detail || "Failed to create task");
    }
    console.error("Failed to create task:", error);
    throw new Error("Failed to create task");
  }
}

// Обновление задачи
export async function updateTask(id: number, task: any): Promise<Task> {
  try {
    console.log("Updating task with payload:", task);
    const response = await axiosClient.put(`/tasks/${id}/`, task);
    const updatedTask: any = response.data;
    console.log("Updated task:", updatedTask);
    return {
      id: updatedTask.id,
      title: updatedTask.title || "",
      description: updatedTask.description || "",
      createdAt: updatedTask.created_at || new Date().toISOString(),
      dueDate: updatedTask.due_date || new Date().toISOString(),
      category: updatedTask.category || undefined,
      priority: mapPriorityToString(updatedTask.priority) || "medium",
      completed: updatedTask.completed || false,
      starred: updatedTask.is_favorite || false,
      date: updatedTask.due_date
        ? updatedTask.due_date.split(" ")[0]
        : new Date().toISOString().split("T")[0],
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to update task:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(axiosError.response?.data?.detail || "Failed to update task");
    }
    console.error("Failed to update task:", error);
    throw new Error("Failed to update task");
  }
}

// Удаление задачи
export async function deleteTask(id: number): Promise<void> {
  try {
    await axiosClient.delete(`/tasks/${id}/`);
    console.log("Deleted task:", id);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to delete task:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(axiosError.response?.data?.detail || "Failed to delete task");
    }
    console.error("Failed to delete task:", error);
    throw new Error("Failed to delete task");
  }
}