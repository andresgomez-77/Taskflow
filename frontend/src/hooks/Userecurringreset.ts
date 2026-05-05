"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TaskStatus, type Task, type KanbanBoard } from "@/types";
import { tasksApi } from "@/lib/api/tasks.api";
import { queryKeys } from "@/lib/utils";

// ─── useRecurringReset ────────────────────────────────────────────────────────
// Al cargar la app, verifica si hay tareas recurrentes completadas
// en un día anterior y las resetea a TODO automáticamente.
// Guardamos la última fecha de reset en localStorage para no resetear
// múltiples veces en el mismo día.
export const useRecurringReset = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const resetRecurringTasks = async () => {
      const today = new Date().toISOString().split("T")[0];
      const lastReset = localStorage.getItem("taskflow_last_reset");

      // Si ya reseteamos hoy, no hacer nada
      if (lastReset === today) return;

      const kanban = queryClient.getQueryData<KanbanBoard>(
        queryKeys.tasks.kanban,
      );
      if (!kanban) return;

      // Buscar tareas recurrentes que están en DONE
      const doneTasks: Task[] = kanban[TaskStatus.DONE] ?? [];
      const recurringDone = doneTasks.filter((t) => t.isRecurring);

      if (recurringDone.length === 0) {
        localStorage.setItem("taskflow_last_reset", today);
        return;
      }

      // Resetear todas a TODO en paralelo
      await Promise.all(
        recurringDone.map((task) =>
          tasksApi.update(task.id, { status: TaskStatus.TODO }),
        ),
      );

      // Invalidar caché para que la UI se actualice
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.kanban });
      localStorage.setItem("taskflow_last_reset", today);
    };

    void resetRecurringTasks();
  }, [queryClient]);
};
