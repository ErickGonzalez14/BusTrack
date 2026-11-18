import { Stop } from "@/src/features/transit-map/domain/stop.type";
import { Bus, TransitRoute } from "@/src/features/transit-map/domain/transport.type";
import { normalizeCoordinate } from "@/src/features/transit-map/domain/mapRouting";
import { collection, getDocs, getFirestore } from "@react-native-firebase/firestore";

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

export const getRoutes = async (): Promise<TransitRoute[]> => {
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, "routes"));

  return snapshot.docs.map((routeDocument) => {
    const data = routeDocument.data() as Omit<TransitRoute, "id"> & {
      routeOutbondId?: unknown;
      routeOutboundID?: unknown;
      routeReturnId?: unknown;
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
        data.routeOutboundId ?? data.routeOutboundID ?? data.routeOutbondId ?? data.stopIds,
      ),
      routeReturnID: normalizeStopIds(data.routeReturnID ?? data.routeReturnId),
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
