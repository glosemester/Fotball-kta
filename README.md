# PitchPlan

AI-drevet treningsplanlegger for ungdomsfotball — bygget for norske breddeklubb-trenere.

> Filosofi: *Flest mulig spillere · Lengst mulig utvikling · Best mulig kvalitet*

---

## Hva er PitchPlan?

PitchPlan hjelper fotballtrenere med å planlegge treninger, administrere lag, følge opp spillerhelse og ha oversikt over kamper — alt på ett sted. Treningsøkter genereres av AI basert på aldersgruppe, tema og tilgjengelig utstyr, i tråd med NFF sine retningslinjer.

**Støttede aldersgrupper:** 6–7, 8–9, 10–12, 13–14, 15–16, 17–18 år

---

## Funksjoner

### Treningsøkter
- 3-stegs veiviser: velg aldersgruppe og banestørrelse → velg treningstema → AI genererer komplett økt
- Treningstemaer: Pasning, Dribling, Avslutning, Forsvar, Posisjonsspill, Pressing, Overganger, Keeperspill, Fri lek
- Regelmotor basert på NFF/SvFF/DBU-retningslinjer per aldersgruppe
- Restriksjonsmotor for banestørrelse og tilgjengelig utstyr (mål, baller, kjegler)

### Kampkalender
- 5-ukers rutenett med kamper og treninger
- Import av kamper direkte fra fotball.no (CSV-format)
- Auto-deteksjon av hjemme/borte basert på lagnavn
- Velg spillertropp per kamp

### Ukesplan
- Dag-for-dag fokusoversikt med ukenavigasjon
- NFF-kompatibel belastningsstyring per aldersgruppe

### Velvære
- Ukentlig status per spiller: Grønn / Gul / Rød
- Symptombasert — ingen vekt/BMI (barnevernsretningslinjer overholdes)
- Trener registrerer status, én rapport per spiller per uke
- Valgfri funksjon (aktiveres i innstillinger)

### Lagadministrasjon
- Opprett og administrer flere lag
- Spillerstall med posisjon og fødselsår
- Myk sletting — data bevares i databasen

### Flerspråklig
- Norsk bokmål, svensk, dansk og engelsk
- Språkvalg lagres per bruker (informasjonskapsel)

---

## Teknisk løsning

### Stack

| Komponent | Teknologi | Versjon |
|-----------|-----------|---------|
| Framework | Next.js App Router | 16.2.6 |
| Språk | TypeScript | ^5 |
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Prisma | 7.8.0 |
| Styling | Tailwind CSS | ^4 |
| UI | Radix UI + egne komponenter | — |
| Auth | JWT (jsonwebtoken) + bcryptjs | — |
| AI | Google Generative AI | ^0.24.1 |
| Runtime | Node.js | 22.x |
| Prosessmanager | PM2 | — |
| Webserver | Nginx | — |
| Hosting | Hetzner Cloud (nbg1) | — |

### Autentisering
- JWT lagret i HTTP-only cookie (`fotball-token`, 30 dager)
- E-post + passord (bcrypt, cost factor 12)
- Google OAuth — fullstendig manuell implementasjon med CSRF state-cookie
- Kontoer som bruker Google kan ikke logge inn med passord og omvendt

### Arkitektur
- **Server components** (`page.tsx`) leser sesjon, henter data og sender typede props til klientkomponenter
- **Klientkomponenter** (`*Klient.tsx`) håndterer interaktivitet og skjemaer
- **API-ruter** (`app/api/`) er REST-endepunkter beskyttet av `getSession()`
- **Proxy** (`proxy.ts`) omdirigerer uautentiserte brukere til `/login`

### Databasemodeller

```
Coach         — trener med e-post, passord/google_id, klubb, rolle, aktiverte funksjoner
Team          — lag med aldersgruppe og sesong, tilhører en trener
Player        — spiller med posisjon og fødselsår, tilhører ett lag
TrainingSession — treningsøkt med AI-genererte faser (JSON), status og utstyrskonfigurasjon
WellbeingReport — velværerapport per spiller per uke (unik constraint)
WeeklyPlan    — ukesplan per lag per uke (JSON-struktur)
Match         — kamp med motstander, dato, hjemme/borte, spillertropp
```

### AI-generering
Endepunkt `/api/treninger/generer` sender aldersgruppe, tema, banestørrelse og utstyr til Google Generative AI og returnerer strukturerte treningsfaser (oppvarming, hoveddel, avslutning) med konkrete øvelser.

---

## Mappestruktur

