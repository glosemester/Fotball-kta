-- ============================================================
-- FOTBALL-KTA: DATABASE OPPSETT
-- Kjør dette skriptet én gang på Hetzner-serveren
--
-- Slik kjører du det:
--   sudo -u postgres psql
--   \i /path/to/setup-database.sql
-- ============================================================

-- Opprett database og bruker
CREATE DATABASE fotball_kta;
CREATE USER fotball_bruker WITH ENCRYPTED PASSWORD 'BYTT_MEG_TIL_ET_SIKKERT_PASSORD';
GRANT ALL PRIVILEGES ON DATABASE fotball_kta TO fotball_bruker;

-- Koble til den nye databasen
\c fotball_kta

-- Gi bruker tilgang til public schema (PostgreSQL 15+)
GRANT ALL ON SCHEMA public TO fotball_bruker;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fotball_bruker;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fotball_bruker;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fotball_bruker;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fotball_bruker;
