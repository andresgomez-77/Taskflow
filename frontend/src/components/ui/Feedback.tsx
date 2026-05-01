import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const spinnerSizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export const Spinner = ({
  size = "md",
  className,
  label = "Cargando...",
}: SpinnerProps) => (
  <div
    role="status"
    aria-label={label}
    className={cn("flex items-center justify-center", className)}
  >
    <Loader2
      className={cn(
        "animate-spin text-indigo-600 dark:text-indigo-400",
        spinnerSizes[size],
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </div>
);

export const LoadingScreen = ({
  message = "Cargando...",
}: {
  message?: string;
}) => (
  <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
    <Spinner size="lg" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  title = "Algo salió mal",
  message = "Ocurrió un error inesperado.",
  onRetry,
}: ErrorStateProps) => (
  <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
      <AlertCircle
        className="h-7 w-7 text-red-500 dark:text-red-400"
        aria-hidden="true"
      />
    </div>
    <div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
    {onRetry && (
      <Button
        variant="secondary"
        size="sm"
        onClick={onRetry}
        leftIcon={<RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />}
      >
        Reintentar
      </Button>
    )}
  </div>
);

interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ title, message, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
      <span className="text-2xl" aria-hidden="true">
        📋
      </span>
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{message}</p>
    </div>
    {action}
  </div>
);
