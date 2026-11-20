import { updateUserNickname } from "@/src/features/auth/data/user.service";
import { runTransaction } from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: () => ({ currentUser: { uid: "user-1" } }),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: () => "firestore",
  doc: (_db: string, ...path: string[]) => path.join("/"),
  runTransaction: jest.fn(),
  serverTimestamp: () => "server-time",
}));

function mockTransaction(documents: Record<string, object>) {
  const transaction = {
    get: jest.fn(async (path: string) => ({
      data: () => documents[path],
      exists: () => Boolean(documents[path]),
    })),
    set: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };
  jest.mocked(runTransaction).mockImplementation((_db, callback) =>
    callback(transaction as unknown as Parameters<typeof callback>[0]),
  );
  return transaction;
}

describe("Cambio de nombre de usuario", () => {
  beforeEach(() => jest.clearAllMocks());

  test("reserva el nuevo nombre normalizado y libera el anterior en la misma transacción", async () => {
    const transaction = mockTransaction({
      "Users/user-1": { nickname: "Ana_ñ" },
      "usernames/ana_n": { uid: "user-1" },
    });

    const names = await updateUserNickname("user-1", "  Álvaro_1  ");

    expect(names).toEqual({ nickname: "Álvaro_1", normalizedNickname: "alvaro_1" });
    expect(transaction.set).toHaveBeenCalledWith("usernames/alvaro_1", {
      uid: "user-1",
      createdAt: "server-time",
    });
    expect(transaction.delete).toHaveBeenCalledWith("usernames/ana_n");
    expect(transaction.update).toHaveBeenCalledWith("Users/user-1", {
      ...names,
      updatedAt: "server-time",
    });
    expect(transaction.get.mock.invocationCallOrder[2]).toBeLessThan(
      transaction.set.mock.invocationCallOrder[0],
    );
  });

  test("rechaza una reserva ajena sin escribir cambios", async () => {
    const transaction = mockTransaction({
      "Users/user-1": { normalizedNickname: "ana_n" },
      "usernames/alvaro_1": { uid: "user-2" },
    });

    await expect(updateUserNickname("user-1", "ÁLVARO_1")).rejects.toThrow("ya está registrado");
    expect(transaction.set).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
    expect(transaction.update).not.toHaveBeenCalled();
  });

  test("conserva la reserva al cambiar solo las mayúsculas o las tildes", async () => {
    const transaction = mockTransaction({
      "Users/user-1": { normalizedNickname: "ana_n" },
      "usernames/ana_n": { uid: "user-1" },
    });

    await updateUserNickname("user-1", "ANA_Ñ");

    expect(transaction.set).not.toHaveBeenCalled();
    expect(transaction.delete).not.toHaveBeenCalled();
    expect(transaction.update).toHaveBeenCalledWith("Users/user-1", {
      nickname: "ANA_Ñ",
      normalizedNickname: "ana_n",
      updatedAt: "server-time",
    });
  });

  test("aplica la validación del perfil antes de iniciar la transacción", async () => {
    await expect(updateUserNickname("user-1", "nombre inválido")).rejects.toThrow("guion bajo");
    expect(runTransaction).not.toHaveBeenCalled();
  });
});
