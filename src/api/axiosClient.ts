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

// if access token expired
axiosClient.interceptors.response.use(
  (response) => response, // everything is fine - we give it as is
  async (error) => {
    const originalRequest = error.config;

    // If the token has expired and this is not a refresh request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/token/refresh/")
    ) {
      originalRequest._retry = true;

      const refresh = Cookies.get("refresh_token");
      if (!refresh) {
        // refresh no — logout
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        // try to get a new access token
        const response = await axios.post(`${API_URL}auth/token/refresh/`, {
          refresh,
        });

        const newAccess = response.data.access;

        // save new access in cookie
        Cookies.set("access_token", newAccess, { expires: 1, secure: true });

        // repeat the original request with a new token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // refresh also expired - delete cookies, redirect
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add an access token to each request
axiosClient.interceptors.request.use((config) => {
  const accessToken = Cookies.get("access_token");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosClient;
