"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RegisterDict {
  title: string; subtitle: string; full_name: string; full_name_placeholder: string;
  club_name: string; club_name_placeholder: string; email: string; email_placeholder: string;
  password: string; password_placeholder: string; confirm_password: string;
  submit: string; loading: string; has_account: string; login_link: string;
  error_mismatch: string; error_too_short: string;
}

export default function RegistrerKlient({ dict }: { dict: RegisterDict }) {
  const [fullName, setFullName] = useState("");
  const [clubName, setClubName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== password2) { setError(dict.error_mismatch); return; }
    if (password.length < 8) { setError(dict.error_too_short); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth/registrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: fullName, club_name: clubName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Hmm, vi satt fast i offside. Prøv igjen om litt."); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-[#0A0F14] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">{dict.title}</h1>
          <p className="text-[#94A3B8] text-sm">{dict.subtitle}</p>
        </div>

        <div className="bg-[#141D26] rounded-xl shadow-sm border border-[#2E4057] p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.full_name}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder={dict.full_name_placeholder} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.club_name}</label>
              <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder={dict.club_name_placeholder} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder={dict.email_placeholder} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder={dict.password_placeholder} className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.confirm_password}</label>
              <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required autoComplete="new-password" className="input-field" />
            </div>
            {error && (
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-4 py-3">
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? dict.loading : dict.submit}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#94A3B8]">
          {dict.has_account}{" "}
          <Link href="/login" className="text-[#22C55E] font-medium hover:underline">{dict.login_link}</Link>
        </p>
      </div>
    </main>
  );
}
