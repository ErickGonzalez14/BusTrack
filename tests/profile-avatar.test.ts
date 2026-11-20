import {
  createUserProfile,
  getUserProfile,
  updateUserAvatar,
} from "@/src/features/auth/data/user.service";
import {
  DEFAULT_PROFILE_AVATAR,
  type ProfileAvatarPath,
} from "@/src/features/auth/domain/profileAvatar";
import { getDoc, runTransaction, updateDoc } from "@react-native-firebase/firestore";

jest.mock("@react-native-firebase/auth", () => ({
  getAuth: () => ({ currentUser: { uid: "user-1" } }),
}));

jest.mock("@react-native-firebase/firestore", () => ({
  getFirestore: () => "firestore",
  doc: (_db: string, ...path: string[]) => path.join("/"),
  getDoc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: () => "server-time",
  updateDoc: jest.fn(),
}));

const driverAvatar = "assets/images/userAvatars/busDriver.png";

describe("Avatar de perfil", () => {
  beforeEach(() => jest.clearAllMocks());

  test("guarda boy.png al crear un perfil", async () => {
    const transaction = {
      get: jest.fn().mockResolvedValue({ exists: () => false }),
      set: jest.fn(),
    };
    jest.mocked(runTransaction).mockImplementation((_db, callback) =>
      callback(transaction as unknown as Parameters<typeof callback>[0]),
    );

    await createUserProfile({ uid: "user-1", nickname: "ana", fullName: "Ana" });

    expect(transaction.set).toHaveBeenCalledWith("Users/user-1", expect.objectContaining({
      photo: { url: DEFAULT_PROFILE_AVATAR },
    }));
  });

  test("solo guarda rutas de avatares del catálogo y exige la sesión correspondiente", async () => {
    await updateUserAvatar("user-1", driverAvatar);
    await expect(updateUserAvatar("user-2", driverAvatar)).rejects.toThrow("iniciar sesión");
    await expect(updateUserAvatar("user-1", "file:///avatar.png" as ProfileAvatarPath))
      .rejects.toThrow("Selecciona un avatar");

    expect(updateDoc).toHaveBeenCalledTimes(1);
    expect(updateDoc).toHaveBeenCalledWith("Users/user-1", {
      photo: { url: driverAvatar },
      updatedAt: "server-time",
    });
  });

  test.each([
    [{}, DEFAULT_PROFILE_AVATAR],
    [{ photoUrl: "https://example.com/old.png" }, "https://example.com/old.png"],
    [{ photo: { url: driverAvatar }, photoUrl: "https://example.com/old.png" }, driverAvatar],
  ])("resuelve el avatar del perfil %j", async (data, expected) => {
    jest.mocked(getDoc).mockResolvedValue({
      id: "user-1",
      exists: () => true,
      data: () => data,
    } as Awaited<ReturnType<typeof getDoc>>);

    expect((await getUserProfile("user-1"))?.photo?.url).toBe(expected);
  });
});
