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

/* =========================================================
   STATUS HELPERS
========================================================= */

function normalizeStatus(status: string | null) {
  return status?.trim().toLowerCase() || "";
}

function isSuccessfulStatus(status: string | null) {
  const value = normalizeStatus(status);

  return (
    value === "delivered" ||
    value === "picked up" ||
    value === "in transit"
  );
}

function isProblemStatus(status: string | null) {
  const value = normalizeStatus(status);

  return value === "delayed" || value === "delivery issue";
}

function getStatusIcon(status: string | null) {
  const value = normalizeStatus(status);

  if (value === "delivered") {
    return (
      <CheckCircle
        size={20}
        className="text-green-600"
      />
    );
  }

  if (value === "picked up") {
    return (
      <CheckCircle
        size={20}
        className="text-green-600"
      />
    );
  }

  if (value === "in transit") {
    return (
      <Truck
        size={20}
        className="text-green-600"
      />
    );
  }

  if (value === "delayed") {
    return (
      <AlertTriangle
        size={20}
        className="text-orange-600"
      />
    );
  }

  if (value === "delivery issue") {
    return (
      <AlertTriangle
        size={20}
        className="text-red-600"
      />
    );
  }

  return (
    <Clock
      size={20}
      className="text-slate-500"
    />
  );
}

