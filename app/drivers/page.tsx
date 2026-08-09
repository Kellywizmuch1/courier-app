"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function DriversPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [driver, setDriver] = useState<any>(null);

  useEffect(() => {
    loadDriver();
  }, []);

  async function loadDriver() {
    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error("Driver lookup failed:", error);
      setMessage(
        "We couldn't load your driver account right now. Please try again."
      );
      setLoading(false);
      return;
    }

    if (!data) {
      setMessage(
        "This login is not connected to a driver account yet."
      );
      setLoading(false);
      return;
    }

    setDriver(data);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 text-xl font-bold">
            Loading driver account...
          </p>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-white text-slate-900 rounded-3xl shadow-2xl p-8 text-center">

          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mx-auto">
            🚚
          </div>

          <h1 className="text-3xl font-black mt-5">
            Driver Account
          </h1>

          <p className="text-slate-500 mt-3 leading-7">
            {message}
          </p>

          <button
            onClick={loadDriver}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Try Again
          </button>

          <button
            onClick={handleLogout}
            className="mt-3 block w-full text-slate-500 hover:text-slate-900 font-semibold"
          >
            Logout
          </button>

        </div>
      </main>
    );
  }

  const driverName =
    driver?.name ||
    driver?.full_name ||
    driver?.driver_name ||
    "Driver";

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>
            <p className="text-orange-500 font-bold uppercase tracking-wider text-sm">
              Atlas Express
            </p>

            <h1 className="text-4xl md:text-5xl font-black mt-2">
              Driver Dashboard
            </h1>

            <p className="text-slate-400 mt-3">
              Welcome back,{" "}
              <span className="text-white font-bold">
                {driverName}
              </span>
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-xl font-bold"
          >
            Logout
          </button>

        </div>

        {/* DRIVER STATS */}

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white text-slate-900 rounded-3xl p-7 shadow-xl">

            <p className="text-sm uppercase font-bold text-slate-400">
              Driver
            </p>

            <h2 className="text-2xl font-black mt-2">
              {driverName}
            </h2>

          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-7 shadow-xl">

            <p className="text-sm uppercase font-bold text-slate-400">
              Phone
            </p>

            <h2 className="text-2xl font-black mt-2">
              {driver?.phone || "Not provided"}
            </h2>

          </div>

          <div className="bg-white text-slate-900 rounded-3xl p-7 shadow-xl">

            <p className="text-sm uppercase font-bold text-slate-400">
              Status
            </p>

            <h2 className="text-2xl font-black mt-2 text-green-600">
              Active
            </h2>

          </div>

        </div>

        {/* DRIVER ACCOUNT */}

        <div className="mt-8 bg-white text-slate-900 rounded-3xl shadow-xl p-8">

          <h2 className="text-2xl font-black">
            Driver Account
          </h2>

          <p className="text-slate-500 mt-2">
            Your driver account is successfully connected
            to Atlas Express.
          </p>

          <div className="mt-6 bg-slate-50 rounded-2xl p-5">

            <p className="text-sm font-bold text-slate-400">
              Driver ID
            </p>

            <p className="font-mono font-bold mt-2 break-all">
              {driver?.id || "Not available"}
            </p>

          </div>

        </div>

        {/* NEXT SECTION */}

        <div className="mt-8 bg-blue-900 rounded-3xl p-8 shadow-xl">

          <p className="text-orange-400 text-sm font-bold uppercase tracking-wider">
            Driver Operations
          </p>

          <h2 className="text-3xl font-black mt-2">
            Your deliveries
          </h2>

          <p className="text-blue-100 mt-3 leading-7 max-w-2xl">
            Your assigned shipments will appear here.
            From this dashboard, drivers will be able to
            view deliveries, update shipment locations,
            and report delivery problems.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-2xl">📦</p>
              <p className="font-black mt-3">
                Assigned Shipments
              </p>
              <p className="text-blue-200 text-sm mt-1">
                View packages assigned to you.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-2xl">📍</p>
              <p className="font-black mt-3">
                Update Location
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Keep customers informed about shipment progress.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <p className="text-2xl">⚠️</p>
              <p className="font-black mt-3">
                Report Problems
              </p>
              <p className="text-blue-200 text-sm mt-1">
                Report delays or delivery issues.
              </p>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}