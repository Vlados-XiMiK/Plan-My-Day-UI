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
    const response = await axiosClient.post(`auth/users/register/`, payload); // use axiosClient

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
      withCredentials: true, // if backend works with cookies
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
