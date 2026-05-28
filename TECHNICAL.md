# PitchPlan — Teknisk dokumentasjon

> **Regler for AI-agenter og utviklere:** Oppdater denne filen hver gang ny funksjonalitet implementeres, feil fikses eller arkitektur endres. Logg endringer under [Endringslogg](#endringslogg).

---

## Oversikt

PitchPlan er en AI-drevet treningsplanlegger for barne- og ungdomsfotball, basert på retningslinjer fra NFF, SvFF, DBU, The FA, RFEF og KNVB. Filosofi: *Flest mulig · Lengst mulig · Best mulig*.

---

## Teknisk stack

| Lag | Teknologi | Versjon |
|-----|-----------|---------|
| **Rammeverk** | Next.js (App Router) | 16.2.6 |
| **Språk** | TypeScript | ^5 |
| **Database** | PostgreSQL (Neon serverless) | — |
| **ORM** | Prisma | 7.8.0 |
| **Styling** | Tailwind CSS | ^4 |
| **UI-komponenter** | Egne komponenter + Radix UI | — |
| **Ikoner** | Lucide React | — |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | — |
| **DB-adapter** | @prisma/adapter-pg | 7.8.0 |
| **Runtime** | Node.js | 22.x |
| **Prosesstyring** | PM2 | 7.x |
| **Webserver** | Nginx | — |

---

## Arkitektur

```
app/
├── (dashboard)/          # Beskyttede ruter (krever innlogging)
│   ├── layout.tsx         # Dashboard-layout med sidemeny og toppbar
│   ├── LoggUtKnapp.tsx    # Client-komponent for utlogging
│   └── dashboard/
│       ├── page.tsx       # Oversiktside med hurtiglenker
│       ├── lag/           # Lag & spillere
│       │   ├── page.tsx
│       │   ├── OpprettLagForm.tsx
│       │   └── [lagId]/
│       │       ├── page.tsx
│       │       ├── LeggTilSpillerForm.tsx
│       │       └── SlettSpillerKnapp.tsx
│       └── treninger/
│           └── ny/page.tsx   # Treningsøkt-wizard (3 steg)
├── login/page.tsx
├── registrer/page.tsx
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── registrer/route.ts
│   │   └── logout/route.ts
│   └── lag/
│       ├── route.ts                         # GET/POST lag
│       └── [id]/
│           ├── route.ts                     # DELETE lag
│           └── spillere/
│               ├── route.ts                 # GET/POST spillere
│               └── [spillerId]/route.ts     # DELETE spiller
├── globals.css
└── layout.tsx

lib/
├── auth.ts               # JWT-signering, verifisering, getSession()
├── prisma.ts             # Prisma-klientinstans (singleton)
├── generated/prisma/     # Autogenerert Prisma-klient (gitignorert)
├── rules-engine/         # NFF/SvFF/DBU-regler per aldersgruppe
│   ├── index.ts
│   └── age-groups.json
└── constraints-engine/   # Feltforhold og utstyrslogikk
    └── index.ts

proxy.ts                  # Next.js 16 proxy (erstatter middleware.ts)
prisma/
├── schema.prisma
└── migrations/
```

---

## Databasemodeller (Prisma)

```prisma
Coach       # Trener/bruker — email, passord (bcrypt), navn, klubb
Team        # Lag — navn, klubb, aldersgruppe, sesong, coachId
Player      # Spiller — fornavn, etternavn, fødselsår, posisjon, lagId
TrainingSession  # Treningsøkt — tema, felt, utstyr, faser (JSON)
WellbeingReport  # Velværerapport — symptombasert, Grønn/Gul/Rød
WeeklyPlan       # Ukesplan — JSON-struktur per lag og uke
```

**Database:** Neon serverless PostgreSQL (eu-west-2)
**Kobling:** `@prisma/adapter-pg` med SSL (`sslmode=require`)

---

## Autentisering

- **Metode:** JWT lagret i HTTP-only cookie (`fotball-token`)
- **Varighet:** 30 dager
- **Hashing:** bcryptjs, cost factor 12
- **Beskyttelse:** `proxy.ts` omdirigerer uautentiserte besøkende til `/login`
- **Session:** `lib/auth.ts → getSession()` brukes i server-komponenter og API-ruter

> **Viktig:** `secure: false` i cookie-oppsett fordi serveren kjører HTTP (ikke HTTPS). Settes til `true` ved Vercel-deploy med HTTPS.

---

## Design-system

Mørkt tema inspirert av moderne sports-apper:

| Token | Verdi | Bruk |
|-------|-------|------|
| `--bg-base` | `#0B0F1A` | Sidebakgrunn |
| `--bg-surface` | `#141929` | Kort og paneler |
| `--bg-elevated` | `#1C2338` | Input-felter, hover |
| `--blue` | `#4F7EFF` | Primærfarge, knapper |
| `--text-primary` | `#FFFFFF` | Overskrifter |
| `--text-secondary` | `#94A3B8` | Brødtekst |
| `--text-muted` | `#4E5A72` | Metadata, labels |
| `--green` | `#22C55E` | Suksess/velvære |
| `--red` | `#EF4444` | Feil/advarsel |
| `--yellow` | `#F59E0B` | Advarsler |

Globale CSS-klasser: `.input-dark` for alle skjemafelt.

---

## Serveroppsett (Hetzner)

| | |
|---|---|
| **Provider** | Hetzner Cloud (nbg1) |
| **OS** | Ubuntu 26.04 LTS |
| **IP** | 178.105.131.153 |
| **Port** | 3001 (åpnet i UFW) |
| **App-mappe** | `/var/www/fotball-kta` |
| **Node-versjon** | 22.x (via nvm) |
| **Prosessstyring** | PM2 (`fotball-kta`) |
| **Brannmur** | UFW — tillatt: OpenSSH, Nginx Full, 3001 |

**Kjøre kommandoer:**
```bash
# Oppdater og rebuild
cd /var/www/fotball-kta && git pull origin claude/wonderful-mendel-uB5N4 && npm run build && pm2 restart fotball-kta

# Se logger
pm2 logs fotball-kta --lines 30 --nostream

# Status
pm2 status
```

**Git-branch:** `claude/wonderful-mendel-uB5N4`

---

## Byggesystem

`npm run build` kjører automatisk `prisma generate && next build`.
Prisma-klienten genereres til `lib/generated/prisma/` (gitignorert).

**Årsak:** Prisma 7 med `moduleResolution: "bundler"` i tsconfig kan ikke løse `.prisma/client`-stien i typedeklarasjonene. Lokal output-path løser dette.

---

## Implementert funksjonalitet

- [x] Registrering og innlogging (e-post + passord)
- [x] JWT-autentisering med HTTP-only cookie
- [x] Rutebeskyttelse via `proxy.ts`
- [x] Lag — opprett, vis, slett (soft delete)
- [x] Spillere — legg til, vis, slett (soft delete)
- [x] Treningsøkt-wizard (3 steg) — aldersgruppe, felt, forhåndsvisning
- [x] Regelmotor per aldersgruppe (NFF/SvFF/DBU)
- [x] Constraints-motor (feltforhold og utstyr)
- [x] Mørkt design-tema over hele appen

---

## Mangler / Planlagt

- [ ] Lagre treningsøkter til database
- [ ] Liste over tidligere treningsøkter
- [ ] Velværeregistrering (Grønn/Gul/Rød per spiller)
- [ ] Ukesplan/periodisering
- [ ] Google OAuth (i tillegg til e-post/passord)
- [ ] Vercel-deploy med HTTPS
- [ ] Treningsøkt-wizard — mørkt design (ikke redesignet ennå)

---

## Endringslogg

| Dato | Endring |
|------|---------|
| 2026-05-26 | Første deploy til Hetzner-server med Neon PostgreSQL |
| 2026-05-26 | Prisma 7-fix: lokal generator-output for TypeScript-kompatibilitet |
| 2026-05-26 | Innlogging, registrering, JWT-auth og rutebeskyttelse implementert |
| 2026-05-26 | Lag og spillere: CRUD-operasjoner med API-ruter og sider |
| 2026-05-26 | Komplett mørkt design-rewrite (navy/blå tema) |
| 2026-05-26 | Lyst pastel design-rewrite: hvit/lavendel tema, fast bunnmeny for app-følelse |
| 2026-05-26 | Treningsøkter-modul: listeside, API og lagring fra wizard |
| 2026-05-26 | Velvære-modul: uke-oversikt, registrering per spiller (Grønn/Gul/Rød), varselpanel |
| 2026-05-26 | Ukesplan-modul: daglig fokusvelger, NFF-regel for antall økter, uke-navigering |
| 2026-05-26 | Valgfrie moduler: features-felt på Coach, innstillinger-side, Velvære skjult til det slås på |
| 2026-05-26 | AI-øvelser: Claude genererer tilpassede øvelser per fase i treningsøkt-wizarden |
| 2026-05-27 | App omdøpt til PitchPlan; GitHub Actions auto-deploy til Hetzner via SSH |
| 2026-05-27 | Flerspråklig støtte (nb/sv/da/en): cookie-basert i18n, JSON-ordbøker, LangSwitcher |
| 2026-05-28 | Full branding-overhaul: Pitch Black mørkt tema, Turf Green aksent, Barlow Condensed + Inter-fonter, NavLink-komponent med aktiv-state, tone-of-voice-oppdatering i alle fire ordbøker |
