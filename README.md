# Instamo Technical Assessment - Playwright Automation

Playwright automation for the Nationwide Intermediary Affordability Calculator.

## Setup

**Requirements:** Node.js v18+

**Install:**
npm install
npx playwright install chromium

## Run

node solution.js

Runs two scenarios back to back:
- Single applicant (£45,000 income, £200/month commitments, 25 year term)
- Joint applicants (£45,000 + £32,000 income, £350/month commitments, 25 year term)

Results are printed to stdout. Screenshots saved as result-Single-applicant.png and result-Joint-applicants.png.

## Files

- solution.js — Part A: core automation script
- bugfix.js — Part B: fixed test with bug comments
- ANSWERS.md — Part C: written answers

## Notes on the real site

- Cookie consent banner handled automatically before form interaction
- Radio buttons are visually hidden, labels must be clicked, not the inputs
- All 5 steps are rendered in the DOM simultaneously, selectors must target visible elements only
- The Next button uses class .Affordability-nextStep triggered via JavaScript
- Step 4 requires buildings insurance as a mandatory field (not in the original spec)
- Individual status dropdown on Step 2 uses a different ID per applicant

## What I would tackle next

- Parameterise income, term, and commitments as CLI arguments
- Add screenshot on failure using try/catch with page.screenshot()
- Refactor into a Page Object Model to separate form logic from test logic
- Add retry logic for network timeouts in CI environments
- Test edge cases: zero income, extreme loan term, missing required fields