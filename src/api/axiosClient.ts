import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // cookies manually
});

// Function to get new access_token using refresh_token
async function refreshAccessToken() {
  const refresh = Cookies.get("refresh_token");
  if (!refresh) {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/auth/login";
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_URL}account/token/refresh/`, { refresh });
    const newAccess = response.data.access;
    Cookies.set("access_token", newAccess, { expires: 1, secure: true });
    return newAccess;
  } catch (error) {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/auth/login";
    throw error;
  }
}

// Request interceptor: add access_token or update it
axiosClient.interceptors.request.use(async (config) => {
  let accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  // If there is an access_token, but no refresh_token, redirect to login
  if (accessToken && !refreshToken) {
    Cookies.remove("access_token");
    window.location.href = "/auth/login";
    throw new Error("No refresh token available");
  }

  // If there is no access_token, but there is a refresh_token, we try to update
  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken();
  }

  // If access_token exists, add it to the headers
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 (expired token)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/account/token/refresh/")
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;