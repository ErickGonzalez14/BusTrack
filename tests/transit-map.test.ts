import type { Stop } from "@/src/features/transit-map/domain/stop.type";
import type { Bus, TransitRoute } from "@/src/features/transit-map/domain/transport.type";
import { buildJourneySimulation } from "@/src/features/transit-map/domain/journeySimulation";
import {
  distanceInMeters,
  findBestRoute,
  getRoutableDirections,
  isBusAvailableForRoute,
  isValidCoordinate,
  normalizeCoordinate,
} from "@/src/features/transit-map/domain/mapRouting";

function stop(id: string, longitude: number, active = true): Stop {
  return {
    id, active, adress: { latitude: 0, longitude },
    city: "Panamá", district: "Panamá", name: id, province: "Panamá", villageId: "v1",
  };
}

const first = stop("a", 0);
const middle = stop("b", 0.01);
const last = stop("c", 0.02);
const stops = [first, middle, last, stop("inactive", 0.03, false)];
const route: TransitRoute = {
  id: "r1", active: true, estimatedDuration: 20, fareAprox: 1,
  name: "Ruta de prueba", routeType: "urbana",
  routeOutboundId: [" a ", "inactive", "b", "missing", "c"],
  routeReturnID: ["c", "b", "a"],
};
const bus: Bus = {
  id: "bus1", active: true, busStatus: "approved", routeId: " r1 ",
  routeType: "urbana", licensePlate: "AB1234", publicTransportPlate: "TP1",
  ratingCount: [], ratingAverage: 0,
};
const walking = {
  fromUser: new Map([["b", 100]]),
  toDestination: new Map([["c", 150]]),
};

describe("Planificación del mapa", () => {
  test("normaliza las coordenadas recibidas con campos de Firestore", () => {
    expect(normalizeCoordinate({ _latitude: 8.98, _longitude: -79.52 }))
      .toEqual({ latitude: 8.98, longitude: -79.52 });
    expect(isValidCoordinate({ latitude: -90, longitude: 180 })).toBe(true);
  });

  test.each([null, {}, { latitude: 91, longitude: 0 }, { latitude: 0, longitude: -181 }])(
    "rechaza coordenadas inválidas: %j",
    (value) => expect(normalizeCoordinate(value)).toBeNull(),
  );

  test("calcula la distancia entre paradas en metros", () => {
    expect(distanceInMeters(first.adress, first.adress)).toBe(0);
    expect(distanceInMeters(first.adress, middle.adress)).toBeCloseTo(1111.95, 2);
  });

  test("conserva el orden de ida y vuelta y descarta rutas y paradas inactivas", () => {
    const directions = getRoutableDirections(stops, [
      route,
      { ...route, id: "disabled", active: false },
      { ...route, id: "duplicated", routeOutboundId: ["a", "a"], routeReturnID: [] },
    ]);
    expect(directions.map(({ direction, orderedStops }) => [direction, orderedStops.map(({ id }) => id)]))
      .toEqual([["outbound", ["a", "b", "c"]], ["return", ["c", "b", "a"]]]);
  });

  test.each([
    ["aprobado", bus, true],
    ["pendiente", { ...bus, busStatus: "pending" }, false],
    ["rechazado", { ...bus, busStatus: "rejected" }, false],
    ["inactivo", { ...bus, active: false }, false],
    ["de otra ruta", { ...bus, routeId: "r2" }, false],
  ] satisfies [string, Bus, boolean][])("filtra el bus %s", (_name, candidate, available) => {
    expect(isBusAvailableForRoute(candidate, route.id)).toBe(available);
  });

  test("recomienda una parada posterior al abordaje y estima el tiempo del tramo", () => {
    const directions = getRoutableDirections(stops, [route]);
    const result = findBestRoute(directions, [{ ...bus, busStatus: "pending" }, bus], last.adress, walking);
    expect(result).toMatchObject({
      direction: "outbound", bus, boardingStop: middle, destinationStop: last,
      estimatedRideMinutes: 10, walkingDistanceMeters: 100, destinationDistanceMeters: 150,
    });
  });

  test("devuelve null cuando no hay distancia peatonal para el descenso", () => {
    expect(findBestRoute(getRoutableDirections(stops, [route]), [], last.adress, {
      ...walking, toDestination: new Map(),
    })).toBeNull();
  });

  test("prefiere el descenso que sigue el recorrido hacia el destino", () => {
    const recommendation = findBestRoute(
      getRoutableDirections(stops, [route]),
      [],
      last.adress,
      { fromUser: new Map([["a", 100]]), toDestination: new Map([["b", 50], ["c", 150]]) },
    );
    expect(recommendation).toMatchObject({ destinationStop: last, bus: null });
  });

  test("desempata distancias peatonales similares por menor tiempo a bordo", () => {
    const fasterRoute = { ...route, id: "r2", estimatedDuration: 12 };
    const recommendation = findBestRoute(
      getRoutableDirections(stops, [route, fasterRoute]),
      [],
      last.adress,
      walking,
    );
    expect(recommendation).toMatchObject({ route: fasterRoute, estimatedRideMinutes: 6 });
  });
});

describe("Simulación del trayecto", () => {
  test("conecta el acercamiento y el viaje en la parada de abordaje", () => {
    const recommendation = findBestRoute(getRoutableDirections(stops, [route]), [], last.adress, walking);
    if (!recommendation) throw new Error("Se esperaba una ruta de prueba");

    const roadBend = { latitude: 0.005, longitude: 0.005 };
    const { approach, ride } = buildJourneySimulation(recommendation, [
      [first.adress, roadBend, middle.adress],
      [middle.adress, last.adress],
    ]);
    expect(approach).toHaveLength(33);
    expect(approach[0]).toEqual(first.adress);
    expect(approach[16].latitude).toBeCloseTo(roadBend.latitude, 6);
    expect(approach[approach.length - 1]).toEqual(middle.adress);
    expect(ride).toHaveLength(61);
    expect(ride[0]).toEqual(middle.adress);
    expect(ride[ride.length - 1]).toEqual(last.adress);
  });

  test("usa las coordenadas de las paradas cuando faltan los tramos de carretera", () => {
    const recommendation = findBestRoute(
      getRoutableDirections(stops, [route]),
      [],
      last.adress,
      { ...walking, fromUser: new Map([["a", 100]]) },
    );
    if (!recommendation) throw new Error("Se esperaba una ruta de prueba");

    const { approach, ride } = buildJourneySimulation(recommendation);
    expect(approach).toEqual([first.adress]);
    expect(ride[30]).toEqual(middle.adress);
    expect(ride[60]).toEqual(last.adress);
  });
});
