"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, User, Lock, Save, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import {
  useUpdateProfile,
  useChangePassword,
  useLogout,
} from "@/hooks/useAuth";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage, cn } from "@/lib/utils";

// ─── Avatar con iniciales ─────────────────────────────────────────────────────
const UserAvatar = ({
  name,
  email,
}: {
  name: string | null;
  email: string;
}) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-lg">
      {initials}
    </div>
  );
};

// ─── Profile Form ─────────────────────────────────────────────────────────────
const ProfileForm = () => {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [success, setSuccess] = useState(false);
  const { mutate: updateProfile, isPending, error } = useUpdateProfile();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateProfile(name.trim(), {
      onSuccess: () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {getErrorMessage(error)}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          ✅ Perfil actualizado correctamente
        </div>
      )}

      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        disabled={isPending}
      />

      <Input
        label="Email"
        value={user?.email ?? ""}
        disabled
        hint="El email no se puede cambiar"
      />

      <Button
        type="submit"
        isLoading={isPending}
        disabled={!name.trim() || name.trim() === user?.name}
        leftIcon={<Save className="h-4 w-4" aria-hidden="true" />}
        className="self-end"
      >
        Guardar cambios
      </Button>
    </form>
  );
};

// ─── Password Form ────────────────────────────────────────────────────────────
const PasswordForm = () => {
  const { handleLogout } = useLogout();
  const [formState, setFormState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const { mutate: changePassword, isPending, error } = useChangePassword();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formState.currentPassword) newErrors.currentPassword = "Requerida";
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
    if (!validate()) return;
    changePassword(
      {
        currentPassword: formState.currentPassword,
        newPassword: formState.newPassword,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setFormState({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          // Logout después de cambiar contraseña — buena práctica de seguridad
          setTimeout(() => handleLogout(), 2000);
        },
      },
    );
  };

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {getErrorMessage(error)}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
        >
          ✅ Contraseña cambiada. Redirigiendo al login...
        </div>
      )}

      {/* Toggle mostrar contraseñas */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {showPasswords ? (
            <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {showPasswords ? "Ocultar" : "Mostrar"} contraseñas
        </button>
      </div>

      <Input
        label="Contraseña actual"
        type={showPasswords ? "text" : "password"}
        value={formState.currentPassword}
        onChange={(e) => handleChange("currentPassword", e.target.value)}
        error={errors.currentPassword}
        disabled={isPending}
        placeholder="••••••••"
        autoComplete="current-password"
      />

      <Input
        label="Nueva contraseña"
        type={showPasswords ? "text" : "password"}
        value={formState.newPassword}
        onChange={(e) => handleChange("newPassword", e.target.value)}
        error={errors.newPassword}
        disabled={isPending}
        placeholder="Mínimo 8 caracteres"
        hint="Al menos 8 caracteres"
        autoComplete="new-password"
      />

      <Input
        label="Confirmar nueva contraseña"
        type={showPasswords ? "text" : "password"}
        value={formState.confirmPassword}
        onChange={(e) => handleChange("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
        disabled={isPending}
        placeholder="Repite la nueva contraseña"
        autoComplete="new-password"
      />

      <Button
        type="submit"
        isLoading={isPending}
        leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
        className="self-end"
      >
        Cambiar contraseña
      </Button>
    </form>
  );
};

// ─── Settings Section wrapper ─────────────────────────────────────────────────
const Section = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
    <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/40">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
    {children}
  </div>
);

// ─── SettingsContent ──────────────────────────────────────────────────────────
const SettingsContent = () => {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-fit"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al tablero
      </Link>

      {/* Header con avatar */}
      <div className="mb-8 flex items-center gap-4">
        <UserAvatar name={user?.name ?? null} email={user?.email ?? ""} />
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {user?.name ?? "Mi perfil"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Sección perfil */}
        <Section
          title="Información personal"
          description="Actualiza tu nombre de usuario"
          icon={
            <User
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          }
        >
          <ProfileForm />
        </Section>

        {/* Sección contraseña */}
        <Section
          title="Seguridad"
          description="Cambia tu contraseña de acceso"
          icon={
            <Lock
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
          }
        >
          <PasswordForm />
        </Section>
      </div>
    </div>
  );
};

// ─── SettingsPage ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <SettingsContent />
        </main>
      </div>
    </AuthGuard>
  );
}
