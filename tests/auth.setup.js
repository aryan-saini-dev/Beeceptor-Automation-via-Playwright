// @ts-check
/**
 * Authentication setup for Beeceptor tests.
 *
 * Runs ONCE before all tests. Logs into Beeceptor using credentials from .env,
 * saves the browser session (cookies + localStorage) to playwright/.auth/user.json
 * so subsequent tests reuse the session without re-logging in.
 */

const { test: setup, expect } = require('@playwright/test');
require('dotenv').config();

const AUTH_FILE = 'playwright/.auth/user.json';

setup('authenticate with Beeceptor', async ({ page }) => {
  const email = process.env.BEECEPTOR_EMAIL;
  const password = process.env.BEECEPTOR_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Missing BEECEPTOR_EMAIL or BEECEPTOR_PASSWORD in .env\n' +
        'Copy .env.example to .env and fill in your credentials.'
    );
  }

  console.log(`\n🔐 Logging into Beeceptor as: ${email}`);

  // ── Navigate to login page ───────────────────────────────────────────────
  await page.goto('https://app.beeceptor.com/login', { waitUntil: 'networkidle' });

  // ── Ensure "Login with Password" tab is active ───────────────────────────
  const pwTab = page.locator('button, a', { hasText: 'Login with Password' });
  if (await pwTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await pwTab.click();
  }

  // ── Fill credentials using exact IDs found in the live DOM ──────────────
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  // ── Submit ────────────────────────────────────────────────────────────────
  await page.locator('button.btn-primary.btn-block').click();

  // ── Wait for successful redirect ──────────────────────────────────────────
  // After login, Beeceptor redirects to an onboarding or console page.
  // We wait for the URL to change away from /login.
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
  await page.waitForLoadState('networkidle');

  console.log(`✅ Logged in! Current URL: ${page.url()}`);

  // ── Save session state ────────────────────────────────────────────────────
  await page.context().storageState({ path: AUTH_FILE });
  console.log(`💾 Auth state saved → ${AUTH_FILE}`);
});
