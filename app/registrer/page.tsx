import { getLang, getDictionary } from "@/lib/dict";
import RegistrerKlient from "./RegistrerKlient";

export default async function RegistrerPage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  return <RegistrerKlient dict={dict.auth.register} />;
}
