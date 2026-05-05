"use client";

import { Search, X, RefreshCw } from "lucide-react";
import { TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

export interface FilterState {
  search: string;
  priority: TaskPriority | "ALL";
  onlyOverdue: boolean;
  onlyRecurring: boolean;
}

interface KanbanFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalResults: number;
}

const priorityOptions: { value: TaskPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todas" },
  { value: TaskPriority.HIGH, label: "🔴 Alta" },
  { value: TaskPriority.MEDIUM, label: "🟡 Media" },
  { value: TaskPriority.LOW, label: "🟢 Baja" },
];

const hasActiveFilters = (filters: FilterState): boolean =>
  filters.search !== "" ||
  filters.priority !== "ALL" ||
  filters.onlyOverdue ||
  filters.onlyRecurring;

export const KanbanFilters = ({
  filters,
  onChange,
  totalResults,
}: KanbanFiltersProps) => {
  const handleReset = () => {
    onChange({
      search: "",
      priority: "ALL",
      onlyOverdue: false,
      onlyRecurring: false,
    });
  };

  const active = hasActiveFilters(filters);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 mb-4">
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:flex-row sm:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Buscar tareas..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className={cn(
              "w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm",
              "text-gray-900 placeholder:text-gray-400",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
              "focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500",
              "dark:focus:bg-gray-800",
            )}
            aria-label="Buscar tareas por título"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filtro prioridad */}
        <div
          className="flex gap-1.5 flex-wrap"
          role="group"
          aria-label="Filtrar por prioridad"
        >
          {priorityOptions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onChange({ ...filters, priority: value })}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filters.priority === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
              )}
              aria-pressed={filters.priority === value}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div className="flex gap-2">
          {/* Solo vencidas */}
          <button
            onClick={() =>
              onChange({ ...filters, onlyOverdue: !filters.onlyOverdue })
            }
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filters.onlyOverdue
                ? "border-red-400 bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
            )}
            aria-pressed={filters.onlyOverdue}
          >
            ⏰ Vencidas
          </button>

          {/* Solo recurrentes */}
          <button
            onClick={() =>
              onChange({ ...filters, onlyRecurring: !filters.onlyRecurring })
            }
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
              filters.onlyRecurring
                ? "border-indigo-400 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
            )}
            aria-pressed={filters.onlyRecurring}
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Diarias
          </button>
        </div>

        {/* Reset + contador */}
        <div className="flex items-center gap-2 shrink-0">
          {active && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Limpiar filtros"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Limpiar
            </button>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {totalResults} tarea{totalResults !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
