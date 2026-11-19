import { businessRequestSchema } from "@/src/features/business/domain/businessApplication.schema";
import { ContactBusinessInfoRequestSchema } from "@/src/features/business/domain/businessContact.schema";
import {
  DiscountRequestSchema,
  ProductRequestSchema,
  ServiceRequestSchema,
} from "@/src/features/business/domain/publication.schema";
import { adjustColor } from "@/src/features/business/domain/publicationColors";

const publication = {
  name: "Artículo de prueba",
  price: "12.50",
  description: "Descripción de prueba",
  categoryId: ["category-1"],
  imageUrl: "https://example.com/photo.jpg",
  cardColor: "#ff0000",
};

describe("Negocios", () => {
  test("valida la categoría y el rango de las coordenadas del negocio", () => {
    const input = {
      businessName: "Tienda de prueba",
      categoryId: ["category-1"],
      adress: { latitude: 8.98, longitude: -79.52 },
    };
    expect(businessRequestSchema.parse(input)).toEqual(input);
    const result = businessRequestSchema.safeParse({
      ...input, categoryId: [], adress: { latitude: -91, longitude: 181 },
    });
    expect(result.error?.issues.map(({ path }) => path))
      .toEqual([["categoryId"], ["adress", "latitude"], ["adress", "longitude"]]);
  });

  test("requiere teléfono y descripción de dirección para el contacto", () => {
    const contact = { phoneNumber: "60000000", adressDescription: "Local 1" };
    expect(ContactBusinessInfoRequestSchema.parse(contact)).toEqual(contact);
    const result = ContactBusinessInfoRequestSchema.safeParse({
      phoneNumber: "", adressDescription: "",
    });
    expect(result.error?.issues.map(({ path }) => path))
      .toEqual([["phoneNumber"], ["adressDescription"]]);
  });

  test("valida los campos del producto y exige teléfono en un servicio", () => {
    expect(ProductRequestSchema.parse(publication)).toEqual(publication);
    expect(ProductRequestSchema.safeParse({ ...publication, imageUrl: "" }).success).toBe(false);
    expect(ServiceRequestSchema.safeParse(publication).error?.issues)
      .toEqual([expect.objectContaining({ path: ["phoneNumber"] })]);
    expect(ServiceRequestSchema.safeParse({ ...publication, phoneNumber: "60000000" }).success)
      .toBe(true);
  });

  test("limita el ajuste de luminosidad al negro y al blanco", () => {
    expect(adjustColor("#ff0000", { lightness: -100 })).toBe("#000000");
    expect(adjustColor("#ff0000", { lightness: 100 })).toBe("#ffffff");
    expect(adjustColor("#00ff00", { saturation: -100 })).toBe("#808080");
    expect(adjustColor("#0000ff")).toBe("#0000ff");
  });
});

describe("Fechas de descuentos", () => {
  const now = new Date("2026-11-18T12:00:00Z");
  const start = new Date("2026-11-19T12:00:00Z");
  const end = new Date("2026-11-20T12:00:00Z");

  beforeEach(() => jest.useFakeTimers({ now }));
  afterEach(() => jest.useRealTimers());

  test.each([
    ["intervalo futuro", start, end, []],
    ["inicio en el presente", now, end, [["startDate"]]],
    ["fin en el presente y anterior al inicio", start, now, [["endDate"], ["endDate"]]],
    ["fin igual al inicio", start, start, [["endDate"]]],
  ])("valida %s", (_label, startDate, endDate, issuePaths) => {
    const result = DiscountRequestSchema.safeParse({
      ...publication, lastPrice: "12.50", currentPrice: "9.50", startDate, endDate,
    });
    expect(result.success).toBe(issuePaths.length === 0);
    expect(result.error?.issues.map(({ path }) => path) ?? []).toEqual(issuePaths);
  });
});
