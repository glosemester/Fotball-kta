import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";
import { getAgeGroupRules, isHeadingForbidden } from "@/lib/rules-engine";
import type { AgeGroupKey, SessionTheme } from "@/types";

const THEME_LABELS: Record<SessionTheme, string> = {
  pasning_mottak:     "Pasning & Mottak",
  dribling_vendinger: "Dribling & Vendinger",
  avslutninger:       "Avslutninger",
  forsvar:            "Forsvar",
  posisjonsspill:     "Posisjonsspill",
  pressing:           "Pressing & Gjenvinning",
  overganger:         "Overganger",
  keeperteknikk:      "Keeperteknikk",
  fritt_spill:        "Fritt Spill",
  venn_med_ballen:    "Venn med ballen",
};

const SYSTEM_PROMPT = `Du er en ekspert på barne- og ungdomsfotball i Norden med dyp kunnskap om NFF, SvFF og DBU sine retningslinjer.

Du genererer konkrete, pedagogisk gjennomtenkte treningsøvelser. Returner ALLTID gyldig JSON i dette formatet — ingen tekst rundt, bare ren JSON:

{
  "exercises": [
    {
      "phase": "Oppvarming",
      "name": "Øvelsesnavn",
      "duration_minutes": 10,
      "description": "En setning som forklarer øvelsens pedagogiske mål.",
      "setup": "Nøyaktig hvordan øvelsen settes opp med mål, kjegler, vester og baller.",
      "rules": ["Regel 1 (f.eks max 3 touch)", "Regel 2"],
      "instructions": ["Steg 1 i gjennomføringen", "Steg 2", "Steg 3"],
      "coaching_points": ["Hva trener ser etter", "Nøkkelprinsipp"],
      "variations": ["Enklere variant for de som sliter", "Vanskeligere variant for de som mestrer"]
    }
  ]
}

VIKTIG: Du skal gi dype, nøyaktige og lette-å-forstå beskrivelser av "setup", "rules" og "instructions". Beskrivelsene skal gjøre det enkelt for en fotballtrener å visualisere øvelsen umiddelbart, uten behov for tegninger.

Pedagogisk filosofi: «Flest mulig · Lengst mulig · Best mulig» — Trygghet → Mestring → Trivsel.
Alltid: høy ball-rolling-tid (>70%), minimale instruksjonspauser, alderstilpasset kompleksitet, lekbasert tilnærming for yngre.`;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "AI ikke konfigurert — legg til GEMINI_API_KEY i .env" }, { status: 503 });
  }

  const {
    age_group,
    themes,
    player_count,
    field_length,
    field_width,
    phases,
  }: {
    age_group: AgeGroupKey;
    theme: SessionTheme;
    player_count: number;
    field_length: number;
  }: {
    age_group: AgeGroupKey;
    themes: SessionTheme[];
    player_count: number;
    field_length: number;
    field_width: number;
    phases: { phase: string; duration_minutes: number; description: string }[];
  } = await req.json();

  if (!age_group || !themes || themes.length === 0) {
    return NextResponse.json({ error: "Mangler aldersgruppe eller tema" }, { status: 400 });
  }

  const rules = getAgeGroupRules(age_group);
  const headingForbidden = isHeadingForbidden(age_group);

  const phaseList = phases
    .map((p) => `- ${p.phase}: ${p.duration_minutes} min`)
    .join("\n");

  const userPrompt = `Lag treningsøvelser for:
- Aldersgruppe: ${rules.label}
- Temaer (kombiner disse for en rød tråd): ${themes.map(t => THEME_LABELS[t]).join(" + ")}
- Antall spillere: ${player_count}
- Banestørrelse: ${field_length}m × ${field_width}m
- Heading: ${headingForbidden ? "ABSOLUTT FORBUDT — ingen øvelse skal involvere heading" : rules.heading_label}
- Anbefalt spillform: ${rules.recommended_game_form}
- Maks varighet: ${rules.max_session_duration_minutes} min

Øktstruktur (lag én øvelse per fase):
${phaseList}

Tilpass alle øvelser til nøyaktig ${player_count} spillere og en bane på ${field_length}m × ${field_width}m.
${headingForbidden ? "VIKTIG: Absolutt headingsforbud — ingen del av noen øvelse skal inneholde heading.\n" : ""}${rules.injury_prevention_mandatory ? "VIKTIG: Aldersgruppen KREVER skadeforebyggende trening (Skadefri / FIFA 11+). Du MÅ inkludere øvelser for dette som en del av oppvarmingsfasen." : ""}`;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  try {
    const result = await model.generateContent(userPrompt);
    const raw = result.response.text();

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json(parsed);
    } catch {
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          return NextResponse.json(JSON.parse(match[1]));
        } catch {
          // fall through
        }
      }
      return NextResponse.json({ error: "Kunne ikke tolke AI-svar", raw }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    
    // Fallback-logikk: Standardbase hvis AI feiler
    const fallbackExercises = phases.map((p) => ({
      phase: p.phase,
      name: `${p.phase} - ${THEME_LABELS[themes[0]] || "Standardøvelse"}`,
      duration_minutes: p.duration_minutes,
      description: "Standardøvelse (AI-systemet er midlertidig overbelastet). Fokus på " + (THEME_LABELS[themes[0]] || "basisferdigheter") + ".",
      setup: `Bruk et område på ${Math.floor(field_length/2)}x${Math.floor(field_width/2)}m. ${player_count} spillere fordeles jevnt.`,
      rules: ["Hold ballen i gang", "Høyt tempo"],
      instructions: ["Spill ballen til ledig spiller", "Beveg deg etter pasning", "Kommuniser med lagkamerater"],
      coaching_points: ["Kroppsstilling for å motta", "Presisjon i pasning", "Oversikt"],
      variations: ["Bruk mindre område for å øke press", "Krav om færre touch"]
    }));

    return NextResponse.json({ exercises: fallbackExercises });
  }
}
