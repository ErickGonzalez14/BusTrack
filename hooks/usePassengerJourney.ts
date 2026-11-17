import type { Coordinate, RouteRecommendation } from "@/interfaces/transport.type";
import { distanceInMeters } from "@/lib/mapRouting";
import { useCallback, useEffect, useState } from "react";

const BOARDING_STOP_RADIUS_METERS = 90;
const USER_BUS_MATCH_RADIUS_METERS = 100;
const DESTINATION_STOP_RADIUS_METERS = 110;

export type PassengerJourneyPhase =
  | "waitingForBus"
  | "boardingPrompt"
  | "onBoard"
  | "exitPrompt";

type UsePassengerJourneyOptions = {
  route: RouteRecommendation | null;
  userLocation: Coordinate | null;
  busCoordinate: Coordinate | null;
};

export function usePassengerJourney({ route, userLocation, busCoordinate }: UsePassengerJourneyOptions) {
  const [phase, setPhase] = useState<PassengerJourneyPhase>("waitingForBus");
  const resetJourney = useCallback(() => setPhase("waitingForBus"), []);

  useEffect(() => {
    if (!route || !userLocation) return;

    if (phase === "onBoard" &&
        distanceInMeters(userLocation, route.destinationStop.adress) <= DESTINATION_STOP_RADIUS_METERS) {
      setPhase("exitPrompt");
      return;
    }

    if (phase !== "waitingForBus" && phase !== "boardingPrompt") return;
    const boardingStop = route.boardingStop.adress;
    const canBoard = busCoordinate &&
      distanceInMeters(userLocation, boardingStop) <= BOARDING_STOP_RADIUS_METERS &&
      distanceInMeters(busCoordinate, boardingStop) <= BOARDING_STOP_RADIUS_METERS &&
      distanceInMeters(userLocation, busCoordinate) <= USER_BUS_MATCH_RADIUS_METERS;
    setPhase(canBoard ? "boardingPrompt" : "waitingForBus");
  }, [busCoordinate, phase, route, userLocation]);

  const confirmBoarding = useCallback(() => {
    setPhase((current) => current === "boardingPrompt" ? "onBoard" : current);
  }, []);

  return { phase, confirmBoarding, resetJourney };
}
