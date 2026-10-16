import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test.describe(`Test setup before testing`, async () => {
  test(`Verify title of service`, async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await expect(page.getByText('This is a demo store to test')).toBeVisible();
  });

  test(`Verify "Sign in" link works properly`, async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.getByRole('link', { name: 'Sidn In' }).click();
    await page.waitForTimeout(7);
    await expect(page.getByText('Customer Login')).toBeVisible();
  });

  test(`Verify "Create an account" works properly`, async ({ page }) => {
    await page.goto(`${process.env.BASE_URL}`);
    await page.getByRole('banner').getByRole('link', { name: 'Create an Account' }).click();
    await page.waitForTimeout(7);
    await expect(page.getByText('Create New Customer Account')).toBeVisible();
  });
});
