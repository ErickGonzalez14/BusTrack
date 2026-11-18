import type { Coordinate, RouteRecommendation } from "@/src/features/transit-map/domain/transport.type";
import { distanceInMeters } from "@/src/features/transit-map/domain/mapRouting";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { buildJourneySimulation, SIMULATION_TICK_MS } from "../domain/journeySimulation";

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
  simulation: ReturnType<typeof buildJourneySimulation> | null;
  isSimulatedPassengerAtStop: boolean;
};

export function usePassengerJourney({
  route, userLocation, busCoordinate, simulation, isSimulatedPassengerAtStop,
}: UsePassengerJourneyOptions) {
  const [phase, setPhase] = useState<PassengerJourneyPhase>("waitingForBus");
  const [simulationStep, setSimulationStep] = useState(0);
  const resetJourney = useCallback(() => {
    setPhase("waitingForBus");
    setSimulationStep(0);
  }, []);
  const path = simulation && (phase === "onBoard" || phase === "exitPrompt" ? simulation.ride : simulation.approach);
  const isAtEnd = !!path && simulationStep >= path.length - 1;
  const simulatedBusCoordinate = path ? path[Math.min(simulationStep, path.length - 1)] : null;

  useFocusEffect(useCallback(() => {
    if (!path || isAtEnd) return;
    const timer = setInterval(() => setSimulationStep((step) => step + 1), SIMULATION_TICK_MS);
    return () => clearInterval(timer);
  }, [path, isAtEnd]));

  useEffect(() => {
    if (simulation) {
      if (phase === "onBoard" && isAtEnd) setPhase("exitPrompt");
      if (phase === "waitingForBus" && isAtEnd && isSimulatedPassengerAtStop) setPhase("boardingPrompt");
      return;
    }

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
  }, [busCoordinate, isAtEnd, isSimulatedPassengerAtStop, phase, route, simulation, userLocation]);

  const confirmBoarding = useCallback(() => {
    if (phase !== "boardingPrompt") return;
    setSimulationStep(0);
    setPhase("onBoard");
  }, [phase]);

  return { phase, confirmBoarding, resetJourney, simulatedBusCoordinate };
}
