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

import { supabase } from "../../../lib/supabase";

export default function ShipmentPage() {
  const router = useRouter();
  const params = useParams();

  const id = String(params.id);

  const [shipment, setShipment] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShipment();
  }, [id]);

  async function loadShipment() {
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        router.replace("/login");
        return;
      }

      const shipmentId = Number(id);

      if (Number.isNaN(shipmentId)) {
        setShipment(null);
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", shipmentId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (error) {
        console.error("SHIPMENT ERROR:", error);
        setShipment(null);
        return;
      }

      if (!data) {
        console.error(
          "NO SHIPMENT FOUND FOR ID:",
          shipmentId
        );

        setShipment(null);
        return;
      }

      setShipment(data);

      const {
        data: history,
        error: historyError,
      } = await supabase
        .from("shipment_updates")
        .select("*")
        .eq("booking_id", data.id)
        .order("created_at", {
          ascending: false,
        });

      if (historyError) {
        console.error(
          "HISTORY ERROR:",
          historyError
        );

        setUpdates([]);
      } else {
        setUpdates(history || []);
      }
    } catch (error) {
      console.error(
        "SHIPMENT PAGE ERROR:",
        error
      );

      setShipment(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshShipment() {
    setRefreshing(true);

    await loadShipment();

    setRefreshing(false);
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

  function statusIcon(status: string) {
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
            We could not find this shipment in your account.
          </p>

          <p className="text-xs text-slate-400 mt-3">
            Shipment ID: {id}
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-7 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-black"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
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
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
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
                Tracking your delivery in real time.
              </p>

            </div>

            <button
              onClick={refreshShipment}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/10 px-6 py-3 rounded-xl font-black"
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

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* TRACKING */}

        <div className="bg-slate-950 text-white rounded-3xl shadow-xl p-7 md:p-9">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                Tracking Number
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                {shipment.tracking_number}
              </h2>

            </div>

            <div className="flex items-center gap-3">

              {statusIcon(
                shipment.status
              )}

              <span
                className={`px-4 py-2 rounded-full font-black ${statusStyle(
                  shipment.status
                )}`}
              >
                {shipment.status ||
                  "Pending"}
              </span>

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid md:grid-cols-3 gap-6 mt-8">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <Package
              size={25}
              className="text-blue-700"
            />

            <p className="text-xs uppercase font-black text-slate-400 mt-5">
              Sender
            </p>

            <p className="font-black text-lg mt-1">
              {shipment.sender_name}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <Truck
              size={25}
              className="text-orange-600"
            />

            <p className="text-xs uppercase font-black text-slate-400 mt-5">
              Receiver
            </p>

            <p className="font-black text-lg mt-1">
              {shipment.receiver_name}
            </p>

          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

            <CalendarDays
              size={25}
              className="text-green-600"
            />

            <p className="text-xs uppercase font-black text-slate-400 mt-5">
              Estimated Delivery
            </p>

            <p className="font-black text-lg mt-1">
              {shipment.estimated_delivery ||
                "Not available"}
            </p>

          </div>

        </div>

        {/* LOCATION */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-8">

          <h2 className="text-2xl font-black text-blue-900">
            Current Shipment Location
          </h2>

          <div className="bg-orange-50 rounded-2xl p-6 mt-6">

            <div className="flex items-center gap-4">

              <MapPin
                size={28}
                className="text-orange-500"
              />

              <div>

                <p className="text-xs uppercase font-black text-orange-500">
                  Current Location
                </p>

                <p className="text-xl font-black mt-1">
                  {shipment.current_location ||
                    "Awaiting pickup"}
                </p>

              </div>

            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">

            <div>

              <p className="text-xs uppercase font-black text-slate-400">
                Pickup
              </p>

              <p className="font-semibold mt-2">
                {shipment.pickup_address}
              </p>

            </div>

            <div>

              <p className="text-xs uppercase font-black text-slate-400">
                Destination
              </p>

              <p className="font-semibold mt-2">
                {shipment.delivery_address}
              </p>

            </div>

          </div>

        </div>

        {/* DELIVERY ISSUE */}

        {(shipment.delivery_issue ||
          shipment.delivery_update) && (

          <div className="bg-red-50 border border-red-200 rounded-3xl p-7 mt-8">

            <div className="flex gap-4">

              <AlertTriangle
                size={25}
                className="text-red-600"
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

        {/* HISTORY */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mt-8">

          <h2 className="text-2xl font-black text-blue-900">
            Shipment History
          </h2>

          <p className="text-slate-500 mt-2">
            Latest updates from Atlas Express.
          </p>

          {updates.length === 0 ? (

            <div className="bg-slate-50 rounded-2xl p-8 text-center mt-6">

              <Clock
                size={35}
                className="text-slate-400 mx-auto"
              />

              <p className="font-bold text-slate-500 mt-4">
                No tracking updates yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4 mt-6">

              {updates.map(
                (update) => (

                  <div
                    key={update.id}
                    className="border border-slate-200 rounded-2xl p-5"
                  >

                    <span
                      className={`inline-flex px-3 py-1.5 rounded-full text-sm font-black ${statusStyle(
                        update.status
                      )}`}
                    >
                      {update.status}
                    </span>

                    {update.location && (

                      <p className="flex items-center gap-2 text-sm text-slate-500 mt-3">
                        <MapPin size={16} />
                        {update.location}
                      </p>

                    )}

                    <p className="font-semibold mt-3">
                      {update.message}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {update.created_at
                        ? new Date(
                            update.created_at
                          ).toLocaleString()
                        : ""}
                    </p>

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