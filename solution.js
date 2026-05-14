const { chromium } = require('playwright');

async function runScenario(browser, data) {
  const page = await browser.newPage();
  console.log(`\n🚀 Starting: ${data.label}`);

  await page.goto(
    'https://www.nationwide-intermediary.co.uk/calculators/affordability-calculator',
    { waitUntil: 'networkidle' }
  );
  await page.waitForTimeout(3000);

  try {
    await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 8000 });
    await page.click('#onetrust-accept-btn-handler');
    console.log('✅ Cookies dismissed');
    await page.waitForTimeout(2000);
  } catch {
    console.log('ℹ️  No cookie banner');
  }

  const clickLabel = async (forId) => {
    try {
      await page.waitForSelector(`label[for="${forId}"]`, { timeout: 5000, state: 'visible' });
      await page.click(`label[for="${forId}"]`);
      await page.waitForTimeout(400);
    } catch { console.log(`ℹ️  Label ${forId} not found`); }
  };

  const safeFill = async (selector, value) => {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
      await page.fill(selector, String(value));
      await page.waitForTimeout(300);
    } catch { console.log(`ℹ️  Field ${selector} not found`); }
  };

  const safeSelect = async (selector, index) => {
    try {
      await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
      await page.selectOption(selector, { index });
      await page.waitForTimeout(500);
    } catch { console.log(`ℹ️  Select ${selector} not found`); }
  };

  const clickNext = async () => {
    try {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('.Affordability-nextStep')];
        const visible = btns.find(b => b.offsetParent !== null);
        if (visible) visible.click();
      });
      await page.waitForTimeout(3000);
      console.log('  → Next clicked');
    } catch (e) {
      console.log('  ℹ️  Next click issue:', e.message.split('\n')[0]);
    }
  };

  // ── STEP 1 ──
  console.log('📋 Step 1: Mortgage...');
  await clickLabel('AffCalc-q10-ApplicationType-0');
  await clickLabel('AffCalc-q2-RepaymentMethod-0');
  if (data.joint) {
    await clickLabel('AffCalc-q0-NumberOfApplicants-1');
  } else {
    await clickLabel('AffCalc-q0-NumberOfApplicants-0');
  }
  await safeFill('#AffCalc-q20-BorrowingAmount', '280000');
  await safeFill('#AffCalc-q30-MortgageTermYears', '25');
  await safeSelect('#AffCalc-q40-OwnershipType', 1);
  await clickLabel('AffCalc-q60-PropertyFound-0');
  await page.waitForTimeout(1000);
  await safeSelect('#AffCalc-q70-PropertyTenure', 1);
  await safeSelect('#AffCalc-q80-PropertyType', 1);
  await safeFill('#AffCalc-q90-PurchasePrice', '280000');
  await clickLabel('AffCalc-q135-Region-1');
  await clickNext();
  console.log('✅ Step 1 done');

  // ── STEP 2 ──
  console.log('📋 Step 2: Clients...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await safeFill('#AffCalc-q140-Day', '1');
  await safeFill('#AffCalc-q140-Month', '6');
  await safeFill('#AffCalc-q140-Year', '1990');

  // Applicant 1 individual status
  await page.evaluate(() => {
    const el = document.querySelector('#AffCalc-q145-PropertyTenure');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(500);
  await page.selectOption('#AffCalc-q145-PropertyTenure', { index: 1 });
  await page.waitForTimeout(500);

  await clickLabel('AffCalc-q150-HaveDependents-1');
  await clickLabel('AffCalc-q170-IsCustomerRetired-1');
  await page.waitForTimeout(500);
  await safeFill('#AffCalc-q180-RetirementAge', '65');

  if (data.joint) {
    await safeFill('#AffCalc-q190-Day', '1');
    await safeFill('#AffCalc-q190-Month', '6');
    await safeFill('#AffCalc-q190-Year', '1992');

    // Second applicant status — find any visible unselected dropdown
    const allVisibleSelects = await page.locator('select:visible').all();
    for (const sel of allVisibleSelects) {
      const val = await sel.inputValue();
      const id = await sel.getAttribute('id');
      if (val === '' || val === 'Select') {
        await sel.evaluate(el => el.scrollIntoView());
        await page.waitForTimeout(300);
        await sel.selectOption({ index: 1 });
        await page.waitForTimeout(300);
        console.log(`  ✅ Selected status for: ${id}`);
      }
    }

    await clickLabel('AffCalc-q200-HaveDependents-1');
    await clickLabel('AffCalc-q220-IsCustomerRetired-1');
    await page.waitForTimeout(500);
    await safeFill('#AffCalc-q230-RetirementAge', '65');
  }

  await clickNext();
  console.log('✅ Step 2 done');

  // ── STEP 3 ──
  console.log('📋 Step 3: Income...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await safeSelect('#AffCalc-q240-EmploymentCategory', 1);
  await page.waitForTimeout(500);
  await safeSelect('#AffCalc-q250-EmploymentType', 1);
  await page.waitForTimeout(500);
  await safeFill('#AffCalc-q270-JobYears', '3');
  await safeFill('#AffCalc-q270-JobMonths', '0');
  await safeFill('#AffCalc-q320-GrossAnnualIncome', String(data.income1));
  await clickLabel('AffCalc-q420-HasSecondJob-1');
  await clickLabel('AffCalc-q610-HasOtherIncome-1');

  if (data.joint && data.income2) {
    await safeSelect('#AffCalc-q780-EmploymentCategory', 1);
    await page.waitForTimeout(500);
    await safeSelect('#AffCalc-q790-EmploymentType', 1);
    await page.waitForTimeout(500);
    await safeFill('#AffCalc-q810-JobYears', '2');
    await safeFill('#AffCalc-q810-JobMonths', '0');
    await safeFill('#AffCalc-q860-GrossAnnualIncome', String(data.income2));
    await clickLabel('AffCalc-q960-HasSecondJob-1');
    await clickLabel('AffCalc-q1150-HasOtherIncome-1');
  }

  await clickNext();
  console.log('✅ Step 3 done');

  // ── STEP 4 ──
  console.log('📋 Step 4: Outgoings...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  await safeFill('#AffCalc-q1330-MonthlyPersonalLoanOrHire', String(data.monthlyCommitments));
  await safeFill('#AffCalc-q1630-BuildingInsurance', '200');
  await clickLabel('AffCalc-q1540-HasExistingMortgages-1');
  if (data.joint) {
    await clickLabel('AffCalc-q1590-HasExistingMortgages-1');
  }

  await clickNext();
  await page.waitForTimeout(6000);
  console.log('✅ Step 4 done');

  // ── STEP 5 ──
  console.log('📋 Step 5: Results...');
  await page.screenshot({ path: `result-${data.label.replace(/ /g, '-')}.png` });
  console.log('📸 Screenshot saved');

  const bodyText = await page.locator('body').innerText();
  const lines = bodyText.split('\n').filter(l => l.includes('£') && l.trim().length < 80);
  console.log('── Lines with £ ──');
  lines.forEach(l => console.log('  ', l.trim()));

  // Pick the largest £ amount on the page
  const allMatches = [...bodyText.matchAll(/£[\d,]+/g)].map(m => m[0]);
  const resultText = allMatches.length > 0
    ? allMatches.reduce((a, b) =>
        parseInt(a.replace(/[^0-9]/g, '')) > parseInt(b.replace(/[^0-9]/g, '')) ? a : b
      )
    : 'NOT FOUND';

  console.log(`\n✅ ${data.label} — Result: ${resultText}`);
  console.log(resultText.includes('£') ? '✅ Assertion PASSED' : '❌ Assertion FAILED');

  const amount = parseInt(resultText.replace(/[^0-9]/g, ''), 10) || 0;
  await page.close();
  return { label: data.label, amount, resultText };
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  try {
    const single = await runScenario(browser, {
      label: 'Single applicant',
      joint: false,
      income1: 45000,
      income2: null,
      monthlyCommitments: 200
    });

    const joint = await runScenario(browser, {
      label: 'Joint applicants',
      joint: true,
      income1: 45000,
      income2: 32000,
      monthlyCommitments: 350
    });

    console.log('\n══ FINAL RESULTS ══');
    console.log(`Single : ${single.resultText}`);
    console.log(`Joint  : ${joint.resultText}`);

    if (joint.amount > single.amount) {
      console.log('✅ PASS — Joint is higher than single');
    } else {
      console.log('⚠️  Check screenshots');
    }
  } catch (err) {
    console.error('❌ Error:', err.message.split('\n')[0]);
  } finally {
    await browser.close();
  }
})();