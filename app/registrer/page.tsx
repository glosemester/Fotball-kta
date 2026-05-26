"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegistrerPage() {
  const [fullName, setFullName] = useState("");
  const [clubName, setClubName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError("Passordene er ikke like"); return; }
    if (password.length < 8) { setError("Passordet må være minst 8 tegn"); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/registrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, club_name: clubName, email, password }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Noe gikk galt"); setLoading(false); return; }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#0B0F1A] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#4F7EFF]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-white">Opprett konto</h1>
          <p className="text-[#94A3B8] text-sm">Kom i gang med FotballKTA</p>
        </div>

        <div className="bg-[#141929] border border-white/[0.07] rounded-2xl p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Fullt navn</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ola Nordmann" className="input-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Klubbnavn <span className="text-[#4E5A72]">(valgfritt)</span></label>
              <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Rosenborg BK" className="input-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">E-post</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="trener@klubb.no" className="input-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Passord</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Minst 8 tegn" className="input-dark" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#94A3B8]">Gjenta passord</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required autoComplete="new-password" className="input-dark" />
            </div>

            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3">
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Oppretter konto..." : "Registrer deg"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#4E5A72]">
          Har du allerede konto?{" "}
          <Link href="/login" className="text-[#4F7EFF] font-medium hover:text-[#3B6BF5]">Logg inn</Link>
        </p>
      </div>
    </main>
  );
}
