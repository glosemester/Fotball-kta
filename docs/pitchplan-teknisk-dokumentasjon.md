# PitchPlan — Teknisk dokumentasjon

> AI-drevet treningsplanlegger for ungdomsfotball

---

## Oversikt

**PitchPlan** er en webapplikasjon for fotballtrenere som hjelper med treningsplanlegging, lagadministrasjon, kampkalender og spillerhelse. Filosofi: *Flest mulig spillere · Lengst mulig utvikling · Best mulig kvalitet*.

---

## Teknisk stack

| Komponent | Teknologi | Versjon |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.6 |
| Språk | TypeScript | ^5 |
| Database | PostgreSQL (Neon serverless) | — |
| ORM | Prisma | 7.8.0 |
| Styling | Tailwind CSS | ^4 |
| UI-komponenter | Radix UI + Custom | — |
| Ikoner | Lucide React | — |
| Autentisering | JWT (jsonwebtoken) + bcryptjs | — |
| DB-adapter | @prisma/adapter-pg | 7.8.0 |
| AI | Google Generative AI | ^0.24.1 |
| Runtime | Node.js | 22.x |
| Prosessmanager | PM2 | 7.x |
| Webserver | Nginx | — |
| Hosting | Hetzner Cloud (nbg1) | — |

---

## Funksjoner og sider

### Autentisering
- `/login` — E-post + passord, og Google OAuth (Fortsett med Google)
- `/registrer` — Ny trener-registrering
- Autentisering via JWT i HTTP-only cookie (`fotball-token`, 30 dager)
- Google OAuth uten NextAuth — fullstendig manuell implementasjon med CSRF state-cookie

### Lagadministrasjon
- `/dashboard/lag` — Vis, opprett og rediger lag
- `/dashboard/lag/[lagId]` — Laginfo og spillerstall
- Aldersgrupper: 6–7, 8–9, 10–12, 13–14, 15–16, 17–18
- Posisjoner: MÅL, BACK, MIDTBANE, SPISS, UKJENT
- Myk sletting (markeres som inaktiv, ikke slettet fra DB)

### Treningsøkter
- `/dashboard/treninger/ny` — 3-stegs veiviser
  1. Velg aldersgruppe, banedimensjoner, tilgjengelig utstyr
  2. Velg treningstema (Pasning, Dribling, Avslutning, Forsvar, Posisjonsspill, Pressing, Overganger, Keeperspill, Fri lek)
  3. AI genererer alderstilpassede øvelser per treningsfase
- `/dashboard/treninger` — Oversikt over alle treningsøkter
- Regelmotor (NFF/SvFF/DBU) pr. aldersgruppe
- Restriksjonsmotor for banestørrelse og utstyr

### Ukesplan
- `/dashboard/ukesplan` — Dag-for-dag fokusoversikt med ukenavigasjon
- NFF-kompatibel treningsfrekvens pr. aldersgruppe
- JSON-basert planstruktur pr. lag

### Velvære
- `/dashboard/velvare` — Ukeoversikt over spillerstatus
- Statussystem: Grønn (frisk) / Gul (forsiktighet) / Rød (bekymring)
- Symptombasert — ingen vekt/BMI (barnevernsretningslinjer)
- Trener registrerer status for spillere
- Unik begrensning: én rapport pr. spiller pr. uke pr. år

### Kampkalender
- `/dashboard/kalender` — 5-ukers rutenett med kamper og treninger
- Kampdetaljer: motstander, hjemme/borte, konkurranse, bane, spillertropp
- CSV-import fra fotball.no (Dato;Tid;Hjemmelag;Bortelag;Bane;Turnering)
- Auto-deteksjon av hjemme/borte ut fra lagnavn

### Innstillinger
- `/dashboard/innstillinger` — Trenerprofil og funksjonsveksler
- Velvære er en valgfri funksjon (kan aktiveres/deaktiveres per trener)

---

## Flerspråklig støtte

Støtter norsk bokmål, svensk, dansk og engelsk via informasjonskapsel-basert i18n.

