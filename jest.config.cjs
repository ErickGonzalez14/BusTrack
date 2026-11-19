module.exports = {
  preset: "jest-expo",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  collectCoverageFrom: [
    "src/features/**/domain/**/*.ts",
    "!src/features/**/domain/**/*.type.ts",
    "functions/shared/simulatedFleet.ts",
    "functions/src/routineSchedule.ts",
  ],
  coverageDirectory: "<rootDir>/evidence/jest/coverage",
  coverageReporters: ["text", "json-summary", "html"],
};
