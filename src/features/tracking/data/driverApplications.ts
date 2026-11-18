import { getAuth } from "@react-native-firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";

type SaveDriverRequest = {
  routeType: string;
  licensePlate: string;
  publicTransportPlate: string;
  routeId: string;
};

export const submitDriverApplication = async ({
  routeType,
  licensePlate,
  publicTransportPlate,
  routeId,
}: SaveDriverRequest) => {
  const db = getFirestore();
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error(
      "Debes iniciar sesión para enviar una solicitud de conductor.",
    );
  }
  await addDoc(collection(db, "buses"), {
    busStatus: "pending",
    routeType: routeType,
    licensePlate: licensePlate,
    publicTransportPlate: publicTransportPlate,
    routeId: routeId,
    ratingCount: [],
    ratingAverage: 0,
    userId: currentUser.uid,
    createdAt: serverTimestamp(),
  });
};

export type BusesListing = {
  id: string;
  licensePlate: string;
  publicTransportPlate: string;
  routeType: string;
  routeId: string;
  userId: string;
  busStatus: "pending" | "approved" | "rejected";
};

const toApprovedBusListing = (document: {
  id: string;
  data: () => Record<string, unknown>;
}, userId: string): BusesListing => {
  const data = document.data();
  const textField = (value: unknown) =>
    typeof value === "string" ? value.trim() : "";
  const licensePlate =
    textField(data.licensePlate) ||
    textField(data.publicTransportPlate) ||
    `Bus ${document.id.slice(0, 6)}`;

  return {
    id: document.id,
    licensePlate,
    publicTransportPlate: textField(data.publicTransportPlate),
    routeType: textField(data.routeType),
    routeId: textField(data.routeId),
    userId,
    busStatus: "approved",
  };
};

export type ActiveBusInfo = {
  isApproved: boolean;
  approvedBuses: BusesListing[];
};

export const subscribeToActiveBus = (
  userId: string,
  onChange: (activeBus: ActiveBusInfo) => void,
) => {
  const db = getFirestore();
  const busQuery = query(
    collection(db, "buses"),
    where("userId", "==", userId),
  );
  return onSnapshot(busQuery, (snapshot) => {
    const approvedDocuments = snapshot.docs.filter(
      (document) => {
        const data = document.data();
        return data.busStatus === "approved" || data.requestStatus === "approved";
      },
    );
    const approvedBuses = approvedDocuments.map((document) =>
      toApprovedBusListing(document, userId),
    );
    onChange({
      isApproved: approvedDocuments.length > 0,
      approvedBuses,
    });
  });
};
