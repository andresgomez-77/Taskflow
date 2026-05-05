"use client";

import { useState, useEffect, type FormEvent } from "react";
import { RefreshCw } from "lucide-react";
import { TaskStatus, TaskPriority, type Task } from "@/types";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { getErrorMessage, cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface TaskFormProps {
  task?: Task;
  defaultStatus?: TaskStatus;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isRecurring: boolean;
}

interface FormErrors {
  title?: string;
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; activeClass: string }
> = {
  [TaskPriority.LOW]: {
    label: "🟢 Baja",
    activeClass:
      "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 dark:border-green-500",
  },
  [TaskPriority.MEDIUM]: {
    label: "🟡 Media",
    activeClass:
      "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-500",
  },
  [TaskPriority.HIGH]: {
    label: "🔴 Alta",
    activeClass:
      "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 dark:border-red-500",
  },
};

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: TaskStatus.TODO, label: "Por hacer" },
  { value: TaskStatus.IN_PROGRESS, label: "En progreso" },
  { value: TaskStatus.DONE, label: "Completado" },
];

export const TaskForm = ({
  task,
  defaultStatus = TaskStatus.TODO,
  onSuccess,
  onCancel,
}: TaskFormProps) => {
  const isEditing = !!task;

  const [formState, setFormState] = useState<FormState>({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? defaultStatus,
    priority: task?.priority ?? TaskPriority.MEDIUM,
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
    isRecurring: task?.isRecurring ?? false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const {
    mutate: createTask,
    isPending: isCreating,
    error: createError,
  } = useCreateTask();
  const {
    mutate: updateTask,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateTask();

  const isPending = isCreating || isUpdating;
  const apiError = createError ?? updateError;

  useEffect(() => {
    if (task) {
      setFormState({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        isRecurring: task.isRecurring,
      });
    }
  }, [task]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formState.title.trim()) newErrors.title = "El título es requerido";
    else if (formState.title.trim().length < 2)
      newErrors.title = "Mínimo 2 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    const data = {
      title: formState.title.trim(),
      description: formState.description.trim() || undefined,
      status: formState.status,
      priority: formState.priority,
      // Si es recurrente, ignoramos la fecha límite
      dueDate: formState.isRecurring
        ? undefined
        : formState.dueDate || undefined,
      isRecurring: formState.isRecurring,
    };
    if (isEditing && task) {
      updateTask({ id: task.id, data }, { onSuccess });
    } else {
      createTask(data, { onSuccess });
    }
  };

  const handleFieldChange = (
    field: keyof FormState,
    value: string | boolean,
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string" && field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
        >
          {getErrorMessage(apiError)}
        </div>
      )}

      {/* Título */}
      <Input
        label="Título"
        required
        placeholder="¿Qué necesitas hacer?"
        value={formState.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        error={errors.title}
        disabled={isPending}
        autoFocus
      />

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="task-description"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descripción{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="task-description"
          rows={3}
          placeholder="Agrega más detalles..."
          value={formState.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          disabled={isPending}
          className={cn(
            "w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900",
            "bg-white placeholder:text-gray-400",
            "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-500",
            "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
            "disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900",
          )}
        />
      </div>

      {/* Tarea recurrente toggle */}
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border p-3 transition-colors cursor-pointer",
          formState.isRecurring
            ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/30"
            : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800",
        )}
        onClick={() => handleFieldChange("isRecurring", !formState.isRecurring)}
        role="checkbox"
        aria-checked={formState.isRecurring}
        tabIndex={0}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          handleFieldChange("isRecurring", !formState.isRecurring)
        }
      >
        <div className="flex items-center gap-2">
          <RefreshCw
            className={cn(
              "h-4 w-4",
              formState.isRecurring
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-gray-400",
            )}
            aria-hidden="true"
          />
          <div>
            <p
              className={cn(
                "text-sm font-medium",
                formState.isRecurring
                  ? "text-indigo-700 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300",
              )}
            >
              Tarea diaria
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Se resetea automáticamente cada día
            </p>
          </div>
        </div>
        {/* Toggle visual */}
        <div
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            formState.isRecurring
              ? "bg-indigo-600"
              : "bg-gray-300 dark:bg-gray-600",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              formState.isRecurring ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </div>
      </div>

      {/* Prioridad */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Prioridad
        </span>
        <div
          className="flex gap-2"
          role="radiogroup"
          aria-label="Prioridad de la tarea"
        >
          {Object.entries(priorityConfig).map(
            ([value, { label, activeClass }]) => (
              <label
                key={value}
                className={cn(
                  "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                  formState.priority === value
                    ? activeClass
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
                )}
              >
                <input
                  type="radio"
                  name="priority"
                  value={value}
                  checked={formState.priority === value}
                  onChange={() => handleFieldChange("priority", value)}
                  className="sr-only"
                  aria-label={label}
                />
                {label}
              </label>
            ),
          )}
        </div>
      </div>

      {/* Fecha límite — se oculta si es recurrente */}
      {!formState.isRecurring && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-duedate"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Fecha límite{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="task-duedate"
            type="date"
            value={formState.dueDate}
            onChange={(e) => handleFieldChange("dueDate", e.target.value)}
            disabled={isPending}
            min={new Date().toISOString().split("T")[0]}
            className={cn(
              "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900",
              "bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
              "focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500",
              "disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900",
            )}
          />
        </div>
      )}

      {/* Estado */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Estado
        </span>
        <div
          className="flex gap-2"
          role="radiogroup"
          aria-label="Estado de la tarea"
        >
          {statusOptions.map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                formState.status === value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-500"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
              )}
            >
              <input
                type="radio"
                name="status"
                value={value}
                checked={formState.status === value}
                onChange={() => handleFieldChange("status", value)}
                className="sr-only"
                aria-label={label}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear tarea"}
        </Button>
      </div>
    </form>
  );
};
