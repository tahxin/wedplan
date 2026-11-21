import { test, expect } from "@playwright/test";

test.describe("Authentication Flows", () => {
  test("should render the sign-in form with email, password, and Google button", async ({ page }) => {
    await page.goto("/sign-in");

    await expect(page.getByRole("heading", { name: /Welcome Back/i })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
    await expect(page.locator("form").getByRole("button", { name: /^Sign In$/i })).toBeVisible();
  });

  test("should display error message on invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");

    await page.getByLabel(/Email Address/i).fill("nonexistent_user_test@example.com");
    await page.getByLabel(/Password/i).fill("WrongPass123!");
    await page.locator("form").getByRole("button", { name: /^Sign In$/i }).click();

    // Verify error toast or feedback
    await expect(page.locator("body")).toContainText(/invalid|failed|not found/i, { timeout: 10000 });
  });

  test("should render the sign-up form with role selection and password rules", async ({ page }) => {
    await page.goto("/sign-up");

    await expect(page.getByRole("heading", { name: /Create Your Account/i })).toBeVisible();
    await expect(page.getByText(/Customer/i).first()).toBeVisible();
    await expect(page.getByText(/Vendor/i).first()).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();

    // Password criteria indicators
    await expect(page.getByText(/6\+ characters/i)).toBeVisible();
    await expect(page.getByText(/1 uppercase/i)).toBeVisible();
    await expect(page.getByText(/1 lowercase/i)).toBeVisible();
  });
});
