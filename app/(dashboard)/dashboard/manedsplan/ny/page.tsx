import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ManedsplanKlient from "@/components/ManedsplanKlient";

export default async function NyManedsplanPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ManedsplanKlient />;
}
