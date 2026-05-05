import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { TaskStatus, TaskPriority } from "@prisma/client";

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: "El título no puede estar vacío" })
  @MaxLength(200)
  declare title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  declare description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  declare status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  declare priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  declare dueDate?: string;

  @IsBoolean()
  @IsOptional()
  declare isRecurring?: boolean;
}

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

  @IsEnum(TaskStatus)
  @IsOptional()
  declare status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  declare priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  declare dueDate?: string;

  @IsBoolean()
  @IsOptional()
  declare isRecurring?: boolean;

  @IsInt()
  @IsOptional()
  @Min(0)
  declare order?: number;
}

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  isRecurring: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
