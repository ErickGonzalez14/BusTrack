module.exports = {
  ...require("./jest.config.cjs"),
  testMatch: ["<rootDir>/e2e/**/*.perf.js"],
  testTimeout: 300_000,
};
