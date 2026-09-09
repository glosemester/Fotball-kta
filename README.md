# 75 Hard

Enkel webapp for å følge 75 Hard-utfordringen: avkryssing av dagens oppgaver og nedtelling til midnatt.

## Funksjonalitet

- Viser hvilken dag du er på (1–75)
- Nedtelling til midnatt hver dag
- Avkryssingsliste for dagens 6 oppgaver:
  - Trening 1 (45 min)
  - Trening 2 (45 min, utendørs)
  - Drikk 4 liter vann
  - Les 10 sider
  - Følg dietten
  - Ta et fremgangsbilde
- Hvis du ikke fullfører alle oppgavene innen midnatt, starter utfordringen automatisk på nytt fra dag 1
- All fremgang lagres lokalt i nettleseren (`localStorage`) – ingen innlogging eller database

## Utvikling

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000).

## Bygg

```bash
npm run build
npm start
```
