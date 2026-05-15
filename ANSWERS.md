# Part C Written Answers

## Question C1 - Front End vs Back End

The **front** end is everything that runs in the user's browser the HTML, CSS, and JavaScript that renders the interface and responds to interactions. The **back end** is the server-side logic, databases, business rules, and calculations that run on a server and send results back to the browser.

For the **Nationwide affordability calculator**:

**Front end**: The multi-step form itself, radio buttons, input fields, dropdowns, validation messages, and the progress bar (Step 1 of 5 etc.) all run in the browser. When you select "Buy a new property", JavaScript shows or hides additional fields instantly without contacting the server.

**Back end**: When you submit the final step, the form data is sent to Nationwide's server. The server runs the affordability calculation, applying lending rules, stress tests, income multipliers and returns the borrowing figure (e.g. £202,100). This logic lives server-side so it cannot be tampered with by the user.

**When you write a Playwright test, are you testing the front end, the back end, or both?**

Both — but primarily the integration between them. Playwright drives a real browser, so it tests the full user journey: front-end form rendering, JavaScript validation, and the HTTP requests sent to the back end. If the back end returns an unexpected result, the assertion catches it. This is called **end-to-end testing** — it validates the entire stack from the user's perspective, which is exactly what Instamo's FastSubmit product does when autofilling lender portals.

---

## Question C2 - Flaky Tests

The script passes 9 out of 10 times. The failure always shows a **timeout waiting for the result element**, but only in CI.

**Cause 1 Slower network in CI**

CI runners often have slower or throttled connections than a local machine. The server response takes longer, so the result element appears after the timeout threshold.

*Fix:* Increase the `waitForSelector` timeout for the results step, or add `page.waitForLoadState('networkidle')` after clicking the final Next button to ensure all network requests complete before asserting.

**Cause 2 - Headless mode differences**

Locally the test runs with `headless: false`. In CI it typically runs headless. Some sites behave differently in headless mode, animations may not fire, certain JavaScript events may not trigger, or the viewport differs which affects element visibility.

*Fix:* Set a consistent viewport with `page.setViewportSize()`. Test with `headless: true` locally to reproduce the CI environment before pushing.

**Cause 3 — Race condition between element appearing and content loading**

The result element may appear in the DOM (so `waitForSelector` passes) but its text content is still empty while the calculation runs asynchronously. Locally this resolves in milliseconds; CI latency exposes the gap.

*Fix:* Instead of waiting for the element to exist, wait for it to contain actual content: `page.waitForFunction(() => document.querySelector('.result-amount')?.textContent?.includes('£'))` this waits until the £ value is actually populated, not just until the element appears.