"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoginFormState {
  email: string;
  password: string;
}
interface LoginFormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const { mutate: login, isPending, error } = useLogin();

  const validate = (): boolean => {
    const newErrors: LoginFormErrors = {};
    if (!formState.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formState.email))
      newErrors.email = "Email inválido";
    if (!formState.password) newErrors.password = "La contraseña es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    login(formState);
  };

  const handleChange = (field: keyof LoginFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
            <LayoutDashboard
              className="h-6 w-6 text-white"
              aria-hidden="true"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bienvenido
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Inicia sesión en tu cuenta de TaskFlow
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
            >
              {getErrorMessage(error)}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formState.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
              disabled={isPending}
              autoComplete="email"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={formState.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              disabled={isPending}
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="mt-2 w-full" isLoading={isPending}>
              {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Regístrate gratis
          </Link>
        </p>
      </div>
    </main>
  );
}
