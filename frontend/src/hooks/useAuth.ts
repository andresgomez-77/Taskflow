"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { getErrorMessage, queryKeys } from "@/lib/utils";

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/dashboard");
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/dashboard");
    },
  });
};

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };
  return { handleLogout };
};

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateProfile = () => {
  const { user, setAuth, token } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => authApi.updateProfile({ name }),
    onSuccess: (updatedUser) => {
      if (user && token) {
        setAuth({ ...user, name: updatedUser.name }, token);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
  });
};

export const useAuthError = (error: unknown): string | null => {
  if (!error) return null;
  return getErrorMessage(error);
};
