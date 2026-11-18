import { z } from "zod";

export const RoutineRequestSchema = z.object({
  name: z.string().min(1, "El nombre de la rutina es requerido"),
  route: z.string().min(1, "La ruta de la rutina es requerida"),
  days: z.array(z.string()).min(1, "Se debe seleccionar al menos un día"),
  time: z.string().min(1, "La hora de la rutina es requerida"),
  recordatory: z
    .string()
    .min(1, "El recordatorio de la rutina debe ser mayor o igual a 0"),
});

export type RoutineRequestInput = z.infer<typeof RoutineRequestSchema>;
