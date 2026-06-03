# Pitchplan — Brand Guidelines

> Gjør hverdagen enklere for treneren på gresset.

---

## Hurtigreferanse

| Element | Verdi |
|---|---|
| Primær bakgrunn (mørk) | `#0A0A0A` |
| Primær bakgrunn (lys) | `#FFFFFF` |
| Overflate (mørk) | `#141414` |
| Overflate (lys) | `#F5F5F5` |
| Grense (mørk) | `#262626` |
| Grense (lys) | `#E5E5E5` |
| Primærtekst (mørk) | `#FFFFFF` |
| Primærtekst (lys) | `#0A0A0A` |
| Sekundærtekst (mørk) | `#A3A3A3` |
| Sekundærtekst (lys) | `#737373` |
| Aksent (rød) | `#E63946` |
| Aksent hover | `#CC2F3B` |
| Heading-font | Barlow Condensed 700 |
| Body-font | Inter 400/500 |
| Tone | Profesjonelt uformell |
| Plattform | Mobil + desktop, lyst og mørkt tema |

---

## Fargepalett

### Svart/hvit kjerne

Pitchplan bruker en ren monokromatisk base. Ingen navy, ingen grå-blå — ren koks og hvit. Det gir maksimal kontrast på alle flater og holder designet tidløst.

```
Pitch Black     #0A0A0A   — Primær bakgrunn, mørkt tema
Charcoal        #141414   — Overflate/kort, mørkt tema
Dark Border     #262626   — Grenser, dividers, mørkt tema
Smoke           #525252   — Sekundærtekst, ikoner, mørkt tema
Silver          #A3A3A3   — Muted tekst, placeholders, mørkt tema

Pure White      #FFFFFF   — Primær bakgrunn, lyst tema
Off White       #F5F5F5   — Overflate/kort, lyst tema
Light Border    #E5E5E5   — Grenser, dividers, lyst tema
Mid Gray        #737373   — Sekundærtekst, lyst tema
Dark Ink        #0A0A0A   — Primærtekst, lyst tema
```

### Aksent

Signal rød brukes sparsomt — kun til knapper, aktive tilstander, ikoner og viktige highlights. Aldri som bakgrunnsfarge på store flater.

```
Signal Red      #E63946   — Primær aksent
Signal Dark     #CC2F3B   — Hover/pressed
Signal Muted    #4D1219   — Subtle bakgrunn på aksent-elementer (mørkt tema)
Signal Light    #FEE2E4   — Subtle bakgrunn på aksent-elementer (lyst tema)
```

### Semantiske farger

```
Suksess         #22C55E   — Bekreftelse, fullført økt
Advarsel        #F59E0B   — Merk, viktig info
Feil            #E63946   — Deler Signal Red (bevisst valg)
```

---

## CSS-variabler

### Tailwind `tailwind.config.js`

```js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pitch: {
          black:   '#0A0A0A',
          charcoal:'#141414',
          border:  '#262626',
          smoke:   '#525252',
          silver:  '#A3A3A3',
        },
        signal: {
          DEFAULT: '#E63946',
          dark:    '#CC2F3B',
          muted:   '#4D1219',
          light:   '#FEE2E4',
        },
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### Rå CSS-variabler

```css
:root {
  /* Bakgrunner */
  --bg-primary:    #FFFFFF;
  --bg-surface:    #F5F5F5;
  --bg-elevated:   #FFFFFF;

  /* Tekst */
  --text-primary:  #0A0A0A;
  --text-secondary:#737373;
  --text-muted:    #A3A3A3;

  /* Grenser */
  --border:        #E5E5E5;
  --border-strong: #D4D4D4;

  /* Aksent */
  --accent:        #E63946;
  --accent-hover:  #CC2F3B;
  --accent-subtle: #FEE2E4;

  /* Semantisk */
  --success:       #22C55E;
  --warning:       #F59E0B;
  --error:         #E63946;
}

.dark {
  --bg-primary:    #0A0A0A;
  --bg-surface:    #141414;
  --bg-elevated:   #1C1C1C;

  --text-primary:  #FFFFFF;
  --text-secondary:#A3A3A3;
  --text-muted:    #525252;

  --border:        #262626;
  --border-strong: #404040;

  --accent:        #E63946;
  --accent-hover:  #CC2F3B;
  --accent-subtle: #4D1219;
}
```

---

## Typografi

### Fonter

| Rolle | Font | Vekt | Last ned |
|---|---|---|---|
| Headings / display | Barlow Condensed | 700 | Google Fonts |
| Body / UI | Inter | 400, 500 | Google Fonts |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

### Typografisk skala

```css
/* Display — stor hero-tekst, tallvisning */
.text-display  { font-family: var(--font-heading); font-size: 3rem;   font-weight: 700; line-height: 1; letter-spacing: -0.01em; }

