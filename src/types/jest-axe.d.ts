declare module "jest-axe" {
  import type { AxeResults } from "axe-core";
  export function axe(container: Element | Document): Promise<AxeResults>;
  export function toHaveNoViolations(results: AxeResults): { pass: boolean; message: () => string };
}

declare module "axe-core" {
  export interface AxeResults {
    violations: unknown[];
  }
}

interface CustomAxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends CustomAxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomAxeMatchers {}
}
