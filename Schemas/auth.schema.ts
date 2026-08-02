import { z } from "zod";

export const signUpSchema = z.object({
  email: z.email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
