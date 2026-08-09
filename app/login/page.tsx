"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

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

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    setResetLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    setResetLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Password reset email sent. Check your email inbox."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <h1 className="text-4xl font-bold text-center text-blue-900">
          Atlas Express
        </h1>

        <p className="text-center text-slate-500 mt-3">
          Admin Login
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5 mt-10"
        >

          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-xl p-4 text-slate-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl p-4 text-slate-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-right">

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-blue-700 hover:text-orange-500 font-semibold text-sm transition"
            >
              {resetLoading
                ? "Sending..."
                : "Forgot password?"}
            </button>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm font-semibold">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl py-4 font-semibold transition"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

        </form>

      </div>

    </main>
  );
}