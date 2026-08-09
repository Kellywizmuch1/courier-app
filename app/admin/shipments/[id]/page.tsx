"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  CalendarDays,
  Truck,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

import { supabase } from "../../../../lib/supabase";

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
  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_issue?: string | null;
  delivery_update?: string | null;
};

type ShipmentUpdate = {
  id: number;
  booking_id: number;
  status: string;
  location: string | null;
  message: string;
  created_at: string;
};

export default function AdminShipmentPage() {
  const router = useRouter();
  const params = useParams();

  const shipmentId = String(params.id);

  const [shipment, setShipment] =
    useState<Booking | null>(null);

  const [updates, setUpdates] =
    useState<ShipmentUpdate[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.replace("/login");
      return;
    }

    const email =
      session.user.email?.toLowerCase();

    if (
      email !==
      "michealkellywiz@gmail.com"
    ) {
      alert(
        "You do not have permission to access this page."
      );

      router.replace("/dashboard");
      return;
    }

    await loadShipment();

    setLoading(false);
  }

  async function loadShipment() {
    if (!shipmentId) {
      return;
    }

    /*
      The [id] URL value can be either:

      /admin/shipments/123

      OR

      /admin/shipments/TRK123456

      We first try the database ID.
      If that doesn't work, we try the
      tracking number.
    */

    let data: Booking | null = null;
    let error: any = null;

    const numericId =
      Number(shipmentId);

    if (!Number.isNaN(numericId)) {
      const result = await supabase
        .from("bookings")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();

      data = result.data;
      error = result.error;
    }

    /*
      If the database ID didn't find anything,
      try the tracking number.
    */

    if (!data && !error) {
      const result = await supabase
        .from("bookings")
        .select("*")
        .eq(
          "tracking_number",
          shipmentId
        )
        .maybeSingle();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error(
        "SHIPMENT ERROR:",
        error
      );

      alert(
        "Could not load shipment: " +
          (error.message ||
            "Unknown Supabase error")
      );

      return;
    }

    if (!data) {
      alert(
        "Shipment not found."
      );

      return;
    }

    setShipment(data);

    await loadShipmentUpdates(
      data.id
    );
  }

  async function loadShipmentUpdates(
    bookingId: number
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("shipment_updates")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "SHIPMENT UPDATES ERROR:",
        error
      );

      return;
    }

    setUpdates(data || []);
  }

  async function refreshShipment() {
    setRefreshing(true);

    await loadShipment();

    setRefreshing(false);
  }

  function statusStyle(
    status: string
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
    status: string
  ) {
    switch (status) {
      case "Delivered":
        return (
          <CheckCircle
            size={22}
            className="text-green-600"
          />
        );

      case "In Transit":
      case "Picked Up":
        return (
          <Truck
            size={22}
            className="text-orange-600"
          />
        );

      case "Delayed":
      case "Delivery Issue":
        return (
          <AlertTriangle
            size={22}
            className="text-red-600"
          />
        );

      default:
        return (
          <Clock
            size={22}
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
            Loading shipment...
          </p>

        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-6">

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-10 text-center max-w-lg w-full">

          <Package
            size={50}
            className="text-slate-400 mx-auto"
          />

          <h1 className="text-3xl font-black mt-6">
            Shipment Not Found
          </h1>

          <p className="text-slate-500 mt-3">
            We could not find this shipment.
          </p>

          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-2 mt-7 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-black"
          >
            <ArrowLeft size={18} />
            Back to Shipments
          </Link>

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
            href="/admin/shipments"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Shipment Management
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mt-7">

            <div>

              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Shipment Details
              </h1>

              <p className="text-blue-200 mt-2">
                Manage this individual shipment.
              </p>

            </div>

            <button
              onClick={refreshShipment}
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
                : "Refresh"}
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* TRACKING HEADER */}

        <div className="bg-slate-950 text-white rounded-3xl shadow-xl p-7 md:p-9">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
                Tracking Number
              </p>

              <h2 className="text-4xl font-black mt-2">
                {shipment.tracking_number}
              </h2>

              <p className="text-slate-400 mt-3">
                Shipment ID: {shipment.id}
              </p>

            </div>

            <div className="flex items-center gap-3">

              {statusIcon(
                shipment.status
              )}

              <span
                className={`px-5 py-2.5 rounded-full font-black ${statusStyle(
                  shipment.status
                )}`}
              >
                {shipment.status ||
                  "Pending"}
              </span>

            </div>

          </div>

        </div>

        {/* SHIPMENT INFORMATION */}

        <div className="grid lg:grid-cols-3 gap-6 mt-8">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                <Package
                  size={22}
                  className="text-blue-800"
                />

              </div>

              <div>

                <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                  Sender
                </p>

                <p className="font-black mt-1">
                  {shipment.sender_name}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">

                <Truck
                  size={22}
                  className="text-orange-600"
                />

              </div>

              <div>

                <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                  Receiver
                </p>

                <p className="font-black mt-1">
                  {shipment.receiver_name}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">

                <CalendarDays
                  size={22}
                  className="text-green-600"
                />

              </div>

              <div>

                <p className="text-xs uppercase font-black tracking-wider text-slate-400">
                  Estimated Delivery
                </p>

                <p className="font-black mt-1">
                  {shipment.estimated_delivery ||
                    "Not available"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ROUTE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-8">

          <h2 className="text-2xl font-black text-blue-900">
            Shipment Route
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div className="bg-orange-50 rounded-2xl p-6">

              <p className="text-xs uppercase tracking-wider font-black text-orange-500">
                Pickup Address
              </p>

              <p className="font-bold text-slate-800 mt-2">
                {shipment.pickup_address}
              </p>

            </div>

            <div className="bg-blue-50 rounded-2xl p-6">

              <p className="text-xs uppercase tracking-wider font-black text-blue-500">
                Delivery Address
              </p>

              <p className="font-bold text-slate-800 mt-2">
                {shipment.delivery_address}
              </p>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-5">

            <div>

              <p className="text-xs uppercase font-black text-slate-400">
                Current Location
              </p>

              <div className="flex items-center gap-2 mt-2">

                <MapPin
                  size={20}
                  className="text-orange-500"
                />

                <p className="font-black">
                  {shipment.current_location ||
                    "Awaiting pickup"}
                </p>

              </div>

            </div>

            <div>

              <p className="text-xs uppercase font-black text-slate-400">
                Next Location
              </p>

              <div className="flex items-center gap-2 mt-2">

                <MapPin
                  size={20}
                  className="text-blue-600"
                />

                <p className="font-black">
                  {shipment.next_location ||
                    "Not available"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* DELIVERY ISSUE */}

        {(shipment.delivery_issue ||
          shipment.delivery_update) && (

          <div className="bg-red-50 border border-red-200 rounded-3xl p-7 mt-8">

            <div className="flex items-start gap-4">

              <AlertTriangle
                size={25}
                className="text-red-600 mt-1"
              />

              <div>

                <h2 className="text-xl font-black text-red-800">
                  Delivery Update
                </h2>

                {shipment.delivery_issue && (
                  <p className="font-black text-red-700 mt-2">
                    {shipment.delivery_issue}
                  </p>
                )}

                {shipment.delivery_update && (
                  <p className="text-red-700 mt-2">
                    {shipment.delivery_update}
                  </p>
                )}

              </div>

            </div>

          </div>

        )}

        {/* SHIPMENT HISTORY */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-8">

          <h2 className="text-2xl font-black text-blue-900">
            Shipment History
          </h2>

          <p className="text-slate-500 mt-2">
            Tracking events recorded for this shipment.
          </p>

          {updates.length === 0 ? (

            <div className="bg-slate-50 rounded-2xl p-8 text-center mt-6">

              <Clock
                size={35}
                className="text-slate-400 mx-auto"
              />

              <p className="font-black text-slate-600 mt-4">
                No tracking updates yet.
              </p>

            </div>

          ) : (

            <div className="mt-7 space-y-5">

              {updates.map(
                (update) => (

                  <div
                    key={update.id}
                    className="border border-slate-200 rounded-2xl p-6"
                  >

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                      <div>

                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-sm font-black ${statusStyle(
                            update.status
                          )}`}
                        >
                          {update.status}
                        </span>

                        {update.location && (
                          <p className="flex items-center gap-2 text-sm text-slate-500 mt-4">
                            <MapPin
                              size={16}
                            />
                            {update.location}
                          </p>
                        )}

                        <p className="font-semibold mt-4">
                          {update.message}
                        </p>

                      </div>

                      <p className="text-xs text-slate-400 whitespace-nowrap">
                        {update.created_at
                          ? new Date(
                              update.created_at
                            ).toLocaleString()
                          : "Unknown time"}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* ACTIONS */}

        <div className="flex flex-col sm:flex-row gap-4 mt-8">

          <Link
            href={`/track?tracking=${encodeURIComponent(
              shipment.tracking_number
            )}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-4 rounded-xl font-black transition"
          >
            <Package size={20} />
            View Customer Tracking
          </Link>

          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-black transition"
          >
            Manage Shipment
          </Link>

        </div>

      </section>

    </main>
  );
}