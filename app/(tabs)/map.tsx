import PrimaryBottomSheet, {
  PrimaryBottomSheetRef,
} from "@/components/bottomSheet/primaryBottomSheet";
import AlternativeHeader from "@/components/Headers/alternativeHeader";
import ButtonPrimary from "@/components/ui/buttons/buttonPrimary";
import RouteCard from "@/components/ui/Cards/routeCard";
import { Stop } from "@/interfaces/stop.type";
import { getStops } from "@/Services/map.service";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
export default function Map() {
  const sheetRef = useRef<PrimaryBottomSheetRef>(null);
  const { theme } = useUnistyles();

  const {
    data: stops = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stops"],
    queryFn: getStops,
  });
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centeredContainer}>
        <Text>No se pudieron cargar las paradas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlternativeHeader SettingName={selectedStop?.name || "Mapa"} />
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        initialRegion={{
          latitude: stops[0]?.adress.latitude ?? 8.9824,
          longitude: stops[0]?.adress.longitude ?? -79.5199,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
      >
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{
              latitude: stop.adress.latitude,
              longitude: stop.adress.longitude,
            }}
            title={stop.name}
            description={`${stop.city}, ${stop.district}`}
            onPress={() => {
              setSelectedStop(stop);
              sheetRef.current?.open();
            }}
          >
            <Image
              source={require("@/assets/images/busStop.png")}
              style={{ width: 35, height: 35 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
      </MapView>
      <PrimaryBottomSheet ref={sheetRef} snapPoints={["50%"]}>
        {selectedStop && (
          <View>
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: theme.fonts.regular,
                  fontSize: 24,
                  color: theme.text.Body,
                }}
              >
                Hacia Donde te Diriges el
              </Text>
              <Text
                style={{
                  fontFamily: theme.fonts.heavy,
                  fontSize: 24,
                  color: theme.text.Body,
                }}
              >
                Día de Hoy
              </Text>
            </View>

            <RouteCard
              busPlate="238cir8vr"
              busType="Bus"
              startStop={selectedStop.name}
              endStop="Destino"
              routeTime="10 min"
              routeFair={1.5}
              calification={4.5}
              timeNearestBus="5 min"
            />
            <View style={{ marginTop: 20 }}>
              <ButtonPrimary text="Iniciar Ruta" />
            </View>
          </View>
        )}
      </PrimaryBottomSheet>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
}));
