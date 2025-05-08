import { AxiosError } from "axios";
import axiosClient from "@/api/axiosClient";
import { Category } from "@/types";

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
  results: Category[];
}

// Получение списка категорий
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await axiosClient.get("/tasks/manage/categories/");
    const data: PaginatedResponse = response.data;
    console.log("Categories API response:", data);

    const categories = Array.isArray(data.results) ? data.results : [];
    if (!categories.length) {
      console.warn("No categories found in response:", data);
    }

    return categories.map((cat: Category) => ({
      id: cat.id,
      name: cat.name || "Uncategorized",
      color: cat.color || "#9d75b5",
    }));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to fetch categories:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to fetch categories",
        {
          cause: { detail: axiosError.response?.data },
        }
      );
    }
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

// Создание новой категории
export async function createCategory(
  category: Partial<Category>
): Promise<Category> {
  try {
    const response = await axiosClient.post(
      "/tasks/manage/categories/",
      category
    );
    const createdCategory: Category = response.data;
    console.log("Created category:", createdCategory);
    return createdCategory;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to create category:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to create category"
      );
    }
    console.error("Failed to create category:", error);
    throw new Error("Failed to create category");
  }
}

// Обновление категории
export async function updateCategory(
  id: number,
  category: Partial<Category>
): Promise<Category> {
  try {
    const response = await axiosClient.put(
      `/tasks/manage/categories/${id}/`,
      category
    );
    const updatedCategory: Category = response.data;
    console.log("Updated category:", updatedCategory);
    return updatedCategory;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to update category:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to update category"
      );
    }
    console.error("Failed to update category:", error);
    throw new Error("Failed to update category");
  }
}

// Удаление категории
export async function deleteCategory(id: number): Promise<void> {
  try {
    await axiosClient.delete(`/tasks/manage/categories/${id}/`);
    console.log("Deleted category:", id);
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to delete category:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to delete category"
      );
    }
    console.error("Failed to delete category:", error);
    throw new Error("Failed to delete category");
  }
}
