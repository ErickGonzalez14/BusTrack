import PrimaryHeader from "@/components/Headers/PrimaryHeader/primaryHeader";
import TabButton from "@/components/ui/buttons/tabButton";
import FavoriteCard from "@/components/ui/Cards/favoriteCard";
import PrimaryCard from "@/components/ui/Cards/primaryCard";
import ProductCard from "@/components/ui/Cards/productCard";
import SearchBar from "@/components/ui/searchBar";
import { useFavoriteSites } from "@/hooks/useFavoriteSites";
import { useBusinessPublications } from "@/hooks/useRequests";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function Home() {
  const { sites, isLoading, error } = useFavoriteSites();
  const { businessPublications, isPublicationLoading, publicationsError } =
    useBusinessPublications();
  return (
    <View style={styles.mainContainer}>
      <PrimaryHeader />
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.mainTabContainer}
      >
        <View style={styles.container}>
          <Text style={styles.Titles}>Buscar Ruta</Text>
          <View style={{ marginRight: 20 }}>
            <SearchBar
              placeHolder="Buscar Ruta"
              icon={require("../../assets/icons/search.svg")}
            />
          </View>

          {/* carrucel de lugares mas concurridos */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <TabButton
              title="Terminal de David"
              onPress={() => console.log("Ruta 1")}
            />
            <TabButton title="Cocetrab" onPress={() => console.log("Ruta 2")} />
            <TabButton
              title="Parada Doña Fela"
              onPress={() => console.log("Ruta 3")}
            />
          </ScrollView>
          <Text style={styles.Titles}>Paradas Más Cercanas</Text>
          {/* carrucel de paradas mas cercanas */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <PrimaryCard
              lugar="Terminal de David"
              nextBus="5"
              distance="2.5"
              time="10"
            />
            <PrimaryCard
              lugar="Terminal de David"
              nextBus="5"
              distance="2.5"
              time="10"
            />
          </ScrollView>
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
                price={publication.price ?? 0}
                currentPrice={publication.currentPrice ?? 0}
                lastPrice={publication.lastPrice ?? 0}
              />
            ))}
          </ScrollView>
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
