import { test, expect } from "@playwright/test";
import { cleanupTestUser } from "./test-helpers";

test.describe("Vendor Full User Journey", () => {
  const timestamp = Date.now();
  const vendorEmail = `vendor_${timestamp}@testflow.com`;
  const vendorPassword = "Password123!";
  const vendorName = `Test Vendor ${timestamp}`;
  const businessName = `Enchanted Moments Studio ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.afterAll(async () => {
    await cleanupTestUser(vendorEmail);
  });

  test("complete vendor lifecycle: register, add package, manage listing, view tabs", async ({ page }) => {
    // 1. Sign Up as Vendor
    await page.goto("/sign-up");
    await page.locator("label[for='role-vendor']").click();

    await page.getByLabel(/Full Name/i).fill(vendorName);
    await page.locator("#businessName").fill(businessName);
    await page.getByLabel(/Email Address/i).fill(vendorEmail);
    await page.getByLabel(/Password/i).fill(vendorPassword);
    await page.locator("form").getByRole("button", { name: /Create Account/i }).click();

    // Verify redirected to Vendor Dashboard
    await expect(page).toHaveURL(/\/dashboard\/vendor/, { timeout: 15000 });
    await expect(page.getByText(/FREE PLAN/i).first()).toBeVisible();
    await expect(page.getByText(/Total Services/i)).toBeVisible();
    await expect(page.getByText(/Active Services/i)).toBeVisible();

    // 2. Add New Wedding Service
    const addServiceBtn = page.getByRole("button", { name: /Publish New Service|Add Your First Service/i }).first();
    await expect(addServiceBtn).toBeVisible();
    await addServiceBtn.click();

    const serviceName = `Artisan Bridal Photography ${timestamp}`;
    await page.locator("#srv-name").fill(serviceName);
    await page.locator("#srv-price").fill("2500");
    await page.locator("#srv-loc").fill("Manhattan, NY");
    await page.locator("#srv-desc").fill("Complete 8-hour wedding coverage including aerial drone and archival print box.");
    await page.getByRole("button", { name: /^Submit Service$/i }).click();

    await expect(page.locator("body")).toContainText(/Service submitted for review|created successfully/i, { timeout: 10000 });
    await expect(page.getByText(serviceName)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Pending/i).first()).toBeVisible();

    // 3. Toggle Availability
    const toggleBtn = page.locator("button:has(svg.lucide-toggle-right), button:has(svg.lucide-toggle-left)").first();
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await expect(page.locator("body")).toContainText(/availability/i, { timeout: 10000 });
    }

    // 4. Edit Service Modal
    const editBtn = page.locator("button:has(svg.lucide-pencil)").first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.getByRole("heading", { name: /Update Service Package/i })).toBeVisible();
      await page.locator("#edit-srv-price").fill("2800");
      await page.getByRole("button", { name: /Save Updates/i }).click();
      await expect(page.locator("body")).toContainText(/Service updated successfully|updated/i, { timeout: 10000 });
    }

    // 5. Inspect Subscription Plan tab
    await page.getByRole("tab", { name: /Subscription/i }).click();
    await expect(page.getByText(/Free Tier/i).first()).toBeVisible();
    await expect(page.getByText(/Premium Partner/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Upgrade to Premium/i }).first()).toBeVisible();

    // 6. Inspect Booking Inquiries tab
    await page.getByRole("tab", { name: /Booking/i }).click();
    await expect(page.getByText(/Booking Inquiries|Client Inquiries/i).first()).toBeVisible();
  });
});
