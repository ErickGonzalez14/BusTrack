const { execFileSync, spawnSync } = require("node:child_process");

const expo = require.resolve("expo/bin/cli");
const options = {
  stdio: "inherit",
  env: {
    ...process.env,
    STRIPE_SECRET_KEY: "",
    EXPO_PUBLIC_STRIPE_SECRET_KEY: "",
  },
};

if (process.platform === "win32" && !process.argv.includes("--help") && !process.argv.includes("-h")) {
  execFileSync(process.execPath, [expo, "prebuild", "--platform", "android", "--no-install"], options);
}

const result = spawnSync(process.execPath, [
  expo,
  "run:android",
  "--variant",
  "release",
  "--no-bundler",
  ...process.argv.slice(2),
], options);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
