import { test, expect } from "@playwright/test";
import { blockUser, cleanupTestUser } from "./test-helpers";

test.describe("Security Guards & Role Boundaries", () => {
  const password = "Password123!";

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("role boundaries: customer and vendor role restrictions and blocked account enforcement", async ({ page }) => {
    const timestamp = Date.now();
    const customerEmail = `sec_cust_${timestamp}@testflow.com`;
    const vendorEmail = `sec_vend_${timestamp}@testflow.com`;

    try {
      // 1. Customer cannot access Vendor or Admin dashboards
      await page.goto("/sign-up");
      await page.getByLabel(/Full Name/i).fill("Security Customer");
      await page.getByLabel(/Email Address/i).fill(customerEmail);
      await page.getByLabel(/Password/i).fill(password);
      await page.locator("form").getByRole("button", { name: /Create Account/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 15000 });

      // Attempt to access Vendor Dashboard
      await page.goto("/dashboard/vendor");
      await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 10000 });

      // Attempt to access Admin Dashboard
      await page.goto("/dashboard/admin");
      await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 10000 });

      // 2. Block user in database and verify real-time expulsion
      await blockUser(customerEmail, true);
      await page.reload();
      await expect(page).toHaveURL(/sign-in.*blocked=1/, { timeout: 15000 });
      await expect(page.locator("body")).toContainText(/Your account is blocked|blocked|support/i);

      // 3. Vendor cannot access Admin dashboard
      await page.context().clearCookies();
      await page.goto("/sign-up");
      await page.locator("label[for='role-vendor']").click();
      await page.getByLabel(/Full Name/i).fill("Security Vendor");
      await page.locator("#businessName").fill("Guardians Floral");
      await page.getByLabel(/Email Address/i).fill(vendorEmail);
      await page.getByLabel(/Password/i).fill(password);
      await page.locator("form").getByRole("button", { name: /Create Account/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/vendor/, { timeout: 15000 });

      // Attempt to access Admin Dashboard
      await page.goto("/dashboard/admin");
      await expect(page).toHaveURL(/\/dashboard\/vendor/, { timeout: 10000 });
    } finally {
      await cleanupTestUser(customerEmail);
      await cleanupTestUser(vendorEmail);
    }
  });
});
