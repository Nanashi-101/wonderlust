import { test, expect } from "@playwright/test";

// Full booking → checkout → payment e2e flows (Stripe test cards, Razorpay,
// per-locale pricing, admin package publish) land once M4-M6 are wired to
// real payment-provider test credentials — see CLAUDE.md §7 E2E for the
// planned list. This file covers what's testable without them today.

test("homepage loads", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle(/Wonderlust/i);
});

test("packages listing loads", async ({ page }) => {
  const response = await page.goto("/en/packages");
  expect(response?.status()).toBeLessThan(400);
});

test("custom 404 page renders and links back home", async ({ page }) => {
  await page.goto("/en/this-page-does-not-exist-anywhere");
  await expect(page.getByText(/wandered off the trail/i)).toBeVisible();

  await page.getByRole("link", { name: /back to base camp/i }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
});
