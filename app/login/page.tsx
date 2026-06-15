"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        placeholder="Password"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa8c41] focus:border-transparent"
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-[#fa8c41] hover:bg-[#e87a30] text-white font-medium rounded-lg transition disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#132452] px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#132452] flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#fa8c41]" />
          </div>
          <h1 className="text-xl font-semibold text-[#132452]">
            SC Restructure Dashboard
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Enter the team password to continue.
          </p>
        </div>

        <Suspense fallback={<div className="text-sm text-gray-500 text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
