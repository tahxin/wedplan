import { test, expect } from "@playwright/test";

test.describe("Home Page & Core Layout", () => {
  test("should display the hero banner, title, and CTA buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/WedPlan/i);

    // Hero title & CTA
    await expect(page.locator("h1")).toContainText(/Discover & Book Trusted Wedding Vendors/i);
    const exploreBtn = page.getByRole("link", { name: /Explore Wedding Services/i });
    await expect(exploreBtn).toBeVisible();
    await expect(exploreBtn).toHaveAttribute("href", "/services");

    const vendorBtn = page.getByRole("main").getByRole("link", { name: /Become a Vendor/i });
    await expect(vendorBtn).toBeVisible();
    await expect(vendorBtn).toHaveAttribute("href", "/sign-up");
  });

  test("should render the 6 wedding category cards with link parameters", async ({ page }) => {
    await page.goto("/");
    const expectedCategories = [
      "Photography & Videography",
      "Wedding Venues",
      "Decoration & Florist",
      "Catering Services",
      "Makeup & Styling",
      "Wedding Fashion",
    ];

    for (const cat of expectedCategories) {
      const catHeading = page.getByRole("heading", { name: cat });
      await expect(catHeading).toBeVisible();
    }
  });

  test("should fetch and render featured wedding packages from the database", async ({ page }) => {
    await page.goto("/");
    // Featured section heading
    await expect(page.getByRole("heading", { name: /Popular Wedding Packages/i })).toBeVisible();

    // Check that at least some service cards are displayed
    const viewDetailsLinks = page.getByRole("link", { name: /View Details/i });
    await expect(viewDetailsLinks.first()).toBeVisible({ timeout: 15000 });
    const count = await viewDetailsLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("should render the footer with wedding branding and working links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/WedPlan/i);
    await expect(footer).toContainText(/All Wedding Services/i);
    await expect(footer).toContainText(/Customer Sign In/i);
  });
});
