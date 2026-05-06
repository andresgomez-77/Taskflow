"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { TaskStatus, TaskPriority, type Task } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  tasks: Task[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === TaskStatus.DONE) return false;
  return new Date(task.dueDate) < new Date();
};

const getLast7Days = (): string[] => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });
};

const formatDayLabel = (dateStr: string): string => {
  return new Intl.DateTimeFormat("es-CO", { weekday: "short" }).format(
    new Date(dateStr + "T12:00:00"),
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
  suffix?: string;
}

const StatCard = ({ label, value, icon, className, suffix }: StatCardProps) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm",
      "dark:border-gray-700 dark:bg-gray-800",
      className,
    )}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {label}
      </p>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {value}
        {suffix}
      </p>
    </div>
  </div>
);

// ─── Custom Tooltip para la gráfica ───────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
        {payload[0].value} completadas
      </p>
    </div>
  );
};

// ─── DashboardStats ───────────────────────────────────────────────────────────
export const DashboardStats = ({ tasks }: DashboardStatsProps) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const inProgress = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS,
    ).length;
    const overdue = tasks.filter(isOverdue).length;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    // Prioridad alta pendiente
    const highPriority = tasks.filter(
      (t) => t.priority === TaskPriority.HIGH && t.status !== TaskStatus.DONE,
    ).length;

    // Gráfica: tareas completadas por día (últimos 7 días)
    const last7Days = getLast7Days();
    const chartData = last7Days.map((day) => ({
      day: formatDayLabel(day),
      completadas: tasks.filter((t) => {
        if (t.status !== TaskStatus.DONE) return false;
        const updated = t.updatedAt.split("T")[0];
        return updated === day;
      }).length,
    }));

    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate,
      highPriority,
      chartData,
    };
  }, [tasks]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 mb-4">
      <div className="flex flex-col gap-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total tareas"
            value={stats.total}
            icon={
              <ListTodo
                className="h-5 w-5 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
              />
            }
          />
          <StatCard
            label="Completadas"
            value={stats.completed}
            icon={
              <CheckCircle2
                className="h-5 w-5 text-green-500"
                aria-hidden="true"
              />
            }
            className="border-l-4 border-l-green-500"
          />
          <StatCard
            label="En progreso"
            value={stats.inProgress}
            icon={
              <Clock className="h-5 w-5 text-blue-500" aria-hidden="true" />
            }
            className="border-l-4 border-l-blue-500"
          />
          <StatCard
            label="Vencidas"
            value={stats.overdue}
            icon={
              <AlertCircle
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            }
            className="border-l-4 border-l-red-500"
          />
        </div>

        {/* Gráfica + tasa de completado */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Gráfica de área — ocupa 2/3 */}
          <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Productividad
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tareas completadas — últimos 7 días
                </p>
              </div>
              <TrendingUp
                className="h-4 w-4 text-indigo-500"
                aria-hidden="true"
              />
            </div>

            <ResponsiveContainer width="100%" height={120}>
              <AreaChart
                data={stats.chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
              >
                <defs>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completadas"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorCompleted)"
                  dot={{ fill: "#6366f1", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Panel derecho — tasa de completado y alertas */}
          <div className="flex flex-col gap-3">
            {/* Tasa de completado */}
            <div className="flex-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Tasa de completado
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.completionRate}%
              </p>
              {/* Barra de progreso */}
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                  role="progressbar"
                  aria-valuenow={stats.completionRate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {stats.completed} de {stats.total} tareas
              </p>
            </div>

            {/* Alerta de prioridad alta */}
            {stats.highPriority > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className="h-4 w-4 shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium text-red-700 dark:text-red-400">
                    {stats.highPriority} tarea
                    {stats.highPriority !== 1 ? "s" : ""} de alta prioridad
                    pendiente{stats.highPriority !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
