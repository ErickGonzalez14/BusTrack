const { AndroidConfig, withAndroidManifest } = require("expo/config-plugins");

module.exports = function withPurchaseLaunchMode(config) {
  return withAndroidManifest(config, (mod) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(
      mod.modResults,
    );
    activity.$["android:launchMode"] = "singleTop";
    return mod;
  });
};
