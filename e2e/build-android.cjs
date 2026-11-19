/* global __dirname */
const { execFileSync, execSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const env = {
  ...process.env,
  BUSTRACK_DETOX: "1",
  EXPO_PUBLIC_STRIPE_SECRET_KEY: "",
};

execFileSync(process.execPath, [
  require.resolve("expo/bin/cli"), "prebuild", "--platform", "android", "--no-install",
], { cwd: root, env, stdio: "inherit" });

const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
execSync(
  `${gradle} :app:assembleRelease :app:assembleReleaseAndroidTest -DtestBuildType=release -PreactNativeArchitectures=x86_64`,
  { cwd: path.join(root, "android"), env, stdio: "inherit" },
);
