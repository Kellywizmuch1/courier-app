"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Package,
  ArrowLeft,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [bookingsCount, setBookingsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.replace("/login");
      return;
    }

    setUserEmail(session.user.email || "");
    setUserId(session.user.id);

    const { count, error } = await supabase
      .from("bookings")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", session.user.id);

    if (!error) {
      setBookingsCount(count || 0);
    }

    setLoading(false);
  }

  async function refreshAccount() {
    setRefreshing(true);
    await loadAccount();
    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="mt-8">

            <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
              Atlas Express
            </p>

            <h1 className="text-4xl md:text-5xl font-black mt-2">
              My Account
            </h1>

            <p className="text-blue-200 mt-2">
              Manage your Atlas Express account information.
            </p>

          </div>

        </div>
      </header>

      {/* CONTENT */}

      <section className="max-w-5xl mx-auto px-6 py-10">

        {/* PROFILE CARD */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-slate-950 text-white p-8">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">
                <User size={32} />
              </div>

              <div>

                <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
                  Customer Account
                </p>

                <h2 className="text-2xl md:text-3xl font-black mt-1">
                  Account Information
                </h2>

              </div>

            </div>

          </div>

          <div className="p-8">

            {/* EMAIL */}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail
                    size={21}
                    className="text-blue-800"
                  />
                </div>

                <div>

                  <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                    Email Address
                  </p>

                  <p className="font-black text-lg mt-1 break-all">
                    {userEmail}
                  </p>

                </div>

              </div>

            </div>

            {/* USER ID */}

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-4">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <User
                    size={21}
                    className="text-purple-700"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                    Customer ID
                  </p>

                  <p className="font-mono text-sm mt-1 break-all text-slate-700">
                    {userId}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* SHIPMENT SUMMARY */}

        <div className="grid md:grid-cols-2 gap-5 mt-6">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package
                size={24}
                className="text-orange-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Total Shipments
            </p>

            <p className="text-4xl font-black mt-1">
              {bookingsCount}
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Shipments connected to your account.
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <RefreshCw
                size={24}
                className="text-blue-700"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Account Status
            </p>

            <p className="text-2xl font-black mt-1 text-green-600">
              Active
            </p>

            <button
              onClick={refreshAccount}
              disabled={refreshing}
              className="inline-flex items-center gap-2 mt-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-black transition"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Account"}
            </button>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-6">

          <h2 className="text-2xl font-black">
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">

            <Link
              href="/dashboard"
              className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-5 py-4 font-black text-center transition"
            >
              View My Shipments
            </Link>

            <Link
              href="/book"
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-5 py-4 font-black text-center transition"
            >
              Book a Delivery
            </Link>

            <Link
              href="/track"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-4 font-black text-center transition"
            >
              Track a Shipment
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-4 font-black transition inline-flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}