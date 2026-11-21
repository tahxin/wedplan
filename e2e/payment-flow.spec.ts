import { test, expect } from "@playwright/test";
import { setVendorPlan, cleanupTestUser } from "./test-helpers";

test.describe("Stripe Payment & Sandbox Flows", () => {
  const timestamp = Date.now();
  const vendorEmail = `payvendor_${timestamp}@testflow.com`;
  const vendorPassword = "Password123!";
  const vendorName = `Stripe Test Vendor ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.afterAll(async () => {
    await cleanupTestUser(vendorEmail);
  });

  test("should enforce route protection and redirect unauthenticated access to sign-in", async ({ page }) => {
    await page.goto("/payment/success");
    await expect(page).toHaveURL(/sign-in\?callbackUrl=%2Fpayment%2Fsuccess/);

    await page.goto("/payment/cancel");
    await expect(page).toHaveURL(/sign-in\?callbackUrl=%2Fpayment%2Fcancel/);
  });

  test("should upgrade vendor to Premium plan and reflect in Vendor Dashboard", async ({ page }) => {
    // 1. Register as a vendor
    await page.goto("/sign-up");
    await page.locator("label[for='role-vendor']").click();
    await page.getByLabel(/Full Name/i).fill(vendorName);
    await page.locator("#businessName").fill("Aura Luxe Events");
    await page.getByLabel(/Email Address/i).fill(vendorEmail);
    await page.getByLabel(/Password/i).fill(vendorPassword);
    await page.locator("form").getByRole("button", { name: /Create Account/i }).click();

    await expect(page).toHaveURL(/\/dashboard\/vendor/, { timeout: 15000 });

    // Initial state: Free Plan
    await expect(page.getByText(/FREE PLAN/i).first()).toBeVisible();

    // 2. Grant Premium in MongoDB (simulating verified Stripe webhook / confirm-session)
    await setVendorPlan(vendorEmail, "premium");

    // 3. Visit Payment Success page
    await page.goto("/payment/success");
    await expect(page.getByRole("heading", { name: /Payment Confirmed!/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Your Premium Membership is Now Active!/i)).toBeVisible({ timeout: 15000 });

    // Verify return or auto-redirect to Vendor Dashboard
    try {
      const returnBtn = page.getByRole("button", { name: /Return to Vendor Dashboard/i });
      if (await returnBtn.isVisible({ timeout: 2000 })) {
        await returnBtn.click();
      }
    } catch {
      // Auto-redirect may have already occurred
    }
    await expect(page).toHaveURL(/\/dashboard\/vendor/, { timeout: 15000 });

    // Verify Premium badge appears in overview
    await expect(page.getByText(/PREMIUM/i).first()).toBeVisible();
  });
});
