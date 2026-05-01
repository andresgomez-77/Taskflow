"use client";

import { Plus } from "lucide-react";
import { TaskStatus, type Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  isMobile?: boolean;
}

const columnConfig: Record<
  TaskStatus,
  { title: string; headerClass: string; dotClass: string; countClass: string }
> = {
  [TaskStatus.TODO]: {
    title: "Por hacer",
    headerClass: "border-t-gray-400",
    dotClass: "bg-gray-400",
    countClass: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  },
  [TaskStatus.IN_PROGRESS]: {
    title: "En progreso",
    headerClass: "border-t-blue-500",
    dotClass: "bg-blue-500",
    countClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  [TaskStatus.DONE]: {
    title: "Completado",
    headerClass: "border-t-green-500",
    dotClass: "bg-green-500",
    countClass:
      "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
};

export const KanbanColumn = ({
  status,
  tasks,
  onAddTask,
  onEditTask,
  isMobile = false,
}: KanbanColumnProps) => {
  const { title, headerClass, dotClass, countClass } = columnConfig[status];

  return (
    <section
      className={cn(
        "flex w-full flex-col rounded-xl border border-gray-200 border-t-4",
        "bg-gray-50/70 dark:bg-gray-800/50 dark:border-gray-700",
        headerClass,
        isMobile && "rounded-t-none border-t-0",
      )}
      aria-label={`Columna: ${title}`}
    >
      {!isMobile && (
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={cn("h-2.5 w-2.5 rounded-full", dotClass)}
              aria-hidden="true"
            />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {title}
            </h2>
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 text-xs font-medium",
                countClass,
              )}
            >
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => onAddTask(status)}
            aria-label={`Agregar tarea en ${title}`}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white hover:text-indigo-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 pt-3",
          isMobile ? "max-h-[calc(100vh-220px)]" : "max-h-[calc(100vh-260px)]",
        )}
        role="list"
        aria-label={`Tareas en ${title}`}
      >
        {tasks.length === 0 ? (
          <EmptyState
            title="Sin tareas"
            message="Agrega una tarea en esta columna"
            action={
              <button
                onClick={() => onAddTask(status)}
                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 rounded"
              >
                + Agregar tarea
              </button>
            }
          />
        ) : (
          tasks.map((task) => (
            <div key={task.id} role="listitem">
              <TaskCard task={task} onEdit={onEditTask} />
            </div>
          ))
        )}
      </div>
    </section>
  );
};
