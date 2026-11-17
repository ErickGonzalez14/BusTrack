import { Stop } from "@/interfaces/stop.type";
import { Bus, Coordinate, RouteDirection, TransitRoute } from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  doc,
  GeoPoint,
  getDocs,
  getFirestore,
  runTransaction,
  serverTimestamp,
} from "@react-native-firebase/firestore";

export type RouteOption = {
  id: string;
  name: string;
};

export const getStops = async (): Promise<Stop[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "stops"));

  return snapshot.docs.flatMap((stopDocument) => {
    const data = stopDocument.data() as Omit<Stop, "id"> & {
      address?: unknown;
      location?: unknown;
    };

    // Las paradas propuestas permanecen ocultas hasta que se confirme su posición.
    if (data.active === false) return [];

    const coordinate = normalizeCoordinate(
      data.adress ?? data.address ?? data.location,
    );

    if (!coordinate) {
      console.warn(
        `La parada ${stopDocument.id} no tiene una coordenada válida y no se mostrará.`,
      );
      return [];
    }

    return [
      {
        ...data,
        id: stopDocument.id.trim(),
        adress: coordinate,
      },
    ];
  });
};

type PendingStopInput = {
  coordinate: Coordinate;
  routeId: string;
  city: string;
  name: string;
};

export const addPendingStop = async ({
  coordinate,
  routeId,
  city,
  name,
}: PendingStopInput) => {
  const db = getFirestore();
  const stopDocument = await addDoc(collection(db, "stops"), {
    active: false,
    adress: new GeoPoint(coordinate.latitude, coordinate.longitude),
    city,
    created_at: serverTimestamp(),
    name,
    routeId,
  });

  return stopDocument.id;
};

export const CROWD_ROUTE_DIRECTIONS = [
  { id: "outbound", label: "Ida" },
  { id: "return", label: "Regreso" },
] as const satisfies readonly { id: RouteDirection; label: string }[];

export const CROWD_BUS_TYPES = [
  { id: "distrital", label: "Distrital" },
  { id: "interdistrital", label: "Interdistrital" },
] as const;

type CrowdStopInput = {
  coordinate: Coordinate;
  stopName: string;
  routeName: string;
  direction: RouteDirection;
  busType: (typeof CROWD_BUS_TYPES)[number]["id"];
};

export async function addCrowdSourcedStop(input: CrowdStopInput) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Inicia sesión para proponer una parada.");

  const stopName = input.stopName.trim();
  const routeName = input.routeName.trim();
  if (!stopName || stopName.length > 80 || !routeName || routeName.length > 120) {
    throw new Error("Revisa el nombre de la parada y el de la ruta.");
  }

  const { latitude, longitude } = input.coordinate;
  await addDoc(collection(getFirestore(), "crowdSoarcingRoutes"), {
    stopName,
    routeName,
    direction: input.direction,
    busType: input.busType,
    location: new GeoPoint(latitude, longitude),
    submittedBy: user.uid,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export const getRoutes = async (): Promise<TransitRoute[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "routes"));

  return snapshot.docs.map((routeDocument) => {
    const data = routeDocument.data() as Omit<TransitRoute, "id"> & {
      routeOutbondId?: unknown;
      stopIds?: unknown;
    };
    const normalizeStopIds = (value: unknown) =>
      Array.isArray(value)
        ? value.flatMap((id) =>
            typeof id === "string" && id.trim() ? [id.trim()] : [],
          )
        : [];

    return {
      ...data,
      id: routeDocument.id.trim(),
      routeOutboundId: normalizeStopIds(
        data.routeOutboundId ?? data.routeOutbondId ?? data.stopIds,
      ),
      routeReturnID: normalizeStopIds(data.routeReturnID),
    };
  });
};

export const getBuses = async (): Promise<Bus[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "buses"));

  return snapshot.docs.map((busDocument) => {
    const data = busDocument.data() as Omit<Bus, "id"> & {
      requestStatus?: unknown;
    };
    return {
      ...data,
      id: busDocument.id.trim(),
      routeId: data.routeId?.trim() ?? "",
      busStatus:
        data.busStatus === "approved" || data.requestStatus === "approved"
          ? "approved"
          : data.busStatus,
    };
  });
};

type RouteFeedback = {
  busId: string;
  routeId: string;
  rating: number;
  fare: number;
};

export const submitRouteFeedback = async ({
  busId,
  routeId,
  rating,
  fare,
}: RouteFeedback) => {
  if (
    !busId ||
    !routeId ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5 ||
    (rating * 2) % 1 !== 0 ||
    !Number.isFinite(fare) ||
    fare <= 0
  ) {
    throw new Error("La calificación o la tarifa no es válida.");
  }

  const db = getFirestore();
  const busRef = doc(db, "buses", busId);
  const routeRef = doc(db, "routes", routeId);

  await runTransaction(db, async (transaction) => {
    const busSnapshot = await transaction.get(busRef);
    const routeSnapshot = await transaction.get(routeRef);
    if (!busSnapshot.exists() || !routeSnapshot.exists()) {
      throw new Error("No se encontró el bus o la ruta del viaje.");
    }

    const currentRatings = busSnapshot.data()?.raitingCount;
    const ratings = Array.isArray(currentRatings)
      ? currentRatings.filter(
          (value): value is number =>
            typeof value === "number" && Number.isFinite(value),
        )
      : [];
    const updatedRatings = [...ratings, rating];
    const average =
      updatedRatings.reduce((sum, value) => sum + value, 0) /
      updatedRatings.length;

    transaction.update(busRef, {
      raitingCount: updatedRatings,
      ratingAverage: average,
    });
    transaction.update(routeRef, { fareAprox: fare });
  });
};

//obtener nombre, id de las rutas para DriverRequest
export const getRouteOptions = async (): Promise<RouteOption[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "routes"));

  return snapshot.docs
    .map((routeDocument) => {
      const data = routeDocument.data();
      return {
        id: routeDocument.id.trim(),
        name: typeof data.name === "string" ? data.name : "",
      };
    })
    .filter((route) => route.name.length > 0);
};
