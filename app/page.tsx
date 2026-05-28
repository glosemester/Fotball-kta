import Link from "next/link";
import PitchPlanLogo from "@/components/PitchPlanLogo";
import { CalendarDays, Brain, Activity, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-drevet planlegging",
    desc: "Generer tilpassede øvelser basert på aldersgruppe, antall spillere og feltforhold.",
  },
  {
    icon: CalendarDays,
    title: "Kalender & kamper",
    desc: "Importer kamprogrammet fra fotball.no og planlegg belastningen uke for uke.",
  },
  {
    icon: Activity,
    title: "Velvære-oversikt",
    desc: "Hold styr på spillernes form med rask Grønn/Gul/Rød-registrering før trening.",
  },
  {
    icon: Users,
    title: "Lag & spillere",
    desc: "Administrer alle lagene dine med spillerlister, posisjoner og aldersgrupper.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0F14]">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-12 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Logo mark */}
          <div className="w-20 h-20 rounded-3xl bg-[#141D26] shadow-lg shadow-black/40 flex items-center justify-center border border-[#2E4057]">
            <PitchPlanLogo size={52} />
          </div>

          {/* Wordmark */}
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-[#F8FAFC]">
              Pitch<span className="text-[#22C55E]">Plan</span>
            </h1>
            <p className="text-[#94A3B8] text-lg mt-2 font-medium">
              AI-drevet treningsplanlegging for barne- og ungdomsfotball
            </p>
          </div>

          {/* Badge row */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-1">
            {["NFF", "SvFF", "DBU", "The FA"].map((org) => (
              <span key={org} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#141D26] border border-[#2E4057] text-[#22C55E] shadow-sm">
                {org}
              </span>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link
            href="/api/auth/google"
            className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-[8px] bg-[#141D26] border border-[#2E4057] px-5 py-3.5 text-[#F8FAFC] font-semibold text-sm hover:bg-[#1E2D3D] hover:border-[#22C55E]/40 transition-all shadow-sm"
          >
            <GoogleIcon />
            Fortsett med Google
          </Link>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center rounded-[8px] bg-[#22C55E] px-5 py-3.5 text-[#0A0F14] font-bold text-sm uppercase tracking-wide hover:bg-[#16A34A] transition-colors shadow-sm shadow-[#22C55E]/20"
          >
            Logg inn
          </Link>
        </div>

        <p className="text-xs text-[#94A3B8] mt-4">
          Ingen konto?{" "}
          <Link href="/registrer" className="text-[#22C55E] font-medium hover:underline">
            Registrer deg gratis
          </Link>
        </p>
      </div>

      {/* Filosofi-banner */}
      <div className="max-w-lg mx-auto px-4 mb-10">
        <div className="bg-[#141D26] rounded-xl border border-[#2E4057] p-5 text-center shadow-sm">
          <p className="text-[#22C55E] text-xs font-bold uppercase tracking-widest mb-1.5">Filosofi</p>
          <p className="text-[#F8FAFC] text-xl font-bold leading-snug">
            "Flest mulig · Lengst mulig · Best mulig"
          </p>
          <p className="text-[#94A3B8] text-sm mt-1.5">Trygghet → Mestring → Trivsel</p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="max-w-lg mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#141D26] rounded-xl border border-[#2E4057] p-4 shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-[#1E2D3D] flex items-center justify-center mb-3">
                <Icon className="h-4.5 w-4.5 text-[#22C55E]" style={{ width: 18, height: 18 }} />
              </div>
              <p className="font-semibold text-[#F8FAFC] text-sm mb-1">{title}</p>
              <p className="text-xs text-[#94A3B8] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
