import {
  deleteFavoriteSite,
  updateFavoriteSiteName,
  watchFavoriteSites,
} from "@/src/features/favorites/data/favoriteSites.service";
import { deleteDoc, onSnapshot, updateDoc } from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: () => ({ currentUser: { uid: "user-1" } }),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: () => "firestore",
  collection: (_db: string, ...path: string[]) => path.join("/"),
  doc: (collectionPath: string, id: string) => `${collectionPath}/${id}`,
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
}));

describe("Favoritos", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renombra solo el nombre del documento guardado, incluso con un ID codificado", async () => {
    await updateFavoriteSiteName("user-1", "place%2F1", "  Casa  ");

    expect(updateDoc).toHaveBeenCalledWith("Users/user-1/favoriteSites/place%2F1", {
      name: "Casa",
    });
  });

  test("elimina el documento guardado y rechaza operaciones de una sesión anterior", async () => {
    await deleteFavoriteSite("user-1", "place%2F1");
    await expect(deleteFavoriteSite("previous-user", "place%2F1")).rejects.toThrow(
      "Debes iniciar sesión",
    );

    expect(deleteDoc).toHaveBeenCalledTimes(1);
    expect(deleteDoc).toHaveBeenCalledWith("Users/user-1/favoriteSites/place%2F1");
  });

  test("publica el nombre inicial, el renombrado y la eliminación a los suscriptores", () => {
    const onChange = jest.fn();
    const onError = jest.fn();
    const unsubscribe = jest.fn();
    jest.mocked(onSnapshot).mockReturnValue(unsubscribe);

    expect(watchFavoriteSites("user-1", onChange, onError)).toBe(unsubscribe);
    expect(onSnapshot).toHaveBeenCalledWith("Users/user-1/favoriteSites", expect.any(Function), onError);

    const publish = jest.mocked(onSnapshot).mock.calls[0][1] as (snapshot: {
      docs: { id: string; data: () => object }[];
    }) => void;
    const storedFavorite = (name: string) => ({
      id: "place%2F1",
      data: () => ({ name, location: { latitude: 9, longitude: -79 } }),
    });

    publish({ docs: [storedFavorite("Casa")] });
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "Casa" })]);
    publish({ docs: [storedFavorite("Mi casa")] });
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: "Mi casa" })]);
    publish({ docs: [] });
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
