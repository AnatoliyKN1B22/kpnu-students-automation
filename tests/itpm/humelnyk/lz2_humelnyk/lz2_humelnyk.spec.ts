import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test.describe('Test setup before testing', () => {
  test('Verify title of service', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://automationexercise.com');
    await expect(page).toHaveTitle(/Automation Exercise/i);
    await expect(page.locator('.logo img')).toBeVisible();
  });

  test('Verify "Sign in" link works properly', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://automationexercise.com');
    await page.getByRole('link', { name: /Signup \/ Login/i }).click();
    await expect(page.getByText('Login to your account')).toBeVisible();
  });

  test('Verify "Create an account" works properly', async ({ page }) => {
    await page.goto(process.env.BASE_URL || 'https://automationexercise.com');
    await page.getByRole('link', { name: /Signup \/ Login/i }).click();
    await expect(page.getByText('New User Signup!')).toBeVisible();
  });
});
