import type { Publication } from "../data/businessPublications";

export type PublicationFilters = {
  businessId?: string;
  businessName: string;
  publicationName: string;
  categoryIds: readonly string[];
};

export function normalizeCatalogName(value?: string) {
  return typeof value === "string"
    ? value.normalize("NFD").replace(/\p{M}/gu, "").trim().toLowerCase()
    : "";
}

export function filterPublications<T extends Pick<Publication, "name" | "businessId" | "categoryId">>(
  publications: readonly T[],
  filters: PublicationFilters,
  businessNames?: ReadonlyMap<string, string>,
) {
  const businessName = normalizeCatalogName(filters.businessName);
  const publicationName = normalizeCatalogName(filters.publicationName);
  const categories = new Set(filters.categoryIds);

  return publications.filter((publication) => {
    if (filters.businessId && publication.businessId !== filters.businessId) {
      return false;
    }

    if (publicationName && !normalizeCatalogName(publication.name).includes(publicationName)) {
      return false;
    }

    if (businessName && !normalizeCatalogName(businessNames?.get(publication.businessId)).includes(businessName)) {
      return false;
    }

    return (
      categories.size === 0 ||
      (Array.isArray(publication.categoryId) &&
        publication.categoryId.some((id) => categories.has(id)))
    );
  });
}
