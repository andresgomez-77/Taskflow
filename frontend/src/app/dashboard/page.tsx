"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskStatus, type Task } from "@/types";
import { useKanbanBoard } from "@/hooks/useTasks";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Navbar } from "@/components/layout/Navbar";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskForm } from "@/components/tasks/TaskForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LoadingScreen, ErrorState } from "@/components/ui/Feedback";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

type ModalState =
  | { type: "closed" }
  | { type: "create"; defaultStatus: TaskStatus }
  | { type: "edit"; task: Task };

const COLUMNS: {
  status: TaskStatus;
  label: string;
  activeClass: string;
  dotClass: string;
}[] = [
  {
    status: TaskStatus.TODO,
    label: "Por hacer",
    activeClass:
      "border-b-2 border-gray-600 text-gray-900 dark:text-gray-100 dark:border-gray-400",
    dotClass: "bg-gray-400",
  },
  {
    status: TaskStatus.IN_PROGRESS,
    label: "En progreso",
    activeClass: "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400",
    dotClass: "bg-blue-500",
  },
  {
    status: TaskStatus.DONE,
    label: "Completado",
    activeClass:
      "border-b-2 border-green-500 text-green-600 dark:text-green-400",
    dotClass: "bg-green-500",
  },
];

const DashboardContent = () => {
  const { user } = useAuthStore();
  const [modalState, setModalState] = useState<ModalState>({ type: "closed" });
  const [activeTab, setActiveTab] = useState<TaskStatus>(TaskStatus.TODO);
  const { data: kanban, isLoading, isError, refetch } = useKanbanBoard();

  const handleOpenCreate = (status: TaskStatus = activeTab) =>
    setModalState({ type: "create", defaultStatus: status });
  const handleOpenEdit = (task: Task) => setModalState({ type: "edit", task });
  const handleCloseModal = () => setModalState({ type: "closed" });

  const isModalOpen = modalState.type !== "closed";
  const modalTitle =
    modalState.type === "edit" ? "Editar tarea" : "Nueva tarea";

  if (isLoading) return <LoadingScreen message="Cargando tu tablero..." />;
  if (isError)
    return (
      <ErrorState
        title="Error al cargar el tablero"
        message="No pudimos obtener tus tareas."
        onRetry={() => void refetch()}
      />
    );

  const totalTasks = kanban
    ? Object.values(kanban).reduce((acc, tasks) => acc + tasks.length, 0)
    : 0;

  return (
    <>
      {/* Header */}
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              {user?.name ? `Hola, ${user.name} 👋` : "Mi tablero"}
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              {totalTasks === 0
                ? "No tienes tareas. ¡Crea la primera!"
                : `${totalTasks} tarea${totalTasks !== 1 ? "s" : ""} en total`}
            </p>
          </div>
          <Button
            onClick={() => handleOpenCreate()}
            size="sm"
            leftIcon={<Plus className="h-4 w-4" aria-hidden="true" />}
            className="shrink-0"
          >
            <span className="hidden sm:inline">Nueva tarea</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 sm:hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-xl overflow-hidden shadow-sm">
          {COLUMNS.map(({ status, label, activeClass, dotClass }) => {
            const count = kanban?.[status]?.length ?? 0;
            const isActive = activeTab === status;
            return (
              <button
                key={status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? activeClass
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                )}
                aria-selected={isActive}
                role="tab"
              >
                <span
                  className={cn("h-2 w-2 rounded-full shrink-0", dotClass)}
                  aria-hidden="true"
                />
                <span className="truncate">{label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700"
                      : "bg-gray-50 dark:bg-gray-800",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-2">
          {COLUMNS.map(({ status }) =>
            activeTab === status ? (
              <KanbanColumn
                key={status}
                status={status}
                tasks={kanban?.[status] ?? []}
                onAddTask={handleOpenCreate}
                onEditTask={handleOpenEdit}
                isMobile
              />
            ) : null,
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden w-full max-w-7xl px-6 pb-8 sm:block">
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map(({ status }) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={kanban?.[status] ?? []}
              onAddTask={handleOpenCreate}
              onEditTask={handleOpenEdit}
            />
          ))}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalTitle}>
        {modalState.type === "create" && (
          <TaskForm
            defaultStatus={modalState.defaultStatus}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
        {modalState.type === "edit" && (
          <TaskForm
            task={modalState.task}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>
    </>
  );
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1">
          <DashboardContent />
        </main>
      </div>
    </AuthGuard>
  );
}
