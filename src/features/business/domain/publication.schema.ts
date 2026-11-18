import { z } from "zod";

export const ProductRequestSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  price: z.string().min(1, "El precio del producto debe ser mayor o igual a 0"),
  description: z.string().min(1, "La descripción del producto es requerida"),
  categoryId: z
    .array(z.string())
    .min(1, "Se debe seleccionar al menos una categoría"),
  imageUrl: z.string().min(1, "La imagen del producto es requerida"),
  cardColor: z.string().min(1, "El color del producto es requerido"),
});

export type ProductRequestInput = z.infer<typeof ProductRequestSchema>;

export const DiscountRequestSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre del Producto con Descuento es requerido"),
    lastPrice: z
      .string()
      .min(1, "El precio anterior del producto debe ser mayor o igual a 0"),
    currentPrice: z
      .string()
      .min(1, "El precio actual del producto debe ser mayor o igual a 0"),
    description: z.string().min(1, "La descripción del producto es requerida"),
    startDate: z.date(),
    endDate: z.date(),
    categoryId: z
      .array(z.string())
      .min(1, "Se debe seleccionar al menos una categoría"),
    cardColor: z.string().min(1, "El color del producto es requerido"),
    imageUrl: z.string().min(1, "La imagen del producto es requerida"),
  })
  .superRefine(({ startDate, endDate }, context) => {
    const now = new Date();

    if (startDate <= now) {
      context.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "La fecha de inicio debe ser mayor a la fecha actual",
      });
    }

    if (endDate <= now) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha de fin debe ser mayor a la fecha actual",
      });
    }

    if (endDate <= startDate) {
      context.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      });
    }
  });

export type DiscountRequestInput = z.infer<typeof DiscountRequestSchema>;

export const ServiceRequestSchema = z.object({
  name: z.string().min(1, "El nombre del servicio es requerido"),
  price: z.string().min(1, "El precio del servicio debe ser mayor o igual a 0"),
  description: z.string().min(1, "La descripción del servicio es requerida"),
  categoryId: z
    .array(z.string())
    .min(1, "Se debe seleccionar al menos una categoría"),
  imageUrl: z.string().min(1, "La imagen del servicio es requerida"),
  cardColor: z.string().min(1, "El color del servicio es requerido"),
  phoneNumber: z.string().min(1, "El número de teléfono es requerido"),
});

export type ServiceRequestInput = z.infer<typeof ServiceRequestSchema>;
