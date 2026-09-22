import { expect, test } from '@playwright/test';

test('home page exposes candidate and employer journeys', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Great people/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore opportunities/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /I’m hiring/i })).toBeVisible();
});

test('seeded jobs are searchable and open a detail page', async ({ page }) => {
  await page.goto('/jobs?q=nurse');
  await expect(page.getByRole('heading', { name: /Find work that fits/i })).toBeVisible();
  await page.getByRole('link', { name: /View .*Nurse/i }).first().click();
  await expect(page.getByRole('heading', { name: /Apply for this role/i })).toBeVisible();
});

test('employer request validates required fields', async ({ page }) => {
  await page.goto('/employers');
  await page.getByRole('button', { name: /Request talent/i }).click();
  await expect(page.locator('input:invalid').first()).toBeVisible();
});
