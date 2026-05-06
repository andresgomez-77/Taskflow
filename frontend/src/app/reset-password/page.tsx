"use client";

import Link from "next/link";
import { type FormEvent, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutDashboard, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ─── ResetPasswordForm ────────────────────────────────────────────────────────
// Separado en componente propio porque useSearchParams necesita Suspense
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formState, setFormState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const {
    mutate: resetPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => setSuccess(true),
  });

  // Si no hay token en la URL — token inválido
  const isTokenMissing = !token;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formState.newPassword) newErrors.newPassword = "Requerida";
    else if (formState.newPassword.length < 8)
      newErrors.newPassword = "Mínimo 8 caracteres";
    if (formState.newPassword !== formState.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !token) return;
    resetPassword({ token, newPassword: formState.newPassword });
  };

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (isTokenMissing) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          Enlace inválido. Solicita uno nuevo.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
          <CheckCircle2 className="h-7 w-7 text-green-500" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            ¡Contraseña restablecida!
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Ir al login
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {getErrorMessage(error)}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={formState.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          error={errors.newPassword}
          disabled={isPending}
          autoComplete="new-password"
          hint="Al menos 8 caracteres"
          autoFocus
          required
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite la nueva contraseña"
          value={formState.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          disabled={isPending}
          autoComplete="new-password"
          required
        />

        <Button type="submit" className="w-full" isLoading={isPending}>
          {isPending ? "Restableciendo..." : "Restablecer contraseña"}
        </Button>
      </form>
    </>
  );
};

// ─── ResetPasswordPage ────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
            <LayoutDashboard
              className="h-6 w-6 text-white"
              aria-hidden="true"
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Nueva contraseña
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Elige una contraseña segura
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          <Suspense
            fallback={
              <p className="text-sm text-gray-500 text-center">Cargando...</p>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}
