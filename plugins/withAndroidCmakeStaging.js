const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = (config) => withAppBuildGradle(config, (androidConfig) => {
  const gradle = androidConfig.modResults;
  const stagingDirectory = "buildStagingDirectory rootProject.file('../.cxx')";
  if (gradle.language === "groovy" && !gradle.contents.includes(stagingDirectory)) {
    gradle.contents = gradle.contents.replace(/^android\s*\{/m, `$&
    externalNativeBuild {
        cmake {
            ${stagingDirectory}
        }
    }`);
  }
  return androidConfig;
});
