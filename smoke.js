#!/usr/bin/env node
/**
 * Smoke-Test für alle Übungen im Projekt.
 *
 * Aufruf:  node tests/smoke.js [pfad-zur-html]
 * Ohne Argument: testet alle .html im Projektroot.
 *
 * Was er prüft:
 *   1. JS-Syntax ist gültig (parse-bar)
 *   2. generateExerciseSet() läuft ohne Fehler
 *   3. Pro Lauf werden 5 Sets a 10 Übungen generiert und stichprobenartig
 *      gerendert, damit du sie mit dem Auge prüfen kannst
 *   4. Optional: wenn ein adverbIndex/targetIndex-Feld da ist, wird gecheckt
 *      dass es auf das richtige Wort zeigt
 *
 * Hinzufügen einer neuen Übung: nichts. Funktioniert automatisch, wenn die
 * Übung der Architektur in CLAUDE.md folgt (insbesondere die Trennlinie
 * `// ============= State =============` zwischen Generator und State-Code).
 */

const fs = require('fs');
const path = require('path');

const SEPARATOR = '// ============= State =============';
const RUNS = 5;

function extractGenerator(html) {
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Kein <script>-Block gefunden');
  const js = m[1];
  if (!js.includes(SEPARATOR)) {
    throw new Error(
      `Trennzeichen "${SEPARATOR}" fehlt im JS — siehe CLAUDE.md, Abschnitt "Standard-Architektur".`
    );
  }
  return js.split(SEPARATOR)[0];
}

function loadExercise(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const head = extractGenerator(html);
  // Optional templates — not all exercises expose an array (some use buildExercise(variant))
  const wrapped =
    head +
    '\nreturn { generateExerciseSet, templates: typeof templates !== "undefined" ? templates : null };';
  const fn = new Function(wrapped);
  return fn();
}

function renderExercise(ex) {
  // Generic renderer — funktioniert für die meisten Übungen
  if (Array.isArray(ex.words)) {
    return ex.words
      .map((w, i) => {
        const marks = [];
        if (Array.isArray(ex.commas) && ex.commas.includes(i)) marks.push('AFTER:,');
        if (typeof ex.adverbIndex === 'number' && ex.adverbIndex === i) return `[${w}]`;
        if (typeof ex.targetIndex === 'number' && ex.targetIndex === i) return `[${w}]`;
        return marks.length ? `${w}${marks.join('')}` : w;
      })
      .join(' ');
  }
  if (Array.isArray(ex.parts)) {
    // Redezeichen-Stil
    return ex.parts
      .map(p => {
        if (p.type === 'text') return p.value;
        const SYM = { qo: '„', qc: '"', co: ':', km: ',' };
        return `[${SYM[p.solution] || p.solution}]`;
      })
      .join('');
  }
  return JSON.stringify(ex);
}

function checkConsistency(ex) {
  const errors = [];
  if (Array.isArray(ex.words) && typeof ex.adverbIndex === 'number') {
    const w = ex.words[ex.adverbIndex];
    if (!w) errors.push(`adverbIndex ${ex.adverbIndex} zeigt auf undefined`);
    else if (ex.adverb) {
      const stripped = w.replace(/[.,!?]/g, '');
      const advStripped = ex.adverb.replace(/[.,!?]/g, '');
      if (stripped.toLowerCase() !== advStripped.toLowerCase()) {
        errors.push(`adverbIndex zeigt auf "${w}", aber adverb ist "${ex.adverb}"`);
      }
    }
  }
  if (Array.isArray(ex.commas)) {
    ex.commas.forEach(c => {
      if (c < 0 || c >= ex.words.length - 1) {
        errors.push(`commaIndex ${c} ist außerhalb gültiger Lückenpositionen`);
      }
    });
  }
  return errors;
}

function testFile(filePath) {
  const name = path.basename(filePath);
  console.log(`\n${'━'.repeat(60)}\n  ${name}\n${'━'.repeat(60)}`);

  let exports;
  try {
    exports = loadExercise(filePath);
  } catch (e) {
    console.log(`  ❌ KAPUTT: ${e.message}`);
    return false;
  }

  const { generateExerciseSet, templates } = exports;
  if (typeof generateExerciseSet !== 'function') {
    console.log('  ❌ generateExerciseSet() fehlt');
    return false;
  }
  console.log(`  Templates: ${templates ? templates.length : '?'}`);

  let totalErrors = 0;
  for (let r = 1; r <= RUNS; r++) {
    let set;
    try {
      set = generateExerciseSet();
    } catch (e) {
      console.log(`  ❌ Run ${r} crashed: ${e.message}`);
      totalErrors++;
      continue;
    }
    console.log(`\n  ── Run ${r} (${set.length} Aufgaben) ──`);
    set.forEach((ex, i) => {
      const errs = checkConsistency(ex);
      if (errs.length) {
        totalErrors += errs.length;
        console.log(`    ${i + 1}. ❌ ${errs.join('; ')}`);
        console.log(`        ${JSON.stringify(ex)}`);
      } else {
        console.log(`    ${i + 1}. ${renderExercise(ex)}`);
      }
    });
  }

  console.log(
    `\n  ${totalErrors === 0 ? '✓ Bestanden' : '❌ ' + totalErrors + ' Fehler'}`
  );
  return totalErrors === 0;
}

// Main
const args = process.argv.slice(2);
let files;
if (args.length) {
  files = args.map(a => path.resolve(a));
} else {
  const root = path.resolve(__dirname, '..');
  files = fs
    .readdirSync(root)
    .filter(f => f.endsWith('.html') && !f.startsWith('_'))
    .map(f => path.join(root, f));
}

if (!files.length) {
  console.log('Keine HTML-Dateien gefunden.');
  process.exit(0);
}

let allOk = true;
files.forEach(f => {
  if (!testFile(f)) allOk = false;
});

console.log(`\n${'═'.repeat(60)}`);
console.log(allOk ? '  ✓ Alle Tests bestanden' : '  ❌ Mindestens ein Test gescheitert');
process.exit(allOk ? 0 : 1);
