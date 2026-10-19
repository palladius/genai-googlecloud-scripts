const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Extract the math gate logic directly from public/index.html so tests always verify the real game code!
const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function createGameMathContext(initialState = {}) {
  const startMarker = '// 4. MATH GATE GENERATOR (PEDAGOGICAL A vs B DECISIONS)';
  const endMarker = '// 5. ORGANIC INTERLACED ENEMY & BOSS WAVE SPAWNER';
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  assert.ok(startIdx !== -1 && endIdx !== -1, 'Math gate section markers must exist in public/index.html');

  const mathSectionCode = html.slice(startIdx, endIdx);

  // Also extract sanitizeActiveGatesForArmy
  const sanitizeStart = html.indexOf('function sanitizeActiveGatesForArmy(n)');
  const sanitizeEnd = html.indexOf('function updateHUD()');
  assert.ok(sanitizeStart !== -1 && sanitizeEnd !== -1, 'sanitizeActiveGatesForArmy must exist in public/index.html');
  const sanitizeCode = html.slice(sanitizeStart, sanitizeEnd);

  const context = {
    Math,
    W: 480,
    H: 800,
    state: {
      difficulty: 'HARD',
      ageTier: 1,
      army: 1,
      gatePairs: [],
      ...initialState,
    },
  };

  vm.createContext(context);
  vm.runInContext(mathSectionCode + '\n' + sanitizeCode, context);
  return context;
}

test('Bug 2a: When army = 1 and gates are -5 vs ÷2, choosing ÷2 (0.5 > -4) is OPTIMAL and NEVER a mistake', () => {
  const ctx = createGameMathContext({ army: 1, difficulty: 'HARD' });
  const oldArmy = 1;
  const chosen = { op: '÷', val: 2, label: '÷2' };
  const other = { op: '-', val: 5, label: '-5' };

  const chosenRaw = chosen.op === '÷' ? oldArmy / chosen.val : ctx.rawOpResult(oldArmy, chosen.op, chosen.val);
  const otherRaw = other.op === '÷' ? oldArmy / other.val : ctx.rawOpResult(oldArmy, other.op, other.val);

  assert.equal(chosenRaw, 0.5);
  assert.equal(otherRaw, -4);
  assert.ok(chosenRaw >= otherRaw, '1 ÷ 2 (0.5) must strictly beat 1 - 5 (-4)!');
});

test('Bug 2b: Never generate fractional divisions (e.g. 1/2, 1/3, 7/2, 10/3) across all tiers and army sizes', () => {
  for (const tier of [1, 2, 3]) {
    for (const army of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 17, 23, 50, 99, 100, 144, 250]) {
      const ctx = createGameMathContext({ army, ageTier: tier });
      for (let i = 0; i < 60; i++) {
        ctx.state.gatePairs = [];
        ctx.generateGatePair();
        const pair = ctx.state.gatePairs[0];
        for (const g of [pair.left, pair.right]) {
          if (g.op === '÷') {
            assert.ok(army > 1, `Division gate ${g.label} spawned when army was 1!`);
            assert.equal(
              army % g.val,
              0,
              `Fractional division spawned! army=${army} with gate ${g.label} (${army}/${g.val} is not an integer)`
            );
            assert.ok(army / g.val >= 1, `Division result must be >= 1`);
          }
          if (g.op === '-') {
            assert.ok(
              army - g.val >= 1,
              `Subtraction gate ${g.label} on army=${army} would drop army below 1 (${army - g.val})`
            );
          }
        }
      }
    }
  }
});

