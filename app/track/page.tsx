"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import { supabase } from "../../lib/supabase";

type Booking = {
  id: number;
  tracking_number: string | null;

  sender_name: string | null;
  receiver_name: string | null;

  pickup_address: string | null;
  delivery_address: string | null;

  status: string | null;

  current_location: string | null;
  next_location: string | null;

  estimated_delivery: string | null;
  last_updated: string | null;
  created_at: string | null;

  package_type: string | null;
  package_description: string | null;
  package_weight: number | null;
  package_quantity: number | null;
  package_value: number | null;
  special_handling: string | null;
};

type ShipmentUpdate = {
  id: number;
  booking_id: number;
  status: string | null;
  location: string | null;
  message: string | null;
  created_at: string | null;
};

type PublicShipmentResponse = {
  shipment: Booking;
  history: ShipmentUpdate[];
};

function TrackShipment() {
  const searchParams = useSearchParams();

  const [trackingInput, setTrackingInput] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [updates, setUpdates] = useState<ShipmentUpdate[]>([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const tracking = searchParams.get("tracking");

    if (tracking) {
      setTrackingInput(tracking);
      loadShipment(tracking);
    }
  }, [searchParams]);

  async function loadShipment(trackingNumber: string) {
    const cleanedTracking = trackingNumber.trim().toUpperCase();

    if (!cleanedTracking) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setBooking(null);
    setUpdates([]);

    try {
      /*
       * IMPORTANT:
       * We no longer query bookings directly.
       *
       * The public tracking page uses the secure
       * get_public_shipment() function.
       *
       * That function returns both:
       * - shipment information
       * - tracking history
       */

      const { data, error } = await supabase.rpc(
        "get_public_shipment",
        {
          tracking_number_input: cleanedTracking,
        }
      );

      if (error) {
        console.error("PUBLIC TRACKING ERROR:", error);

        setLoading(false);
        return;
      }

      if (!data) {
        setLoading(false);
        return;
      }

      const result = data as PublicShipmentResponse;

      setBooking(result.shipment);
      setUpdates(result.history || []);
    } catch (error) {
      console.error("TRACKING ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    loadShipment(trackingInput);
  }

  function getStatusClass(status: string | null): string {
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

  function getStatusIcon(status: string | null) {
    switch (status) {
      case "Delivered":
        return (
          <CheckCircle
            size={22}
            className="text-green-600"
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

      case "In Transit":
      case "Picked Up":
        return (
          <Truck
            size={22}
            className="text-orange-600"
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition font-semibold"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <div className="mt-10 text-center">
            <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
              Atlas Express
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-3">
              Track Your Shipment
            </h1>

            <p className="text-blue-200 mt-4 text-lg">
              Enter your tracking number to see the latest
              shipment information.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto mt-8 pb-12"
          >
            <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
              <div className="relative flex-1">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={trackingInput}
                  onChange={(event) =>
                    setTrackingInput(event.target.value)
                  }
                  placeholder="Enter tracking number e.g. TRK123456"
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-black transition"
              >
                {loading
                  ? "Searching..."
                  : "Track Shipment"}
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* RESULTS */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="font-bold text-slate-700 mt-5">
              Finding your shipment...
            </p>
          </div>
        )}

        {/* NOT FOUND */}
        {!loading && searched && !booking && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto">
              <AlertTriangle
                size={30}
                className="text-red-500"
              />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mt-6">
              Shipment Not Found
            </h2>

            <p className="text-slate-500 mt-2">
              We could not find a shipment with that
              tracking number.
            </p>

            <p className="text-sm text-slate-400 mt-3">
              Please check the tracking number and try
              again.
            </p>
          </div>
        )}

        {/* SHIPMENT */}
        {!loading && booking && (
          <div className="space-y-8">
            {/* SHIPMENT OVERVIEW */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-950 text-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
                      Tracking Number
                    </p>

                    <h2 className="text-3xl md:text-4xl font-black mt-2">
                      {booking.tracking_number ||
                        "Unavailable"}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusIcon(booking.status)}

                    <span
                      className={`px-5 py-3 rounded-full font-black ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* LOCATION CARDS */}
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="bg-orange-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <MapPin
                        size={22}
                        className="text-orange-600"
                      />

                      <p className="text-sm font-black text-orange-600">
                        Current Location
                      </p>
                    </div>

                    <p className="font-black text-slate-900 mt-3">
                      {booking.current_location ||
                        "Awaiting update"}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <Truck
                        size={22}
                        className="text-blue-700"
                      />

                      <p className="text-sm font-black text-blue-700">
                        Next Location
                      </p>
                    </div>

                    <p className="font-black text-slate-900 mt-3">
                      {booking.next_location ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                      <Calendar
                        size={22}
                        className="text-green-600"
                      />

                      <p className="text-sm font-black text-green-600">
                        Estimated Delivery
                      </p>
                    </div>

                    <p className="font-black text-slate-900 mt-3">
                      {booking.estimated_delivery ||
                        "Not available"}
                    </p>
                  </div>
                </div>

                {/* PEOPLE */}
                <div className="grid md:grid-cols-2 gap-5 mt-8">
                  <div className="border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Sender
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.sender_name ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Receiver
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.receiver_name ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {/* ADDRESSES */}
                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Pickup Address
                    </p>

                    <p className="font-semibold text-slate-700 mt-2">
                      {booking.pickup_address ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Delivery Address
                    </p>

                    <p className="font-semibold text-slate-700 mt-2">
                      {booking.delivery_address ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PACKAGE INFORMATION */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-blue-950 text-white p-6">
                <div className="flex items-center gap-3">
                  <Package size={24} />

                  <div>
                    <h2 className="text-2xl font-black">
                      Package Information
                    </h2>

                    <p className="text-blue-200 text-sm mt-1">
                      Information provided for this shipment
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* TYPE */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Package Type
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.package_type ||
                        "Not provided"}
                    </p>
                  </div>

                  {/* QUANTITY */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Quantity
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.package_quantity ?? 1}
                    </p>
                  </div>

                  {/* WEIGHT */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Weight
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.package_weight !== null &&
                      booking.package_weight !==
                        undefined
                        ? `${booking.package_weight} kg`
                        : "Not provided"}
                    </p>
                  </div>

                  {/* VALUE */}
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                      Declared Value
                    </p>

                    <p className="font-black text-slate-900 mt-2">
                      {booking.package_value !== null &&
                      booking.package_value !==
                        undefined
                        ? `$${booking.package_value}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                    Package Description
                  </p>

                  <div className="bg-slate-50 rounded-2xl p-5 mt-2">
                    <p className="text-slate-700 font-semibold">
                      {booking.package_description ||
                        "No package description provided."}
                    </p>
                  </div>
                </div>

                {/* SPECIAL HANDLING */}
                {booking.special_handling && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-widest font-black text-orange-500">
                      Special Handling
                    </p>

                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mt-2">
                      <p className="text-slate-700 font-semibold">
                        {booking.special_handling}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TRACKING HISTORY */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-950 text-white p-6">
                <h2 className="text-2xl font-black">
                  Tracking History
                </h2>

                <p className="text-slate-400 mt-1">
                  Latest shipment activity
                </p>
              </div>

              <div className="p-6 md:p-8">
                {updates.length === 0 ? (
                  <div className="text-center py-10">
                    <Clock
                      size={35}
                      className="text-slate-300 mx-auto"
                    />

                    <p className="font-bold text-slate-500 mt-4">
                      No tracking updates yet.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="space-y-6">
                      {updates.map(
                        (update, index) => (
                          <div
                            key={update.id}
                            className="relative flex gap-5"
                          >
                            <div className="flex flex-col items-center">
                              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                {getStatusIcon(
                                  update.status
                                )}
                              </div>

                              {index <
                                updates.length - 1 && (
                                <div className="w-0.5 bg-slate-200 flex-1 mt-2" />
                              )}
                            </div>

                            <div className="pb-6 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span
                                  className={`inline-flex w-fit px-3 py-1 rounded-full text-sm font-black ${getStatusClass(
                                    update.status
                                  )}`}
                                >
                                  {update.status ||
                                    "Update"}
                                </span>

                                {update.created_at && (
                                  <span className="text-xs text-slate-400 font-semibold">
                                    {new Date(
                                      update.created_at
                                    ).toLocaleString()}
                                  </span>
                                )}
                              </div>

                              {update.location && (
                                <div className="flex items-center gap-2 mt-3 text-slate-500">
                                  <MapPin size={16} />

                                  <span className="font-semibold">
                                    {update.location}
                                  </span>
                                </div>
                              )}

                              {update.message && (
                                <p className="text-slate-700 font-semibold mt-3">
                                  {update.message}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LAST UPDATED */}
            {booking.last_updated && (
              <div className="text-center text-sm text-slate-400">
                Last updated:{" "}
                {new Date(
                  booking.last_updated
                ).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function TrackPageLoading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="font-bold mt-5 text-slate-700">
          Loading tracking page...
        </p>
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackPageLoading />}>
      <TrackShipment />
    </Suspense>
  );
}