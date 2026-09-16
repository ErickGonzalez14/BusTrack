import {
  Coordinate,
  RouteRecommendation,
} from "@/interfaces/transport.type";
import { buildSimulationPath, distanceInMeters } from "@/lib/mapRouting";
import { useCallback, useEffect, useState } from "react";

const SIMULATION_STEPS = 240;
const SIMULATION_TICK_MS = 1000;
const STOP_DWELL_TICKS = 5;

export type BusJourneyStatus =
  | "idle"
  | "running"
  | "nearDestination"
  | "arrived";

function findClosestPathIndex(path: Coordinate[], stop: Coordinate) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  path.forEach((coordinate, index) => {
    const distance = distanceInMeters(coordinate, stop);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function useBusSimulation() {
  const [activeRoute, setActiveRoute] =
    useState<RouteRecommendation | null>(null);
  const [simulationPath, setSimulationPath] = useState<Coordinate[]>([]);
  const [busCoordinate, setBusCoordinate] = useState<Coordinate | null>(null);
  const [status, setStatus] = useState<BusJourneyStatus>("idle");
  const [etaToBoardingSeconds, setEtaToBoardingSeconds] = useState<
    number | null
  >(null);
  const [hasPassedBoardingStop, setHasPassedBoardingStop] = useState(false);
  const [busRunNumber, setBusRunNumber] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);

  useEffect(() => {
    if (simulationPath.length < 2 || !activeRoute) return;

    let index = 0;
    const stopIndexes = new Set(
      activeRoute.orderedStops.map((stop) =>
        findClosestPathIndex(simulationPath, stop.adress),
      ),
    );
    const boardingPathIndex = findClosestPathIndex(
      simulationPath,
      activeRoute.boardingStop.adress,
    );
    const destinationPathIndex = findClosestPathIndex(
      simulationPath,
      activeRoute.destinationStop.adress,
    );
    let remainingDwellTicks = stopIndexes.has(0) ? STOP_DWELL_TICKS : 0;
    setHasPassedBoardingStop(false);
    setRouteProgress(0);
    setBusCoordinate(simulationPath[0]);
    setEtaToBoardingSeconds(
      (boardingPathIndex * SIMULATION_TICK_MS) / 1000,
    );
    const timer = setInterval(() => {
      if (remainingDwellTicks > 0) {
        remainingDwellTicks -= 1;
        return;
      }

      index += 1;
      const coordinate = simulationPath[Math.min(index, simulationPath.length - 1)];
      setBusCoordinate(coordinate);
      setRouteProgress(
        Math.min(1, index / Math.max(simulationPath.length - 1, 1)),
      );
      setEtaToBoardingSeconds(
        Math.max(
          0,
          ((boardingPathIndex - index) * SIMULATION_TICK_MS) / 1000,
        ),
      );
      if (index > boardingPathIndex) {
        setHasPassedBoardingStop(true);
      }
      const remainingDistance = distanceInMeters(
        coordinate,
        activeRoute.destinationStop.adress,
      );

      if (index >= destinationPathIndex) {
        setStatus("arrived");
      } else if (remainingDistance <= 700) {
        setStatus("nearDestination");
      }

      if (index >= simulationPath.length - 1) {
        clearInterval(timer);
      }

      if (stopIndexes.has(index)) {
        remainingDwellTicks = STOP_DWELL_TICKS;
      }
    }, SIMULATION_TICK_MS);

    return () => clearInterval(timer);
  }, [activeRoute, busRunNumber, simulationPath]);

  const startSimulation = useCallback((
    route: RouteRecommendation,
    roadCoordinates: Coordinate[],
  ) => {
    setActiveRoute(route);
    setStatus("running");
    setHasPassedBoardingStop(false);
    setRouteProgress(0);
    setBusRunNumber((currentRun) => currentRun + 1);
    setSimulationPath(buildSimulationPath(roadCoordinates, SIMULATION_STEPS));
    return roadCoordinates;
  }, []);

  const startNextBus = useCallback(() => {
    if (!activeRoute || simulationPath.length < 2) return;

    setStatus("running");
    setHasPassedBoardingStop(false);
    setRouteProgress(0);
    setBusRunNumber((currentRun) => currentRun + 1);
  }, [activeRoute, simulationPath.length]);

  const finishSimulation = useCallback(() => {
    setActiveRoute(null);
    setSimulationPath([]);
    setBusCoordinate(null);
    setEtaToBoardingSeconds(null);
    setHasPassedBoardingStop(false);
    setRouteProgress(0);
    setStatus("idle");
  }, []);

  return {
    activeRoute,
    busCoordinate,
    status,
    etaToBoardingSeconds,
    hasPassedBoardingStop,
    busRunNumber,
    routeProgress,
    startSimulation,
    startNextBus,
    finishSimulation,
  };
}