```
app/
├── (dashboard)/              # Beskyttede sider (krever innlogging)
│   ├── layout.tsx            # Navigasjon og header
│   └── dashboard/
│       ├── page.tsx          # Oversiktsside
│       ├── treninger/        # Treningsøkter
│       ├── lag/              # Lagadministrasjon
│       ├── ukesplan/         # Ukesplan
│       ├── kalender/         # Kampkalender
│       ├── velvare/          # Velvære
│       └── innstillinger/    # Innstillinger
├── login/                    # Innlogging
├── registrer/                # Registrering
├── page.tsx                  # Landingsside
└── api/                      # REST API

components/
├── ui/                       # Knapper, kort, badges
└── PitchPlanLogo.tsx         # SVG-logo

lib/
├── auth.ts                   # JWT sign/verify, getSession()
├── prisma.ts                 # Prisma-klient singleton
├── dict.ts                   # i18n ordbokslaster
├── rules-engine/             # NFF/SvFF/DBU-regler per aldersgruppe
└── constraints-engine/       # Bane- og utstyrsvalidering

dictionaries/                 # Oversettelser: nb, sv, da, en
prisma/schema.prisma          # Datamodeller
```

---

## Kom i gang

### Forutsetninger
- Node.js 22.x
- PostgreSQL-database (f.eks. Neon)

### Installasjon

```bash
git clone https://github.com/glosemester/Fotball-kta.git
cd Fotball-kta
npm install
```

### Miljøvariabler

Opprett `.env` i prosjektmappen:

```env
DATABASE_URL="postgresql://bruker:passord@host:5432/dbnavn"
JWT_SECRET="minst-32-tegn-tilfeldig-streng"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# Valgfritt — kreves for Google OAuth
GOOGLE_CLIENT_ID="fra-google-cloud-console"
GOOGLE_CLIENT_SECRET="fra-google-cloud-console"
```

### Kjør lokalt

```bash
npx prisma db push      # Opprett tabeller
npm run dev             # Start på localhost:3000
```

### Bygg for produksjon

```bash
npm run build   # prisma generate + next build
npm start
```

---

## Deploy

### Server
- **Hetzner Cloud**, Ubuntu, IP: `178.105.131.153`, port `3001`
- Node 22 via nvm, PM2 som prosessmanager, Nginx som reverse proxy

### Auto-deploy (GitHub Actions)
Push til `main` trigrer automatisk deploy:

```
git pull → npm ci → prisma db push → npm run build → pm2 restart
```

**GitHub Secrets som kreves:**
- `SSH_HOST` — serverens IP
- `SSH_USER` — brukernavn (root)
- `SSH_PRIVATE_KEY` — privat SSH-nøkkel

### Google OAuth oppsett (produksjon)
1. Google Cloud Console → Credentials → Opprett OAuth 2.0-klient-ID
2. Legg til autorisert redirect-URI: `http://178.105.131.153:3001/api/auth/google/callback`
3. Legg `GOOGLE_CLIENT_ID` og `GOOGLE_CLIENT_SECRET` i `.env` på serveren
4. Kjør `npx prisma db push` for å legge til `google_id`-kolonnen

---

## API-oversikt

| Endepunkt | Metode | Funksjon |
|-----------|--------|----------|
| `/api/auth/login` | POST | Innlogging e-post/passord |
| `/api/auth/registrer` | POST | Registrer ny trener |
| `/api/auth/logout` | POST | Logg ut |
| `/api/auth/google` | GET | Start Google OAuth |
| `/api/auth/google/callback` | GET | Google OAuth callback |
| `/api/lag` | GET/POST | Hent/opprett lag |
| `/api/lag/[id]/spillere` | GET/POST | Hent/legg til spillere |
| `/api/treninger` | GET/POST | Hent/opprett treningsøkter |
| `/api/treninger/generer` | POST | AI-generer øvelser |
| `/api/ukesplan` | GET/POST | Hent/oppdater ukesplan |
| `/api/velvare` | GET/POST | Hent/registrer velværerapport |
| `/api/kamper` | GET/POST | Hent/opprett kamper |
| `/api/kamper/import` | POST | Importer kamper fra CSV |
| `/api/innstillinger` | POST | Oppdater innstillinger |
| `/api/lang` | POST | Sett språkpreferanse |

---

## Endringslogg

| Dato | Endring |
|------|---------|
| 2026-05-26 | Første deploy til Hetzner med Neon PostgreSQL |
| 2026-05-26 | Auth: innlogging, registrering, JWT, rutebeskyttelse |
| 2026-05-26 | Lag og spillere CRUD |
| 2026-05-26 | Treningsøkt-veiviser med AI-generering |
| 2026-05-26 | Velvære-modul (Grønn/Gul/Rød) |
| 2026-05-26 | Ukesplan med NFF-samsvar |
| 2026-05-27 | App omdøpt til PitchPlan |
| 2026-05-27 | GitHub Actions auto-deploy |
| 2026-05-27 | Flerspråklig støtte (nb/sv/da/en) |
| 2026-05-27 | Kampkalender med CSV-import fra fotball.no |
| 2026-05-27 | Google OAuth-innlogging |
| 2026-05-27 | PitchPlan-logo og redesignet landingsside |
