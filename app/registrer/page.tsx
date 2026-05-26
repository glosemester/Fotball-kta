"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegistrerPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [clubName, setClubName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError("Passordene er ikke like");
      return;
    }
    if (password.length < 8) {
      setError("Passordet må være minst 8 tegn");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/registrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, club_name: clubName, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Noe gikk galt");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-2">⚽</div>
          <CardTitle className="text-2xl">Opprett konto</CardTitle>
          <CardDescription>Kom i gang med Fotball-KTA</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Fullt navn</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Ola Nordmann"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Klubbnavn</label>
              <input
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="Rosenborg BK (valgfritt)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="trener@klubb.no"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Passord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Minst 8 tegn"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Gjenta passord</label>
              <input
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800">
              {loading ? "Oppretter konto..." : "Registrer deg"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Har du allerede konto?{" "}
            <Link href="/login" className="text-green-700 font-medium hover:underline">
              Logg inn
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
