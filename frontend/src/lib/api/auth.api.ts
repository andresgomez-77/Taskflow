import apiClient from "./client";
import type { AuthResponse } from "@/types";

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}
interface LoginData {
  email: string;
  password: string;
}
interface UpdateProfileData {
  name: string;
}
interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.patch("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await apiClient.patch("/auth/password", data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (
    data: ResetPasswordData,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },
};
