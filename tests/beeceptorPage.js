// @ts-check
/**
 * BeeceptorPage - Page Object Model for Beeceptor console.
 *
 * All selectors verified against the live Beeceptor UI.
 *
 * Key findings from DOM inspection:
 * - Modal class:           .modal.allRules
 * - Callout editor:        .v2-callout-editor
 * - Match method select:   .v2-callout-editor select (index 0)
 * - Path input:            .v2-callout-editor input.v2-path-input
 * - Response mode select:  .v2-callout-editor select (index 2)
 * - Callout method select: .v2-callout-editor select (index 3)
 * - Target URL input:      .v2-callout-editor #targetEndpoint (2 exist! use first())
 * - Save button:           modal footer button containing "Save"
 * - Cancel button:         modal footer button containing "Cancel"
 * - Rule rows in list:     .modal.allRules .list-group-item
 * - Delete (trash) icon:   last visible icon button in each row
 */

const { expect } = require('@playwright/test');

class BeeceptorPage {
  constructor(page) {
    this.page = page;
    // Auto-accept delete confirmation dialogs
    this.page.on('dialog', async (dialog) => {
      if (dialog.message().toLowerCase().includes('delete')) {
        await dialog.accept();
        console.log('  ✅ Dialog accepted automatically');
      } else {
        await dialog.dismiss();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  async goToConsole(endpointName) {
    await this.page.goto(`https://app.beeceptor.com/console/${endpointName}`);
    await this.page.waitForLoadState('networkidle');
    // Dismiss onboarding panel if present
    const skipBtn = this.page.locator("text=I'll explore myself");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
      await this.page.waitForTimeout(400);
    }
    console.log(`📡 Navigated to console: ${endpointName}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mock Rules Modal
  // ─────────────────────────────────────────────────────────────────────────

  async openMockRulesModal() {
    if (await this.isModalOpen()) {
      console.log('📋 Mock Rules modal is already open, skipping open');
      return;
    }
    await this.page.locator('a.btn.btn-link.btn-sm', { hasText: 'Mock Rules' }).click();
    await this.page.locator('.modal.allRules').waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(300);
    console.log('📋 Mock Rules modal opened');
  }

  async closeMockRulesModal() {
    await this.page.locator('.modal.allRules .btn-close').click();
    await this.page.locator('.modal.allRules').waitFor({ state: 'hidden', timeout: 8000 });
    console.log('❌ Mock Rules modal closed');
  }

  async isModalOpen() {
    return await this.page.locator('.modal.allRules').isVisible();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HTTP Callout Rule form
  // ─────────────────────────────────────────────────────────────────────────

  async openNewCalloutRuleForm() {
    if (!(await this.isModalOpen())) {
      await this.openMockRulesModal();
    }

    // Self-healing: if the split caret button is not visible, a form must be open.
    // Click Cancel to return to the rules list view.
    const splitCaret = this.page.locator('.modal.allRules .dropdown-toggle-split');
    if (!(await splitCaret.isVisible())) {
      console.log('⚠️ Rules list split caret not visible. Form is likely open, clicking Cancel to return to list...');
      const cancelBtn = this.page.locator('.modal.allRules').getByRole('button', { name: /Cancel/i });
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
        await this.page.waitForTimeout(500);
      }
    }

    // Click the split-button dropdown caret (▾) next to "+ New Rule"
    await this.page.locator('.modal.allRules .dropdown-toggle-split').click();
    const dropdown = this.page.locator('.dropdown-menu.show');
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await dropdown.locator('a', { hasText: 'New Callout Rule' }).click();
    await this.page.locator('.v2-callout-editor').waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(500);
    console.log('📝 HTTP Callout Rule form opened');
  }

  /**
   * Fill the callout rule form.
   * Uses JS evaluate for selects (React re-renders break .selectOption).
   * Scopes #targetEndpoint to .v2-callout-editor to avoid strict-mode duplicate error.
   */
  async configureCalloutRule({ matchMethod, matchPath, calloutMethod, calloutUrl, description }) {
    const editor = this.page.locator('.v2-callout-editor');
    await editor.waitFor({ state: 'visible', timeout: 5000 });

    // ── 1. Match Method (select[0]) via JS ────────────────────────────────
    await this.page.evaluate((val) => {
      const selects = document.querySelectorAll('.v2-callout-editor select');
      if (selects[0]) {
        selects[0].value = val;
        selects[0].dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, matchMethod);
    await this.page.waitForTimeout(200);

    // ── 2. Match Path (input.v2-path-input) ──────────────────────────────
    const pathInput = editor.locator('input.v2-path-input');
    await pathInput.waitFor({ state: 'visible', timeout: 5000 });
    await pathInput.clear();
    await pathInput.fill(matchPath);
    console.log(`  → Match: ${matchMethod} ${matchPath}`);

    // ── 3. Scroll to "Synchronous Request Configuration (HTTP Callout)" ───
    await editor.evaluate((el) => (el.scrollTop = 350));
    await this.page.waitForTimeout(500);

    // ── 4. Callout Method (select[3]) via JS ──────────────────────────────
    await this.page.evaluate((val) => {
      const selects = document.querySelectorAll('.v2-callout-editor select');
      if (selects[3]) {
        selects[3].value = val;
        selects[3].dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, calloutMethod);
    await this.page.waitForTimeout(200);

    // ── 5. Callout URL — scoped to editor, .first() to avoid strict-mode ─
    // NOTE: There are 2 elements with id="targetEndpoint" on the page (a React
    // rendering quirk). We scope to the editor AND take .first() to be safe.
    const urlInput = editor.locator('[id="targetEndpoint"]').first();
    await urlInput.waitFor({ state: 'visible', timeout: 5000 });
    await urlInput.fill(calloutUrl);
    console.log(`  → Callout: ${calloutMethod} → ${calloutUrl}`);

    // ── 6. Description (optional) ─────────────────────────────────────────
    if (description) {
      await editor.evaluate((el) => (el.scrollTop = el.scrollHeight));
      await this.page.waitForTimeout(300);
      const descInput = editor.locator('input[placeholder="Description"]');
      if (await descInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await descInput.fill(description);
        console.log(`  → Description: "${description}"`);
      }
    }
  }

  /** Save by clicking the "Save" button in the modal footer. */
  async saveCalloutRule() {
    // The Save button is in the modal footer — locate by visible text
    await this.page.locator('.modal.allRules').getByRole('button', { name: /Save/i }).click();
    await this.page.locator('.v2-callout-editor').waitFor({ state: 'hidden', timeout: 10000 });
    await this.page.waitForTimeout(500);
    console.log('💾 Callout rule saved');
  }

  /** Cancel the callout rule form. */
  async cancelCalloutRule() {
    await this.page.locator('.modal.allRules').getByRole('button', { name: /Cancel/i }).click();
    await this.page.locator('.v2-callout-editor').waitFor({ state: 'hidden', timeout: 5000 });
    await this.page.waitForTimeout(300);
    console.log('🚫 Form cancelled');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Rule list helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Returns true if a rule containing pathText exists in the rules list. */
  async ruleExists(pathText) {
    if (!(await this.isModalOpen())) return false;
    const count = await this.page
      .locator('.modal.allRules .rule-row', { hasText: pathText })
      .count();
    return count > 0;
  }

  /**
   * Delete the rule containing pathText.
   * Uses native Playwright locators to find the correct row and click the trash button.
   */
  async deleteRuleByPath(pathText) {
    const row = this.page.locator('.modal.allRules .rule-row', { hasText: pathText }).first();
    if (await row.count() === 0) {
      console.log(`ℹ️ Rule "${pathText}" not found, skipping delete`);
      return;
    }

    console.log(`🗑️ Deleting rule matching "${pathText}"`);
    // Find the trash/delete button in this row by title or class
    const deleteBtn = row.locator('button[title="Delete rule"], button:has(i.bi-trash-fill), button:has(i.bi-trash)').first();
    await deleteBtn.click();

    // Wait for the row to disappear (hidden) since dialog is auto-accepted
    await row.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      console.log('⚠️ Rule row did not disappear within 5 seconds');
    });
    await this.page.waitForTimeout(500);
    console.log(`🗑️ Rule "${pathText}" deleted`);
  }
}

module.exports = { BeeceptorPage };
