import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Fotball.no CSV format (semicolon-separated):
// Dato;Tid;Hjemmelag;Bortelag;Bane;Turnering
// 27.05.2026;18:00;Rosenborg;Molde;Lerkendal;Eliteserien

function parseDate(dateStr: string, timeStr = "12:00"): Date | null {
  // Handle DD.MM.YYYY or YYYY-MM-DD
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

function detectDelimiter(line: string): string {
  return line.includes(";") ? ";" : ",";
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { csv, team_id, my_team_name } = body;

  if (!csv || typeof csv !== "string") {
    return NextResponse.json({ error: "CSV mangler" }, { status: 400 });
  }

  const lines = csv.split("\n").map((l: string) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return NextResponse.json({ error: "CSV er tom" }, { status: 400 });
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map((h: string) => h.trim().toLowerCase());

  const colIndex = (names: string[]) => {
    for (const n of names) {
      const i = headers.findIndex((h) => h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };

  const iDate     = colIndex(["dato", "date"]);
  const iTime     = colIndex(["tid", "time", "kl"]);
  const iHome     = colIndex(["hjemmelag", "home"]);
  const iAway     = colIndex(["bortelag", "away"]);
  const iVenue    = colIndex(["bane", "venue", "arena", "sted"]);
  const iComp     = colIndex(["turnering", "competition", "kamp", "liga"]);

  if (iDate < 0 || iHome < 0 || iAway < 0) {
    return NextResponse.json({ error: "Fant ikke kolonnene Dato, Hjemmelag og Bortelag i CSV-filen" }, { status: 400 });
  }

  const myName = (my_team_name || "").toLowerCase();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const line of lines.slice(1)) {
    const cols = line.split(delimiter).map((c: string) => c.trim().replace(/^"|"$/g, ""));
    const dateStr  = cols[iDate] ?? "";
    const timeStr  = iTime >= 0 ? cols[iTime] : "12:00";
    const homeTeam = cols[iHome] ?? "";
    const awayTeam = cols[iAway] ?? "";
    const venue    = iVenue >= 0 ? cols[iVenue] : undefined;
    const comp     = iComp  >= 0 ? cols[iComp]  : undefined;

    const date = parseDate(dateStr, timeStr);
    if (!date) { skipped.push(line); continue; }

    // Determine if this is a home or away game for myName
    const isHome = myName
      ? homeTeam.toLowerCase().includes(myName)
      : true;
    const opponent = isHome ? awayTeam : homeTeam;

    if (!opponent) { skipped.push(line); continue; }

    const match = await prisma.match.create({
      data: {
        coach_id:    session.coachId,
        team_id:     team_id || null,
        date,
        opponent,
        is_home:     isHome,
        location:    venue   || null,
        competition: comp    || null,
      },
    });
    created.push(match.id);
  }

  return NextResponse.json({ created: created.length, skipped: skipped.length });
}