/* Heading 1 — sidetitler */
.text-h1       { font-family: var(--font-heading); font-size: 2rem;   font-weight: 700; line-height: 1.1; }

/* Heading 2 — seksjonstittler */
.text-h2       { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; line-height: 1.2; }

/* Heading 3 — korttitler */
.text-h3       { font-family: var(--font-heading); font-size: 1.25rem;font-weight: 700; line-height: 1.3; }

/* Body — brødtekst */
.text-body     { font-family: var(--font-body);    font-size: 1rem;   font-weight: 400; line-height: 1.6; }

/* Small — labels, metadata */
.text-small    { font-family: var(--font-body);    font-size: 0.875rem;font-weight: 400; line-height: 1.5; }

/* Label — knapper, tags, caps */
.text-label    { font-family: var(--font-body);    font-size: 0.75rem; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; }
```

### Tailwind-klasser (typografi)

```
Barlow Condensed 700:   font-heading
Inter 400:              font-body
Inter 500:              font-body font-medium
```

---

## Tone of voice

### Personlighet

**Profesjonelt uformell.** Pitchplan er eksperten som snakker til deg som en kollega, ikke en manual. Seriøst nok til at du stoler på det — avslappet nok til at det ikke føles som et regneark.

### Regler

| Gjør | Unngå |
|---|---|
| Bruk fotballsjargong naturlig | Teknisk app-språk («initialiserer», «henter data») |
| Vær direkte og konkret | Lange forklaringer |
| Ha humor ved feil og tomme tilstander | Kald, robotaktig feilmelding |
| Snakk til treneren, ikke om treneren | Passiv form |

### Eksempler

```
✅  "Økt klar. 8 spillere, 60 min. La oss kjøre."
❌  "Din treningsøkt er nå generert og klar til bruk."

✅  "Ingen spillere lagt til ennå. Legg til laget ditt først."
❌  "Feil: Ingen spillerdata tilgjengelig."

✅  "Vi satt fast i offside. Prøv igjen om litt."
❌  "Feil 500 – intern serverfeil."

✅  "Bra jobba! Okten er lagret."
❌  "Lagring fullført."
```

---

## Komponentprinsipper

### Knapper

```
Primær:     bg-signal text-white font-medium rounded-md px-4 py-2.5
            hover: bg-signal-dark
            — Kun én primærknapp per skjerm

Sekundær:   bg-transparent border border-border text-primary rounded-md px-4 py-2.5
            hover: bg-surface

Destruktiv: bg-transparent text-signal border border-signal rounded-md px-4 py-2.5
```

### Kort

```
Mørkt tema:  bg-charcoal border border-pitch-border rounded-lg p-4
Lyst tema:   bg-white border border-light-border rounded-lg p-4 shadow-sm
```

### Input-felt

```
bg-surface border border-border rounded-md px-3 py-2 text-primary
focus: border-signal outline-none ring-0
placeholder: text-muted
```

### Tags / badges

```
Aktiv/primær:  bg-signal-muted text-signal text-label px-2 py-0.5 rounded
Nøytral:       bg-surface text-secondary text-label px-2 py-0.5 rounded
```

---

## Misjon & verdier

**Misjon:** Gjøre hverdagen til usikre trenere litt enklere — med treningsøkter som er forankret i nordisk fotballtradisjon og tilpasset hvert enkelt lag.

**Verdier:**
- **Mestring** — Hver økt skal gi spillerne en følelse av fremgang
- **Glede** — Fotball skal være gøy, for spillerne og treneren
- **Lagånd** — Fellesskapet på banen er viktigere enn individuelle prestasjoner

---

## Anti-mønstre

Ting som aldri skal skje i Pitchplan-design:

- 🚫 Rød bakgrunn på store flater
- 🚫 Mer enn én primærknapp per skjerm
- 🚫 Gradients eller glow-effekter
- 🚫 Fonter andre enn Barlow Condensed og Inter
- 🚫 Tekst under 12px
- 🚫 Aksent-rød på tekst over lys bakgrunn (for lav kontrast)
- 🚫 Mer enn 3 nivåer av grå i samme komponent
