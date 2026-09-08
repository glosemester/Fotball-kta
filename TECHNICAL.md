# 75 Hard — Teknisk dokumentasjon

> **Regler for AI-agenter og utviklere:** Oppdater denne filen hver gang ny funksjonalitet implementeres, feil fikses eller arkitektur endres. Logg endringer under [Endringslogg](#endringslogg).

---

## Oversikt

75 Hard er en enkel webapp for å følge 75 Hard-utfordringen: avkryssing av dagens 6 oppgaver og nedtelling til midnatt. All fremgang lagres lokalt i nettleseren – ingen innlogging, ingen database, ingen backend.

---

## Teknisk stack

| Lag | Teknologi | Versjon |
|-----|-----------|---------|
| **Rammeverk** | Next.js (App Router) | 16.2.6 |
| **Språk** | TypeScript | ^5 |
| **Styling** | Tailwind CSS | ^4 |
| **Lagring** | `localStorage` i nettleseren | — |
| **Auth** | Ingen | — |
| **Database** | Ingen | — |

---

## Arkitektur

```
app/
├── layout.tsx     # Root-layout, metadata, viewport
├── page.tsx       # Hovedside (client-komponent): dag-teller, nedtelling, avkryssingsliste
├── tasks.ts        # Definisjon av de 6 daglige oppgavene og TOTAL_DAYS (75)
└── globals.css     # Tailwind + fargevariabler (mørkt tema)
public/
├── manifest.json   # PWA-manifest
└── icon-*.png      # App-ikoner
```

### Datamodell (localStorage, nøkkel `75hard-state`)

```ts
{
  startDate: "YYYY-MM-DD",       // dato dag 1 startet
  history: {
    "YYYY-MM-DD": {              // per dag
      workout1: boolean,
      workout2: boolean,
      water: boolean,
      read: boolean,
      diet: boolean,
      photo: boolean,
    }
  }
}
```

### Kjernelogikk

- **Dag-teller**: `dagens dato − startDate` (i hele dager) + 1. Når dette overstiger 75, er utfordringen fullført.
- **Nedtelling**: tid igjen til midnatt (`setHours(24,0,0,0)`), oppdateres hvert sekund.
- **Nedtelling til siste dag**: tid igjen til slutten av dag 75 (`startDate` + 75 dager, ved midnatt), vist som dager/timer/min/sek, oppdateres hvert sekund.
- **Automatisk restart**: ved innlasting sjekkes alle dager fra `startDate` til i går. Hvis én dag mangler fullførte oppgaver, nullstilles `startDate` til i dag og `history` tømmes (tilbake til dag 1), med en synlig melding til brukeren.
- **Manuell restart**: knapp for å starte på nytt fra dag 1 når som helst (med bekreftelse).

---

## Utvikling

```bash
npm install
npm run dev
```

## Mangler / Planlagt

- [ ] Ingen kjente mangler per nå

---

## Endringslogg

| Dato | Endring |
|------|---------|
| 2026-09-08 | Hele det tidligere PitchPlan-fotballprosjektet (auth, Prisma/Neon, kalender, Capacitor osv.) fjernet. Ny, enkel 75 Hard-webapp bygget fra bunnen: dag-teller, nedtelling til midnatt, avkryssing av 6 daglige oppgaver, automatisk restart ved bommet dag. Data lagres kun lokalt i nettleseren (localStorage), ingen backend. |
| 2026-09-08 | Lagt til nedtelling til siste dag (dag 75): viser dager/timer/min/sek igjen til utfordringen er fullført, i tillegg til den eksisterende nedtellingen til midnatt for dagens oppgaver. |
