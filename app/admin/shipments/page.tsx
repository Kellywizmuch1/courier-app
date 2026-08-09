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
  user_id: string | null;

  tracking_number: string | null;

  sender_name: string | null;
  receiver_name: string | null;

  pickup_address: string | null;
  delivery_address: string | null;

  phone_number: string | null;

  status: string | null;

  current_location: string | null;
  next_location: string | null;

  estimated_delivery: string | null;
  last_updated: string | null;
  created_at: string | null;

  package_type?: string | null;
  package_description?: string | null;
  package_weight?: number | null;
  package_length?: number | null;
  package_width?: number | null;
  package_height?: number | null;
  package_value?: number | null;
};

export default function AdminShipmentsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

    setBookings(
      (data as Booking[]) || []
    );
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
      const tracking =
        booking.tracking_number?.toLowerCase() ||
        "";

      const sender =
        booking.sender_name?.toLowerCase() ||
        "";

      const receiver =
        booking.receiver_name?.toLowerCase() ||
        "";

      const pickup =
        booking.pickup_address?.toLowerCase() ||
        "";

      const delivery =
        booking.delivery_address?.toLowerCase() ||
        "";

      const packageDescription =
        booking.package_description?.toLowerCase() ||
        "";

      const matchesSearch =
        searchValue === "" ||
        tracking.includes(searchValue) ||
        sender.includes(searchValue) ||
        receiver.includes(searchValue) ||
        pickup.includes(searchValue) ||
        delivery.includes(searchValue) ||
        packageDescription.includes(searchValue);

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
        booking.status ===
          "Delivery Issue"
    ).length;

  function statusStyle(
    status: string | null
  ) {
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

  function statusIcon(
    status: string | null
  ) {
    switch (status) {
      case "Delivered":
        return (
          <CheckCircle
            size={18}
            className="text-green-600"
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
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
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

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-7">
            <div>
              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Shipment Management
              </h1>

              <p className="text-blue-200 mt-2">
                Search, view and manage customer shipments.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshShipments}
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
                : "Refresh Shipments"}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* STATISTICS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
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
              {totalShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Truck
                size={24}
                className="text-orange-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Active Shipments
            </p>

            <p className="text-3xl font-black mt-1">
              {activeShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle
                size={24}
                className="text-green-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Delivered
            </p>

            <p className="text-3xl font-black mt-1">
              {deliveredShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle
                size={24}
                className="text-red-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Attention Required
            </p>

            <p className="text-3xl font-black mt-1">
              {delayedShipments}
            </p>
          </div>
        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mt-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search tracking number, sender, receiver or package..."
                className="w-full border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="lg:w-64 border-2 border-slate-200 rounded-xl px-4 py-4 font-bold bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
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

          <div className="mt-4 text-sm text-slate-500">
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

        <div className="mt-8">
          {filteredBookings.length ===
          0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <Package
                  size={30}
                  className="text-slate-400"
                />
              </div>

              <h2 className="text-2xl font-black mt-6">
                No shipments found
              </h2>

              <p className="text-slate-500 mt-2">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredBookings.map(
                (booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* CARD HEADER */}

                    <div className="bg-slate-950 text-white p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                            Shipment ID #
                            {booking.id}
                          </p>

                          <h2 className="text-2xl font-black mt-1">
                            {booking.tracking_number ||
                              "No tracking number"}
                          </h2>
                        </div>

                        <div className="flex items-center gap-3">
                          {statusIcon(
                            booking.status
                          )}

                          <span
                            className={`px-4 py-2 rounded-full text-sm font-black ${statusStyle(
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

                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                            Sender
                          </p>

                          <p className="font-black mt-2">
                            {booking.sender_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                            Receiver
                          </p>

                          <p className="font-black mt-2">
                            {booking.receiver_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wider font-black text-orange-500">
                            Current Location
                          </p>

                          <p className="font-black mt-2">
                            {booking.current_location ||
                              "Awaiting pickup"}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wider font-black text-blue-500">
                            Estimated Delivery
                          </p>

                          <p className="font-black mt-2">
                            {booking.estimated_delivery ||
                              "Not available"}
                          </p>
                        </div>
                      </div>

                      {/* ADDRESSES */}

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div>
                          <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                            Pickup Address
                          </p>

                          <p className="text-sm font-semibold text-slate-600 mt-1">
                            {booking.pickup_address ||
                              "Not provided"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wider font-black text-slate-400">
                            Delivery Address
                          </p>

                          <p className="text-sm font-semibold text-slate-600 mt-1">
                            {booking.delivery_address ||
                              "Not provided"}
                          </p>
                        </div>
                      </div>

                      {/* PACKAGE INFORMATION */}

                      <div className="mt-6 border-2 border-slate-200 rounded-2xl overflow-hidden">
                        <div className="bg-slate-950 text-white px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Package size={20} />

                            <div>
                              <p className="font-black">
                                Package Information
                              </p>

                              <p className="text-xs text-slate-400">
                                Shipment details provided by customer
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs uppercase font-black text-slate-400">
                              Package Type
                            </p>

                            <p className="font-bold mt-1">
                              {booking.package_type ||
                                "Not provided"}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs uppercase font-black text-slate-400">
                              Weight
                            </p>

                            <p className="font-bold mt-1">
                              {booking.package_weight !==
                                null &&
                              booking.package_weight !==
                                undefined
                                ? `${booking.package_weight} kg`
                                : "Not provided"}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs uppercase font-black text-slate-400">
                              Dimensions
                            </p>

                            <p className="font-bold mt-1">
                              {booking.package_length !==
                                null &&
                              booking.package_length !==
                                undefined &&
                              booking.package_width !==
                                null &&
                              booking.package_width !==
                                undefined &&
                              booking.package_height !==
                                null &&
                              booking.package_height !==
                                undefined
                                ? `${booking.package_length} × ${booking.package_width} × ${booking.package_height} cm`
                                : "Not provided"}
                            </p>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs uppercase font-black text-slate-400">
                              Declared Value
                            </p>

                            <p className="font-bold mt-1">
                              {booking.package_value !==
                                null &&
                              booking.package_value !==
                                undefined
                                ? `$${booking.package_value}`
                                : "Not provided"}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 pb-5">
                          <p className="text-xs uppercase font-black text-slate-400">
                            Package Description
                          </p>

                          <p className="text-sm text-slate-600 font-semibold mt-1">
                            {booking.package_description ||
                              "No package description provided."}
                          </p>
                        </div>
                      </div>

                      {/* PHONE */}

                      {booking.phone_number && (
                        <div className="mt-5 bg-blue-50 rounded-2xl p-5">
                          <p className="text-xs uppercase tracking-wider font-black text-blue-500">
                            Contact Phone
                          </p>

                          <p className="font-black mt-1">
                            {booking.phone_number}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Link
                          href={`/track?tracking=${encodeURIComponent(
                            booking.tracking_number ||
                              ""
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
                        <p className="text-xs text-slate-400 mt-5">
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