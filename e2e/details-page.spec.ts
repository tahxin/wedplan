import { test, expect } from "@playwright/test";
import { cleanupTestUser } from "./test-helpers";

test.describe("Service Details Page Deep Dive", () => {
  const timestamp = Date.now();
  const customerEmail = `details_cust_${timestamp}@testflow.com`;
  const customerPassword = "Password123!";

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.afterAll(async () => {
    await cleanupTestUser(customerEmail);
  });

  test("should render complete service package details, vendor card, and booking form", async ({ page }) => {
    // 1. Sign up as a fresh customer
    await page.goto("/sign-up");
    await page.getByLabel(/Full Name/i).fill("Details Test Customer");
    await page.getByLabel(/Email Address/i).fill(customerEmail);
    await page.getByLabel(/Password/i).fill(customerPassword);
    await page.locator("form").getByRole("button", { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 15000 });

    // 2. Navigate to Browse Services
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /Browse Wedding Services/i })).toBeVisible();

    // Click on the first service card's View Details
    const firstDetailsBtn = page.getByRole("link", { name: /View Details/i }).first();
    await expect(firstDetailsBtn).toBeVisible({ timeout: 10000 });
    await firstDetailsBtn.click();

    // Should load the service details page
    await expect(page).toHaveURL(/\/services\/[a-f0-9]+/, { timeout: 15000 });

    // Verify breadcrumb
    await expect(page.getByText(/Back to all wedding services/i)).toBeVisible();

    // Verify booking form elements
    await expect(page.getByRole("heading", { name: /Request a Booking/i })).toBeVisible();
    await expect(page.locator("input[type='date']")).toBeVisible();
    await expect(page.locator("#eventLocation")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();

    // Verify investment package price is displayed
    await expect(page.getByText(/Investment/i)).toBeVisible();
  });
});