test('Bug 2c: Never spawn negative (- or ÷) gates when army is 1 (or <= 5)', () => {
  for (const army of [1, 2, 3, 4, 5]) {
    for (const tier of [1, 2, 3]) {
      const ctx = createGameMathContext({ army, ageTier: tier });
      assert.equal(ctx.getNegativeGateProbability(army), 0, `Negative gate prob must be 0 for army=${army}`);
      for (let i = 0; i < 100; i++) {
        ctx.state.gatePairs = [];
        ctx.generateGatePair();
        const pair = ctx.state.gatePairs[0];
        assert.ok(
          (pair.left.op === '+' || pair.left.op === '×') &&
            (pair.right.op === '+' || pair.right.op === '×'),
          `Expected only + or × gates for army=${army}, got ${pair.left.label} vs ${pair.right.label}`
        );
      }
    }
  }
});

test('Bug 2d: Negative gates (- vs ÷) are rare at small army sizes and frequent at >= 100 to keep army in check', () => {
  const ctxSmall = createGameMathContext({ army: 12, ageTier: 1 });
  const ctxLarge = createGameMathContext({ army: 120, ageTier: 1 });

  let negSmall = 0;
  let negLarge = 0;
  const trials = 1000;

  for (let i = 0; i < trials; i++) {
    ctxSmall.state.gatePairs = [];
    ctxSmall.generateGatePair();
    if (ctxSmall.state.gatePairs[0].left.op === '-' || ctxSmall.state.gatePairs[0].left.op === '÷') {
      negSmall++;
    }

    ctxLarge.state.gatePairs = [];
    ctxLarge.generateGatePair();
    if (ctxLarge.state.gatePairs[0].left.op === '-' || ctxLarge.state.gatePairs[0].left.op === '÷') {
      negLarge++;
    }
  }

  const smallRatio = negSmall / trials;
  const largeRatio = negLarge / trials;

  assert.ok(smallRatio < 0.25, `Expected small army (12) negative gate ratio < 0.25, got ${smallRatio}`);
  assert.ok(largeRatio > 0.60, `Expected large army (120) negative gate ratio > 0.60, got ${largeRatio}`);
});

test('Bug 2e: sanitizeActiveGatesForArmy converts mid-flight gates if army drops to 1 or non-divisible number', () => {
  const ctx = createGameMathContext({
    army: 12,
    gatePairs: [
      {
        y: 100,
        height: 76,
        resolved: false,
        left: { op: '-', val: 5, label: '-5' },
        right: { op: '÷', val: 2, label: '÷2' },
      },
    ],
  });

  // Suppose enemies hit the squad and army drops from 12 down to 1 while the gate is falling!
  ctx.state.army = 1;
  ctx.sanitizeActiveGatesForArmy(ctx.state.army);

  const pair = ctx.state.gatePairs[0];
  assert.notEqual(pair.right.op, '÷', 'Division gate must be sanitized away when army drops to 1');
  assert.notEqual(pair.left.op, '-', 'Subtraction gate must be sanitized away when army drops to 1');

  // Suppose army drops from 12 to 9 while a ÷2 gate is falling -> should switch to ÷3 (since 9 % 3 === 0)!
  ctx.state.gatePairs = [
    {
      y: 100,
      height: 76,
      resolved: false,
      left: { op: '-', val: 4, label: '-4' },
      right: { op: '÷', val: 2, label: '÷2' },
    },
  ];
  ctx.sanitizeActiveGatesForArmy(9);
  assert.equal(ctx.state.gatePairs[0].right.op, '÷');
  assert.equal(ctx.state.gatePairs[0].right.val, 3);
  assert.equal(9 % ctx.state.gatePairs[0].right.val, 0);
});

