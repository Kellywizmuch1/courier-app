"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Booking = {
  id: number;
  user_id: string;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  pickup_address: string;
  delivery_address: string;
  phone_number: string;
  status: string;
  current_location: string;
  next_location: string;
  estimated_delivery: string;
  last_updated: string;
  created_at?: string;
};

export default function AdminShipmentsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    void checkAdmin();
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

    await loadShipments();

    setLoading(false);
  }

  async function loadShipments() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ADMIN SHIPMENTS ERROR:",
        error
      );

      alert(
        "Could not load shipments: " +
          error.message
      );

      return;
    }

    setBookings(data || []);
  }

  async function refreshShipments() {
    setRefreshing(true);

    await loadShipments();

    setRefreshing(false);
  }

  const filteredBookings = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !searchValue ||
        booking.tracking_number
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.sender_name
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.receiver_name
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.pickup_address
          ?.toLowerCase()
          .includes(searchValue) ||
        booking.delivery_address
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    bookings,
    search,
    statusFilter,
  ]);

  const totalShipments =
    bookings.length;

  const activeShipments =
    bookings.filter(
      (booking) =>
        booking.status !== "Delivered"
    ).length;

  const deliveredShipments =
    bookings.filter(
      (booking) =>
        booking.status === "Delivered"
    ).length;

  const delayedShipments =
    bookings.filter(
      (booking) =>
        booking.status === "Delayed" ||
        booking.status === "Delivery Issue"
    ).length;

  function statusStyle(status: string) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "In Transit":
        return "bg-orange-100 text-orange-700";

      case "Picked Up":
        return "bg-blue-100 text-blue-700";

      case "Confirmed":
        return "bg-indigo-100 text-indigo-700";

      case "Delayed":
        return "bg-purple-100 text-purple-700";

      case "Delivery Issue":
        return "bg-red-100 text-red-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function statusIcon(status: string) {
    switch (status) {
      case "Delivered":
        return (
          <CheckCircle
            size={18}
            className="text-green-600"
          />
        );

      case "Confirmed":
        return (
          <CheckCircle
            size={18}
            className="text-indigo-600"
          />
        );

      case "In Transit":
      case "Picked Up":
        return (
          <Truck
            size={18}
            className="text-orange-600"
          />
        );

      case "Delayed":
      case "Delivery Issue":
        return (
          <AlertTriangle
            size={18}
            className="text-red-600"
          />
        );

      case "Pending":
      default:
        return (
          <Clock
            size={18}
            className="text-yellow-600"
          />
        );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Loading shipments...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold text-sm transition"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mt-6 sm:mt-7">
            <div>
              <p className="text-orange-400 font-black uppercase tracking-widest text-xs sm:text-sm">
                Atlas Express
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2">
                Shipment Management
              </h1>

              <p className="text-blue-200 mt-2 text-sm sm:text-base">
                Search, filter and manage customer shipments.
              </p>
            </div>

            <button
              onClick={refreshShipments}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/10 px-5 py-3 rounded-xl font-black transition"
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
                : "Refresh Shipments"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* STATISTICS */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package
                size={22}
                className="text-blue-800"
              />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-4">
              Total Shipments
            </p>

            <p className="text-2xl sm:text-3xl font-black mt-1">
              {totalShipments}
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Truck
                size={22}
                className="text-orange-600"
              />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-4">
              Active Shipments
            </p>

            <p className="text-2xl sm:text-3xl font-black mt-1">
              {activeShipments}
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle
                size={22}
                className="text-green-600"
              />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-4">
              Delivered
            </p>

            <p className="text-2xl sm:text-3xl font-black mt-1">
              {deliveredShipments}
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle
                size={22}
                className="text-red-600"
              />
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-500 mt-4">
              Attention Required
            </p>

            <p className="text-2xl sm:text-3xl font-black mt-1">
              {delayedShipments}
            </p>
          </div>
        </div>

        {/* SEARCH / FILTER */}

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 mt-6 sm:mt-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search tracking number, sender, receiver or address..."
                className="w-full border-2 border-slate-200 rounded-xl py-3.5 sm:py-4 pl-12 pr-4 text-slate-900 font-semibold focus:outline-none focus:border-orange-500 text-sm sm:text-base"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="lg:w-64 border-2 border-slate-200 rounded-xl px-4 py-3.5 sm:py-4 font-bold bg-white focus:outline-none focus:border-orange-500 text-sm sm:text-base"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Picked Up">
                Picked Up
              </option>

              <option value="In Transit">
                In Transit
              </option>

              <option value="Delayed">
                Delayed
              </option>

              <option value="Delivery Issue">
                Delivery Issue
              </option>

              <option value="Delivered">
                Delivered
              </option>
            </select>
          </div>

          <div className="mt-3 text-xs sm:text-sm text-slate-500">
            Showing{" "}
            <span className="font-black text-slate-900">
              {filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-black text-slate-900">
              {bookings.length}
            </span>{" "}
            shipments
          </div>
        </div>

        {/* SHIPMENTS */}

        <div className="mt-6 sm:mt-8">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-10 sm:p-12 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <Package
                  size={30}
                  className="text-slate-400"
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-black mt-5">
                No shipments found
              </h2>

              <p className="text-slate-500 mt-2 text-sm">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* CARD HEADER */}

                    <div className="bg-slate-950 text-white p-5 sm:p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                            Tracking Number
                          </p>

                          <h2 className="text-xl sm:text-2xl font-black mt-1 break-all">
                            {booking.tracking_number}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3">
                          {statusIcon(
                            booking.status
                          )}

                          <span
                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black ${statusStyle(
                              booking.status
                            )}`}
                          >
                            {booking.status ||
                              "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD BODY */}

                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-400">
                            Sender
                          </p>

                          <p className="font-black mt-1.5 text-sm sm:text-base">
                            {booking.sender_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-400">
                            Receiver
                          </p>

                          <p className="font-black mt-1.5 text-sm sm:text-base">
                            {booking.receiver_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-2xl p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-orange-500">
                            Current Location
                          </p>

                          <p className="font-black mt-1.5 text-sm sm:text-base">
                            {booking.current_location ||
                              "Awaiting pickup"}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-4 sm:p-5">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-blue-500">
                            Estimated Delivery
                          </p>

                          <p className="font-black mt-1.5 text-sm sm:text-base">
                            {booking.estimated_delivery ||
                              "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-400">
                            Pickup
                          </p>

                          <p className="text-sm font-semibold text-slate-600 mt-1">
                            {booking.pickup_address ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-400">
                            Destination
                          </p>

                          <p className="text-sm font-semibold text-slate-600 mt-1">
                            {booking.delivery_address ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}

                      <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
                        <Link
                          href={`/track?tracking=${encodeURIComponent(
                            booking.tracking_number
                          )}`}
                          className="flex-1 inline-flex items-center justify-center bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-black transition"
                        >
                          View Tracking
                        </Link>

                        <Link
                          href={`/admin/shipments/${booking.id}`}
                          className="flex-1 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-black transition"
                        >
                          Manage Shipment
                        </Link>
                      </div>

                      {booking.last_updated && (
                        <p className="text-[11px] sm:text-xs text-slate-400 mt-4 sm:mt-5">
                          Last updated:{" "}
                          {new Date(
                            booking.last_updated
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}