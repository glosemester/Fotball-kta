import ageGroupsData from "./age-groups.json";
import type { AgeGroupKey, WellbeingStatus } from "@/types";

type AgeGroupRules = typeof ageGroupsData.age_groups_rules;
type SingleGroupRule = AgeGroupRules[keyof AgeGroupRules];

export function getAgeGroupRules(ageGroup: AgeGroupKey): SingleGroupRule {
  const rules = ageGroupsData.age_groups_rules[ageGroup as keyof AgeGroupRules];
  if (!rules) {
    throw new Error(`Ugyldig aldersgruppe: ${ageGroup}`);
  }
  return rules;
}

export function getHeadingLabel(ageGroup: AgeGroupKey): string {
  const rules = getAgeGroupRules(ageGroup);
  return rules.heading_label;
}

export function isHeadingForbidden(ageGroup: AgeGroupKey): boolean {
  const rules = getAgeGroupRules(ageGroup);
  return rules.heading_rule === "forbidden";
}

export function isHeadingDiscouraged(ageGroup: AgeGroupKey): boolean {
  const rules = getAgeGroupRules(ageGroup);
  return rules.heading_rule === "discouraged";
}

export function getSessionDuration(ageGroup: AgeGroupKey): { min: number; max: number } {
  const rules = getAgeGroupRules(ageGroup);
  return {
    min: rules.min_session_duration_minutes,
    max: rules.max_session_duration_minutes,
  };
}

export function getWellbeingRecommendation(
  ageGroup: AgeGroupKey,
  status: WellbeingStatus
): { recommendation: string; modifications: string[] } {
  const rules = getAgeGroupRules(ageGroup);

  if (status === "green") {
    return {
      recommendation: "Klar for full belastning. Normal treningsplan.",
      modifications: [],
    };
  }

  const loadMgmt = (rules as { load_management?: { yellow_flag_recommendations?: string[]; red_flag_recommendations?: string[] } }).load_management;

  if (status === "yellow") {
    return {
      recommendation: "Redusert intensitet anbefalt. Bruk spilleren som nøytral.",
      modifications: loadMgmt?.yellow_flag_recommendations ?? [
        "Reduser plyometrisk volum (hopp og sprint)",
        "La spilleren være nøytral i posisjonsspill",
        "Unngå maksimale akselerasjoner",
      ],
    };
  }

  return {
    recommendation: "Kun tekniske stasjoner uten løp. Vurder full hvile.",
    modifications: loadMgmt?.red_flag_recommendations ?? [
      "Kun teknisk deltakelse uten løping",
      "Kontakt foreldre umiddelbart",
      "Medisinsk vurdering anbefales",
    ],
  };
}

export function getBallRollingTarget(ageGroup: AgeGroupKey): number {
  const rules = getAgeGroupRules(ageGroup);
  return rules.target_ball_rolling_time_percentage;
}

export function requiresFifa11Plus(ageGroup: AgeGroupKey): boolean {
  const rules = getAgeGroupRules(ageGroup);
  return (rules as { session_structure?: { fifa_11plus?: boolean } }).session_structure?.fifa_11plus === true;
}

export function requiresWellbeingCheck(ageGroup: AgeGroupKey): boolean {
  const rules = getAgeGroupRules(ageGroup);
  return (rules as { wellbeing_check_mandatory?: boolean }).wellbeing_check_mandatory === true;
}

export function getAgeGroupFromBirthYear(birthYear: number): AgeGroupKey {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  if (age <= 7) return "6-7";
  if (age <= 9) return "8-9";
  if (age <= 12) return "10-12";
  if (age <= 14) return "13-14";
  if (age <= 16) return "15-16";
  return "17-18";
}

export function getAllAgeGroups(): { key: AgeGroupKey; label: string }[] {
  return [
    { key: "6-7", label: "6–7 år" },
    { key: "8-9", label: "8–9 år" },
    { key: "10-12", label: "10–12 år" },
    { key: "13-14", label: "13–14 år" },
    { key: "15-16", label: "15–16 år" },
    { key: "17-18", label: "17–18 år" },
  ];
}

export { ageGroupsData };