| Kode | Språk |
|------|-------|
| `nb` | Norsk bokmål (standard) |
| `sv` | Svensk |
| `da` | Dansk |
| `en` | Engelsk |

---

## Database — modeller

```
Coach (Trener)
├── id, email, password (nullable), full_name, club_name
├── role: COACH / ASSISTANT_COACH / ADMIN
├── google_id (for Google OAuth)
├── features[] (aktiverte funksjoner, f.eks. "wellbeing")
└── relasjoner: lag[], treningsøkter[], kamper[]

Team (Lag)
├── id, name, club_name, age_group, season
├── coach_id, is_active
└── relasjoner: trener, spillere[], treningsøkter[], ukesplaner[], kamper[]

Player (Spiller)
├── id, first_name, last_name, birth_year, position
├── team_id, is_active
└── relasjoner: lag, velværerapporter[]

TrainingSession (Treningsøkt)
├── id, team_id, coach_id, title, date, duration_minutes
├── age_group, theme, field_length/width
├── has_full_goals, balls_available, cones_available
├── phases (JSON: strukturerte treningsfaser med øvelser)
└── status: DRAFT / ACTIVE / COMPLETED

WellbeingReport (Velværerapport)
├── id, player_id, week_number, year
├── status: GREEN / YELLOW / RED
├── reported_by: PLAYER / PARENT / COACH
├── symptoms[], note
└── Unik: (player_id, week_number, year)

WeeklyPlan (Ukesplan)
├── id, team_id, week_number, year, match_day
├── plan_data (JSON)
└── Unik: (team_id, week_number, year)

Match (Kamp)
├── id, coach_id, team_id, date, opponent
├── is_home, location, competition, notes
└── player_ids[] (deltakende spillere)
```

---

## API-ruter

| Endepunkt | Metode | Funksjon |
|-----------|--------|----------|
| `/api/auth/login` | POST | Logg inn med e-post/passord |
| `/api/auth/registrer` | POST | Registrer ny trener |
| `/api/auth/logout` | POST | Logg ut (slett cookie) |
| `/api/auth/google` | GET | Start Google OAuth |
| `/api/auth/google/callback` | GET | Google OAuth callback |
| `/api/lag` | GET/POST | Liste lag / opprett lag |
| `/api/lag/[id]` | DELETE | Slett lag (myk) |
| `/api/lag/[id]/spillere` | GET/POST | Liste/legg til spillere |
| `/api/lag/[id]/spillere/[id]` | DELETE | Slett spiller (myk) |
| `/api/treninger` | GET/POST | Liste/opprett treningsøkter |
| `/api/treninger/generer` | POST | AI-generer øvelser |
| `/api/ukesplan` | GET/POST | Hent/oppdater ukesplan |
| `/api/velvare` | GET/POST | Hent/registrer velværerapport |
| `/api/kamper` | GET/POST | Liste/opprett kamper |
| `/api/kamper/[id]` | DELETE | Slett kamp |
| `/api/kamper/import` | POST | Importer kamper fra CSV |
| `/api/innstillinger` | POST | Oppdater trenerinnstillinger |
| `/api/lang` | POST | Sett språkpreferanse |

---

## Drift og deploy

### Server
- **Leverandør:** Hetzner Cloud, nbg1 (Nürnberg)
- **OS:** Ubuntu 26.04 LTS
- **IP:** 178.105.131.153
- **Port:** 3001
- **App-mappe:** `/var/www/fotball-kta`
- **Node:** 22.x (via nvm)
- **Prosessmanager:** PM2 (`fotball-kta`)
- **Proxy:** Nginx

### GitHub Actions — auto-deploy
Trigger: push til `main`

```
1. SSH inn på Hetzner-serveren
2. git pull origin main
3. npm ci
4. npx prisma db push --accept-data-loss
5. npm run build
6. pm2 restart fotball-kta
7. pm2 save
```

**Hemmeligheter i GitHub:**
- `SSH_HOST` — serverens IP
- `SSH_USER` — root
- `SSH_PRIVATE_KEY` — privat SSH-nøkkel

