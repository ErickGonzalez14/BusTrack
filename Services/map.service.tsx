import { Stop } from "@/interfaces/stop.type";
import { Bus, Coordinate, TransitRoute } from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import {
  addDoc,
  collection,
  GeoPoint,
  getDocs,
  getFirestore,
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
    const data = busDocument.data() as Omit<Bus, "id">;
    return {
      ...data,
      id: busDocument.id.trim(),
      routeId: data.routeId?.trim() ?? "",
    };
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
