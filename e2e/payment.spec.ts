import { test, expect } from "@playwright/test";

test.describe("Payment Callback Flows", () => {
  test("should enforce route protection and redirect unauthenticated access to sign-in", async ({ page }) => {
    await page.goto("/payment/success");
    await expect(page).toHaveURL(/sign-in\?callbackUrl=%2Fpayment%2Fsuccess/);

    await page.goto("/payment/cancel");
    await expect(page).toHaveURL(/sign-in\?callbackUrl=%2Fpayment%2Fcancel/);
  });
});
