import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('❌ Could not find <script> block in public/index.html');
  process.exit(1);
}

function makeMockCtx() {
  const ops = [];
  const stateStack = [];
  const ctx = {
    fillStyle: '#000000',
    strokeStyle: '#000000',
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    lineWidth: 1,
    shadowColor: '#000000',
    shadowBlur: 0,
    globalAlpha: 1,
    __ops: ops,
    save() {
      stateStack.push({
        fillStyle: this.fillStyle,
        strokeStyle: this.strokeStyle,
        font: this.font,
        textAlign: this.textAlign,
        textBaseline: this.textBaseline,
        lineWidth: this.lineWidth,
        globalAlpha: this.globalAlpha
      });
    },
    restore() {
      const s = stateStack.pop();
      if (s) Object.assign(this, s);
    },
    translate() {},
    setTransform() {},
    scale() {},
    rotate() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc(x, y, r) {
      ops.push({ type: 'arc', x, y, r, fillStyle: this.fillStyle, strokeStyle: this.strokeStyle });
    },
    ellipse() {},
     quadraticCurveTo() {},
    fill() {
      ops.push({ type: 'fill', fillStyle: this.fillStyle });
    },
    stroke() {
      ops.push({ type: 'stroke', strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
    },
    fillRect(x, y, w, h) {
      ops.push({ type: 'fillRect', x, y, w, h, fillStyle: this.fillStyle });
    },
    strokeRect(x, y, w, h) {
      ops.push({ type: 'strokeRect', x, y, w, h, strokeStyle: this.strokeStyle });
    },
    fillText(text, x, y) {
      ops.push({
        type: 'fillText',
        text: String(text),
        x,
        y,
        fillStyle: this.fillStyle,
        font: this.font
      });
    },
    drawImage(img, x, y, w, h) {
      ops.push({ type: 'drawImage', x, y, w, h });
    },
    setLineDash() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    createRadialGradient() {
      return { addColorStop() {} };
    }
  };
  return ctx;
}

const mockCtx = makeMockCtx();

function makeElement() {
  const classes = new Set(['hidden']);
  return {
    style: {},
    dataset: {},
    textContent: '',
    innerHTML: '',
    value: '',
    width: 1024,
    height: 768,
    paused: true,
    currentTime: 0,
    classList: {
      add: (...c) => c.forEach(x => classes.add(x)),
      remove: (...c) => c.forEach(x => classes.delete(x)),
      toggle: (c) => classes.has(c) ? classes.delete(c) : classes.add(c),
      contains: (c) => classes.has(c)
    },
    addEventListener() {},
    appendChild() {},
    prepend() {},
    removeChild() {},
    children: [],
    focus() {},
    play() { return Promise.resolve(); },
    pause() {},
    load() {},
    getContext() { return mockCtx; },
    parentElement: {
      getBoundingClientRect() { return { width: 1024, height: 768, left: 0, top: 0 }; }
    },
    getBoundingClientRect() { return { width: 1024, height: 768, left: 0, top: 0 }; }
  };
}

const elements = new Map();
const sandbox = {
  console,
  Math,
  Date,
  JSON,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Set,
  Map,
  Promise,
  parseInt,
  parseFloat,
  isNaN,
  setTimeout: () => 0,
  clearTimeout: () => {},
  requestAnimationFrame: () => 0,
  performance: { now: () => 1000 },
  localStorage: {
    _store: {},
    getItem(k) { return this._store[k] || null; },
    setItem(k, v) { this._store[k] = String(v); },
    removeItem(k) { delete this._store[k]; }
  },
  Image: class {
    constructor() { this.complete = true; this.src = ''; }
  },
  Audio: class {
    constructor() { this.loop = false; this.volume = 1; }
    play() { return Promise.resolve(); }
    pause() {}
  },
  window: null,
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, makeElement());
      return elements.get(id);
    },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    createElement() { return makeElement(); }
  }
};
sandbox.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener() {},
  AudioContext: null,
  webkitAudioContext: null
};

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox, { filename: 'public/index.html' });

const result = vm.runInContext('runMobilityUnitTests()', sandbox);
if (!result.passed) {
  console.error(`❌ Unit Test Suite FAILED (${result.failures.length} failure(s) out of ${result.assertions} assertions):`);
  for (const f of result.failures) {
    console.error(`   - ${f}`);
  }
  process.exit(1);
} else {
  console.log(`✅ All ${result.assertions} unit test assertions PASSED!`);
}
