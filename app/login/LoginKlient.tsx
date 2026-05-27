"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LoginDict {
  title: string; subtitle: string; email: string; password: string;
  submit: string; loading: string; error: string; no_account: string; register_link: string;
}

export default function LoginKlient({ dict }: { dict: LoginDict }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || dict.error); setLoading(false); return; }
    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#EDE9FF] via-[#F0EEFF] to-[#E0EAFF] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{dict.title}</h1>
          <p className="text-[#64748B] text-sm">{dict.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E4E2F5] p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A2E]">{dict.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="trener@klubb.no" className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#1A1A2E]">{dict.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="input-field" />
            </div>
            {error && (
              <div className="bg-[#DC2626]/8 border border-[#DC2626]/15 rounded-xl px-4 py-3">
                <p className="text-sm text-[#DC2626]">{error}</p>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? dict.loading : dict.submit}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#94A3B8]">
          {dict.no_account}{" "}
          <Link href="/registrer" className="text-[#6D28D9] font-medium hover:text-[#5B21B6]">{dict.register_link}</Link>
        </p>
      </div>
    </main>
  );
}
