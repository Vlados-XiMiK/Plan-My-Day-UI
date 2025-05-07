import axios from "axios";
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

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await axiosClient.post(`auth/users/register/`, payload);
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.email?.[0] ||
      error.response?.data?.password?.[0] ||
      error.response?.data?.detail ||
      "Registration failed";

    throw new Error(errorMessage, {
      cause: {
        field: error.response?.data?.email
          ? "email"
          : error.response?.data?.password
          ? "password"
          : null,
        detail: error.response?.data,
      },
    });
  }
}

export async function loginUser(payload: LoginPayload) {
  try {
    const response = await axios.post(`${API_URL}auth/users/login/`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    const { access, refresh } = response.data;

    Cookies.set("access_token", access, { expires: 1 / 24, sameSite: "strict" });
    Cookies.set("refresh_token", refresh, { expires: 7, sameSite: "strict" });

    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.detail || "Login failed";
    throw new Error(errorMessage, {
      cause: {
        detail: error.response?.data,
      },
    });
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
  
      const response = await axiosClient.post("auth/users/logout/", {
        refresh, 
      });
  
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      return response.data;
    } catch (error: any) {
      console.error("Logout failed:", error.response?.data || error);
      throw new Error("Logout failed");
    }
  }