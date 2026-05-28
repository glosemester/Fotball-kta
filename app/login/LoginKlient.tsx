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
    <main className="min-h-screen bg-[#0A0F14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">{dict.title}</h1>
          <p className="text-[#94A3B8] text-sm">{dict.subtitle}</p>
        </div>

        <a href="/api/auth/google"
          className="flex items-center justify-center gap-2.5 w-full rounded-[8px] bg-[#141D26] border border-[#2E4057] px-5 py-3 text-[#F8FAFC] font-semibold text-sm hover:bg-[#1E2D3D] hover:border-[#22C55E]/40 transition-all shadow-sm">
          <GoogleIcon />
          Fortsett med Google
        </a>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2E4057]" />
          <span className="text-xs text-[#94A3B8]">eller</span>
          <div className="flex-1 h-px bg-[#2E4057]" />
        </div>

        <div className="bg-[#141D26] rounded-xl shadow-sm border border-[#2E4057] p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="trener@klubb.no" className="input-field" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">{dict.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="input-field" />
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
          {dict.no_account}{" "}
          <Link href="/registrer" className="text-[#22C55E] font-medium hover:underline">{dict.register_link}</Link>
        </p>
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
