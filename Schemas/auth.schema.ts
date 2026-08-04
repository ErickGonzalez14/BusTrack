import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
  nickname: z.string().min(3, "El nickname debe tener mínimo 3 caracteres"),
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener mínimo 3 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
