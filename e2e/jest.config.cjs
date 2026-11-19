module.exports = {
  rootDir: "..",
  testMatch: ["<rootDir>/e2e/**/*.e2e.js"],
  transform: {},
  testTimeout: 120_000,
  maxWorkers: 1,
  globalSetup: "detox/runners/jest/globalSetup",
  globalTeardown: "detox/runners/jest/globalTeardown",
  testEnvironment: "detox/runners/jest/testEnvironment",
  reporters: ["detox/runners/jest/reporter"],
  verbose: true,
};
