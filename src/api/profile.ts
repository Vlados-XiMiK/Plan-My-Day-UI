import { AxiosError } from "axios";
import axios from "axios";
import axiosClient from "@/api/axiosClient";
import { User } from "@/types";

// Interface for error response structure
interface ErrorResponse {
  detail?: string;
}

export async function getUserProfile(): Promise<User> {
  try {
    const response = await axiosClient.get("/account/profile/");
    console.log("Profile API response:", response.data);
    const data = response.data;
    return {
      username: data.username || "",
      email: data.email || "",
      age: data.age ?? null,
      place_of_work: data.place_of_work || "",
      phone_number: data.phone_number || "",
      last_login_at: data.last_login_at ?? null,
      last_profile_edit_at: data.last_profile_edit_at ?? null,
      last_task_completed_at: data.last_task_completed_at ?? null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to fetch user profile:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to fetch user profile",
        {
          cause: {
            detail: axiosError.response?.data,
          },
        }
      );
    } else {
      console.error("Failed to fetch user profile:", error);
      throw new Error("Failed to fetch user profile");
    }
  }
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  try {
    console.log("Sending updateUserProfile request with data:", data);
    const response = await axiosClient.patch("account/update_profile/", {
      username: data.username,
      email: data.email,
      age: data.age ?? null,
      place_of_work: data.place_of_work,
      phone_number: data.phone_number,
    });
    console.log("Update profile API response:", response.data);
    const updatedData = response.data;
    return {
      username: updatedData.username || "",
      email: updatedData.email || "",
      age: updatedData.age ?? null,
      place_of_work: updatedData.place_of_work || "",
      phone_number: updatedData.phone_number || "",
      last_login_at: updatedData.last_login_at ?? null,
      last_profile_edit_at: updatedData.last_profile_edit_at ?? null,
      last_task_completed_at: updatedData.last_task_completed_at ?? null,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error(
        "Failed to update user profile:",
        axiosError.response?.data || axiosError.message
      );
      throw new Error(
        axiosError.response?.data?.detail || "Failed to update user profile",
        {
          cause: {
            detail: axiosError.response?.data,
          },
        }
      );
    } else {
      console.error("Failed to update user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }
}
