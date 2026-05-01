"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { useRegister } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [formState, setFormState] = useState<RegisterFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const { mutate: register, isPending, error } = useRegister();

  const validate = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    if (!formState.email) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(formState.email))
      newErrors.email = "Email inválido";
    if (!formState.password) newErrors.password = "La contraseña es requerida";
    else if (formState.password.length < 8)
      newErrors.password = "Mínimo 8 caracteres";
    if (formState.password !== formState.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    register({
      email: formState.email,
      password: formState.password,
      name: formState.name || undefined,
    });
  };

  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof RegisterFormErrors])
      setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
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
              Crear cuenta
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Empieza a gestionar tus tareas hoy
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
              label="Nombre"
              type="text"
              placeholder="Tu nombre (opcional)"
              value={formState.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
              disabled={isPending}
              autoComplete="name"
            />
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
              placeholder="Mínimo 8 caracteres"
              value={formState.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              disabled={isPending}
              autoComplete="new-password"
              hint="Al menos 8 caracteres"
              required
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu contraseña"
              value={formState.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              disabled={isPending}
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="mt-2 w-full" isLoading={isPending}>
              {isPending ? "Creando cuenta..." : "Crear cuenta gratis"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
