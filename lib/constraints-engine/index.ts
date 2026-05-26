import type { AgeGroupKey, ConstraintAdjustment, Equipment, FieldSize, SessionConstraints } from "@/types";
import { getAgeGroupRules } from "@/lib/rules-engine";

export function applyConstraints(
  ageGroup: AgeGroupKey,
  actualPlayerCount: number,
  plannedPlayerCount: number,
  field: FieldSize,
  equipment: Equipment
): SessionConstraints {
  const adjustments: ConstraintAdjustment[] = [];
  const rules = getAgeGroupRules(ageGroup);

  let adjustedField = { ...field };
  let adjustedEquipment = { ...equipment };

  // --- SPILLERANTALL-JUSTERING ---
  if (actualPlayerCount !== plannedPlayerCount) {
    const difference = plannedPlayerCount - actualPlayerCount;
    if (difference > 0) {
      adjustments.push({
        type: "player_count",
        description: `${difference} færre spillere enn planlagt. Øvelser tilpasses til oddetalls-formasjoner med nøytrale spillere.`,
        original_value: `${plannedPlayerCount} spillere`,
        adjusted_value: `${actualPlayerCount} spillere`,
      });
    }
  }

  // --- BANE-JUSTERING ---
  const fieldRules = rules.field_dimensions;
  if (field.length_meters < fieldRules.length_min) {
    const scaleFactor = field.length_meters / fieldRules.length_min;
    adjustedField = {
      ...adjustedField,
      length_meters: field.length_meters,
      width_meters: Math.max(field.width_meters * scaleFactor, fieldRules.width_min * 0.6),
    };
    adjustments.push({
      type: "field_size",
      description: `Banen er mindre enn anbefalt (${field.length_meters}m mot anbefalt min ${fieldRules.length_min}m). Kjegleavstander skaleres ned for å bevare intensitet.`,
      original_value: `${fieldRules.length_min}–${fieldRules.length_max}m x ${fieldRules.width_min}–${fieldRules.width_max}m`,
      adjusted_value: `${field.length_meters}m x ${field.width_meters}m`,
    });
  }

  // --- UTSTYR-JUSTERING ---
  if (equipment.goal_size === "none" || equipment.goals_available === 0) {
    adjustedEquipment = { ...adjustedEquipment, goal_size: "cone_goals" };
    adjustments.push({
      type: "equipment",
      description: "Ingen mål tilgjengelig. Øvelsene bruker kjegleporter i stedet for mål.",
      original_value: "Mål tilgjengelig",
      adjusted_value: "Kjegleporter",
    });
  } else if (equipment.goal_size === "small" && ageGroup === "13-14" || ageGroup === "15-16" || ageGroup === "17-18") {
    adjustments.push({
      type: "equipment",
      description: "Kun små mål tilgjengelig for en aldersgruppe som normalt bruker fulle mål. Avslutningsøvelser tilpasses.",
      original_value: "Fulle mål (7,32m x 2,44m)",
      adjusted_value: "Små mål",
    });
  }

  if (equipment.balls_available < actualPlayerCount) {
    adjustments.push({
      type: "equipment",
      description: `Kun ${equipment.balls_available} baller for ${actualPlayerCount} spillere. Tekniske stasjoner deles opp i par-øvelser.`,
      original_value: `${actualPlayerCount} baller (1 per spiller)`,
      adjusted_value: `${equipment.balls_available} baller`,
    });
  }

  return {
    actual_player_count: actualPlayerCount,
    field: adjustedField,
    equipment: adjustedEquipment,
    adjustments_made: adjustments,
  };
}

export function getRecommendedGameForm(
  ageGroup: AgeGroupKey,
  actualPlayerCount: number
): { form: string; description: string } {
  const totalPlayers = actualPlayerCount;

  if (ageGroup === "6-7") {
    return { form: "3v3", description: "3 vs 3 — ingen keeper. Bruk ekstra spillere som rotatorer." };
  }

  if (ageGroup === "8-9") {
    if (totalPlayers < 10) {
      return { form: "4v4", description: `Kun ${totalPlayers} spillere. 4 vs 4 med keeper (redusert fra 5v5).` };
    }
    return { form: "5v5", description: "5 vs 5 med keeper — anbefalt format." };
  }

  if (ageGroup === "10-12") {
    if (totalPlayers < 14) {
      return { form: "6v6", description: `${totalPlayers} spillere. 6 vs 6 (redusert fra 7v7).` };
    }
    if (totalPlayers < 18) {
      return { form: "7v7", description: "7 vs 7 med keeper." };
    }
    return { form: "9v9", description: "9 vs 9 med keeper." };
  }

  if (ageGroup === "13-14") {
    if (totalPlayers < 18) {
      return { form: "9v9", description: `${totalPlayers} spillere. 9 vs 9 (redusert fra 11v11).` };
    }
    return { form: "11v11", description: "11 vs 11 — fullt format." };
  }

  if (totalPlayers < 18) {
    return { form: "9v9", description: `${totalPlayers} spillere. 9 vs 9 (tilpasset format).` };
  }
  return { form: "11v11", description: "11 vs 11 — fullt format." };
}

export function getOddPlayerSolution(
  ageGroup: AgeGroupKey,
  playerCount: number
): string {
  if (playerCount % 2 === 0) return "";

  const solutions: Record<string, string> = {
    "6-7": "En spiller er 'fri mann' (nøytral) og spiller alltid for laget som har ballen.",
    "8-9": "En spiller er nøytral/joker og gir alltid laget med ball et overtall.",
    "10-12": "En spiller er 'frispiller' (nøytral) — perfekt for å trene spillbarhet og posisjonering.",
    "13-14": "Oddetall løses med rullerende hvile (1 spiller hviler 5 min) eller med en 'fri mann' som alltid angriper.",
    "15-16": "Oddetall løses med rullerende hvile eller ekstra keeper.",
    "17-18": "Oddetall løses med rullerende hvile eller ekstra forsvarer.",
  };

  return solutions[ageGroup] ?? "La en spiller være nøytral/fri mann.";
}
