import type { BusJourneyStatus } from "@/hooks/useBusSimulation";
import {
  Coordinate,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import {
  buildSimulationPath,
  distanceInMeters,
  normalizeCoordinate,
} from "@/lib/mapRouting";
import { useCallback, useEffect, useState } from "react";

const SIMULATION_TICK_MS = 1000;
const BOARDING_PROXIMITY_METERS = 75;
const DESTINATION_PROXIMITY_METERS = 60;
const WALKING_SPEED_METERS_PER_TICK = 10;
const MIN_WALKING_STEPS = 6;
const MAX_WALKING_STEPS = 20;

export type UserSimulationStatus =
  | "idle"
  | "walking"
  | "waitingForBus"
  | "onBus"
  | "arrived";

export type UseUserSimulationOptions = {
  busCoordinate: Coordinate | null;
  busStatus?: BusJourneyStatus;
};

export function useUserSimulation({
  busCoordinate,
  busStatus,
}: UseUserSimulationOptions) {
  const [activeRoute, setActiveRoute] =
    useState<RouteRecommendation | null>(null);
  const [userCoordinate, setUserCoordinate] = useState<Coordinate | null>(null);
  const [status, setStatus] = useState<UserSimulationStatus>("idle");
  const [walkingPath, setWalkingPath] = useState<Coordinate[]>([]);
  const [walkRunNumber, setWalkRunNumber] = useState(0);

  // Simulación del desplazamiento a pie hacia la parada de abordaje
  useEffect(() => {
    if (status !== "walking" || walkingPath.length < 2) return;

    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      const nextIndex = Math.min(index, walkingPath.length - 1);
      const coordinate = walkingPath[nextIndex];
      setUserCoordinate(coordinate);

      if (index >= walkingPath.length - 1) {
        setStatus("waitingForBus");
        clearInterval(timer);
      }
    }, SIMULATION_TICK_MS);

    return () => clearInterval(timer);
  }, [status, walkingPath, walkRunNumber]);

  // Detección de cercanía del bus para abordar (mientras camina o espera)
  useEffect(() => {
    if (
      !activeRoute ||
      !busCoordinate ||
      (status !== "walking" && status !== "waitingForBus")
    ) {
      return;
    }

    const currentUserCoordinate =
      userCoordinate ?? activeRoute.boardingStop.adress;
    const distanceToBus = distanceInMeters(
      currentUserCoordinate,
      busCoordinate,
    );

    if (distanceToBus <= BOARDING_PROXIMITY_METERS) {
      setStatus("onBus");
      setUserCoordinate(busCoordinate);
    }
  }, [activeRoute, busCoordinate, status, userCoordinate]);

  // Movimiento junto al bus cuando el usuario está a bordo hasta la parada final
  useEffect(() => {
    if (status !== "onBus" || !activeRoute || !busCoordinate) {
      return;
    }

    setUserCoordinate(busCoordinate);

    const distanceToDestination = distanceInMeters(
      busCoordinate,
      activeRoute.destinationStop.adress,
    );

    if (
      distanceToDestination <= DESTINATION_PROXIMITY_METERS ||
      busStatus === "arrived"
    ) {
      setStatus("arrived");
    }
  }, [activeRoute, busCoordinate, busStatus, status]);

  const startSimulation = useCallback(
    (route: RouteRecommendation, initialLocation: Coordinate) => {
      const normalizedInitial =
        normalizeCoordinate(initialLocation) ?? route.boardingStop.adress;
      setActiveRoute(route);

      const boardingTarget = route.boardingStop.adress;
      const distanceToBoarding = distanceInMeters(
        normalizedInitial,
        boardingTarget,
      );

      // Si el usuario ya está muy cerca de la parada, pasa directo a esperar el bus
      if (distanceToBoarding <= 15) {
        setWalkingPath([]);
        setUserCoordinate(boardingTarget);
        setStatus("waitingForBus");
        return;
      }

      const steps = Math.max(
        MIN_WALKING_STEPS,
        Math.min(
          MAX_WALKING_STEPS,
          Math.round(distanceToBoarding / WALKING_SPEED_METERS_PER_TICK),
        ),
      );

      const path = buildSimulationPath(
        [normalizedInitial, boardingTarget],
        steps,
      );
      setWalkingPath(path);
      setUserCoordinate(path[0]);
      setStatus("walking");
      setWalkRunNumber((current) => current + 1);
    },
    [],
  );

  const finishSimulation = useCallback(() => {
    setActiveRoute(null);
    setWalkingPath([]);
    setUserCoordinate(null);
    setStatus("idle");
  }, []);

  return {
    activeRoute,
    userCoordinate,
    status,
    isWalking: status === "walking",
    isWaitingForBus: status === "waitingForBus",
    isOnBus: status === "onBus",
    hasArrived: status === "arrived",
    isSimulating: status !== "idle" && status !== "arrived",
    startSimulation,
    finishSimulation,
  };
}
