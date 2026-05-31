import { Suspense } from "react";
import { getLang, getDictionary } from "@/lib/dict";
import LoginKlient from "./LoginKlient";

export default async function LoginPage() {
  const lang = await getLang();
  const dict = await getDictionary(lang);
  return (
    <Suspense>
      <LoginKlient dict={dict.auth.login} />
    </Suspense>
  );
}
