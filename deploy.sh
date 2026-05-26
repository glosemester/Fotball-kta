#!/bin/bash
# ============================================================
# FOTBALL-KTA — DEPLOY-SKRIPT FOR HETZNER-SERVER
# Kjør dette skriptet én gang for å sette opp appen
# ============================================================

set -e  # Stopp hvis noe feiler

APP_DIR="/var/www/fotball-kta"
REPO_URL="https://github.com/glosemester/Fotball-kta.git"
BRANCH="claude/wonderful-mendel-uB5N4"
NODE_VERSION="22"

echo "========================================"
echo "  Fotball-KTA — Serveroppsett starter"
echo "========================================"

# 1. Opprett app-mappen
echo ""
echo "→ Oppretter app-mappe..."
mkdir -p $APP_DIR
cd $APP_DIR

# 2. Klon eller oppdater koden fra GitHub
if [ -d ".git" ]; then
  echo "→ Oppdaterer eksisterende kode..."
  git fetch origin
  git checkout $BRANCH
  git pull origin $BRANCH
else
  echo "→ Laster ned koden fra GitHub..."
  git clone -b $BRANCH $REPO_URL .
fi

# 3. Installer avhengigheter
echo ""
echo "→ Installerer Node.js-pakker (tar litt tid)..."
npm install --production=false

# 4. Opprett .env-fil (VIKTIG: aldri del denne filen!)
echo ""
echo "→ Oppretter konfigurasjonsfil..."
cat > .env << 'ENVFILE'
DATABASE_URL="postgresql://fotball_bruker:Rosenborgballklubb+1917@127.0.0.1:5432/fotball_kta"
JWT_SECRET="fotball-kta-hemmelig-nøkkel-bytt-meg-i-produksjon-2025"
NEXT_PUBLIC_APP_URL="http://178.105.131.153"
NODE_ENV="production"
ENVFILE

# 5. Sett opp databasetabeller (kjøres kun én gang)
echo ""
echo "→ Oppretter databasetabeller..."
npx prisma db push --accept-data-loss

# 6. Bygg appen for produksjon
echo ""
echo "→ Bygger appen (tar 1-2 minutter)..."
npm run build

# 7. Start appen med PM2
echo ""
echo "→ Starter appen med PM2..."
pm2 delete fotball-kta 2>/dev/null || true
pm2 start npm --name "fotball-kta" -- start
pm2 save

echo ""
echo "========================================"
echo "  ✅ Appen kjører nå!"
echo "  Åpne: http://178.105.131.153"
echo "========================================"
