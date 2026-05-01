"use client";

import { useState } from "react";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { TaskStatus, type Task } from "@/types";
import { useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { formatDate, cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  [TaskStatus.TODO]: {
    label: "Por hacer",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "En progreso",
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  [TaskStatus.DONE]: {
    label: "Completado",
    className:
      "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    deleteTask(task.id);
  };

  const { label, className: badgeClass } = statusConfig[task.status];

  return (
    <article
      className={cn(
        "group rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
        "transition-all duration-150",
        "hover:border-indigo-200 hover:shadow-md",
        "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1",
        "dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-700",
        isDeleting && "opacity-50",
      )}
      aria-label={`Tarea: ${task.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
          {task.title}
        </h3>

        <div
          className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
          role="group"
          aria-label="Acciones de la tarea"
        >
          <button
            onClick={() => onEdit(task)}
            aria-label={`Editar tarea: ${task.title}`}
            tabIndex={0}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            aria-label={
              isConfirmingDelete
                ? "Confirmar eliminación"
                : `Eliminar tarea: ${task.title}`
            }
            tabIndex={0}
            className={cn(
              "rounded-md p-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500",
              isConfirmingDelete
                ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                : "text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            badgeClass,
          )}
        >
          {label}
        </span>

        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          <time dateTime={task.createdAt}>{formatDate(task.createdAt)}</time>
        </div>
      </div>

      {isConfirmingDelete && (
        <p
          role="alert"
          className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium animate-fade-in"
        >
          ¿Seguro? Haz clic en eliminar de nuevo para confirmar.
        </p>
      )}
    </article>
  );
};
