#!/usr/bin/env node

/**
 * Airtime Design System — Component Manifest Validator
 *
 * Parses component CSS files to extract class names, then cross-references
 * them against components-manifest.json to catch drift.
 *
 * Usage:
 *   node scripts/generate-manifest.js          # Validate only (dry run)
 *   node scripts/generate-manifest.js --fix    # Write updated manifest + snapshot
 *
 * Before writing, always saves a timestamped snapshot to generated/manifest-snapshots/.
 * Exits non-zero if any degradation is detected (classes removed from manifest).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'components-manifest.json');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const SNAPSHOTS_DIR = path.join(ROOT, 'generated', 'manifest-snapshots');

const FIX_MODE = process.argv.includes('--fix');

// ─── CSS class extraction ────────────────────────────────────────────────────

function extractClassesFromCSS(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  // Strip block comments (/* ... */) before extracting
  src = src.replace(/\/\*[\s\S]*?\*\//g, '');
  // Strip string literals (URLs, content values)
  src = src.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
  // Strip url() values
  src = src.replace(/url\([^)]*\)/g, 'url()');

  const classes = new Set();
  // Only match class selectors in actual CSS selector context:
  // preceded by start-of-line, space, comma, selector combinators, or another class/id/element end
  const classRe = /(?:^|[\s,~+>[\])]|(?<=[a-zA-Z0-9_-]))\.([a-zA-Z][a-zA-Z0-9_-]*)/gm;
  let m;
  while ((m = classRe.exec(src)) !== null) {
    classes.add(m[1]);
  }
  return [...classes].sort();
}

function buildCSSClassMap() {
  const files = fs.readdirSync(COMPONENTS_DIR)
    .filter(f => f.endsWith('.css') && !f.endsWith('.barrel.css'))
    .sort();

  const map = {};
  for (const file of files) {
    const filePath = path.join(COMPONENTS_DIR, file);
    // Skip barrel files (controls.css, education.css, others.css)
    const src = fs.readFileSync(filePath, 'utf8');
    if (src.trim().startsWith('/**') && src.includes('@import')) {
      const hasOnlyImports = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
        .split('\n')
        .every(l => l.trim() === '' || l.trim().startsWith('@import'));
      if (hasOnlyImports) continue;
    }
    const relPath = `components/${file}`;
    map[relPath] = new Set(extractClassesFromCSS(filePath));
  }
  return map;
}

// ─── Manifest helpers ────────────────────────────────────────────────────────

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('ERROR: components-manifest.json not found.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function manifestClasses(entry) {
  const classes = new Set();
  const add = (val) => {
    if (!val) return;
    const name = val.startsWith('.') ? val.slice(1) : val;
    if (name) classes.add(name);
  };
  if (entry.base) add(entry.base);
  for (const v of entry.variants || []) add(v);
  for (const m of entry.modifiers || []) add(m);
  for (const p of entry.patterns || []) add(p);
  for (const key of Object.keys(entry.parts || {})) add(key);
  for (const cls of (Array.isArray(entry.cssClasses) ? entry.cssClasses : Object.keys(entry.cssClasses || {}))) add(cls);
  return classes;
}

// ─── Snapshot ────────────────────────────────────────────────────────────────

function saveSnapshot(manifest) {
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const snapPath = path.join(SNAPSHOTS_DIR, `manifest-${ts}.json`);
  fs.writeFileSync(snapPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`  Snapshot saved → generated/manifest-snapshots/manifest-${ts}.json`);
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validate(manifest, cssMap) {
  const components = manifest.components || {};
  const issues = [];

  for (const [componentName, entry] of Object.entries(components)) {
    const file = entry.file;
    if (!file) {
      issues.push({ type: 'missing-file', component: componentName, msg: `No "file" field` });
      continue;
    }
    const cssClasses = cssMap[file];
    if (!cssClasses) {
      issues.push({ type: 'file-not-found', component: componentName, msg: `CSS file not found: ${file}` });
      continue;
    }
    const mfClasses = manifestClasses(entry);
    for (const cls of mfClasses) {
      if (!cssClasses.has(cls)) {
        issues.push({ type: 'degradation', component: componentName, msg: `".${cls}" in manifest but not in ${file}` });
      }
    }
    for (const cls of cssClasses) {
      if (!mfClasses.has(cls)) {
        issues.push({ type: 'undocumented', component: componentName, msg: `".${cls}" in ${file} but not in manifest` });
      }
    }
  }

  for (const filePath of Object.keys(cssMap)) {
    const hasEntry = Object.values(components).some(e => e.file === filePath);
    if (!hasEntry) {
      issues.push({ type: 'untracked-file', component: null, msg: `${filePath} has no manifest entry` });
    }
  }

  return issues;
}

// ─── Report ──────────────────────────────────────────────────────────────────

function report(issues) {
  const degradations = issues.filter(i => i.type === 'degradation' || i.type === 'file-not-found' || i.type === 'missing-file');
  const undocumented = issues.filter(i => i.type === 'undocumented');
  const untracked = issues.filter(i => i.type === 'untracked-file');

  if (degradations.length > 0) {
    console.error('\n  DEGRADATION — classes in manifest missing from CSS:');
    for (const i of degradations) console.error(`  ✗ [${i.component || '?'}] ${i.msg}`);
  }
  if (untracked.length > 0) {
    console.warn('\n  UNTRACKED CSS FILES (no manifest entry):');
    for (const i of untracked) console.warn(`  ⚠  ${i.msg}`);
  }
  if (undocumented.length > 0) {
    console.warn('\n  UNDOCUMENTED CLASSES (in CSS, not in manifest):');
    for (const i of undocumented) console.warn(`  ⚠  [${i.component}] ${i.msg}`);
  }
  if (degradations.length === 0 && undocumented.length === 0 && untracked.length === 0) {
    console.log('\n  ✓ Manifest is consistent with CSS. No issues found.');
  } else if (degradations.length === 0) {
    console.log('\n  ✓ No degradation detected. Warnings above are informational.');
  }
  return degradations.length > 0;
}

// ─── Update manifest cssClasses ───────────────────────────────────────────────

function updateManifest(manifest, cssMap) {
  for (const entry of Object.values(manifest.components || {})) {
    if (entry.file && cssMap[entry.file]) {
      entry.cssClasses = [...cssMap[entry.file]].sort();
    }
  }
  manifest._generated = new Date().toISOString().slice(0, 10);
  return manifest;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Airtime Design System — Manifest Validator');
  console.log(`Mode: ${FIX_MODE ? 'fix (will write)' : 'validate (dry run)'}\n`);

  const manifest = loadManifest();
  const cssMap = buildCSSClassMap();

  console.log(`  Components in manifest: ${Object.keys(manifest.components || {}).length}`);
  console.log(`  CSS files tracked: ${Object.keys(cssMap).length}`);

  const issues = validate(manifest, cssMap);
  const hasErrors = report(issues);

  if (FIX_MODE) {
    console.log('\n  Saving snapshot and updating manifest...');
    saveSnapshot(manifest);
    const updated = updateManifest(manifest, cssMap);
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2) + '\n', 'utf8');
    console.log('  ✓ components-manifest.json updated.');
  } else {
    console.log('\n  Run with --fix to save snapshot and update manifest.');
  }

  if (hasErrors) {
    console.error('\n  Exiting with error (degradation detected).');
    process.exit(1);
  }
}

main();
