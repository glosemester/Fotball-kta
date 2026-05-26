import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center px-4 overflow-hidden relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#4F7EFF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-lg w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="text-7xl">⚽</div>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            Fotball<span className="text-[#4F7EFF]">KTA</span>
          </h1>
          <p className="text-[#94A3B8] text-lg">
            AI-drevet treningsplanlegging for barne- og ungdomsfotball
          </p>
          <p className="text-[#4E5A72] text-sm">NFF · SvFF · DBU · The FA · RFEF · KNVB</p>
        </div>

        <div className="bg-[#141929] border border-white/[0.07] rounded-2xl p-5 text-left">
          <p className="text-[#4F7EFF] text-xs font-semibold uppercase tracking-widest mb-2">Filosofi</p>
          <p className="text-white text-xl font-semibold leading-snug">
            "Flest mulig · Lengst mulig · Best mulig"
          </p>
          <p className="text-[#94A3B8] text-sm mt-2">Trygghet → Mestring → Trivsel</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#4F7EFF] px-6 py-3.5 text-white font-semibold text-base hover:bg-[#3B6BF5] transition-colors shadow-lg shadow-blue-900/30"
          >
            Logg inn
          </Link>
          <Link
            href="/registrer"
            className="flex-1 inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-white font-semibold text-base hover:bg-white/10 transition-colors"
          >
            Registrer deg
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {["6–7 år", "8–9 år", "10–12 år", "13–14 år", "15–16 år", "17–18 år"].map((age) => (
            <span key={age} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#94A3B8] font-medium">
              {age}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
