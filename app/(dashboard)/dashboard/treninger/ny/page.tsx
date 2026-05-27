import { getLang, getDictionary } from "@/lib/dict";
import NyTreningsøktKlient from "./NyTreningsøktKlient";

const LOCALE_MAP: Record<string, string> = {
  nb: "nb-NO", sv: "sv-SE", da: "da-DK", en: "en-GB",
};

export default async function NyTreningsøktPage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  return <NyTreningsøktKlient dict={dict.training} locale={LOCALE_MAP[lang] ?? "nb-NO"} />;
}
