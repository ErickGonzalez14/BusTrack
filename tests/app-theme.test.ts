import { restoreAppTheme, setAppDarkMode } from "@/src/shared/theme/appTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { UnistylesRuntime } from "react-native-unistyles";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("react-native-unistyles", () => ({
  UnistylesRuntime: { setTheme: jest.fn() },
}));

describe("Tema de la aplicación", () => {
  const setColorScheme = jest.spyOn(Appearance, "setColorScheme").mockImplementation(() => {});

  beforeEach(() => jest.clearAllMocks());
  afterAll(() => setColorScheme.mockRestore());

  test.each([
    [true, "dark"],
    [false, "light"],
  ] as const)("aplica el interruptor %s y guarda la elección", async (enabled, theme) => {
    await setAppDarkMode(enabled);

    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith(theme);
    expect(setColorScheme).toHaveBeenCalledWith(theme);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("bustrack:theme", theme);
  });

  test.each([
    ["dark", "dark"],
    ["light", "light"],
    [null, "light"],
    ["unknown", "light"],
  ])("restaura la preferencia guardada %s", async (stored, theme) => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValue(stored);

    await restoreAppTheme();

    expect(UnistylesRuntime.setTheme).toHaveBeenCalledWith(theme);
    expect(setColorScheme).toHaveBeenCalledWith(theme);
  });
});
