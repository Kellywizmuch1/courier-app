"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Customer = {
  id: string;
  email: string | null;
  created_at: string | null;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      router.replace("/login");
      return;
    }

    const email = session.user.email?.toLowerCase();

    if (email !== "michealkellywiz@gmail.com") {
      alert(
        "You do not have permission to access the admin dashboard."
      );

      router.replace("/dashboard");
      return;
    }

    await loadUsers();

    setLoading(false);
  }

  async function loadUsers() {
    /*
      Supabase normally does NOT allow the browser
      to directly read auth.users.

      So we use the customer_profiles table.

      Make sure this table exists with:
        id
        email
        created_at
    */

    const { data, error } = await supabase
      .from("customer_profiles")
      .select("id, email, created_at")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("USERS ERROR:", error);

      alert(
        "Could not load customers:\n\n" +
          error.message
      );

      setUsers([]);
      return;
    }

    setUsers(data || []);
  }

  async function refreshUsers() {
    setRefreshing(true);

    await loadUsers();

    setRefreshing(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Loading customers...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-7">

            <div>

              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Customer Management
              </h1>

              <p className="text-blue-200 mt-2">
                View customers registered with Atlas Express.
              </p>

            </div>

            <button
              onClick={refreshUsers}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/10 px-6 py-3 rounded-xl font-black transition"
            >

              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Customers"}

            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* STAT */}

        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

              <Users
                size={24}
                className="text-blue-800"
              />

            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Total Customers
            </p>

            <p className="text-3xl font-black mt-1">
              {users.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

              <ShieldCheck
                size={24}
                className="text-green-600"
              />

            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Account System
            </p>

            <p className="text-xl font-black mt-1">
              Active
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">

              <User
                size={24}
                className="text-orange-600"
              />

            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Admin
            </p>

            <p className="text-sm font-black mt-2 break-all">
              michealkellywiz@gmail.com
            </p>

          </div>

        </div>

        {/* CUSTOMER LIST */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-200">

            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Registered Customers
            </p>

            <h2 className="text-2xl md:text-3xl font-black mt-1">
              Customer Accounts
            </h2>

          </div>

          {users.length === 0 ? (

            <div className="p-12 text-center">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">

                <Users
                  size={30}
                  className="text-slate-400"
                />

              </div>

              <h3 className="text-2xl font-black mt-6">
                No customers found
              </h3>

              <p className="text-slate-500 mt-2">
                Customer accounts will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {users.map((user, index) => (

                <div
                  key={user.id}
                  className="p-6 hover:bg-slate-50 transition"
                >

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                        <User
                          size={22}
                          className="text-blue-800"
                        />

                      </div>

                      <div>

                        <p className="font-black">
                          Customer #{index + 1}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          {user.email ||
                            "Email unavailable"}
                        </p>

                      </div>

                    </div>

                    <div className="text-sm text-slate-500">

                      <span className="font-bold">
                        Registered:
                      </span>{" "}

                      {user.created_at
                        ? new Date(
                            user.created_at
                          ).toLocaleDateString()
                        : "Unknown"}

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}