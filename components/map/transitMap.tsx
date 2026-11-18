import BusinessProMarker from "@/components/map/businessProMarker";
import { Stop } from "@/interfaces/stop.type";
import {
  Coordinate,
  GooglePlace,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import {
  isValidCoordinate,
  normalizeCoordinate,
} from "@/lib/mapRouting";
import { BusinessListing } from "@/Services/request.service";
import { RefObject, useMemo } from "react";
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
  trackedBuses: {
    busId: string;
    coordinate: Coordinate;
    licensePlate: string;
    simulated?: boolean;
  }[];
  defaultLocation: Coordinate;
  proBusinesses?: BusinessListing[];
  onPoiClick: (event: PoiClickEvent) => void;
  onMapPress: () => void;
  onUserLocationChange: (coordinate: Coordinate) => void;
  onProBusinessPress?: (business: BusinessListing) => void;
  onMapReady?: () => void;
};

export default function TransitMap({
  mapRef,
  stops,
  selectedPlace,
  displayedRoute,
  routeCoordinates,
  trackedBuses,
  defaultLocation,
  proBusinesses = [],
  onPoiClick,
  onMapPress,
  onUserLocationChange,
  onProBusinessPress,
  onMapReady,
}: TransitMapProps) {
  const { theme } = useUnistyles();
  const validStops = useMemo(
    () => stops.filter((stop) => isValidCoordinate(stop.adress)),
    [stops],
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
      onMapReady={onMapReady}
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
      {displayedRoute && routeCoordinates.length >= 2 && (
        <Polyline
          coordinates={routeCoordinates}
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
            pinColor="#0B86C3"
          />
        );
      })}

      {/* ── Pins de negocios Pro ─────────────────────────── */}
      {proBusinesses.map((biz) => (
        <BusinessProMarker
          key={`${biz.id}:${biz.logoUrl ?? ""}`}
          business={biz}
          onPress={(b) => onProBusinessPress?.(b)}
        />
      ))}

      {selectedPlace && isValidCoordinate(selectedPlace.coordinate) && (
        <Marker
          coordinate={selectedPlace.coordinate}
          title={selectedPlace.name}
          description={selectedPlace.address}
          pinColor={theme.surface.contrast}
        />
      )}

      {trackedBuses.map((bus) => (
        <Marker
          key={`live-${bus.busId}`}
          coordinate={bus.coordinate}
          title={bus.licensePlate}
          description={bus.busId === displayedRoute?.bus?.id
            ? `${bus.simulated ? "Simulación" : "Bus en vivo"} · ${displayedRoute.route.name}`
            : bus.simulated ? "Simulación" : "Bus en vivo"}
          zIndex={11}
          tracksViewChanges={false}
          image={require("@/assets/images/busTrackPin.png")}
        />
      ))}

    </MapView>
  );
}

const styles = StyleSheet.create((theme) => ({
  map: {
    width: "100%",
    height: "100%",
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
  userMarker: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    borderRadius: theme.size_rounded.full,
    backgroundColor: theme.surface.brand,
    padding: 5,
    position: "absolute",
    top: 70,
  },
}));
