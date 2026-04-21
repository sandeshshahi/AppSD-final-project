/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // tells Jest to only run files that end in .spec.ts
  testMatch: ["**/*.spec.ts"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
};
