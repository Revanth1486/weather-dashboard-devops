import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

test.describe('Weather Dashboard - QA Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('page loads with title and search bar', async ({ page }) => {
    await expect(page).toHaveTitle(/Weather Dashboard/);
    await expect(page.locator('input[placeholder="Search city..."]')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Search' })).toBeVisible();
  });

  test('shows quick city suggestion buttons', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'London' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tokyo' })).toBeVisible();
  });

  test('search for London returns weather data', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'London');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=London')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=GB')).toBeVisible();
  });

  test('temperature is displayed as a number with degree symbol', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'London');
    await page.click('button:has-text("Search")');
    await page.waitForSelector('text=Feels like', { timeout: 10000 });
    const tempEl = page.locator('text=/\\d+°/').first();
    await expect(tempEl).toBeVisible();
  });

  test('5-day forecast section is visible after search', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'London');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=5-Day Forecast')).toBeVisible({ timeout: 10000 });
  });

  test('error message shows for invalid city', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'xyzfakecity99999');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=/City not found|not found/i')).toBeVisible({ timeout: 10000 });
  });

  test('pressing Enter triggers search', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'Tokyo');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Tokyo')).toBeVisible({ timeout: 10000 });
  });

  test('clicking quick city button loads weather', async ({ page }) => {
    await page.click('button:has-text("Tokyo")');
    await expect(page.locator('text=Tokyo')).toBeVisible({ timeout: 10000 });
  });

  test('humidity stat card is visible', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'London');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=Humidity')).toBeVisible({ timeout: 10000 });
  });

  test('wind speed stat card is visible', async ({ page }) => {
    await page.fill('input[placeholder="Search city..."]', 'London');
    await page.click('button:has-text("Search")');
    await expect(page.locator('text=Wind Speed')).toBeVisible({ timeout: 10000 });
  });
});
