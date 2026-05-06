import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { RegisterDto, LoginDto, AuthResponseDto } from "./dto/auth.dto";
import type { JwtPayload } from "./interfaces/jwt-payload.interface";
import { Resend } from "resend";
import * as crypto from "crypto";
const BCRYPT_ROUNDS = 12; // Factor de trabajo. Más = más seguro pero más lento.

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── register ─────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 1. Verificar que el email no esté en uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      // ConflictException = 409 HTTP
      throw new ConflictException("Ya existe una cuenta con este email.");
    }

    // 2. Hashear la contraseña — NUNCA guardar texto plano en DB
    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // 3. Crear el usuario en la DB
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        // password: false — NUNCA retornar el hash al cliente
      },
    });

    // 4. Generar el JWT y retornar respuesta
    return this.buildAuthResponse(user);
  }

  // ─── login ────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // ⚠️ Error intencionalmente genérico: no revelamos si el email existe o no.
    // Un mensaje como "email no encontrado" permitiría enumerar usuarios.
    if (!user) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    // 2. Comparar contraseña con el hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Credenciales inválidas.");
    }

    // 3. Generar JWT y retornar
    return this.buildAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }

  // ─── getProfile ───────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // Nunca incluir password
      },
    });
  }

  // ─── updateProfile ────────────────────────────────────────────────────────
  async updateProfile(userId: string, name: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, email: true, name: true },
    });
    return user;
  }

  // ─── changePassword ───────────────────────────────────────────────────────
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // 1. Buscar usuario con password para verificar
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado.");
    }

    // 2. Verificar contraseña actual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException("La contraseña actual es incorrecta.");
    }

    // 3. Hashear y guardar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Contraseña actualizada correctamente." };
  }
  // ─── forgotPassword ───────────────────────────────────────────────────────
  async forgotPassword(email: string): Promise<{ message: string }> {
    const resend = new Resend(process.env.RESEND_API_KEY); // ← aquí

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message: "Si el email existe, recibirás un enlace de recuperación.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: email,
      subject: "Recupera tu contraseña — TaskFlow",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="color:#4f46e5">TaskFlow</h2>
        <p>Hola${user.name ? ` ${user.name}` : ""},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Restablecer contraseña
        </a>
        <p style="color:#6b7280;font-size:14px">
          Este enlace expira en 1 hora. Si no solicitaste esto, ignora este email.
        </p>
      </div>
    `,
    });

    return {
      message: "Si el email existe, recibirás un enlace de recuperación.",
    };
  }

  // ─── resetPassword ────────────────────────────────────────────────────────
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }, // token no expirado
      },
    });

    if (!user) {
      throw new UnauthorizedException("Token inválido o expirado.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Actualizar contraseña y limpiar el token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      message:
        "Contraseña restablecida correctamente. Ya puedes iniciar sesión.",
    };
  }

  // ─── buildAuthResponse (private helper) ──────────────────────────────────
  // Centralizamos la creación del JWT aquí para no repetir lógica en register y login.
  // DRY principle en acción.
  private buildAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
  }): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
