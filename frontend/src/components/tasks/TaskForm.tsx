"use client";

import { useState, useEffect, type FormEvent } from "react";
import { TaskStatus, type Task } from "@/types";
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
}

interface FormErrors {
  title?: string;
}

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
    };
    if (isEditing && task) {
      updateTask({ id: task.id, data }, { onSuccess });
    } else {
      createTask(data, { onSuccess });
    }
  };

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (field in errors) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: TaskStatus.TODO, label: "Por hacer" },
    { value: TaskStatus.IN_PROGRESS, label: "En progreso" },
    { value: TaskStatus.DONE, label: "Completado" },
  ];

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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="task-description"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Descripción{" "}
          <span className="text-gray-400 font-normal dark:text-gray-500">
            (opcional)
          </span>
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
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800",
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
