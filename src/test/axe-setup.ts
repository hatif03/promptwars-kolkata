import { toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

expect.extend(toHaveNoViolations as unknown as Parameters<typeof expect.extend>[0]);
