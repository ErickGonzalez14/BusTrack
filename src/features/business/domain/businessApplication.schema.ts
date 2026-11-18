import { z } from "zod";

export const businessRequestSchema = z.object({
  businessName: z.string().min(1, "El nombre del negocio es requerido"),
  categoryId: z
    .array(z.string())
    .min(1, "Se debe seleccionar al menos una categoría"),
  adress: z.object({
    latitude: z
      .number()
      .min(-90, "La latitud debe ser mayor o igual a -90")
      .max(90, "La latitud debe ser menor o igual a 90"),
    longitude: z
      .number()
      .min(-180, "La longitud debe ser mayor o igual a -180")
      .max(180, "La longitud debe ser menor o igual a 180"),
  }),
  paymentIntentId: z.string().optional(),
  plan: z.string().optional(),
  amountPaid: z.number().optional(),
});

export type BusinessRequestInput = z.infer<typeof businessRequestSchema>;
