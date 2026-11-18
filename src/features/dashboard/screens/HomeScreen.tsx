import ProductCard from "@/src/features/business/components/productCard";
import ProductModal from "@/src/features/business/components/productModal";
import { useBusinessFromPublication } from "@/src/features/business/hooks/useBusinessProfile";
import { useBusinessPublications } from "@/src/features/business/hooks/useBusinessPublications";
import PrimaryHeader from "@/src/features/dashboard/components/primaryHeader/primaryHeader";
import FavoriteCard from "@/src/features/favorites/components/favoriteCard";
import { useFavoriteSites } from "@/src/features/favorites/hooks/useFavoriteSites";
import { useGetRoutines } from "@/src/features/routines/hooks/useRoutine";
import { router } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { StyleSheet } from "react-native-unistyles";
export default function Home() {
  const { sites, isLoading, error } = useFavoriteSites();
  const windowWidth = Dimensions.get("window").width;
  const { businessPublications } = useBusinessPublications();
  const { routines } = useGetRoutines();

  const [selectedProduct, setSelectedProduct] = useState<
    (typeof businessPublications)[number] | null
  >(null);

  const { data: business } = useBusinessFromPublication(
    selectedProduct?.businessId,
  );

  return (
    <View style={styles.mainContainer}>
      <PrimaryHeader />

      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.mainTabContainer}
      >
        <BannerAd
          unitId="ca-app-pub-3940256099942544/6300978111"
          size={`${Math.floor(windowWidth)}x50` as BannerAdSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
        <View style={styles.container}>
          <Text style={styles.Titles}>Promociones</Text>
          {/* carrucel de promociones */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {businessPublications.map((publication) => (
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
                onPress={() => setSelectedProduct(publication)}
              />
            ))}
          </ScrollView>
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
              businessName={business?.businessName ?? ""}
              businessLogo={business?.logoUrl ?? ""}
              businessPhone={business?.phoneNumber ?? ""}
            />
          )}
          {/*   Carrucel para Lugares Favoritos */}
          <Text style={styles.Titles}>Lugares Favoritos</Text>
          {isLoading && (
            <Text style={styles.Titles}>Cargando sitios favoritos...</Text>
          )}
          {error && <Text style={styles.Titles}>Error: {error}</Text>}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            {sites.map((site) => (
              <FavoriteCard
                key={site.placeId}
                routeName={site.name}
                onPress={() => {
                  router.push({
                    pathname: "/(tabs)/map",
                    params: {
                      favoriteRequest: String(Date.now()),
                      favoritePlaceId: site.placeId,
                      favoriteName: site.name,
                      favoriteAddress: site.address ?? "",
                      favoriteLatitude: String(site.coordinate.latitude),
                      favoriteLongitude: String(site.coordinate.longitude),
                      favoriteType: site.placeType ?? "",
                    },
                  });
                }}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: 20,
    marginLeft: 20,
  },
  Titles: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    marginBottom: 20,
  },
  mainTabContainer: {
    marginBottom: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
  },
}));
