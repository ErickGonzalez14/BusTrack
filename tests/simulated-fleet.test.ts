import { cumulativeDistances, simulateFleet } from "@/functions/shared/simulatedFleet";
import type { FleetDirection } from "@/functions/shared/simulatedFleet";

const start = { latitude: 0, longitude: 0 };
const end = { latitude: 0, longitude: 0.01 };
const outbound: FleetDirection = {
  routeId: "r/1", direction: "outbound", stops: [start, start, end], duration: 10,
};

describe("Flota simulada", () => {
  test("acumula las distancias y conserva los segmentos de longitud cero", () => {
    const meters = cumulativeDistances(outbound.stops);
    expect(meters.slice(0, 2)).toEqual([0, 0]);
    expect(meters[2]).toBeCloseTo(1111.95, 2);
  });

  test("es determinista y distribuye cinco buses por ruta entre ida y vuelta", () => {
    const directions: FleetDirection[] = [
      outbound,
      { ...outbound, direction: "return", stops: [end, start] },
    ];
    const buses = simulateFleet(directions, 0);
    expect(simulateFleet([...directions].reverse(), 0)).toEqual(buses);
    expect(buses.map(({ id }) => id)).toEqual([1, 2, 3, 4, 5].map((n) => `simulated:r%2F1:${n}`));
    expect(new Set(buses.map(({ direction }) => direction))).toEqual(new Set(["outbound", "return"]));
    for (const bus of buses) {
      expect(bus.latitude).toBe(0);
      expect(bus.longitude).toBeGreaterThanOrEqual(start.longitude);
      expect(bus.longitude).toBeLessThanOrEqual(end.longitude);
      expect(bus.speed).toBeCloseTo(1111.95 / 600);
    }
  });

  test("descarta recorridos sin distancia y usa velocidad predeterminada sin duración", () => {
    expect(simulateFleet([{ ...outbound, stops: [start, start] }], 0)).toEqual([]);
    const buses = simulateFleet([{ ...outbound, duration: 0 }], 0);
    expect(buses).toHaveLength(5);
    expect(buses[0].speed).toBeCloseTo(30 / 3.6);
  });
});
