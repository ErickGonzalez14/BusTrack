import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  nickname: z
    .string()
    .min(3, "El nickname debe tener mínimo 3 caracteres")
    .regex(
      /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/,
      "Solo puede contener letras, números y guion bajo",
    ),
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener mínimo 3 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z
  .object({
    email: z.string().trim().pipe(z.email("Ingresa un Correo Valido")),

    password: z.string().min(1, "Ingresa tu contraseña"),
  })
  .strict();

export type SignInInput = z.infer<typeof signInSchema>;

export const completeProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(3, "El nombre de usuario debe tener mínimo 3 caracteres")
    .max(30, "El nombre de usuario debe tener máximo 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+$/,
      "Solo puede contener letras, números y guion bajo",
    ),

  fullName: z
    .string()
    .trim()
    .min(3, "El nombre completo debe tener mínimo 3 caracteres")
    .max(80, "El nombre completo debe tener máximo 80 caracteres"),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;
