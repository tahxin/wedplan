import { test, expect } from "@playwright/test";
import { cleanupTestUser } from "./test-helpers";

test.describe("Customer Full User Journey", () => {
  const timestamp = Date.now();
  const customerEmail = `customer_${timestamp}@testflow.com`;
  const customerPassword = "Password123!";
  const customerName = `Test Customer ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.afterAll(async () => {
    await cleanupTestUser(customerEmail);
  });

  test("complete customer lifecycle: register, book package, cancel inquiry, and update profile", async ({ page }) => {
    // 1. Sign Up as Customer
    await page.goto("/sign-up");
    await page.getByLabel(/Full Name/i).fill(customerName);
    await page.getByLabel(/Email Address/i).fill(customerEmail);
    await page.getByLabel(/Password/i).fill(customerPassword);
    await page.locator("form").getByRole("button", { name: /Create Account/i }).click();

    // Verify redirected to Customer Dashboard
    await expect(page).toHaveURL(/\/dashboard\/customer/, { timeout: 15000 });
    await expect(page.getByText(/Customer Portal/i).first()).toBeVisible();
    await expect(page.getByText(/Total Requests/i)).toBeVisible();

    // 2. Browse Services and Submit a Booking Request
    await page.goto("/services");
    await expect(page.getByRole("heading", { name: /Browse Wedding Services/i })).toBeVisible();

    const firstDetailsBtn = page.getByRole("link", { name: /View Details/i }).first();
    await expect(firstDetailsBtn).toBeVisible({ timeout: 10000 });
    await firstDetailsBtn.click();

    await expect(page).toHaveURL(/\/services\/[a-f0-9]+/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Request a Booking/i })).toBeVisible();

    const futureDate = "2027-09-20";
    await page.locator("input[type='date']").fill(futureDate);
    await page.locator("#eventLocation").fill("St. Patrick Grand Ballroom");
    await page.locator("#message").fill("Looking forward to celebrating our wedding!");
    await page.getByRole("button", { name: /Send Booking Request/i }).click();

    await expect(page.getByText(/Booking Request Sent|Booking request sent successfully/i)).toBeVisible({ timeout: 10000 });

    // 3. Test Duplicate Booking Prevention
    await page.reload();
    await page.locator("input[type='date']").fill(futureDate);
    await page.locator("#eventLocation").fill("St. Patrick Grand Ballroom");
    await page.getByRole("button", { name: /Send Booking Request/i }).click();
    await expect(page.locator("body")).toContainText(/active booking request/i, { timeout: 10000 });

    // 4. Return to Customer Dashboard and View Booking Details
    await page.goto("/dashboard/customer");
    await expect(page.getByText(/Pending/i).first()).toBeVisible({ timeout: 10000 });

    const detailsBtn = page.getByRole("button", { name: /Details/i }).first();
    await expect(detailsBtn).toBeVisible();
    await detailsBtn.click();

    await expect(page.getByRole("heading", { name: /Booking Request Details/i })).toBeVisible();
    await expect(page.getByText(/St. Patrick Grand Ballroom/i).first()).toBeVisible();
    await page.getByRole("button", { name: /^Close$/i }).click();

    // 5. Cancel Booking Request
    const cancelBtn = page.getByRole("button", { name: /Cancel Request/i }).first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    await expect(page.getByRole("heading", { name: /Cancel this booking request\?/i })).toBeVisible();
    await page.getByRole("button", { name: /Cancel Request/i }).last().click();

    await expect(page.getByText(/Cancelled/i).first()).toBeVisible({ timeout: 10000 });

    // 6. Update Profile Settings
    await page.goto("/dashboard/customer/settings");
    await expect(page.getByRole("heading", { name: /Profile Settings/i })).toBeVisible();

    const updatedName = `${customerName} Updated`;
    await page.getByLabel(/Full Name/i).fill(updatedName);
    await page.getByRole("button", { name: /Save Settings/i }).click();
    await expect(page.locator("body")).toContainText(/Profile updated successfully/i, { timeout: 10000 });
  });
});
