import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLang, getDictionary } from "@/lib/dict";
import TreningSkjemaKlient from "@/components/TreningSkjemaKlient";

const LOCALE_MAP: Record<string, string> = {
  nb: "nb-NO", sv: "sv-SE", da: "da-DK", en: "en-GB",
};

export default async function RedigerTreningPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const dict = await getDictionary(lang);
  
  const { id } = await params;

  const trening = await prisma.trainingSession.findFirst({
    where: { id, coach_id: session.coachId },
  });

  if (!trening) notFound();

  return (
    <TreningSkjemaKlient 
      dict={dict.training} 
      locale={LOCALE_MAP[lang] ?? "nb-NO"} 
      initialSession={trening} 
    />
  );
}
