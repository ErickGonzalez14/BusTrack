import { Stop } from "@/interfaces/stop.type";
import {
  Coordinate,
  GooglePlace,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import {
  getRemainingRouteCoordinates,
  isValidCoordinate,
  normalizeCoordinate,
} from "@/lib/mapRouting";
import { Bus } from "iconoir-react-native";
import { RefObject, useMemo } from "react";
import { Image, View } from "react-native";
import MapView, {
  Marker,
  PoiClickEvent,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TransitMapProps = {
  mapRef: RefObject<MapView | null>;
  stops: Stop[];
  selectedPlace: GooglePlace | null;
  displayedRoute: RouteRecommendation | null;
  routeCoordinates: Coordinate[];
  routeProgress: number;
  busCoordinate: Coordinate | null;
  defaultLocation: Coordinate;
  onPoiClick: (event: PoiClickEvent) => void;
  onMapPress: () => void;
  onUserLocationChange: (coordinate: Coordinate) => void;
};

export default function TransitMap({
  mapRef,
  stops,
  selectedPlace,
  displayedRoute,
  routeCoordinates,
  routeProgress,
  busCoordinate,
  defaultLocation,
  onPoiClick,
  onMapPress,
  onUserLocationChange,
}: TransitMapProps) {
  const { theme } = useUnistyles();
  const validStops = stops.filter((stop) => isValidCoordinate(stop.adress));
  const remainingRouteCoordinates = useMemo(
    () => getRemainingRouteCoordinates(routeCoordinates, routeProgress),
    [routeCoordinates, routeProgress],
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      showsUserLocation
      showsMyLocationButton={false}
      onPoiClick={onPoiClick}
      onPress={onMapPress}
      onUserLocationChange={(event) => {
        const coordinate = normalizeCoordinate(event.nativeEvent.coordinate);
        if (coordinate) onUserLocationChange(coordinate);
      }}
      initialRegion={{
        latitude: validStops[0]?.adress.latitude ?? defaultLocation.latitude,
        longitude: validStops[0]?.adress.longitude ?? defaultLocation.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {displayedRoute && remainingRouteCoordinates.length >= 2 && (
        <Polyline
          coordinates={remainingRouteCoordinates}
          strokeColor={
            displayedRoute.direction === "outbound" ? "#1473E6" : "#F57C00"
          }
          strokeWidth={6}
          lineCap="round"
          lineJoin="round"
          zIndex={2}
        />
      )}

      {validStops.map((stop) => {
        const stopId = stop.id.trim();
        const isBoardingStop =
          displayedRoute?.boardingStop.id.trim() === stopId;
        const isDestinationStop =
          displayedRoute?.destinationStop.id.trim() === stopId;
        const stopRole = isBoardingStop
          ? "boarding"
          : isDestinationStop
            ? "destination"
            : "regular";

        if (isBoardingStop || isDestinationStop) {
          return (
            <Marker
              key={`${stop.id}:${stopRole}`}
              coordinate={stop.adress}
              title={`${isBoardingStop ? "SUBE" : "BAJA"} · ${stop.name}`}
              description={
                isBoardingStop ? "Parada para abordar" : "Parada para bajar"
              }
              pinColor={isBoardingStop ? "#1473E6" : "#F57C00"}
              zIndex={5}
            />
          );
        }

        return (
          <Marker
            key={stop.id}
            coordinate={stop.adress}
            title={stop.name}
            description={stop.city}
          >
            <Image
              source={require("@/assets/images/busStop.png")}
              style={styles.stopMarker}
              resizeMode="contain"
            />
          </Marker>
        );
      })}

      {selectedPlace && isValidCoordinate(selectedPlace.coordinate) && (
        <Marker
          coordinate={selectedPlace.coordinate}
          title={selectedPlace.name}
          description={selectedPlace.address}
          pinColor={theme.surface.contrast}
        />
      )}

      {busCoordinate && isValidCoordinate(busCoordinate) && displayedRoute && (
        <Marker
          coordinate={busCoordinate}
          title={displayedRoute.bus.plate}
          description={`Simulación · ${displayedRoute.route.name} · ${
            displayedRoute.direction === "outbound" ? "Ida" : "Regreso"
          }`}
          zIndex={10}
        >
          <View style={styles.busMarker}>
            <Bus width={24} height={24} color="#FFFFFF" />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

const styles = StyleSheet.create((theme) => ({
  map: {
    width: "100%",
    height: "100%",
  },
  stopMarker: {
    width: 40,
    height: 40,
  },
  busMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.surface.primary,
    borderWidth: 3,
    borderColor: theme.surface.background,
  },
  locationButton: {
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    padding: 5,
    position: "absolute",
    top: 70,
  },
}));
