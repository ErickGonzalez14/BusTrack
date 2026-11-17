import { Stop } from "@/interfaces/stop.type";

export type TransitRoute = {
  id: string;
  active: boolean;
  estimatedDuration: number;
  fareAprox: number;
  ratingAverage?: number;
  name: string;
  routeType: string;
  routeOutboundId: string[];
  routeReturnID: string[];
};

export type RouteDirection = "outbound" | "return";

export type Bus = {
  id: string;
  userId?: string;
  busStatus?: "pending" | "approved" | "rejected";
  active: boolean;
  routeType: string;
  licensePlate: string;
  publicTransportPlate: string;
  ratingCount: number[];
  ratingAverage: number;
  routeId: string;
};

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PlaceSuggestion = {
  id: string;
  name: string;
  secondaryText?: string;
};

export type GooglePlace = PlaceSuggestion & {
  coordinate: Coordinate;
  address?: string;
  type?: string;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
};

export type RouteRecommendation = {
  route: TransitRoute;
  direction: RouteDirection;
  bus: Bus | null;
  orderedStops: Stop[];
  boardingStop: Stop;
  destinationStop: Stop;
  boardingIndex: number;
  destinationIndex: number;
  walkingDistanceMeters: number;
  destinationDistanceMeters: number;
  estimatedRideMinutes: number | null;
};
