import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Ingresa un email válido" })
  declare email: string;

  @IsString()
  @MinLength(8, { message: "La contraseña debe tener mínimo 8 caracteres" })
  @MaxLength(50, {
    message: "La contraseña no puede superar los 50 caracteres",
  })
  declare password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  declare name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Ingresa un email válido" })
  declare email: string;

  @IsString()
  @MinLength(1, { message: "La contraseña es requerida" })
  declare password: string;
}

// AuthResponseDto no usa decoradores — puede ser interface
export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  declare name: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  declare currentPassword: string;

  @IsString()
  @MinLength(8, {
    message: "La nueva contraseña debe tener mínimo 8 caracteres",
  })
  @MaxLength(50)
  declare newPassword: string;
}
