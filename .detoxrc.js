/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e/jest.config.cjs",
      json: true,
      outputFile: "evidence/detox/results.json",
    },
  },
  apps: {
    "android.release": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/release/app-release.apk",
      testBinaryPath: "android/app/build/outputs/apk/androidTest/release/app-release-androidTest.apk",
      build: "node e2e/build-android.cjs",
    },
  },
  devices: {
    emulator: {
      type: "android.emulator",
      device: { avdName: process.env.DETOX_AVD || "BusTrack_Detox_API_35" },
      headless: true,
      ...(process.platform === "win32" ? { gpuMode: "swiftshader_indirect" } : {}),
    },
  },
  configurations: {
    "android.emu.release": { device: "emulator", app: "android.release" },
    "android.emu.performance": {
      device: "emulator",
      app: "android.release",
      testRunner: {
        args: {
          config: "e2e/jest.performance.config.cjs",
          outputFile: "evidence/performance/detox-results.json",
        },
      },
      artifacts: { rootDir: "evidence/performance/artifacts" },
    },
  },
  artifacts: {
    rootDir: "evidence/detox",
    plugins: { log: "all", screenshot: "all" },
  },
};
