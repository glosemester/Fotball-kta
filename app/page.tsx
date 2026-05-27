import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EDE9FF] via-[#F0EEFF] to-[#E0EAFF] flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="text-7xl">⚽</div>
          <h1 className="text-5xl font-bold text-[#1A1A2E] tracking-tight">
            Pitch<span className="text-[#6D28D9]">Plan</span>
          </h1>
          <p className="text-[#64748B] text-lg">
            AI-drevet treningsplanlegging for barne- og ungdomsfotball
          </p>
          <p className="text-[#94A3B8] text-sm">NFF · SvFF · DBU · The FA · RFEF · KNVB</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E4E2F5] p-5 text-left">
          <p className="text-[#6D28D9] text-xs font-semibold uppercase tracking-widest mb-2">Filosofi</p>
          <p className="text-[#1A1A2E] text-xl font-semibold leading-snug">
            "Flest mulig · Lengst mulig · Best mulig"
          </p>
          <p className="text-[#64748B] text-sm mt-2">Trygghet → Mestring → Trivsel</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-[#2563EB] px-6 py-3.5 text-white font-semibold text-base hover:bg-[#1D4ED8] transition-colors shadow-sm shadow-blue-200"
          >
            Logg inn
          </Link>
          <Link
            href="/registrer"
            className="flex-1 inline-flex items-center justify-center rounded-2xl border border-[#E4E2F5] bg-white px-6 py-3.5 text-[#1A1A2E] font-semibold text-base hover:bg-[#F8F7FF] transition-colors"
          >
            Registrer deg
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {["6–7 år", "8–9 år", "10–12 år", "13–14 år", "15–16 år", "17–18 år"].map((age) => (
            <span key={age} className="rounded-full bg-white border border-[#E4E2F5] px-3 py-1 text-xs text-[#64748B] font-medium shadow-sm">
              {age}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
