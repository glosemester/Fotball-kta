import "server-only";
import { cookies } from "next/headers";

export type Lang = "nb" | "sv" | "da" | "en";
export type Dict = Awaited<ReturnType<typeof getDictionary>>;

const SUPPORTED: Lang[] = ["nb", "sv", "da", "en"];
export const DEFAULT_LANG: Lang = "nb";

export function isValidLang(lang: string): lang is Lang {
  return SUPPORTED.includes(lang as Lang);
}

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("pitchplan-lang")?.value;
  return isValidLang(lang ?? "") ? (lang as Lang) : DEFAULT_LANG;
}

const dictionaries = {
  nb: () => import("../dictionaries/nb.json").then((m) => m.default),
  sv: () => import("../dictionaries/sv.json").then((m) => m.default),
  da: () => import("../dictionaries/da.json").then((m) => m.default),
  en: () => import("../dictionaries/en.json").then((m) => m.default),
};

export async function getDictionary(lang: Lang = DEFAULT_LANG) {
  return dictionaries[lang]();
}
