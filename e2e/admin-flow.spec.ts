import { test, expect } from "@playwright/test";
import { promoteToAdmin, cleanupTestUser } from "./test-helpers";

test.describe("Admin Full User Flow", () => {
  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@testflow.com`;
  const adminPassword = "Password123!";
  const adminName = `Platform Admin ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test.afterAll(async () => {
    await cleanupTestUser(adminEmail);
  });

  test("complete admin lifecycle: promote to admin, access console, inspect moderation, users, and stripe ledger", async ({ page }) => {
    // 1. Sign up as regular user
    await page.goto("/sign-up");
    await page.getByLabel(/Full Name/i).fill(adminName);
    await page.getByLabel(/Email Address/i).fill(adminEmail);
    await page.getByLabel(/Password/i).fill(adminPassword);
    await page.locator("form").getByRole("button", { name: /Create Account/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // 2. Promote user to admin directly in MongoDB
    await promoteToAdmin(adminEmail);

    // 3. Clear cookies and sign in to obtain fresh session with admin role
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await page.getByLabel(/Email Address/i).fill(adminEmail);
    await page.getByLabel(/Password/i).fill(adminPassword);
    await page.locator("form").getByRole("button", { name: /^Sign In$/i }).click();

    // Verify redirected to Admin Dashboard
    await expect(page).toHaveURL(/\/dashboard\/admin/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /WedPlan Management Console/i })).toBeVisible();

    // Verify overview metric cards
    await expect(page.getByText(/Total Users/i)).toBeVisible();
    await expect(page.getByText(/Vendors/i).first()).toBeVisible();
    await expect(page.getByText(/Customers/i).first()).toBeVisible();
    await expect(page.getByText(/Total Services/i)).toBeVisible();
    await expect(page.getByText(/Pending Reviews/i)).toBeVisible();
    await expect(page.getByText(/Transactions/i).first()).toBeVisible();

    // 4. Switch to Users Directory tab
    await page.getByRole("tab", { name: /Users Directory/i }).click();
    const searchInput = page.getByPlaceholder(/Search name or email/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("grandmirage");
    await page.waitForTimeout(500);
    await searchInput.fill("");

    // 5. Switch to Services Moderation tab
    await page.getByRole("tab", { name: /Services Moderation/i }).click();
    await expect(page.getByRole("heading", { name: /Services Review Queue/i })).toBeVisible();

    // 6. Switch to Stripe Transactions tab
    await page.getByRole("tab", { name: /Stripe Transactions/i }).click();
    await expect(page.getByRole("heading", { name: /Platform Payments/i })).toBeVisible();
    await expect(page.getByText(/Session ID/i).first()).toBeVisible();
    await expect(page.getByText(/COMPLETED/i).first()).toBeVisible();
  });
});
