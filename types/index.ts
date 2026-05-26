// ============================================================
// ALDERSGRUPPER
// ============================================================

export type AgeGroupKey = "6-7" | "8-9" | "10-12" | "13-14" | "15-16" | "17-18";

export type HeadingRule = "forbidden" | "discouraged" | "controlled" | "functional_only" | "fully_integrated" | "unrestricted";

export type WellbeingStatus = "green" | "yellow" | "red";

export type InjuryRiskLevel = "low" | "low_to_medium" | "medium" | "high";

export type TrainingMethodology = "part_to_whole" | "whole_part_whole";

// ============================================================
// VELVÆRE (SYMPTOMBASERT — INGEN KROPPSMÅL)
// ============================================================

export interface WellbeingReport {
  id: string;
  player_id: string;
  reported_by: "player" | "parent" | "coach";
  status: WellbeingStatus;
  symptoms: WellbeingSymptom[];
  note?: string;
  created_at: string;
  week_number: number;
  year: number;
}

export type WellbeingSymptom =
  | "schlatter"
  | "severs"
  | "general_fatigue"
  | "muscle_soreness"
  | "growing_pains"
  | "low_motivation"
  | "sleep_issues"
  | "other";

export interface WellbeingFlag {
  player_id: string;
  player_name: string;
  status: WellbeingStatus;
  symptoms: WellbeingSymptom[];
  recommendation: string;
  requires_coach_confirmation: boolean;
}

// ============================================================
// SPILLERE
// ============================================================

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number;
  team_id: string;
  position?: PlayerPosition;
  is_active: boolean;
  created_at: string;
  current_wellbeing?: WellbeingStatus;
  age_group: AgeGroupKey;
}

export type PlayerPosition =
  | "goalkeeper"
  | "defender"
  | "midfielder"
  | "forward"
  | "unassigned";

// ============================================================
// LAG
// ============================================================

export interface Team {
  id: string;
  name: string;
  club_name: string;
  age_group: AgeGroupKey;
  coach_id: string;
  season: string;
  players?: Player[];
  created_at: string;
}

// ============================================================
// TRENERE / BRUKERE
// ============================================================

export interface Coach {
  id: string;
  email: string;
  full_name: string;
  club_name?: string;
  role: "coach" | "assistant_coach" | "admin";
  created_at: string;
}

// ============================================================
// TRENINGSØKTER
// ============================================================

export interface TrainingSession {
  id: string;
  team_id: string;
  coach_id: string;
  title: string;
  date: string;
  age_group: AgeGroupKey;
  theme: SessionTheme;
  duration_minutes: number;
  actual_player_count: number;
  planned_player_count: number;
  field_size: FieldSize;
  equipment_available: Equipment;
  session_phases: SessionPhase[];
  wellbeing_flags: WellbeingFlag[];
  constraints_applied: string[];
  created_at: string;
  status: "draft" | "active" | "completed";
}

export type SessionTheme =
  | "pasning_mottak"
  | "dribling_vendinger"
  | "avslutninger"
  | "forsvar"
  | "posisjonsspill"
  | "pressing"
  | "overganger"
  | "keeperteknikk"
  | "fritt_spill";

export interface SessionPhase {
  id: string;
  order: number;
  name: string;
  duration_minutes: number;
  description: string;
  exercises: Exercise[];
  phase_type: "warmup" | "main" | "closing" | "ramp" | "fifa11plus";
}

export interface Exercise {
  id: string;
  name: string;
  duration_minutes: number;
  players_needed: number;
  description: string;
  coaching_points: string[];
  difficulty_level: 1 | 2 | 3;
  equipment_needed: string[];
  ball_rolling_percentage: number;
  differentiation?: ExerciseDifferentiation;
  heading_involved: boolean;
  age_groups_suitable: AgeGroupKey[];
}

export interface ExerciseDifferentiation {
  easier_version: string;
  harder_version: string;
  constraint_for_advanced: string;
}

// ============================================================
// FELTFORHOLD (CONSTRAINTS ENGINE)
// ============================================================

export interface FieldSize {
  length_meters: number;
  width_meters: number;
  is_full_size: boolean;
  has_goals: boolean;
  goal_type: "full" | "small" | "cone_goals" | "none";
}

export interface Equipment {
  balls_available: number;
  cones_available: number;
  bibs_available: number;
  goals_available: number;
  goal_size: "full" | "small" | "cone_goals" | "none";
}

export interface SessionConstraints {
  actual_player_count: number;
  field: FieldSize;
  equipment: Equipment;
  adjustments_made: ConstraintAdjustment[];
}

export interface ConstraintAdjustment {
  type: "player_count" | "field_size" | "equipment";
  description: string;
  original_value: string;
  adjusted_value: string;
}

// ============================================================
// PERIODISERING (UKESSTRUKTUR)
// ============================================================

export type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface WeeklyPlan {
  id: string;
  team_id: string;
  week_number: number;
  year: number;
  match_day?: WeekDay;
  training_days: TrainingDay[];
  created_at: string;
}

export interface TrainingDay {
  day: WeekDay;
  focus: "high_volume" | "sharpness" | "match" | "recovery" | "technical";
  session_id?: string;
  notes?: string;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface GenerateSessionRequest {
  team_id: string;
  age_group: AgeGroupKey;
  theme: SessionTheme;
  actual_player_count: number;
  field: FieldSize;
  equipment: Equipment;
  match_day_context?: "high_volume" | "sharpness" | "recovery";
  wellbeing_overrides?: { player_id: string; status: WellbeingStatus }[];
}
