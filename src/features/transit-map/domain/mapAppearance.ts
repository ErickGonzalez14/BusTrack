import type { MapStyleElement } from "react-native-maps";

export const defaultMapStyle: MapStyleElement[] = [];

export const darkMapStyle: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: "#182038" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#D0D8E1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#182038" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#6474A3" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#19362F" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#364466" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0C101C" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#53648B" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#253154" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#091540" }] },
];