### Manuelle kommandoer (på server)
```bash
cd /var/www/fotball-kta
git pull origin main
npm run build
pm2 restart fotball-kta
pm2 logs fotball-kta --lines 30 --nostream
pm2 status
```

---

## Miljøvariabler

```env
DATABASE_URL="postgresql://bruker:passord@host:5432/fotball_kta"
JWT_SECRET="minst-32-tegn-tilfeldig-streng"
NEXT_PUBLIC_BASE_URL="http://178.105.131.153:3001"
NODE_ENV="production"
GOOGLE_CLIENT_ID="fra-google-cloud-console"
GOOGLE_CLIENT_SECRET="fra-google-cloud-console"
```

### Google OAuth oppsett
1. Google Cloud Console → APIs & Services → Credentials → Opprett OAuth 2.0-klient-ID
2. Autorisert redirect-URI: `http://178.105.131.153:3001/api/auth/google/callback`
3. Legg `GOOGLE_CLIENT_ID` og `GOOGLE_CLIENT_SECRET` i `.env` på serveren

---

## Scripts

| Script | Funksjon |
|--------|----------|
| `npm run dev` | Utviklingsserver (localhost:3000) |
| `npm run build` | `prisma generate` → `next build` |
| `npm start` | Produksjonsserver |
| `npm run lint` | ESLint |

---

## Mappestruktur

```
/
├── app/
│   ├── (dashboard)/          # Beskyttede ruter (krever innlogging)
│   │   ├── layout.tsx         # Dashboard-layout med navigasjon
│   │   └── dashboard/
│   │       ├── page.tsx       # Oversiktsside
│   │       ├── innstillinger/ # Innstillinger
│   │       ├── lag/           # Lag-CRUD
│   │       ├── treninger/     # Treningsøkter
│   │       ├── ukesplan/      # Ukesplan
│   │       ├── velvare/       # Velvære
│   │       └── kalender/      # Kampkalender
│   ├── login/                 # Innloggingsside
│   ├── registrer/             # Registreringsside
│   ├── page.tsx               # Landingsside
│   └── api/                   # REST API
├── components/
│   ├── ui/                    # Gjenbrukbare UI-komponenter
│   ├── PitchPlanLogo.tsx      # SVG-logo
│   └── ...
├── lib/
│   ├── auth.ts                # JWT sign/verify, getSession()
│   ├── prisma.ts              # Prisma-klient singleton
│   ├── dict.ts                # i18n-ordbokslaster
│   ├── rules-engine/          # NFF/SvFF/DBU-regler pr. aldersgruppe
│   └── constraints-engine/    # Bane- og utstyrsvalidering
├── dictionaries/
│   ├── nb.json                # Norsk bokmål
│   ├── sv.json                # Svensk
│   ├── da.json                # Dansk
│   └── en.json                # Engelsk
├── prisma/
│   └── schema.prisma          # Datamodeller
└── .github/
    └── workflows/
        └── deploy.yml         # Auto-deploy
```

---

## Endringslogg

| Dato | Endring |
|------|---------|
| 2026-05-26 | Første deploy til Hetzner med Neon PostgreSQL |
| 2026-05-26 | Autentisering: innlogging, registrering, JWT, rutebeskyttelse |
| 2026-05-26 | Lag og spillere CRUD |
| 2026-05-26 | Mørkt tema (navy/lilla) |
| 2026-05-26 | Treningsøkt-veiviser (3 steg) med AI-generering |
| 2026-05-26 | Velvære-modul (Grønn/Gul/Rød) |
| 2026-05-26 | Ukesplan med NFF-samsvar |
| 2026-05-26 | Valgfrie funksjoner (Coach.features-array) |
| 2026-05-27 | App omdøpt til PitchPlan |
| 2026-05-27 | GitHub Actions auto-deploy til Hetzner |
| 2026-05-27 | Flerspråklig støtte (nb/sv/da/en) |
| 2026-05-27 | Kampkalender med CSV-import fra fotball.no |
| 2026-05-27 | Google OAuth-innlogging |
| 2026-05-27 | PitchPlan-logo (SVG fotballbane) |
| 2026-05-27 | Redesignet landingsside |
