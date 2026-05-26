import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo / Ikon */}
        <div className="text-7xl">⚽</div>

        {/* Tittel */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Fotball-KTA
          </h1>
          <p className="text-green-200 text-xl">
            AI-drevet treningsplanlegging for barne- og ungdomsfotball
          </p>
          <p className="text-green-300 text-sm max-w-md mx-auto">
            Basert på retningslinjer fra NFF · SvFF · DBU · The FA · RFEF · KNVB
          </p>
        </div>

        {/* Filosofi */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-left space-y-2">
          <p className="text-green-100 text-sm font-semibold uppercase tracking-wider">Vår filosofi</p>
          <p className="text-white text-xl font-medium">
            "Flest mulig · Lengst mulig · Best mulig"
          </p>
          <p className="text-green-200 text-sm">
            Trygghet → Mestring → Trivsel. AI tilpasset norsk grasrotfotball.
          </p>
        </div>

        {/* Knapper */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-green-900 font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
          >
            Gå til dashboard →
          </Link>
          <Link
            href="/dashboard/treninger/ny"
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/50 px-8 py-4 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Lag treningsøkt
          </Link>
        </div>

        {/* Aldersgruppe-chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["6–7 år", "8–9 år", "10–12 år", "13–14 år", "15–16 år", "17–18 år"].map((age) => (
            <span
              key={age}
              className="rounded-full bg-white/20 px-3 py-1 text-xs text-white font-medium"
            >
              {age}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
