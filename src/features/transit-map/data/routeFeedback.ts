import { doc, getFirestore, runTransaction } from "@react-native-firebase/firestore";

type RouteFeedback = {
  busId?: string;
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
  const busRef = busId ? doc(db, "buses", busId) : null;
  const routeRef = doc(db, "routes", routeId);

  await runTransaction(db, async (transaction) => {
    const routeSnapshot = await transaction.get(routeRef);
    if (!routeSnapshot.exists()) {
      throw new Error("No se encontró la ruta del viaje.");
    }

    const busSnapshot = busRef ? await transaction.get(busRef) : null;
    if (busRef && busSnapshot?.exists()) {
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
    }

    const { ratingCount, ratingAverage } = routeSnapshot.data() ?? {};
    const hasPreviousRatings = typeof ratingCount === "number" &&
      Number.isSafeInteger(ratingCount) && ratingCount > 0 &&
      typeof ratingAverage === "number" && ratingAverage >= 1 && ratingAverage <= 5;
    const previousCount = hasPreviousRatings ? ratingCount : 0;
    const previousAverage = hasPreviousRatings ? ratingAverage : 0;
    const count = previousCount + 1;
    transaction.update(routeRef, {
      fareAprox: fare,
      ratingCount: count,
      ratingAverage: (previousAverage * previousCount + rating) / count,
    });
  });
};
