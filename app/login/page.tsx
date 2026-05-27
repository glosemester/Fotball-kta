import { getLang, getDictionary } from "@/lib/dict";
import LoginKlient from "./LoginKlient";

export default async function LoginPage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  return <LoginKlient dict={dict.auth.login} />;
}
