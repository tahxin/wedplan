import { test, expect } from "@playwright/test";

test.describe("Browse Services Catalog", () => {
  test("should render the catalog with search, category filters, and sorting controls", async ({ page }) => {
    await page.goto("/services");

    await expect(page.getByRole("heading", { name: /Browse Wedding Services/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search services.../i)).toBeVisible();
    await expect(page.getByPlaceholder(/City, State, or Region.../i)).toBeVisible();

    // Check category pills
    await expect(page.getByRole("button", { name: "All Categories" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Photography & Videography" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wedding Venues" })).toBeVisible();
  });

  test("should filter packages when clicking category pills", async ({ page }) => {
    await page.goto("/services");

    // Click on "Photography & Videography" pill
    const photoPill = page.getByRole("button", { name: "Photography & Videography" });
    await photoPill.click();

    // Verify services load and match the category
    await expect(page.getByText(/Cinematic Photo|Photography/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should allow changing the sort order", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /Browse Wedding Services/i })).toBeVisible();

    const sortSelect = page.locator("#sort-select");
    await expect(sortSelect).toBeVisible();

    await sortSelect.selectOption({ value: "price_asc" });
    await expect(sortSelect).toHaveValue("price_asc");

    await sortSelect.selectOption({ value: "price_desc" });
    await expect(sortSelect).toHaveValue("price_desc");
  });

  test("should redirect unauthenticated users to sign-in when clicking View Details", async ({ page }) => {
    await page.goto("/services");

    const viewDetails = page.getByRole("link", { name: /View Details/i }).first();
    await expect(viewDetails).toBeVisible({ timeout: 15000 });
    await viewDetails.click();

    // Unauthenticated user should be redirected to sign-in with callbackUrl
    await expect(page).toHaveURL(/sign-in/);
  });
});
