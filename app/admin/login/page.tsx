"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md">

        {/* BRAND */}

        <div className="text-center">

          <div className="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center mx-auto">

            <span className="text-orange-500 text-2xl font-black">
              AE
            </span>

          </div>

          <h1 className="text-3xl font-black text-blue-900 mt-5">
            Atlas Express
          </h1>

          <p className="text-slate-500 mt-2 font-semibold">
            Administrator Login
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-5 mt-8"
        >

          <div>

            <label className="block text-sm font-black text-slate-700 mb-2">
              Administrator Email
            </label>

            <input
              type="email"
              required
              placeholder="Enter administrator email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
            />

          </div>

          <div>

            <label className="block text-sm font-black text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              required
              placeholder="Enter administrator password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">

              <p className="text-red-600 text-sm font-bold">
                {error}
              </p>

            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl py-4 font-black text-lg transition"
          >
            {loading ? "Signing In..." : "Administrator Login"}
          </button>

        </form>

        <p className="text-center text-xs text-slate-400 mt-8">
          Atlas Express Administration
        </p>

      </div>

    </main>
  );
}