import { useBusinessFromPublication } from "@/src/features/business/hooks/useBusinessProfile";
import ButtonSecondary from "@/src/shared/ui/buttons/buttonSecundary";
import Empty from "@/src/shared/ui/empty";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import InputText from "@/src/shared/ui/inputText";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import CatalogCategoryModal from "../components/CatalogCategoryModal";
import ProductCard from "../components/productCard";
import ProductModal from "../components/productModal";
import type { Publication } from "../data/businessPublications";
import { useProductCatalogFilters } from "../hooks/useProductCatalogFilters";

export default function ProductCatalog() {
  const params = useLocalSearchParams<{ businessId?: string; businessName?: string }>();
  const businessId = typeof params.businessId === "string" ? params.businessId : undefined;
  const businessName = typeof params.businessName === "string" ? params.businessName : undefined;
  const catalog = useProductCatalogFilters(businessId);
  const { categories, publications } = catalog;
  const [selectedProduct, setSelectedProduct] = useState<Publication | null>(null);

  const {
    data: business,
    isLoading: isBusinessLoading,
    isLoadingError: isBusinessLoadingError,
  } = useBusinessFromPublication(selectedProduct?.businessId);

  const businessStatus = isBusinessLoading
    ? "Cargando datos de la empresa…"
    : isBusinessLoadingError
      ? "No se pudieron cargar los datos de la empresa."
      : undefined;
  return (
    <View style={[styles.container]}>
      <AlternativeHeader
        SettingName="Catálogo de productos"
        onTouch={() => router.back()}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        style={styles.container}
        contentContainerStyle={styles.tabContainer}
      >
        <View style={styles.filters}>
          {businessId ? (
            <Text accessibilityRole="header" style={styles.businessTitle}>
              {businessName || "Publicaciones de la empresa"}
            </Text>
          ) : (
            <InputText
              placeholder="Nombre de la empresa"
              accessibilityLabel="Filtrar por nombre de la empresa"
              value={catalog.businessName}
              onChangeText={catalog.setBusinessName}
              style={styles.filterInput}
            />
          )}
          <InputText
            placeholder="Nombre de la publicación"
            accessibilityLabel="Filtrar por nombre de la publicación"
            value={catalog.publicationName}
            onChangeText={catalog.setPublicationName}
            style={styles.filterInput}
          />
          <View style={styles.filterActions}>
            <ButtonSecondary
              title={categories.selectedCount > 0 ? `Categorías (${categories.selectedCount})` : "Categorías"}
              onPress={() => {
                Keyboard.dismiss();
                categories.open();
              }}
            />
            {catalog.hasFilters && (
              <Pressable
                accessibilityRole="button"
                style={styles.clearButton}
                onPress={catalog.clearFilters}
              >
                <Text style={styles.statusText}>Limpiar filtros</Text>
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.publications}>
          {catalog.isLoading && (
            <ActivityIndicator accessibilityLabel="Cargando publicaciones" />
          )}
          {catalog.error && (
            <View style={styles.status}>
              <Text accessibilityRole="alert" style={styles.statusText}>{catalog.error}</Text>
              <ButtonSecondary title="Reintentar" onPress={() => void catalog.retry()} />
            </View>
          )}
          {!catalog.isLoading && !catalog.error && publications.length === 0 && (
            <Empty
              message={catalog.hasFilters
                ? "No hay publicaciones que coincidan con estos filtros."
                : businessId
                  ? "Esta empresa aún no tiene publicaciones."
                  : "Vaya, aún no se han registrado promociones"}
            />
          )}
          {publications.map((publication) => (
            <ProductCard
              key={publication.id}
              title={publication.name}
              description={publication.description}
              img={publication.imageUrl}
              cardType={publication.type}
              color={publication.cardColor}
              price={publication.price ?? ""}
              currentPrice={publication.currentPrice}
              lastPrice={publication.lastPrice}
              onPress={() => {
                Keyboard.dismiss();
                setSelectedProduct(publication);
              }}
            />
          ))}
        </View>
      </ScrollView>
      {categories.draftIds !== null && (
        <CatalogCategoryModal {...categories} draftIds={categories.draftIds} />
      )}
      {selectedProduct && (
        <ProductModal
          title={selectedProduct.name}
          description={selectedProduct.description}
          img={selectedProduct.imageUrl}
          cardType={selectedProduct.type}
          color={selectedProduct.cardColor}
          price={selectedProduct.price ?? ""}
          currentPrice={selectedProduct.currentPrice}
          lastPrice={selectedProduct.lastPrice}
          onClose={() => setSelectedProduct(null)}
          visible
          businessName={business?.businessName}
          businessLogo={business?.logoUrl ?? undefined}
          businessPhone={business?.phoneNumber}
          businessStatus={businessStatus}
        />
      )}
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  tabContainer: {
    gap: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 50,
    width: "100%",
    alignItems: "stretch",
  },
  filters: {
    gap: 10,
  },
  businessTitle: {
    color: theme.text.Body,
    fontFamily: theme.fonts.heavy,
    fontSize: 20,
  },
  filterInput: {
    minHeight: 44,
    marginBottom: 0,
    paddingVertical: 10,
  },
  filterActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  clearButton: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  publications: {
    gap: 40,
  },
  status: {
    gap: 8,
    alignItems: "center",
  },
  statusText: {
    color: theme.text.Body,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
  },
}));
