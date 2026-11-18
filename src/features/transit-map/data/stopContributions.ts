import { Coordinate, RouteDirection } from "@/src/features/transit-map/domain/transport.type";
import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  GeoPoint,
  getFirestore,
  serverTimestamp,
} from "@react-native-firebase/firestore";

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
