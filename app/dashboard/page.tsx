"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  MapPin,
  CalendarDays,
  ArrowRight,
  Truck,
  LogOut,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("SESSION ERROR:", sessionError);
      setLoading(false);
      return;
    }

    if (!session) {
      router.push("/login");
      return;
    }

    setUserEmail(session.user.email || "");

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", session.user.id)
      .order("id", { ascending: false });

    if (error) {
      console.error("DASHBOARD BOOKING ERROR:", error);
      setBookings([]);
      setLoading(false);
      return;
    }

    setBookings(data || []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  function statusStyle(status: string) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "In Transit":
        return "bg-orange-100 text-orange-700";

      case "Picked Up":
        return "bg-blue-100 text-blue-700";

      case "Delayed":
        return "bg-purple-100 text-purple-700";

      case "Delivery Issue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 text-lg font-bold">
            Loading your dashboard...
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

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div>

              <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                My Dashboard
              </h1>

              <p className="text-blue-200 mt-2">
                Manage and track your shipments.
              </p>

              {userEmail && (
                <p className="text-blue-300 text-sm mt-3">
                  {userEmail}
                </p>
              )}

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={loadDashboard}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl font-bold transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-bold transition"
              >
                <LogOut size={18} />
                Logout
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* QUICK STATS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package
                size={24}
                className="text-blue-800"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Total Shipments
            </p>

            <p className="text-3xl font-black mt-1">
              {bookings.length}
            </p>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Truck
                size={24}
                className="text-orange-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              In Transit
            </p>

            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status === "In Transit"
                ).length
              }
            </p>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Package
                size={24}
                className="text-green-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Delivered
            </p>

            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status === "Delivered"
                ).length
              }
            </p>

          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MapPin
                size={24}
                className="text-purple-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Active Shipments
            </p>

            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status !== "Delivered"
                ).length
              }
            </p>

          </div>

        </div>

        {/* BOOK DELIVERY */}

        <div className="bg-blue-900 text-white rounded-3xl p-7 md:p-8 mb-10">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-orange-400 font-bold uppercase tracking-wider text-sm">
                Need another shipment?
              </p>

              <h2 className="text-2xl md:text-3xl font-black mt-1">
                Book a new delivery
              </h2>

            </div>

            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 px-7 py-4 rounded-xl font-black transition"
            >
              Book Delivery
              <ArrowRight size={20} />
            </Link>

          </div>

        </div>

        {/* SHIPMENT HISTORY */}

        <div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">

            <div>

              <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
                Your shipments
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-1">
                Shipment History
              </h2>

            </div>

            <Link
              href="/track"
              className="text-blue-900 font-black hover:text-orange-500 transition"
            >
              Track by number →
            </Link>

          </div>

          {bookings.length === 0 ? (

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">

                <Package
                  size={30}
                  className="text-slate-400"
                />

              </div>

              <h3 className="text-2xl font-black mt-6">
                No shipments yet
              </h3>

              <p className="text-slate-500 mt-2">
                Your shipments will appear here after you create a booking.
              </p>

              <Link
                href="/book"
                className="inline-flex items-center gap-2 mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black"
              >
                Book Your First Delivery
                <ArrowRight size={18} />
              </Link>

            </div>

          ) : (

            <div className="grid lg:grid-cols-2 gap-6">

              {bookings.map((booking) => (

                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                >

                  {/* CARD HEADER */}

                  <div className="bg-slate-950 text-white p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                          Tracking Number
                        </p>

                        <h3 className="text-2xl font-black mt-1">
                          {booking.tracking_number}
                        </h3>

                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap ${statusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status || "Pending"}
                      </span>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-6">

                    <div className="grid sm:grid-cols-2 gap-4">

                      <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-xs uppercase tracking-wide font-black text-slate-400">
                          Sender
                        </p>

                        <p className="font-black mt-2">
                          {booking.sender_name || "Not provided"}
                        </p>

                      </div>

                      <div className="bg-slate-50 rounded-2xl p-5">

                        <p className="text-xs uppercase tracking-wide font-black text-slate-400">
                          Receiver
                        </p>

                        <p className="font-black mt-2">
                          {booking.receiver_name || "Not provided"}
                        </p>

                      </div>

                    </div>

                    <div className="mt-4 bg-orange-50 rounded-2xl p-5">

                      <div className="flex items-center gap-3">

                        <MapPin
                          size={20}
                          className="text-orange-500"
                        />

                        <div>

                          <p className="text-xs uppercase tracking-wide font-black text-slate-400">
                            Current Location
                          </p>

                          <p className="font-black mt-1">
                            {booking.current_location ||
                              "Awaiting pickup"}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-4 bg-blue-50 rounded-2xl p-5">

                      <div className="flex items-center gap-3">

                        <CalendarDays
                          size={20}
                          className="text-blue-700"
                        />

                        <div>

                          <p className="text-xs uppercase tracking-wide font-black text-slate-400">
                            Estimated Delivery
                          </p>

                          <p className="font-black mt-1">
                            {booking.estimated_delivery ||
                              "Not available"}
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-4 text-sm text-slate-500">

                      <span className="font-bold">
                        Pickup:
                      </span>{" "}
                      {booking.pickup_address || "Not provided"}

                    </div>

                    <div className="mt-2 text-sm text-slate-500">

                      <span className="font-bold">
                        Destination:
                      </span>{" "}
                      {booking.delivery_address || "Not provided"}

                    </div>

                    {/* IMPORTANT: OPEN THE ACTUAL BOOKING ID */}

                    <Link
                      href={`/shipments/${booking.id}`}
                      className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-black transition"
                    >
                      View Shipment
                      <ArrowRight size={18} />
                    </Link>

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