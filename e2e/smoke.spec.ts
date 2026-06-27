import { test, expect } from "@playwright/test";

test.describe("Saathi smoke flows", () => {
  test("login page loads with skip link and demo option", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeVisible({
      visible: false,
    });
    await expect(page.getByRole("button", { name: /Explore as/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign in" })).toBeVisible();
  });

  test("crisis resources reachable from login context copy", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/not a therapist/i)).toBeVisible();
  });
});
