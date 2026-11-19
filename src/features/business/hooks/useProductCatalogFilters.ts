import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getPublicationBusinessNames } from "../data/businessContact";
import { filterPublications, normalizeCatalogName } from "../domain/publicationFilters";
import { useCategories } from "./useBusinessApplication";
import { useBusinessPublications } from "./useBusinessPublications";

export function useProductCatalogFilters(businessId?: string) {
  const {
    businessPublications,
    isPublicationLoading,
    publicationsError,
    fetchBusinessPublications,
  } = useBusinessPublications();
  const categoryQuery = useCategories();
  const [businessName, setBusinessName] = useState("");
  const [publicationName, setPublicationName] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [draftCategoryIds, setDraftCategoryIds] = useState<string[] | null>(null);

  const businessIds = useMemo(() => {
    if (businessId) return [];
    const ids = businessPublications.map((publication) => publication.businessId);
    return [...new Set(ids.filter((id) => typeof id === "string" && id.trim() && !id.includes("/")))].sort();
  }, [businessId, businessPublications]);
  const searchBusinessName = businessId ? "" : businessName;
  const hasBusinessFilter = Boolean(normalizeCatalogName(searchBusinessName));
  const hasBusinessLookup = hasBusinessFilter && businessIds.length > 0;
  const businessQuery = useQuery({
    queryKey: ["catalog-publication-business-names", businessIds],
    queryFn: () => getPublicationBusinessNames(businessIds),
    enabled: hasBusinessLookup,
    staleTime: 5 * 60 * 1000,
  });

  const publications = useMemo(
    () => filterPublications(
      businessPublications,
      { businessId, businessName: searchBusinessName, publicationName, categoryIds },
      businessQuery.data,
    ),
    [businessPublications, businessId, searchBusinessName, publicationName, categoryIds, businessQuery.data],
  );
  const categories = useMemo(
    () => categoryQuery.categories
      .filter((category) => category.name.trim())
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    [categoryQuery.categories],
  );

  function setCategorySelected(id: string, selected: boolean) {
    setDraftCategoryIds((current) => {
      if (current === null) return null;
      const remaining = current.filter((categoryId) => categoryId !== id);
      return selected ? [...remaining, id] : remaining;
    });
  }

  function applyCategories() {
    if (draftCategoryIds === null) return;
    setCategoryIds(draftCategoryIds);
    setDraftCategoryIds(null);
  }

  function clearFilters() {
    setBusinessName("");
    setPublicationName("");
    setCategoryIds([]);
    setDraftCategoryIds(null);
  }

  const businessLookupFailed = hasBusinessLookup && businessQuery.isLoadingError;

  return {
    publications,
    businessName,
    setBusinessName,
    publicationName,
    setPublicationName,
    hasFilters: hasBusinessFilter || Boolean(normalizeCatalogName(publicationName)) || categoryIds.length > 0,
    clearFilters,
    isLoading: isPublicationLoading || (hasBusinessLookup && businessQuery.isPending),
    error: publicationsError ?? (businessLookupFailed ? "No se pudo buscar por empresa." : null),
    retry: publicationsError ? fetchBusinessPublications : businessQuery.refetch,
    categories: {
      options: categories,
      selectedCount: categoryIds.length,
      draftIds: draftCategoryIds,
      isLoading: categoryQuery.isLoading,
      error: categoryQuery.categoryError,
      retry: categoryQuery.fetchCategories,
      open: () => setDraftCategoryIds(categoryIds),
      cancel: () => setDraftCategoryIds(null),
      setSelected: setCategorySelected,
      clearDraft: () => setDraftCategoryIds([]),
      apply: applyCategories,
    },
  };
}
