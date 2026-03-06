import { test, expect } from '@playwright/test';

test.describe('Home page smoke test', () => {
  test('loads the home page successfully', async ({ page }) => {
    await page.goto('/');
    // Page should load without errors
    await expect(page).toHaveTitle(/Guild/i);
  });

  test('home page has main navigation', async ({ page }) => {
    await page.goto('/');
    // The page should contain a navigation element or header
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('home page renders key content sections', async ({ page }) => {
    await page.goto('/');
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    // The page body should have meaningful content (not blank)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});
