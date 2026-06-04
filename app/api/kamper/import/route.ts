import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fotball.no CSV format (semicolon-separated):
// Dato;Tid;Hjemmelag;Bortelag;Bane;Turnering
// 27.05.2026;18:00;Rosenborg;Molde;Lerkendal;Eliteserien

function parseDateCsv(dateStr: string, timeStr = "12:00"): Date | null {
  let day: number, month: number, year: number;
  if (dateStr.includes(".")) {
    const parts = dateStr.split(".");
    if (parts.length < 3) return null;
    [day, month, year] = parts.map(Number);
  } else if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length < 3) return null;
    [year, month, day] = parts.map(Number);
  } else {
    return null;
  }
  const [hours, minutes] = (timeStr || "12:00").split(":").map(Number);
  const d = new Date(year, month - 1, day, hours || 12, minutes || 0);
  return isNaN(d.getTime()) ? null : d;
}

function parseIcalDate(dtstart: string): Date | null {
  const match = dtstart.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/);
  if (!match) return null;
  const [_, y, m, d, h, min, s, z] = match;
  if (z === "Z") {
    return new Date(Date.UTC(+y, +m - 1, +d, +h, +min, +s));
  }
  return new Date(+y, +m - 1, +d, +h, +min, +s);
}

function detectDelimiter(line: string): string {
  return line.includes(";") ? ";" : ",";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { csv, team_id, my_team_name, action, matches } = body;

  // Håndter commit-action: Lagre en liste med kamper
  if (action === "commit") {
    if (!Array.isArray(matches)) {
      return NextResponse.json({ error: "Ugyldig format for kamper" }, { status: 400 });
    }
    
    const created: string[] = [];
    for (const m of matches) {
      const match = await prisma.match.create({
        data: {
          coach_id: session.coachId,
          team_id: team_id || null,
          date: new Date(m.date),
          opponent: m.opponent || "Ukjent",
          is_home: m.is_home,
          location: m.location || null,
          competition: m.competition || null,
        },
      });
      created.push(match.id);
    }
    return NextResponse.json({ created: created.length });
  }

  // Preview-action eller legacy import
  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "Mangler data" }, { status: 400 });
  }

  const isUrl = csv.trim().startsWith("http");
  let content = csv;

  // Hent innhold hvis det er en URL (iCal)
  if (isUrl) {
    try {
      const resp = await fetch(csv.trim());
      if (!resp.ok) throw new Error("Kunne ikke hente kalender fra URL");
      content = await resp.text();
    } catch (e: any) {
      return NextResponse.json({ error: "Feil ved henting av iCal: " + e.message }, { status: 400 });
    }
  }

  const myName = (my_team_name || "").toLowerCase();
  const parsedMatches: any[] = [];
  const skipped: string[] = [];

  // Parse iCal
  if (content.includes("BEGIN:VCALENDAR")) {
    const events = content.split("BEGIN:VEVENT").slice(1);
    for (const event of events) {
      const lines = event.split(/\r?\n/);
      let dtstart = "", summary = "", location = "", description = "";
      
      for (let line of lines) {
        if (line.startsWith("DTSTART")) dtstart = line.split(":")[1];
        if (line.startsWith("SUMMARY:")) summary = line.substring(8);
        if (line.startsWith("LOCATION:")) location = line.substring(9);
        if (line.startsWith("DESCRIPTION:")) description = line.substring(12);
      }

      if (!dtstart || !summary) {
        skipped.push("Ugyldig hendelse");
        continue;
      }

      const date = parseIcalDate(dtstart);
      if (!date) {
        skipped.push("Ugyldig dato");
        continue;
      }

      let homeTeam = summary;
      let awayTeam = "Motstander";
      let competition = undefined;

      if (description) {
        competition = description.split("\\n")[0].trim();
      }

      const compMatch = summary.match(/\((.*?)\)/);
      if (compMatch) {
        if (!competition) competition = compMatch[1];
        summary = summary.replace(compMatch[0], "").trim();
      }

      const teams = summary.split(" - ");
      if (teams.length >= 2) {
        homeTeam = teams[0].trim();
        awayTeam = teams.slice(1).join(" - ").trim();
      }

      const isHome = myName ? homeTeam.toLowerCase().includes(myName) : true;
      const opponent = isHome ? awayTeam : homeTeam;

      parsedMatches.push({
        id: "preview-" + Math.random().toString(36).substr(2, 9),
        date: date.toISOString(),
        opponent: opponent || "Ukjent",
        is_home: isHome,
        location: location || null,
        competition: competition || null,
      });
    }
  } else {
    // Parse CSV
    const lines = content.split("\n").map((l: string) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const delimiter = detectDelimiter(lines[0]);
      const headers = lines[0].split(delimiter).map((h: string) => h.trim().toLowerCase());

      const colIndex = (names: string[]) => {
        for (const n of names) {
          const i = headers.findIndex((h) => h.includes(n));
          if (i >= 0) return i;
        }
        return -1;
      };

      const iDate = colIndex(["dato", "date", "datum"]);
      const iTime = colIndex(["tid", "time", "kl"]);
      const iHome = colIndex(["hjemmelag", "home", "hemmalag"]);
      const iAway = colIndex(["bortelag", "away", "bortalag"]);
      const iVenue = colIndex(["bane", "venue", "arena", "sted"]);
      const iComp = colIndex(["turnering", "competition", "kamp", "liga"]);

      if (iDate >= 0 && iHome >= 0 && iAway >= 0) {
        for (const line of lines.slice(1)) {
          const cols = line.split(delimiter).map((c: string) => c.trim().replace(/^"|"$/g, ""));
          const dateStr = cols[iDate] ?? "";
          const timeStr = iTime >= 0 ? cols[iTime] : "12:00";
          const homeTeam = cols[iHome] ?? "";
          const awayTeam = cols[iAway] ?? "";
          const venue = iVenue >= 0 ? cols[iVenue] : undefined;
          const comp = iComp >= 0 ? cols[iComp] : undefined;

          const date = parseDateCsv(dateStr, timeStr);
          if (!date) { skipped.push(line); continue; }

          const isHome = myName ? homeTeam.toLowerCase().includes(myName) : true;
          const opponent = isHome ? awayTeam : homeTeam;

          if (!opponent) { skipped.push(line); continue; }

          parsedMatches.push({
            id: "preview-" + Math.random().toString(36).substr(2, 9),
            date: date.toISOString(),
            opponent,
            is_home: isHome,
            location: venue || null,
            competition: comp || null,
          });
        }
      } else {
        return NextResponse.json({ error: "Ugyldig CSV-format. Trenger Dato, Hjemmelag, Bortelag." }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Filen er tom eller mangler rader" }, { status: 400 });
    }
  }

  // Sorter kronologisk
  parsedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (action === "preview") {
    return NextResponse.json({ matches: parsedMatches, skipped: skipped.length });
  }

  // Legacy fallback: Hvis noen kaller uten action='preview' og forventer at den lagrer alt direkte
  const created: string[] = [];
  for (const m of parsedMatches) {
    const match = await prisma.match.create({
      data: {
        coach_id: session.coachId,
        team_id: team_id || null,
        date: new Date(m.date),
        opponent: m.opponent,
        is_home: m.is_home,
        location: m.location,
        competition: m.competition,
      },
    });
    created.push(match.id);
  }
  return NextResponse.json({ created: created.length, skipped: skipped.length });
}
