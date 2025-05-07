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

// Функция для получения нового access_token с помощью refresh_token
async function refreshAccessToken() {
  const refresh = Cookies.get("refresh_token");
  if (!refresh) {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = "/auth/login";
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_URL}auth/token/refresh/`, { refresh });
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

// Интерцептор запросов: добавляем access_token или обновляем его
axiosClient.interceptors.request.use(async (config) => {
  let accessToken = Cookies.get("access_token");
  const refreshToken = Cookies.get("refresh_token");

  // Если есть access_token, но нет refresh_token, перенаправляем на логин
  if (accessToken && !refreshToken) {
    Cookies.remove("access_token");
    window.location.href = "/auth/login";
    throw new Error("No refresh token available");
  }

  // Если access_token нет, но есть refresh_token, пытаемся обновить
  if (!accessToken && refreshToken) {
    accessToken = await refreshAccessToken();
  }

  // Если access_token есть, добавляем его в заголовки
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Интерцептор ответов: обрабатываем 401 (истекший токен)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/token/refresh/")
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