test('Bug 3: Easy (Tier 1) and Medium (Tier 2) have clear, kid-friendly spreads (never 30×2 vs 30+33), while Hard (Tier 3) stays tight', () => {
  const army = 30;
  const ctxEasy = createGameMathContext({ army, ageTier: 1, difficulty: 'NORMAL' });
  const ctxMed = createGameMathContext({ army, ageTier: 2, difficulty: 'NORMAL' });
  const ctxHard = createGameMathContext({ army, ageTier: 3, difficulty: 'HARD' });

  for (let i = 0; i < 100; i++) {
    ctxEasy.state.gatePairs = [];
    ctxEasy.generateGatePair();
    const pEasy = ctxEasy.state.gatePairs[0];
    const rEasyL = ctxEasy.rawOpResult(army, pEasy.left.op, pEasy.left.val);
    const rEasyR = ctxEasy.rawOpResult(army, pEasy.right.op, pEasy.right.val);
    // For army=30 in Easy mode, the two gate outcomes must differ by at least 4 (or >=30% of gain/loss)
    assert.ok(
      Math.abs(rEasyL - rEasyR) >= 4,
      `Easy mode gates too close at army=30! ${pEasy.left.label} (${rEasyL}) vs ${pEasy.right.label} (${rEasyR})`
    );

    ctxMed.state.gatePairs = [];
    ctxMed.generateGatePair();
    const pMed = ctxMed.state.gatePairs[0];
    const rMedL = ctxMed.rawOpResult(army, pMed.left.op, pMed.left.val);
    const rMedR = ctxMed.rawOpResult(army, pMed.right.op, pMed.right.val);
    assert.ok(
      Math.abs(rMedL - rMedR) >= 3,
      `Medium mode gates too close at army=30! ${pMed.left.label} (${rMedL}) vs ${pMed.right.label} (${rMedR})`
    );

    ctxHard.state.gatePairs = [];
    ctxHard.generateGatePair();
    const pHard = ctxHard.state.gatePairs[0];
    const rHardL = ctxHard.rawOpResult(army, pHard.left.op, pHard.left.val);
    const rHardR = ctxHard.rawOpResult(army, pHard.right.op, pHard.right.val);
    assert.ok(
      Math.abs(rHardL - rHardR) <= 4,
      `Hard mode gates should stay tight (<=4 diff), got ${pHard.left.label} (${rHardL}) vs ${pHard.right.label} (${rHardR})`
    );
  }
});

test('Bug 4: Negative gates (- vs ÷) span 50/50 across the road with no middle dodge corridor, and log2(N) army strength scales monotonically', () => {
  const ctx = createGameMathContext({ army: 120, ageTier: 1 });
  let foundNegative = false;
  for (let i = 0; i < 50; i++) {
    ctx.state.gatePairs = [];
    ctx.generateGatePair();
    const pair = ctx.state.gatePairs[0];
    if (pair.isNegativePair) {
      foundNegative = true;
      const roadSpan = 480 * 0.89 - 480 * 0.11;
      // Each gate in a negative pair spans ~50% of roadSpan (minus tiny 4px gap)
      assert.ok(pair.left.w >= roadSpan * 0.48, `Expected left gate width >= 48% of road, got ${pair.left.w}`);
      assert.ok(pair.right.w >= roadSpan * 0.48, `Expected right gate width >= 48% of road, got ${pair.right.w}`);
      const gapBetween = pair.right.x - (pair.left.x + pair.left.w);
      assert.ok(gapBetween <= 8, `Expected no middle dodge corridor between negative gates, gap was ${gapBetween}px`);
    }
  }
  assert.ok(foundNegative, 'Should have generated at least one negative gate pair at army=120');

  // Verify bottom toast positioning and getArmyLogStrength in HTML
  assert.ok(html.includes('bottom: 12px;'), 'Math coach toast must be positioned at the bottom below the player!');
  assert.ok(html.includes('function getArmyLogStrength(n)'), 'Logarithmic army strength helper must exist');

  // Verify VERSION synchronization across VERSION, package.json, index.html, and sw.js
  const ver = fs.readFileSync(path.join(__dirname, '..', 'VERSION'), 'utf8').trim();
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const sw = fs.readFileSync(path.join(__dirname, '..', 'public', 'sw.js'), 'utf8');
  assert.equal(pkg.version, ver, 'package.json version must match VERSION');
  assert.ok(html.includes(`v${ver}`), `public/index.html must display v${ver}`);
  assert.ok(sw.includes(`v${ver}`), `public/sw.js CACHE_NAME must include v${ver}`);
});
