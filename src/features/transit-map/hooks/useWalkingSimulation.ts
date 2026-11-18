import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { interpolatePosition, SIMULATION_TICK_MS } from "../domain/journeySimulation";
import { distanceInMeters } from "../domain/mapRouting";
import type { Stop } from "../domain/stop.type";
import type { Coordinate } from "../domain/transport.type";

type Walk = {
  placeId: string;
  target: Stop;
  origin: Coordinate;
  step: number;
  steps: number;
};

function walkingPosition({ origin, target, step, steps }: Walk) {
  return step === steps ? target.adress : interpolatePosition(origin, target.adress, step / steps);
}

export function useWalkingSimulation(
  placeId: string | undefined,
  boardingStop: Stop | undefined,
  stops: Stop[],
  userLocation: Coordinate | null,
) {
  const [walk, setWalk] = useState<Walk | null>(null);
  useEffect(() => {
    setWalk((current) => {
      if (!placeId) return null;
      const previous = current?.placeId === placeId ? current : null;
      if (previous && (!boardingStop || previous.target === boardingStop)) return previous;
      const origin = previous ? walkingPosition(previous) : userLocation;
      if (!origin) return null;

      let target = boardingStop;
      if (!target) {
        let closest = Infinity;
        for (const stop of stops) {
          const distance = distanceInMeters(origin, stop.adress);
          if (distance >= closest) continue;
          closest = distance;
          target = stop;
        }
      }
      if (!target) return null;

      const distance = distanceInMeters(origin, target.adress);
      const seconds = Math.min(12, Math.max(6, distance / 20));
      const steps = distance === 0 ? 0 : Math.ceil(seconds * 1_000 / SIMULATION_TICK_MS);
      return { placeId, target, origin, step: 0, steps };
    });
  }, [boardingStop, placeId, stops, userLocation]);

  const current = walk?.placeId === placeId ? walk : null;
  const isWalking = !!current && current.step < current.steps;
  useFocusEffect(useCallback(() => {
    if (!isWalking) return;
    const timer = setInterval(() => setWalk((previous) => (
      previous && previous.step < previous.steps
        ? { ...previous, step: previous.step + 1 }
        : previous
    )), SIMULATION_TICK_MS);
    return () => clearInterval(timer);
  }, [isWalking]));

  return current ? {
    coordinate: walkingPosition(current),
    origin: current.origin,
    target: current.target.adress,
    isWalking,
    isAtBoardingStop: !!boardingStop && current.target === boardingStop && !isWalking,
  } : null;
}
