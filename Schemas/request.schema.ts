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
});
export type BusinessRequestInput = z.infer<typeof businessRequestSchema>;

export const ProductRequestSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  price: z.number().min(0, "El precio del producto debe ser mayor o igual a 0"),
  description: z.string().min(1, "La descripción del producto es requerida"),
  categoryId: z
    .array(z.string())
    .min(1, "Se debe seleccionar al menos una categoría"),
  imageUrl: z.string().min(1, "La imagen del producto es requerida"),
  cardColor: z.string().min(1, "El color del producto es requerido"),
});
export type ProductRequestInput = z.infer<typeof ProductRequestSchema>;
