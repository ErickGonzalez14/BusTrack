import type { BusJourneyStatus } from "@/hooks/useBusSimulation";
import type {
  Coordinate,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import { distanceInMeters } from "@/lib/mapRouting";
import { useCallback, useEffect, useRef, useState } from "react";

const BOARDING_STOP_RADIUS_METERS = 90;
const USER_BUS_MATCH_RADIUS_METERS = 100;
const DESTINATION_STOP_RADIUS_METERS = 110;
const BUS_DEPARTURE_RADIUS_METERS = 140;

export type PassengerJourneyPhase =
  | "waitingForBus"
  | "boardingPrompt"
  | "onBoard"
  | "exitPrompt"
  | "completed";

type UsePassengerJourneyOptions = {
  route: RouteRecommendation | null;
  userLocation: Coordinate | null;
  busCoordinate: Coordinate | null;
  busStatus: BusJourneyStatus;
  hasBusPassedBoardingStop: boolean;
  busRunNumber: number;
};

export function usePassengerJourney({
  route,
  userLocation,
  busCoordinate,
  busStatus,
  hasBusPassedBoardingStop,
  busRunNumber,
}: UsePassengerJourneyOptions) {
  const [phase, setPhase] =
    useState<PassengerJourneyPhase>("waitingForBus");
  const destinationWasReached = useRef(false);
  const lastMissedBusRun = useRef<number | null>(null);
  const [missedBusSequence, setMissedBusSequence] = useState(0);
  const routeKey = route
    ? `${route.route.id}:${route.direction}:${route.boardingStop.id}:${route.destinationStop.id}`
    : null;

  useEffect(() => {
    destinationWasReached.current = false;
    lastMissedBusRun.current = null;
    setPhase("waitingForBus");
  }, [routeKey]);

  useEffect(() => {
    if (!route || !userLocation || !busCoordinate) return;

    const userToBus = distanceInMeters(userLocation, busCoordinate);
    const userToBoardingStop = distanceInMeters(
      userLocation,
      route.boardingStop.adress,
    );
    const busToBoardingStop = distanceInMeters(
      busCoordinate,
      route.boardingStop.adress,
    );
    const userToDestinationStop = distanceInMeters(
      userLocation,
      route.destinationStop.adress,
    );
    const busToDestinationStop = distanceInMeters(
      busCoordinate,
      route.destinationStop.adress,
    );

    if (
      phase === "waitingForBus" &&
      hasBusPassedBoardingStop &&
      userToBoardingStop > BOARDING_STOP_RADIUS_METERS &&
      lastMissedBusRun.current !== busRunNumber
    ) {
      lastMissedBusRun.current = busRunNumber;
      setMissedBusSequence((sequence) => sequence + 1);
      return;
    }

    if (busStatus === "arrived" || busToDestinationStop <= 70) {
      destinationWasReached.current = true;
    }

    if (
      phase === "waitingForBus" &&
      userToBoardingStop <= BOARDING_STOP_RADIUS_METERS &&
      busToBoardingStop <= BOARDING_STOP_RADIUS_METERS &&
      userToBus <= USER_BUS_MATCH_RADIUS_METERS
    ) {
      setPhase("boardingPrompt");
      return;
    }

    if (phase !== "onBoard" || !destinationWasReached.current) return;

    const routeEndsAtDestination =
      route.destinationIndex >= route.orderedStops.length - 1;
    const busHasDeparted =
      busToDestinationStop >= BUS_DEPARTURE_RADIUS_METERS &&
      userToBus >= BUS_DEPARTURE_RADIUS_METERS;

    if (
      userToDestinationStop <= DESTINATION_STOP_RADIUS_METERS &&
      (busHasDeparted || (routeEndsAtDestination && busStatus === "arrived"))
    ) {
      setPhase("exitPrompt");
    }
  }, [
    busCoordinate,
    busRunNumber,
    busStatus,
    hasBusPassedBoardingStop,
    phase,
    route,
    userLocation,
  ]);

  const confirmBoarding = useCallback(() => {
    setPhase("onBoard");
  }, []);

  const confirmExit = useCallback(() => {
    setPhase("completed");
  }, []);

  const resetJourney = useCallback(() => {
    destinationWasReached.current = false;
    setPhase("waitingForBus");
  }, []);

  return {
    phase,
    missedBusSequence,
    confirmBoarding,
    confirmExit,
    resetJourney,
  };
}
