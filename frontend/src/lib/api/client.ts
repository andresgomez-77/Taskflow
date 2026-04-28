import axios, { type AxiosError } from "axios";
import type { ApiError } from "@/types";
import { type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está definida");
}

const isBrowser = typeof window !== "undefined";

const getToken = () => {
  if (!isBrowser) return null;
  return localStorage.getItem("taskflow_token");
};

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();

  if (token && config.headers) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // error del backend
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request setup error:", error.message);
    }

    if (error.response?.status === 401 && isBrowser) {
      localStorage.removeItem("taskflow_token");
      localStorage.removeItem("taskflow_user");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
