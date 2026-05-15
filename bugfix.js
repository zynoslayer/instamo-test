const { test, expect } = require('@playwright/test');

test('affordability form submits correctly', async ({ page }) => {

  // Bug 1 — Missing await: page.goto() is async but await was missing
  // Without await, the script moves on before the page loads
  await page.goto('https://www.nationwide-intermediary.co.uk/calculators/affordability-calculator');

  await page.click('#accept-cookies');

  // Bug 2 — Wrong argument type: fill() requires a string, not a number
  // 45000 was passed as a number — changed to String(45000)
  await page.fill('[name="income"]', String(45000));

  await page.click('button[type="submit"]');

  // Bug 3 — textContent is a method, not a property — parentheses () were missing
  const result = await page.locator('.result-amount').textContent();

  // Bug 4 — No wait for the result element before reading it
  // The result may not be visible yet after clicking submit
  await page.waitForSelector('.result-amount', { state: 'visible' });

  expect(result).toContain('£');

});