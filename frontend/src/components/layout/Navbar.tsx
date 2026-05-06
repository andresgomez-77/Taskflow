"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { user } = useAuthStore();
  const { handleLogout } = useLogout();
  const { isDark, toggleDarkMode } = useDarkMode();

  // Genera iniciales del usuario para el avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0].toUpperCase() ?? "?");

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
      <nav
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6"
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label="TaskFlow — Ir al dashboard"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 sm:h-8 sm:w-8">
            <LayoutDashboard
              className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
            TaskFlow
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={
              isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
            }
            className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          {/* Settings */}
          <Link
            href="/settings"
            aria-label="Configuración de perfil"
            className="flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </Link>

          {/* Avatar con iniciales — link a settings */}
          <Link
            href="/settings"
            aria-label="Ir a mi perfil"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
              "bg-indigo-600 hover:bg-indigo-700 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
            )}
          >
            {initials}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
