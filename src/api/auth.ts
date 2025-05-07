import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface RegisterPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  try {
    const response = await axios.post(`${API_URL}auth/users/register/`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.email?.[0] ||
      error.response?.data?.password?.[0] ||
      error.response?.data?.detail ||
      "Registration failed";

    throw new Error(errorMessage, {
      cause: {
        field: error.response?.data?.email ? "email" : error.response?.data?.password ? "password" : null,
        detail: error.response?.data,
      },
    });
  }
}
