## Plan: Full-Width Tailwind-Refactor

Du willst **Variante C**: echtes Full-Width-Layout auf Desktop und das Styling **sauber mit Tailwind**, mit **so wenig klassischem bzw. „inline-artigem“ CSS wie möglich**. Das ist sinnvoll — und der aktuelle Engpass ist ziemlich klar:

- `src/index.css` enthält noch typische **Vite-Starter-CSS-Regeln**, die das Root-Layout ungünstig beeinflussen
- `src/app.tsx` nutzt an mehreren Stellen bewusst schmale Container wie `max-w-6xl`
- es gibt zwar kaum echtes `style={...}`, aber einige **Arbitrary-Value-Tailwind-Klassen** wie `bg-[#09090b]`, die du vermutlich ebenfalls reduzieren möchtest

### Was ich konkret empfehle

**Steps**
1. `c:\GIT\gcodes\filename-builder\src\index.css` auf eine minimale Tailwind-Basis zurückbauen. Entfernt oder ersetzt werden sollten die generischen Vite-Regeln für `body`, `button`, `h1`, Links und das `prefers-color-scheme`, weil sie nicht zu einem Tailwind-first-Ansatz passen. Übrig bleiben nur globale Baselines wie Import, Font-Smoothing und Root-Größen.
2. Das Root-Layout für `html`, `body` und `#app` auf volle Breite/Höhe ausrichten, damit die App nicht mehr durch das bisherige zentrierende Flex-Layout „zusammengedrückt“ wirkt. *depends on 1*
3. In `c:\GIT\gcodes\filename-builder\src\app.tsx` die Full-Width-Struktur von Variante C herstellen: äußere Seite, Header, Main und Footer laufen über die volle Breite; nur innere Bereiche werden bei Bedarf begrenzt. *depends on 2*
4. Die mehrfachen `max-w-6xl mx-auto`-Wrapper gezielt umbauen:
   - äußere Sektionen full width
   - innere Inhalts-Wrapper optional begrenzt
   - Hauptlayout großzügiger für Desktop, ohne unleserlich breit zu werden
5. Wiederkehrende visuelle Werte aus `src/app.tsx` systematisieren. Statt viele Hex-/Opacity-Werte direkt in Klassen zu streuen, sollten Farben und wiederkehrende Muster in Tailwind-Tokens oder semantische Komponentenklassen überführt werden, idealerweise via `@theme` und/oder `@layer components` in `src/index.css`.
6. Wiederverwendbare UI-Muster zusammenziehen:
   - Karten
   - Buttons
   - Labels
   - Pills/Kategorie-Buttons
   - Inputs/Selects/Textarea  
   Ziel ist weniger Klassen-Duplikation und ein klarerer Tailwind-Stil.
7. Prüfen, ob Datenstrukturen wie `CAT_COLORS` noch gebraucht werden oder besser in ein echtes Tailwind-basiertes Kategoriensystem überführt werden.
8. Danach Desktop-Layout und Overflow validieren: lange Preview-Texte, Sticky-Header, Grid, Sidebar und Footer dürfen auf breiten Screens nicht mehr abgeschnitten wirken.
9. Abschließend Build und visuelle Prüfung durchführen, damit das Verhalten lokal und auf GitHub Pages identisch ist.

### Relevante Dateien

- `c:\GIT\gcodes\filename-builder\src\index.css` — von Vite-Default-CSS auf minimale Tailwind-Basis + optionale `@theme`/`@layer`-Definitionen umstellen
- `c:\GIT\gcodes\filename-builder\src\app.tsx` — Full-Width-Struktur und Konsolidierung der Tailwind-Klassen
- `c:\GIT\gcodes\filename-builder\src\main.tsx` — vermutlich unverändert, aber relevant für das Root-Element `#app`

### Verifikation

1. Prüfen, dass `html`, `body` und `#app` die volle Viewport-Breite einnehmen.
2. Auf Desktop-Breiten wie 1440px, 1728px und 1920px testen.
3. Sicherstellen, dass keine horizontale Scrollbar entsteht.
4. Prüfen, dass Header, Main und Footer nicht mehr „abgeschnitten“ wirken.
5. Vergleichen, ob wiederholte Arbitrary-Value-Klassen sinnvoll reduziert wurden.
6. Produktions-Build testen und das Ergebnis auf GitHub Pages gegenprüfen.

### Wichtige Entscheidung

- **Gewählt:** Variante C
- **Stilziel:** Tailwind-first
- **CSS-Restmenge:** nur globale Baselines plus Tailwind-`@theme`/`@layer`, kein unnötiges klassisches Seiten-CSS

### Wichtige Nuance

Du hast aktuell fast **kein echtes Inline-CSS** im React-Sinn. Das Problem ist eher:

- zu viel globales Starter-CSS
- viele verstreute Tailwind-Klassen mit direkten Werten

Das heißt: Die saubere Lösung ist **nicht alles in separates CSS zurückzuschieben**, sondern:
- globale Defaults entschlacken
- Layout sauber mit Tailwind strukturieren
- wiederkehrende Werte in Tailwind-Tokens/Komponenten bündeln

## Empfohlene Umsetzung in einem Satz

**Root-CSS auf Tailwind-Minimum reduzieren, App auf echte Full-Width-Struktur umbauen und wiederkehrende Farb-/Card-/Input-Patterns in Tailwind-Theme- bzw. Component-Klassen zusammenführen.**

## Status-Checkliste

- [x] Ursache für abgeschnittene Breite untersucht
- [x] Variante C als gewünschte Zielrichtung übernommen
- [x] Tailwind-first-Strategie für minimales CSS festgelegt
- [x] Konkreten Umsetzungsplan mit betroffenen Dateien erstellt
- [ ] Implementierung — in diesem Modus bewusst nicht gestartet
- [ ] Verifikation nach Umsetzung

Wenn du willst, kann ich dir als Nächstes den **konkreten Handoff-Plan für die Implementierung** noch feiner aufteilen, zum Beispiel in:
1. Root-CSS bereinigen  
2. Full-Width-Layout umbauen  
3. Tailwind-Tokens/Komponenten extrahieren
