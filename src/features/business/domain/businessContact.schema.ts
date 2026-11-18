import { z } from "zod";

export const ContactBusinessInfoRequestSchema = z.object({
  phoneNumber: z.string().min(1, "El número de teléfono es requerido"),
  adressDescription: z
    .string()
    .min(1, "La descripción de la dirección es requerida"),
});

export type ContactBusinessInfoRequestInput = z.infer<
  typeof ContactBusinessInfoRequestSchema
>;
