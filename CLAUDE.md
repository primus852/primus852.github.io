# Deutsch-Übungen Klasse 6 — Projektkonventionen

Sammlung interaktiver HTML-Übungen für den Deutschunterricht. Jede Übung ist eine **einzelne, in sich abgeschlossene HTML-Datei** ohne Build-Schritt — Lehrkraft öffnet sie im Browser, fertig.

## Bestehende Übungen

- `kommasetzung.html` — Kommas an die richtige Stelle klicken
- `adverbien.html` — Adverb finden + Typ (Temporal/Modal/Lokal/Kausal) bestimmen
- `redezeichen.html` — Satzzeichen der wörtlichen Rede durch Klick-Rotation setzen

## Goldene Regeln für neue Übungen

1. **Eine Datei, kein Build.** Kein npm, kein Bundler, keine externen Skripte außer Google Fonts. Funktioniert per Doppelklick auf die Datei – auch offline (außer Fonts).
2. **Visueller Look bleibt einheitlich.** Übernimm das gemeinsame CSS-Token-System (siehe unten). Eine neue Übung darf eine eigene Akzentfarbe haben, aber Layout, Typografie, Buttons, Cards, Slide-Animationen bleiben gleich.
3. **Randomisierung ist Pflicht.** Jeder Seitenaufruf und jeder „Nochmal üben"-Klick erzeugt frische Sätze aus Templates. Schüler sollen Sätze nicht auswendig lernen können.
4. **Pädagogische Sorgfalt geht vor Quantität.** Lieber weniger Templates, dafür alle grammatisch sauber: kein Pronomen-Mismatch, keine Tempus-Fehler, keine semantisch unsinnigen Adverb-Verb-Kombis. Lieber Templates kontextabhängig einschränken (per `ctx`-Pattern, siehe `adverbien.html`).
5. **Sofortiges, lehrreiches Feedback.** Bei Fehlern zeigt die Übung die richtige Lösung und erklärt die Regel. Nie nur „falsch".
6. **Schüler dürfen Fehler machen.** Schritt 1 (z. B. „Wort anklicken") darf wiederholbar sein, ohne Punktverlust einzufrieren. Erst „Prüfen" / Schritt 2 ist endgültig.
7. **Sticky Header, scrollbare Slides.** `html, body { min-height: 100% }` – nie `overflow: hidden` aufs Body.
8. **Keine Speicherung.** Kein `localStorage`, kein Backend. Punktestand lebt im RAM. Beim Schließen ist alles weg – das ist gewollt.

## Standard-Architektur einer Übung

```
<header>      ← sticky, mit Logo, Titel, Punkten, Fortschrittsbalken
<main>
  <section data-slide="welcome">    ← Erklärung der Regeln + „Übung starten"
  <section data-slide="ex-N">       ← dynamisch generiert pro Aufgabe
  <section data-slide="result">     ← Statistik + Badge + „Nochmal üben"
</main>
<script>
  // 1. Datenpools (NAMES, ADVERBS, …)
  // 2. Helpers: pick, shuffle, capitalize, …
  // 3. Templates: () => ({words:[…], …}) — eine Funktion pro Satzmuster
  // 4. generateExerciseSet() — Mix-Regel (z.B. 3 Temporal, 3 Modal, 2 Lokal, 2 Kausal)
  // 5. State: currentIndex, score, correctCount, stage
  // 6. buildSlides() — baut alle Übungs-Slides aus exercises[]
  // 7. Logik: showSlide, checkAnswer/pickType, goNext, showResult, restart
  // 8. launchConfetti()
</script>
```

`buildSlides()` muss als **Funktion** existieren, damit `restart()` sie nach `exercises = generateExerciseSet()` neu aufrufen kann. Niemals Slides nur einmalig im Top-Level bauen.

## Gemeinsame Stil-Tokens (verbindlich)

```css
:root {
  --bg: #fef6e4;        /* Hintergrund warm beige */
  --bg-2: #f3d2c1;      /* sekundärer Akzent */
  --ink: #001858;       /* Tinte / Border / Text */
  --ink-soft: #172c66;  /* sekundärer Text */
  --paper: #fffaf0;     /* Slide-Hintergrund */
  --accent: #f582ae;    /* primärer Akzent (rosa) */
  --accent-2: #8bd3dd;  /* sekundärer Akzent (mint) */
  --good: #2e7d4f;      /* richtig */
  --good-bg: #d4f1d6;
  --bad: #b3261e;       /* falsch */
  --bad-bg: #fbd6d3;
  --shadow: 6px 6px 0 var(--ink);       /* Hauptkarten */
  --shadow-soft: 4px 4px 0 var(--ink);  /* Buttons, kleine Karten */
}
```

**Fonts:** `Fraunces` (Display, 900 für Headlines, italic für Akzent-em), `Inter` (UI-Text, 400–700).
**Borders:** durchgängig 2–3px, `var(--ink)`, harte Ecken-Radien (12–24px).
**Schatten:** Hard-Shadow Stil ohne Blur (`6px 6px 0 ink`). Niemals `box-shadow: 0 2px 8px rgba(...)`.
**Animation:** Slide-Einstieg mit `cubic-bezier(0.34, 1.56, 0.64, 1)` (leichter Bounce), 0.55s. Buttons translaten beim Hover um -2/-2px.

Eine neue Übung darf **eine** zusätzliche themenspezifische Farbe definieren (z. B. `--quote-color`), aber niemals die obigen Tokens überschreiben.

## Komponenten-Vokabular

Diese Klassennamen sind projektweit konsistent — neue Übungen verwenden sie wieder:

- `.slide` / `.slide.active` — Hauptkarte, eine pro Schritt
- `.tag` — kleines Pill-Label oben links auf der Karte
- `.pill` — kleines Info-Pill in der Question-Meta-Zeile
- `.btn` / `.btn.secondary` / `.btn.success-btn` — Hauptaktionen
- `.hint-btn` + `.hint-text.show` — ausklappbarer Tipp
- `.feedback.success` / `.feedback.error` / `.feedback.info` — Feedback-Box nach Antwort
- `.sentence-area` — gestrichelter Rahmen, Fraunces 26px, line-height 2, das Aufgaben-„Brett"
- `.question-meta` — Zeile mit Tags oben in der Aufgabe (Satz N/M, Regelname …)
- `.stat-card`, `.badge`, `.result-grid` — Ergebnis-Slide
- `.confetti-piece` — Erfolgsanimation

**Klick-Element pro Übung** ist meist eine eigene Klasse (`.gap`, `.word`, `.slot`), weil das Verhalten unterschiedlich ist – aber Größe, Border, Hover-Pop bleiben im selben Vokabular.

## Pädagogisches Muster: Templates mit Kontext-Constraints

Wenn eine Übung Adverbien, Adjektive o. Ä. mit Verben kombiniert, **nicht** beliebig mischen — sondern pro Variation einen passenden Adverb-Pool definieren:

```js
const ctx = pick([
  { sentence: (a) => ["Der", "Hund", "bellt", a, "in", "der", "Nacht."],
    adverbs: ["laut", "leise", "kaum"] },          // nur passende!
  { sentence: (a) => [subj, "lernt", a, "für", "die", "Klassenarbeit."],
    adverbs: ["fleißig", "gerne", "kaum"] },
]);
const adv = pick(ctx.adverbs);
```

Verhindert Sätze wie „Der Hund bellt schnell in der Nacht."

**Pronomen** in Begründungssätzen entweder weglassen oder das Subjekt wiederholen (`Tim ist krank, deshalb nimmt Tim Medizin.`) — niemals `er/sie` raten, weil Namen geschlechts-mehrdeutig sind.

**Capitalization-Helper** verwenden, falls Wörter an Satzanfang rotieren können (siehe `capitalize()` in `adverbien.html`).

## Mix-Strategie für Sets

In `generateExerciseSet()`: **explizite Verteilung** über `targetMix.shuffle()`, nicht reines Random. Beispiel:

```js
const targetMix = [
  ...Array(3).fill('temporal'),
  ...Array(3).fill('modal'),
  ...Array(2).fill('lokal'),
  ...Array(2).fill('kausal')
];
```

Garantiert, dass jeder Schüler in einem Set alle Regeltypen sieht.

## Total Questions

Standard: **10** (`TOTAL_QUESTIONS = 10`). Genug für 10–15 Min Übung, kurz genug für Aufmerksamkeitsspanne der 6. Klasse. Wenn das geändert wird, Welcome-Text & Result-Counter mitziehen.

## Sprachliche Konventionen

- Schüler-Anrede per **du**, nicht **Sie**.
- Lockerer, freundlicher Ton: „Super!", „Fast!", „Schau noch mal genau hin."
- Deutsche typografische Anführungszeichen: **„unten"** und **"oben"** (U+201E / U+201C). Niemals `"..."` für deutsche Zitate. Achtung in JS-Strings: `"„word""` ist ein Syntaxfehler – die zweite Anführung ist ASCII-`"` und schließt den String. Stattdessen `"„word""` mit U+201C verwenden.
- Emojis sparsam: ein Icon pro Card oder Pill ist OK, ganze Sätze voll mit Emoji nicht.
- Geschlechtergerechtigkeit: Mix aus männlichen/weiblichen Namen im NAMES-Pool. Berufsbezeichnungen abwechselnd („Lehrer" vs. „Lehrerin").

## Testen vor dem Ausliefern

Vor jedem Commit: ein Smoke-Test in Node, der die Templates 3–6× durchspielt und prüft:

```js
// Generiert N Sätze, rendert sie als Plaintext, prüft auf Index-Konsistenz
// (z. B. dass adverbIndex tatsächlich auf das Adverb zeigt)
```

Beispiel-Skripte stehen am Ende dieser Datei (siehe `## Smoke-Test-Beispiel`).

## Smoke-Test-Beispiel

```bash
node << 'EOF'
const fs = require('fs');
const html = fs.readFileSync('./meine_übung.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const js = m[1].split('// ============= State =============')[0];
const fn = new Function(js + '\nreturn { generateExerciseSet, templates };');
const { generateExerciseSet } = fn();

for (let r = 0; r < 5; r++) {
  console.log(`══ RUN ${r+1} ══`);
  generateExerciseSet().forEach((ex, i) => {
    // …rendere und prüfe Konsistenz
    console.log(`${i+1}.`, ex);
  });
}
EOF
```

Trick: alles vor `// ============= State =============` extrahieren, damit Top-Level-DOM-Code nicht in Node ausgeführt wird.

## Vorschläge für Erweiterungen

Mögliche nächste Übungen, die ins Set passen:

- **Wortarten bestimmen** — Substantiv/Verb/Adjektiv/Pronomen/Artikel im Satz markieren
- **Zeitformen** — Präsens/Präteritum/Perfekt/Plusquamperfekt/Futur erkennen oder umformen
- **Subjekt & Prädikat** — Satzglieder per Klick markieren
- **Aktiv/Passiv** — Sätze umformen oder zuordnen
- **Groß-/Kleinschreibung** — Wörter im Satz korrigieren (Klick toggelt)
- **Synonyme/Antonyme** — Drag oder Klick-Pairing
- **Direkte → indirekte Rede** — Umformungsübung mit Konjunktiv I

Jede neue Übung folgt der Architektur oben und referenziert dieses Dokument als Single Source of Truth für Stil und Verhalten.
