import { test, expect } from "@playwright/test";

test.describe("Navigation & Route Guards", () => {
  test("should render custom 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/non-existent-wedding-page");

    await expect(page.getByText(/404 Error/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Page Not Found/i })).toBeVisible();

    const homeBtn = page.getByRole("link", { name: /Back to Home/i });
    await expect(homeBtn).toBeVisible();
    await homeBtn.click();
    await expect(page).toHaveURL("/");
  });

  test("should redirect unauthenticated users attempting to access dashboards to sign-in", async ({ page }) => {
    await page.goto("/dashboard/admin");
    await expect(page).toHaveURL(/sign-in/);

    await page.goto("/dashboard/vendor");
    await expect(page).toHaveURL(/sign-in/);

    await page.goto("/dashboard/customer");
    await expect(page).toHaveURL(/sign-in/);
  });
});
