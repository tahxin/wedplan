import { test, expect } from "@playwright/test";

test.describe("Backend Express REST API", () => {
  const BACKEND_URL = "http://localhost:5000";

  test("GET / should return 200 OK with health check message", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("WedPlan API is running");
  });

  test("GET /categories should return the 6 categories with item counts", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/categories`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.categories.length).toBe(6);
  });

  test("GET /services/featured should return seeded approved wedding services", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/services/featured`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.services.length).toBeGreaterThanOrEqual(1);
    expect(data.services[0]).toHaveProperty("serviceName");
    expect(data.services[0]).toHaveProperty("price");
  });

  test("GET /services should allow search and category filters", async ({ request }) => {
    const res = await request.get(`${BACKEND_URL}/services?category=Wedding%20Venues`);
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    for (const service of data.services) {
      expect(service.category).toBe("Wedding Venues");
    }
  });
});
