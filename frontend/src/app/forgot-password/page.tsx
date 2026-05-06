"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { LayoutDashboard, ArrowLeft, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth.api";
import { getErrorMessage } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    mutate: forgotPassword,
    isPending,
    error,
  } = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    forgotPassword(email.trim());
  };

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
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Te enviaremos un enlace para restablecerla
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:bg-gray-900 dark:border-gray-700">
          {/* Estado enviado */}
          {submitted ? (
            <div className="flex flex-col items-center gap-4 text-center py-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
                <Mail className="h-7 w-7 text-green-500" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Revisa tu email
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Si existe una cuenta con <strong>{email}</strong>, recibirás
                  un enlace en los próximos minutos.
                </p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                ¿No lo ves? Revisa la carpeta de spam.
              </p>
            </div>
          ) : (
            <>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  autoComplete="email"
                  required
                  autoFocus
                />
                <Button type="submit" className="w-full" isLoading={isPending}>
                  {isPending ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </form>
            </>
          )}
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
