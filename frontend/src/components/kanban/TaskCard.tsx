"use client";

import { useState } from "react";
import { Pencil, Trash2, Calendar, AlertCircle } from "lucide-react";
import { TaskStatus, TaskPriority, type Task } from "@/types";
import { useDeleteTask } from "@/hooks/useTasks";
import { formatDate, cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}
// ─── Config visual ────────────────────────────────────────────────────────────
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

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string; dot: string }
> = {
  [TaskPriority.LOW]: {
    label: "Baja",
    className: "text-green-600 dark:text-green-400",
    dot: "bg-green-500",
  },
  [TaskPriority.MEDIUM]: {
    label: "Media",
    className: "text-yellow-600 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  [TaskPriority.HIGH]: {
    label: "Alta",
    className: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
};
// ─── Helper: verifica si la fecha venció ──────────────────────────────────────
const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const diff = new Date(dueDate).getTime() - new Date().getTime();
  const hours = diff / (1000 * 60 * 60);
  return hours > 0 && hours <= 48; // vence en menos de 48 horas
};

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask();

  const handleDeleteClick = () => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    deleteTask(task.id);
  };

  // ─── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent<HTMLElement>) => {
    // Guardamos el id y el status actual en el dataTransfer
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("fromStatus", task.status);
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const { label: statusLabel, className: statusClass } =
    statusConfig[task.status];
  const {
    label: priorityLabel,
    className: priorityClass,
    dot: priorityDot,
  } = priorityConfig[task.priority];
  const overdue = isOverdue(task.dueDate);
  const dueSoon = isDueSoon(task.dueDate);

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "group rounded-xl border bg-white p-4 shadow-sm",
        "transition-all duration-150 cursor-grab active:cursor-grabbing",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1",
        "dark:bg-gray-800",
        task.priority === TaskPriority.HIGH &&
          "border-l-4 border-l-red-500 border-gray-200 dark:border-gray-700",
        task.priority === TaskPriority.MEDIUM &&
          "border-l-4 border-l-yellow-500 border-gray-200 dark:border-gray-700",
        task.priority === TaskPriority.LOW &&
          "border-l-4 border-l-green-500 border-gray-200 dark:border-gray-700",
        // Visual feedback mientras arrastra
        isDragging && "opacity-40 scale-95 rotate-1",
      )}
      aria-label={`Tarea: ${task.title}. Arrastra para mover de columna.`}
    >
      {/* Header */}
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

      {/* Description */}
      {task.description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 w-fit",
            overdue
              ? "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400"
              : dueSoon
                ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
                : "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
          )}
        >
          {overdue ? (
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Calendar className="h-3 w-3" aria-hidden="true" />
          )}
          <time dateTime={task.dueDate}>
            {overdue ? "Venció: " : dueSoon ? "Vence: " : ""}
            {formatDate(task.dueDate)}
          </time>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            statusClass,
          )}
        >
          {statusLabel}
        </span>
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            priorityClass,
          )}
        >
          <span
            className={cn("h-2 w-2 rounded-full", priorityDot)}
            aria-hidden="true"
          />
          {priorityLabel}
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
