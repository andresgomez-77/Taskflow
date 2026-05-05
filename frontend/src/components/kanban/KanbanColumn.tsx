"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskStatus, type Task } from "@/types";
import { TaskCard } from "./TaskCard";
import { EmptyState } from "@/components/ui/Feedback";
import { useUpdateTask } from "@/hooks/useTasks";
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
  {
    title: string;
    headerClass: string;
    dotClass: string;
    countClass: string;
    dropClass: string;
  }
> = {
  [TaskStatus.TODO]: {
    title: "Por hacer",
    headerClass: "border-t-gray-400",
    dotClass: "bg-gray-400",
    countClass: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
    dropClass: "border-gray-400 bg-gray-100/50 dark:bg-gray-700/50",
  },
  [TaskStatus.IN_PROGRESS]: {
    title: "En progreso",
    headerClass: "border-t-blue-500",
    dotClass: "bg-blue-500",
    countClass:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    dropClass: "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20",
  },
  [TaskStatus.DONE]: {
    title: "Completado",
    headerClass: "border-t-green-500",
    dotClass: "bg-green-500",
    countClass:
      "bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    dropClass: "border-green-400 bg-green-50/50 dark:bg-green-900/20",
  },
};

export const KanbanColumn = ({
  status,
  tasks,
  onAddTask,
  onEditTask,
  isMobile = false,
}: KanbanColumnProps) => {
  const { title, headerClass, dotClass, countClass, dropClass } =
    columnConfig[status];
  const [isDragOver, setIsDragOver] = useState(false);
  const { mutate: updateTask } = useUpdateTask();

  // ─── Drop handlers ────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Sin esto el browser no permite el drop — obligatorio
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Solo quitamos el highlight si salimos del área del drop zone
    // relatedTarget es el elemento al que el mouse fue
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const taskId = e.dataTransfer.getData("taskId");
    const fromStatus = e.dataTransfer.getData("fromStatus");

    // Solo actualizamos si se movió a una columna diferente
    if (!taskId || fromStatus === status) return;

    updateTask({ id: taskId, data: { status } });
  };

  return (
    <section
      className={cn(
        "flex w-full flex-col rounded-xl border border-gray-200 border-t-4",
        "bg-gray-50/70 dark:bg-gray-800/50 dark:border-gray-700",
        "transition-all duration-150",
        headerClass,
        isMobile && "rounded-t-none border-t-0",
        // Visual feedback cuando algo se arrastra sobre la columna
        isDragOver && `border-2 ${dropClass}`,
      )}
      aria-label={`Columna: ${title}`}
    >
      {/* Header — solo en desktop */}
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

      {/* Drop zone — aquí ocurre la magia */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 pt-3",
          "transition-all duration-150 rounded-b-xl",
          isMobile ? "max-h-[calc(100vh-220px)]" : "max-h-[calc(100vh-260px)]",
          // Zona de drop con indicador visual
          isDragOver && "pt-4 pb-4",
        )}
        role="list"
        aria-label={`Tareas en ${title}`}
      >
        {/* Indicador visual de drop */}
        {isDragOver && (
          <div
            className={cn(
              "flex items-center justify-center rounded-lg border-2 border-dashed py-4 text-xs font-medium animate-fade-in",
              dropClass,
            )}
          >
            Suelta aquí para mover a {title}
          </div>
        )}

        {tasks.length === 0 && !isDragOver ? (
          <EmptyState
            title="Sin tareas"
            message="Agrega o arrastra una tarea aquí"
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
