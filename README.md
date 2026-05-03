# Deutsch-Übungen Klasse 6

Interaktive HTML-Übungen für den Deutschunterricht der 6. Klasse.

## Übungen

| Datei | Thema |
|-------|-------|
| `kommasetzung.html` | Kommasetzung |
| `adverbien.html` | Adverbien (Temporal/Modal/Lokal/Kausal) |
| `redezeichen.html` | Wörtliche Rede |

## Benutzung

Doppelklick auf die jeweilige `.html`-Datei – sie öffnet sich im Standardbrowser. Es wird kein Server, keine Installation und (außer für die Schriftarten von Google Fonts) keine Internetverbindung benötigt.

## Entwicklung

- **`CLAUDE.md`** – verbindliche Konventionen für neue Übungen (CSS-Tokens, Architektur, pädagogische Regeln). Pflichtlektüre vor jeder Erweiterung.
- **`_template.html`** – Starter-Vorlage. Kopieren, umbenennen, eigene Templates eintragen.
- **`tests/smoke.js`** – Sanity-Check für alle Übungen. Aufruf: `node tests/smoke.js`.

## Eine neue Übung hinzufügen

```bash
cp _template.html neue-uebung.html
# ... bearbeiten ...
node tests/smoke.js neue-uebung.html
```

Beim Erstellen mit Claude Code: **CLAUDE.md zuerst lesen lassen.** Dort steht alles über Stilkonventionen, das `ctx`-Pattern für kontextabhängige Wortpools, die Mix-Strategie und typische Fallstricke (deutsche Anführungszeichen in JS-Strings, Pronomen-Mismatch, Tempus-Konflikte).
