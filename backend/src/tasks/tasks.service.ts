import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type {
  CreateTaskDto,
  UpdateTaskDto,
  TaskResponseDto,
} from "./dto/task.dto";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<TaskResponseDto[]> {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "desc" }],
    });
  }

  async findOne(taskId: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con id "${taskId}" no encontrada.`);
    }

    if (task.userId !== userId) {
      throw new ForbiddenException(
        "No tienes permiso para acceder a esta tarea.",
      );
    }

    return task;
  }

  async create(dto: CreateTaskDto, userId: string): Promise<TaskResponseDto> {
    const lastTask = await this.prisma.task.findFirst({
      where: { userId, status: dto.status ?? TaskStatus.TODO },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        priority: dto.priority ?? TaskPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        isRecurring: dto.isRecurring ?? false,
        order: nextOrder,
        userId,
      },
    });
  }

  async update(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    await this.findOne(taskId, userId);

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async remove(taskId: string, userId: string): Promise<{ message: string }> {
    await this.findOne(taskId, userId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { message: "Tarea eliminada correctamente." };
  }

  async getKanbanBoard(
    userId: string,
  ): Promise<Record<TaskStatus, TaskResponseDto[]>> {
    const tasks = await this.findAll(userId);
    return {
      [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
      [TaskStatus.IN_PROGRESS]: tasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS,
      ),
      [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
    };
  }
}
