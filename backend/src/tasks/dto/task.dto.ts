import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from "class-validator";
import { TaskStatus } from "@prisma/client";

// ─── CreateTaskDto ────────────────────────────────────────────────────────────
export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: "El título no puede estar vacío" })
  @MaxLength(200, { message: "El título no puede superar los 200 caracteres" })
  declare title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000, {
    message: "La descripción no puede superar los 2000 caracteres",
  })
  declare description?: string;

  @IsEnum(TaskStatus, {
    message: `El estado debe ser uno de: ${Object.values(TaskStatus).join(", ")}`,
  })
  @IsOptional()
  declare status?: TaskStatus;
}

// ─── UpdateTaskDto ────────────────────────────────────────────────────────────
// Todos los campos son opcionales — el usuario puede actualizar parcialmente.
// Patrón común en APIs REST: PUT (reemplaza todo) vs PATCH (actualiza parcialmente).
// Usamos PATCH para updates.
export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(200)
  declare title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  declare description?: string;

  @IsEnum(TaskStatus, {
    message: `Estado inválido. Opciones: ${Object.values(TaskStatus).join(", ")}`,
  })
  @IsOptional()
  declare status?: TaskStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  declare order?: number;
}

// ─── TaskResponseDto ──────────────────────────────────────────────────────────
// Lo que el backend retorna al frontend. Tipado explícito del contrato.
export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
