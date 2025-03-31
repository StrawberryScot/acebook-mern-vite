import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

// Add testing-library matchers to expect
expect.extend(matchers);

// Clear the DOM after each test
afterEach(() => {
  cleanup();
});
