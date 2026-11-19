const path = require("node:path");
const { AndroidConfig, withDangerousMod } = require("expo/config-plugins");

module.exports = (config) => withDangerousMod(config, ["android", async (mod) => {
  const manifestPath = path.join(mod.modRequest.platformProjectRoot, "app", "src", "debug", "AndroidManifest.xml");
  const manifest = await AndroidConfig.Manifest.readAndroidManifestAsync(manifestPath);
  const application = manifest.manifest.application[0].$;
  const removedAttributes = (application["tools:remove"] ?? "")
    .split(",")
    .map((attribute) => attribute.trim())
    .filter(Boolean);

  // Detox sets a network security config in the main manifest. Keep Expo's
  // debug cleartext setting effective so Metro can use the ADB loopback.
  if (!removedAttributes.includes("android:networkSecurityConfig")) {
    removedAttributes.push("android:networkSecurityConfig");
    application["tools:remove"] = removedAttributes.join(",");
    await AndroidConfig.Manifest.writeAndroidManifestAsync(manifestPath, manifest);
  }
  return mod;
}]);
