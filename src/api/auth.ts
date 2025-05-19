import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import axiosClient from "@/api/axiosClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Interface for the error response structure
interface ErrorResponse {
  email?: string[];
  password?: string[];
  detail?: string;
}

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await axiosClient.post(`account/register/`, payload);
    return response.data;
  } catch (error: unknown) { 
    // Check if the error is an instance of AxiosError
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        axiosError.response?.data?.email?.[0] ||
        axiosError.response?.data?.password?.[0] ||
        axiosError.response?.data?.detail ||
        "Registration failed";

      throw new Error(errorMessage, {
        cause: {
          field: axiosError.response?.data?.email
            ? "email"
            : axiosError.response?.data?.password
            ? "password"
            : null,
          detail: axiosError.response?.data,
        },
      });
    } else {
      // If the error is not from Axios, throw a generic error
      throw new Error("Registration failed");
    }
  }
}

export async function loginUser(payload: LoginPayload) {
  try {
    const response = await axios.post(`${API_URL}account/login/`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    const { access, refresh } = response.data;

    Cookies.set("access_token", access, { expires: 1 / 24, sameSite: "strict" });
    Cookies.set("refresh_token", refresh, { expires: 7, sameSite: "strict" });

    return response.data;
  } catch (error: unknown) { 
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage = axiosError.response?.data?.detail || "Login failed";
      throw new Error(errorMessage, {
        cause: {
          detail: axiosError.response?.data,
        },
      });
    } else {
      throw new Error("Login failed");
    }
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  // If access_token or refresh_token exists, assume user is authenticated
  // Actual token validity will be checked by axiosClient interceptor on API calls
  return !!(accessToken || refreshToken);
}

export async function logoutUser() {
  try {
    const refresh = Cookies.get("refresh_token");

    const response = await axiosClient.post("account/logout/", {
      refresh,
    });

    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // console.error("Logout failed:", axiosError.response?.data || axiosError);
      throw new Error("Logout failed");
    } else {
      // console.error("Logout failed:", error);
      throw new Error("Logout failed");
    }
  }
}