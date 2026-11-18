import AddFavoritePlace from "@/src/features/favorites/components/addFavoritePlace";
import AlternativeHeader from "@/src/shared/ui/headers/alternativeHeader";
import FavoriteCard from "@/src/features/favorites/components/favoriteCard";
import RoutineCard from "@/src/features/routines/components/routineCard";
import { useFavoriteSites } from "@/src/features/favorites/hooks/useFavoriteSites";
import { useGetRoutines } from "@/src/features/routines/hooks/useRoutine";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { StyleSheet } from "react-native-unistyles";
export default function Favorite() {
  const { sites, isLoading, error } = useFavoriteSites();
  const { routines } = useGetRoutines();
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
          {/* Add new Favorite site */}
          <Text style={styles.Titles}>Agregar un nuevo lugar</Text>
          <AddFavoritePlace />
          {/* Routines and Add new routines*/}
          <View style={styles.routineTextContainer}>
            <Text style={[styles.Titles, { marginTop: 20 }]}>Tus Rutinas</Text>
            <Pressable
              onPress={() => router.push("/Settings/Favorites/createRoutine")}
            >
              <Text style={styles.createRoutineText}>+ Agregar Rutina</Text>
            </Pressable>
          </View>
          <View style={styles.routinesCardContainer}>
            {routines.map((routine) => (
              <RoutineCard
                routineName={routine.name}
                routineHour={routine.time}
                firstDay={routine.days[0]}
                lastDay={routine.days[routine.days.length - 1]}
                key={routine.id}
              />
            ))}
          </View>
        </View>
      </KeyboardAwareScrollView>
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
  mainTabContainer: {
    marginBottom: 20,
  },
  createRoutineText: {
    fontSize: 16,
    fontFamily: "Roboto_400Regular",
    color: theme.surface.brand,
  },
  routineTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routinesCardContainer: {
    gap: 10,
  },
}));
