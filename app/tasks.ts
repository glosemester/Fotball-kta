export type TaskId =
  | "workout1"
  | "workout2"
  | "water"
  | "read"
  | "diet"
  | "photo";

export interface TaskDef {
  id: TaskId;
  label: string;
  detail: string;
}

export const TASKS: TaskDef[] = [
  {
    id: "workout1",
    label: "Trening 1 – 45 minutter",
    detail: "Ute eller inne.",
  },
  {
    id: "workout2",
    label: "Trening 2 – 45 minutter",
    detail: "Må være utendørs.",
  },
  {
    id: "water",
    label: "Drikk 4 liter vann",
    detail: "Fordelt utover dagen.",
  },
  {
    id: "read",
    label: "Les 10 sider",
    detail: "I en fagbok / selvutviklingsbok (ikke skjønnlitteratur).",
  },
  {
    id: "diet",
    label: "Følg dietten din",
    detail: "Ingen cheat meals, ingen alkohol.",
  },
  {
    id: "photo",
    label: "Ta et fremgangsbilde",
    detail: "Ett bilde hver dag.",
  },
];

export const TOTAL_DAYS = 75;