function getStatusBadge(status: string | null) {
  const value = normalizeStatus(status);

  if (value === "delivered") {
    return "bg-green-100 text-green-700";
  }

  if (
    value === "picked up" ||
    value === "in transit"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (value === "delayed") {
    return "bg-orange-100 text-orange-700";
  }

  if (value === "delivery issue") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getTimelineCircle(status: string | null) {
  if (isSuccessfulStatus(status)) {
    return "bg-green-100 border-green-200";
  }

  if (isProblemStatus(status)) {
    return "bg-orange-100 border-orange-200";
  }

  return "bg-white border-slate-300";
}

/* =========================================================
   MAIN TRACKING COMPONENT
========================================================= */

function TrackShipment() {
  const searchParams = useSearchParams();

  const [trackingInput, setTrackingInput] =
    useState("");

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [updates, setUpdates] =
    useState<ShipmentUpdate[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  /* -------------------------------------------------------
     LOAD TRACKING NUMBER FROM URL
  ------------------------------------------------------- */

  useEffect(() => {
    const tracking =
      searchParams.get("tracking");

    if (tracking) {
      setTrackingInput(tracking);
      loadShipment(tracking);
    }
  }, [searchParams]);

  /* -------------------------------------------------------
     LOAD SHIPMENT
  ------------------------------------------------------- */

  async function loadShipment(
    trackingNumber: string
  ) {
    const cleanedTracking =
      trackingNumber.trim().toUpperCase();

    if (!cleanedTracking) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setBooking(null);
    setUpdates([]);

    try {
      const { data, error } =
        await supabase.rpc(
          "get_public_shipment",
          {
            tracking_number_input:
              cleanedTracking,
          }
        );

      if (error) {
        console.error(
          "PUBLIC TRACKING ERROR:",
          error
        );

        return;
      }

      if (!data) {
        return;
      }

      const result =
        data as PublicShipmentResponse;

      setBooking(result.shipment);

      const sortedHistory = [
        ...(result.history || []),
      ].sort((a, b) => {
        const aTime = a.created_at
          ? new Date(
              a.created_at
            ).getTime()
          : 0;

        const bTime = b.created_at
          ? new Date(
              b.created_at
            ).getTime()
          : 0;

        return bTime - aTime;
      });

      setUpdates(sortedHistory);
    } catch (error) {
      console.error(
        "TRACKING ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     SEARCH
  ------------------------------------------------------- */

  function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    loadShipment(trackingInput);
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-bold"
            >
              <ArrowLeft size={17} />
              Home
            </Link>

            <div className="flex items-center gap-2">

              <Package
                size={20}
                className="text-orange-400"
              />

              <span className="font-black">
                Atlas Express
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* ===================================================
          SEARCH AREA
      =================================================== */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">

          <h1 className="text-2xl sm:text-3xl font-black text-blue-950">
            Track a Shipment
          </h1>

          <p className="text-sm sm:text-base text-slate-700 mt-2">
            Enter your tracking number to view the
            latest shipment information.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-3xl mt-5"
          >

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="text"
                  value={trackingInput}
                  onChange={(event) =>
                    setTrackingInput(
                      event.target.value
                    )
                  }
                  placeholder="Enter tracking number"
                  className="w-full border border-slate-300 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 font-semibold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl font-black transition"
              >
                {loading
                  ? "Searching..."
                  : "Track"}
              </button>

            </div>

          </form>

        </div>

      </section>

      {/* ===================================================
          RESULTS
      =================================================== */}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* LOADING */}

        {loading && (

          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

            <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="font-bold text-slate-700 mt-4">
              Finding your shipment...
            </p>

          </div>

        )}

        {/* NOT FOUND */}

        {!loading &&
          searched &&
          !booking && (

            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">

              <AlertTriangle
                size={36}
                className="text-red-500 mx-auto"
              />

              <h2 className="text-xl font-black mt-4 text-slate-900">
                Shipment Not Found
              </h2>

              <p className="text-sm text-slate-700 mt-2">
                We could not find a shipment with
                that tracking number.
              </p>

            </div>

          )}

        {/* SHIPMENT */}

        {!loading && booking && (

          <div className="space-y-5">

            {/* =================================================
                SHIPMENT SUMMARY
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-widest font-black text-slate-700">
                      Tracking Number
                    </p>

                    <h2 className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                      {booking.tracking_number ||
                        "Unavailable"}
                    </h2>

                  </div>

                  <span
                    className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-black ${getStatusBadge(
                      booking.status
                    )}`}
                  >
                    {booking.status ||
                      "Pending"}
                  </span>

                </div>

                {/* CURRENT SHIPMENT INFORMATION */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

                  <div className="border border-slate-200 rounded-xl p-4">

                    <div className="flex items-center gap-2 text-slate-700">

                      <MapPin size={17} />

                      <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                        Current Location
                      </span>

                    </div>

                    <p className="font-black text-sm text-slate-900 mt-2">
                      {booking.current_location ||
                        "Awaiting update"}
                    </p>

                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">

                    <div className="flex items-center gap-2 text-slate-700">

                      <Truck size={17} />

                      <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                        Next Location
                      </span>

                    </div>

                    <p className="font-black text-sm text-slate-900 mt-2">
                      {booking.next_location ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">

                    <div className="flex items-center gap-2 text-slate-700">

                      <Calendar size={17} />

                      <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                        Estimated Delivery
                      </span>

                    </div>

                    <p className="font-black text-sm text-slate-900 mt-2">
                      {booking.estimated_delivery ||
                        "Not available"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ROUTE
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">

              <h2 className="text-lg font-black text-blue-950">
                Shipment Route
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mt-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs uppercase tracking-widest font-black text-slate-700">
                    From
                  </p>

                  <p className="font-black text-slate-900 mt-2">
                    {booking.pickup_address ||
                      "Not available"}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs uppercase tracking-widest font-black text-slate-700">
                    To
                  </p>

                  <p className="font-black text-slate-900 mt-2">
                    {booking.delivery_address ||
                      "Not available"}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                TRACKING HISTORY
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-2xl">

              <div className="px-5 sm:px-6 py-5 border-b border-slate-200">

                <h2 className="text-xl font-black text-blue-950">
                  Tracking History
                </h2>

                <p className="text-sm text-slate-700 mt-1">
                  Shipment activity from latest to
                  oldest.
                </p>

              </div>

              <div className="p-5 sm:p-6">

                {updates.length === 0 ? (

                  <div className="py-8 text-center">

                    <Clock
                      size={32}
                      className="text-slate-500 mx-auto"
                    />

                    <p className="font-bold text-slate-700 mt-3">
                      No tracking updates yet.
                    </p>

                  </div>

                ) : (

                  <div className="relative">

                    {updates.map(
                      (update, index) => {

                        const successful =
                          isSuccessfulStatus(
                            update.status
                          );

                        const problem =
                          isProblemStatus(
                            update.status
                          );

                        const isLast =
                          index ===
                          updates.length - 1;

                        return (

                          <div
                            key={update.id}
                            className="relative flex gap-4"
                          >

                            {/* TIMELINE */}

                            <div className="flex flex-col items-center">

                              <div
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${getTimelineCircle(
                                  update.status
                                )}`}
                              >
                                {getStatusIcon(
                                  update.status
                                )}
                              </div>

                              {!isLast && (

                                <div
                                  className={`w-0.5 flex-1 min-h-12 ${
                                    successful
                                      ? "bg-green-300"
                                      : problem
                                      ? "bg-orange-200"
                                      : "bg-slate-300"
                                  }`}
                                />

                              )}

                            </div>

                            {/* EVENT */}

                            <div className="flex-1 pb-7">

                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                                <div>

                                  <div className="flex flex-wrap items-center gap-2">

                                    <h3
                                      className={`font-black text-base ${
                                        problem
                                          ? "text-orange-700"
                                          : successful
                                          ? "text-slate-900"
                                          : "text-slate-700"
                                      }`}
                                    >
                                      {update.status ||
                                        "Shipment Update"}
                                    </h3>

                                    {successful && (

                                      <span className="text-xs font-bold text-green-600">
                                        Completed
                                      </span>

                                    )}

                                    {problem && (

                                      <span className="text-xs font-bold text-orange-600">
                                        Attention
                                      </span>

                                    )}

                                  </div>

                                </div>

                                {update.created_at && (

                                  <span className="text-xs text-slate-600 font-semibold whitespace-nowrap">

                                    {new Date(
                                      update.created_at
                                    ).toLocaleString()}

                                  </span>

                                )}

                              </div>

                              {update.location && (

                                <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">

                                  <MapPin
                                    size={15}
                                  />

                                  <span className="font-semibold">
                                    {update.location}
                                  </span>

                                </div>

                              )}

                              {update.message && (

                                <p
                                  className={`text-sm mt-2 ${
                                    problem
                                      ? "text-orange-700 font-semibold"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {update.message}
                                </p>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                PACKAGE INFORMATION
            ================================================= */}

            <div className="bg-white border border-slate-200 rounded-2xl">

              <div className="px-5 sm:px-6 py-5 border-b border-slate-200 flex items-center gap-3">

                <Package
                  size={21}
                  className="text-blue-800"
                />

                <div>

                  <h2 className="font-black text-blue-950">
                    Package Information
                  </h2>

                  <p className="text-xs text-slate-700">
                    Shipment details
                  </p>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-700">
                      Type
                    </p>

                    <p className="font-black text-sm text-slate-900 mt-2">
                      {booking.package_type ||
                        "Not provided"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-700">
                      Quantity
                    </p>

                    <p className="font-black text-sm text-slate-900 mt-2">
                      {booking.package_quantity ??
                        1}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-700">
                      Weight
                    </p>

                    <p className="font-black text-sm text-slate-900 mt-2">

                      {booking.package_weight !==
                        null &&
                      booking.package_weight !==
                        undefined
                        ? `${booking.package_weight} kg`
                        : "Not provided"}

                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-700">
                      Value
                    </p>

                    <p className="font-black text-sm text-slate-900 mt-2">

                      {booking.package_value !==
                        null &&
                      booking.package_value !==
                        undefined
                        ? `$${booking.package_value}`
                        : "Not provided"}

                    </p>

                  </div>

                </div>

                {booking.package_description && (

                  <div className="mt-4">

                    <p className="text-xs uppercase font-black text-slate-700">
                      Description
                    </p>

                    <p className="text-sm text-slate-700 mt-2">
                      {booking.package_description}
                    </p>

                  </div>

                )}

                {booking.special_handling && (

                  <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-orange-700">
                      Special Handling
                    </p>

                    <p className="text-sm text-slate-800 font-semibold mt-2">
                      {booking.special_handling}
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                LAST UPDATED
            ================================================= */}

            {booking.last_updated && (

              <div className="text-center text-xs text-slate-600 pb-4">

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

/* =========================================================
   LOADING
========================================================= */

function TrackPageLoading() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">

      <div className="text-center">

        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

        <p className="font-bold text-slate-700 mt-4">
          Loading tracking page...
        </p>

      </div>

    </main>
  );
}

/* =========================================================
   PAGE EXPORT
========================================================= */

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <TrackPageLoading />
      }
    >
      <TrackShipment />
    </Suspense>
  );
}