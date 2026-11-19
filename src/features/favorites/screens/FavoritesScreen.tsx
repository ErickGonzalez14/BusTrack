import FavoriteCard from "@/src/features/favorites/components/favoriteCard";
import { FavoriteNameModal } from "@/src/features/favorites/components/FavoriteNameModal";
import { useFavoriteSiteEditor } from "@/src/features/favorites/hooks/useFavoriteSiteEditor";
import { useFavoriteSites } from "@/src/features/favorites/hooks/useFavoriteSites";
import ButtonPrimary from "@/src/shared/ui/buttons/buttonPrimary";
import Empty from "@/src/shared/ui/empty";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
export default function Favorite() {
  const { sites, isLoading, error } = useFavoriteSites();
  const { selectedSite, openFavoriteModal, ...editor } =
    useFavoriteSiteEditor();
  const siteOnMap = sites.find((site) => site.id === selectedSite?.id);

  function viewOnMap() {
    if (!siteOnMap) return;

    editor.closeFavoriteModal();
    router.push({
      pathname: "/(tabs)/map",
      params: {
        favoriteRequest: String(Date.now()),
        favoritePlaceId: siteOnMap.placeId,
        favoriteName: siteOnMap.name,
        favoriteAddress: siteOnMap.address ?? "",
        favoriteLatitude: String(siteOnMap.coordinate.latitude),
        favoriteLongitude: String(siteOnMap.coordinate.longitude),
        favoriteType: siteOnMap.placeType ?? "",
      },
    });
  }

  return (
    <View style={styles.mainContainer}>
      <AlternativeHeader
        SettingName="Favoritos"
        onTouch={() => router.push("/settings")}
      />
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.viewContainer}
      >
        <View style={styles.container}>
          {/*Favorites Routes Carrousel*/}
          <Text style={[styles.Titles, { marginTop: 20 }]}>
            Tus Lugares Favoritos
          </Text>
          {isLoading && (
            <Text style={styles.Titles}>Cargando sitios favoritos...</Text>
          )}
          {error && <Text style={styles.Titles}>Error: {error}</Text>}
          <View style={styles.gridContainer}>
            {sites.map((site) => (
              <View key={site.id} style={styles.gridItem}>
                <FavoriteCard
                  routeName={site.name}
                  onPress={() => openFavoriteModal(site)}
                />
              </View>
            ))}
            {!isLoading && !error && sites.length === 0 && (
              <Empty message="Vaya, aún no has guardado ningun lugar" />
            )}
          </View>
          <ButtonPrimary
            text="Agregar Lugar"
            onPress={() => router.push("/(tabs)/map")}
          />
        </View>
      </KeyboardAwareScrollView>
      <FavoriteNameModal
        {...editor}
        isEditing
        onViewOnMap={siteOnMap ? viewOnMap : undefined}
      />
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: 20,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 30,
  },
  viewContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    marginBottom: 20,
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
  mainContainer: {
    flex: 1,
    backgroundColor: theme.surface.neutral,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginBottom: 20,
  },
  gridItem: {
    width: "48%",
  },
}));
