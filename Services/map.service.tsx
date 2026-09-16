import { Stop } from "@/interfaces/stop.type";
import { Bus, TransitRoute } from "@/interfaces/transport.type";
import { normalizeCoordinate } from "@/lib/mapRouting";
import {
  collection,
  getDocs,
  getFirestore,
} from "@react-native-firebase/firestore";

export const getStops = async (): Promise<Stop[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "stops"));

  return snapshot.docs.flatMap((stopDocument) => {
    const data = stopDocument.data() as Omit<Stop, "id"> & {
      address?: unknown;
      location?: unknown;
    };
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
