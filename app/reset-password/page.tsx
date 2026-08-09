"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(
        "This password reset link is invalid or has expired."
      );
    }

    setCheckingSession(false);
  }

  async function handleResetPassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "Password updated successfully! Redirecting to login..."
    );

    setTimeout(async () => {
      await supabase.auth.signOut();
      router.push("/login");
    }, 2000);
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold">
            Checking password reset...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">

        <h1 className="text-4xl font-black text-center text-blue-900">
          Atlas Express
        </h1>

        <p className="text-center text-slate-500 mt-3">
          Reset Your Password
        </p>

        {error ? (
          <div className="mt-8">

            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-5 font-semibold">
              {error}
            </div>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full mt-5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl py-4 font-bold transition"
            >
              Back to Login
            </button>

          </div>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="space-y-5 mt-10"
          >

            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
                required
              />

            </div>

            <div>

              <label className="block text-sm font-bold text-slate-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
                required
              />

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
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl py-4 font-black transition"
            >
              {loading
                ? "Updating Password..."
                : "Update Password"}
            </button>

          </form>
        )}

      </div>

    </main>
  );
}