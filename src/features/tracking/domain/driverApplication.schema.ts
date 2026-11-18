import { z } from "zod";

export const driverRequestSchema = z.object({
  licensePlate: z
    .string()
    .min(1, "La placa del bus es requerida")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/,
      "Solo puede contener letras y números",
    ),
  publicTransportPlate: z
    .string()
    .min(1, "La placa del transporte público es requerida")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+$/,
      "Solo puede contener letras y números",
    ),
  routeType: z.string().min(1, "El tipo de ruta es requerido"),
  routeId: z.string().min(1, "Se debe seleccionar una ruta"),
});

export type DriverRequestInput = z.infer<typeof driverRequestSchema>;
