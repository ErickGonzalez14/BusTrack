import { getPublicationBusinessNames } from "@/src/features/business/data/businessContact";
import { filterPublications } from "@/src/features/business/domain/publicationFilters";
import { getDocs, where } from "@react-native-firebase/firestore";

jest.mock("@/src/shared/lib/uploadImage.service", () => ({}));

jest.mock("@react-native-firebase/firestore", () => ({
  collection: (_db: string, name: string) => name,
  documentId: () => "__name__",
  getFirestore: () => "firestore",
  query: (collectionName: string, constraint: object) => ({ collectionName, constraint }),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

const publications = [
  { name: "Café molido", businessId: "central", categoryId: ["bebidas"] },
  { name: "Café en grano", businessId: "central", categoryId: ["despensa"] },
  { name: "Café frío", businessId: "norte", categoryId: ["bebidas"] },
  { name: "Té verde", businessId: "central", categoryId: ["bebidas"] },
  { name: "Café de especialidad", businessId: "central", categoryId: [] },
];
const businessNames = new Map([
  ["central", "Cafetería Central"],
  ["norte", "Mercado del Norte"],
]);
const noFilters = { businessName: "", publicationName: "", categoryIds: [] };

describe("Filtros del catálogo de productos", () => {
  test("combina ambos nombres por coincidencia parcial y acepta cualquiera de las categorías elegidas", () => {
    const results = filterPublications(publications, {
      businessName: "  CAFETERIA  ",
      publicationName: "cafe",
      categoryIds: ["bebidas", "despensa"],
    }, businessNames);

    expect(results.map(({ name }) => name)).toEqual(["Café molido", "Café en grano"]);
  });

  test("filtra por publicación y categoría aunque la empresa no se haya consultado", () => {
    const results = filterPublications(publications, {
      ...noFilters,
      publicationName: "café",
      categoryIds: ["bebidas"],
    });

    expect(results.map(({ name }) => name)).toEqual(["Café molido", "Café frío"]);
  });

  test("limita el catálogo al ID exacto de la empresa incluso al limpiar los demás filtros", () => {
    const businessFilters = { ...noFilters, businessId: "central" };

    const scoped = filterPublications(publications, businessFilters);
    expect(scoped).toHaveLength(4);
    expect(scoped.every((publication) => publication.businessId === "central")).toBe(true);
    expect(filterPublications(publications, { ...businessFilters, businessId: "cent" })).toEqual([]);
    expect(filterPublications(publications, {
      ...businessFilters,
      publicationName: "cafe",
      categoryIds: ["bebidas"],
    })).toEqual([publications[0]]);
  });

  test("muestra todo al limpiar los filtros y omite empresas desconocidas en la búsqueda por empresa", () => {
    expect(filterPublications(publications, noFilters)).toEqual(publications);
    expect(filterPublications(publications, {
      ...noFilters,
      businessName: "central",
    }, new Map())).toEqual([]);
  });
});

describe("Consulta de empresas del catálogo", () => {
  beforeEach(() => jest.clearAllMocks());

  test("consulta por ID en lotes de hasta 30 y conserva la relación con la publicación", async () => {
    const ids = Array.from({ length: 31 }, (_, index) => `business-${index}`);
    const snapshot = (id: string, businessName: string) => ({
      docs: [{ id, data: () => ({ businessName }) }],
    }) as Awaited<ReturnType<typeof getDocs>>;
    jest.mocked(getDocs)
      .mockResolvedValueOnce(snapshot("business-0", "Cafetería Central"))
      .mockResolvedValueOnce(snapshot("business-30", "Mercado del Norte"));

    const names = await getPublicationBusinessNames(ids);

    expect(where).toHaveBeenNthCalledWith(1, "__name__", "in", ids.slice(0, 30));
    expect(where).toHaveBeenNthCalledWith(2, "__name__", "in", ["business-30"]);
    expect(names.get("business-0")).toBe("Cafetería Central");
    expect(names.get("business-30")).toBe("Mercado del Norte");
    expect(names.has("business-1")).toBe(false);
  });

  test("omite lecturas si ninguna publicación tiene empresa", async () => {
    expect(await getPublicationBusinessNames([])).toEqual(new Map());
    expect(getDocs).not.toHaveBeenCalled();
  });
});
