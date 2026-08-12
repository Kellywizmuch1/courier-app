"use client";

import { FormEvent, useState } from "react";
import {
  Search,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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
        size={18}
        className="text-green-400"
      />
    );
  }

  if (value === "picked up") {
    return (
      <CheckCircle
        size={18}
        className="text-green-400"
      />
    );
  }

  if (value === "in transit") {
    return (
      <Truck
        size={18}
        className="text-orange-400"
      />
    );
  }

  if (value === "delayed") {
    return (
      <AlertTriangle
        size={18}
        className="text-orange-400"
      />
    );
  }

  if (value === "delivery issue") {
    return (
      <AlertTriangle
        size={18}
        className="text-red-400"
      />
    );
  }

  return (
    <Clock
      size={18}
      className="text-slate-400"
    />
  );
}

function getStatusColor(status: string | null) {
  const value = normalizeStatus(status);

  if (value === "delivered") {
    return "bg-green-500/15 border-green-400/20 text-green-300";
  }

  if (
    value === "picked up" ||
    value === "in transit"
  ) {
    return "bg-orange-500/15 border-orange-400/20 text-orange-300";
  }

  if (value === "delayed") {
    return "bg-orange-500/15 border-orange-400/20 text-orange-300";
  }

  if (value === "delivery issue") {
    return "bg-red-500/15 border-red-400/20 text-red-300";
  }

  return "bg-white/10 border-white/10 text-slate-300";
}

function getTimelineColor(status: string | null) {
  if (isSuccessfulStatus(status)) {
    return "bg-green-400";
  }

  if (isProblemStatus(status)) {
    return "bg-orange-400";
  }

  return "bg-slate-500";
}

export default function ShipmentTracker() {
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

  const [errorMessage, setErrorMessage] =
    useState("");

  async function loadShipment(
    trackingNumber: string
  ) {
    const cleanedTracking =
      trackingNumber.trim().toUpperCase();

    if (!cleanedTracking) {
      setErrorMessage(
        "Please enter a tracking number."
      );
      setSearched(true);
      return;
    }

    setLoading(true);
    setSearched(true);
    setBooking(null);
    setUpdates([]);
    setErrorMessage("");

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

        setErrorMessage(
          "Unable to find shipment."
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "Shipment not found."
        );

        return;
      }

      const result =
        data as PublicShipmentResponse;

      if (!result.shipment) {
        setErrorMessage(
          "Shipment not found."
        );

        return;
      }

      setBooking(result.shipment);

      const sortedHistory = [
        ...(result.history || []),
      ].sort((a, b) => {
        const first = a.created_at
          ? new Date(
              a.created_at
            ).getTime()
          : 0;

        const second = b.created_at
          ? new Date(
              b.created_at
            ).getTime()
          : 0;

        return second - first;
      });

      setUpdates(sortedHistory);
    } catch (error) {
      console.error(
        "TRACKING ERROR:",
        error
      );

      setErrorMessage(
        "Something went wrong while tracking this shipment."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    loadShipment(trackingInput);
  }

  return (
    <div className="w-full text-white">

      {/* =====================================================
          TRACKING SEARCH
      ===================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-3 mb-5">

          <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">

            <Package
              size={22}
              className="text-white"
            />

          </div>

          <div>

            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Shipment Overview
            </p>

            <h2 className="text-2xl font-black text-white mt-1">
              Track your delivery
            </h2>

          </div>

        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
              className="
                w-full
                rounded-xl
                border
                border-white/15
                bg-white/10
                backdrop-blur-md
                py-3.5
                pl-11
                pr-4
                text-white
                placeholder:text-slate-400
                font-semibold
                outline-none
                focus:border-orange-400
                focus:ring-2
                focus:ring-orange-500/20
                transition
              "
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              bg-orange-500
              hover:bg-orange-600
              disabled:opacity-60
              disabled:cursor-not-allowed
              text-white
              px-7
              py-3.5
              rounded-xl
              font-black
              transition
              shadow-lg
              shadow-orange-500/20
            "
          >
            {loading
              ? "Searching..."
              : "Track"}
          </button>

        </form>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {searched &&
        errorMessage && (
          <div
            className="
              mb-5
              bg-red-500/10
              border
              border-red-400/20
              text-red-300
              rounded-xl
              p-4
              font-bold
              text-sm
            "
          >
            {errorMessage}
          </div>
        )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div
          className="
            bg-white/5
            border
            border-white/10
            rounded-2xl
            p-8
            text-center
          "
        >

          <div
            className="
              w-9
              h-9
              border-4
              border-orange-500
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="text-slate-300 font-bold mt-4">
            Finding your shipment...
          </p>

        </div>
      )}

      {/* =====================================================
          SHIPMENT RESULT
      ===================================================== */}

      {!loading && booking && (
        <div className="space-y-5">

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-5
            "
          >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <p className="text-xs uppercase tracking-widest font-black text-slate-400">
                  Tracking Number
                </p>

                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {booking.tracking_number ||
                    "Unavailable"}
                </h2>

              </div>

              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  w-fit
                  px-3.5
                  py-2
                  rounded-full
                  border
                  text-xs
                  font-black
                  ${getStatusColor(
                    booking.status
                  )}
                `}
              >

                {getStatusIcon(
                  booking.status
                )}

                {booking.status ||
                  "Pending"}

              </span>

            </div>

          </div>

          {/* =================================================
              LIVE SHIPMENT INFORMATION
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-3
            "
          >

            <div
              className="
                bg-white/5
                border
                border-white/10
                rounded-xl
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <MapPin size={16} />

                <span className="text-[10px] font-black uppercase tracking-wider">
                  Current Location
                </span>

              </div>

              <p className="font-black text-sm text-white mt-2">
                {booking.current_location ||
                  "Awaiting update"}
              </p>

            </div>

            <div
              className="
                bg-white/5
                border
                border-white/10
                rounded-xl
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <Truck size={16} />

                <span className="text-[10px] font-black uppercase tracking-wider">
                  Next Location
                </span>

              </div>

              <p className="font-black text-sm text-white mt-2">
                {booking.next_location ||
                  "Not available"}
              </p>

            </div>

            <div
              className="
                bg-white/5
                border
                border-white/10
                rounded-xl
                p-4
              "
            >

              <div className="flex items-center gap-2 text-slate-400">

                <Calendar size={16} />

                <span className="text-[10px] font-black uppercase tracking-wider">
                  Estimated Delivery
                </span>

              </div>

              <p className="font-black text-sm text-white mt-2">
                {booking.estimated_delivery ||
                  "Not available"}
              </p>

            </div>

          </div>

          {/* =================================================
              ROUTE
          ================================================= */}

          <div
            className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-5
            "
          >

            <h3 className="font-black text-white">
              Shipment Route
            </h3>

            <div className="grid sm:grid-cols-2 gap-3 mt-4">

              <div className="bg-black/10 rounded-xl p-4">

                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  From
                </p>

                <p className="font-bold text-sm text-white mt-2">
                  {booking.pickup_address ||
                    "Not available"}
                </p>

              </div>

              <div className="bg-black/10 rounded-xl p-4">

                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                  To
                </p>

                <p className="font-bold text-sm text-white mt-2">
                  {booking.delivery_address ||
                    "Not available"}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              TRACKING HISTORY
          ================================================= */}

          <div
            className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              overflow-hidden
            "
          >

            <div className="px-5 py-4 border-b border-white/10">

              <h3 className="font-black text-white">
                Tracking History
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Latest shipment activity
              </p>

            </div>

            <div className="p-5">

              {updates.length === 0 ? (
                <div className="py-5 text-center">

                  <Clock
                    size={28}
                    className="text-slate-500 mx-auto"
                  />

                  <p className="text-sm font-bold text-slate-400 mt-3">
                    No tracking updates yet.
                  </p>

                </div>
              ) : (
                <div className="space-y-0">

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
                          className="flex gap-4"
                        >

                          <div className="flex flex-col items-center">

                            <div
                              className={`
                                w-9
                                h-9
                                rounded-full
                                border
                                border-white/10
                                flex
                                items-center
                                justify-center
                                shrink-0
                                ${getTimelineColor(
                                  update.status
                                )}
                              `}
                            />

                            {!isLast && (
                              <div
                                className={`
                                  w-px
                                  flex-1
                                  min-h-10
                                  ${
                                    successful
                                      ? "bg-green-400/40"
                                      : problem
                                      ? "bg-orange-400/40"
                                      : "bg-white/10"
                                  }
                                `}
                              />
                            )}

                          </div>

                          <div className="flex-1 pb-6">

                            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">

                              <div className="flex items-center gap-2">

                                {getStatusIcon(
                                  update.status
                                )}

                                <p className="font-black text-sm text-white">
                                  {update.status ||
                                    "Shipment Update"}
                                </p>

                              </div>

                              {update.created_at && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  {new Date(
                                    update.created_at
                                  ).toLocaleString()}
                                </span>
                              )}

                            </div>

                            {update.location && (
                              <div className="flex items-center gap-2 mt-2">

                                <MapPin
                                  size={13}
                                  className="text-slate-500"
                                />

                                <p className="text-xs text-slate-400 font-semibold">
                                  {update.location}
                                </p>

                              </div>
                            )}

                            {update.message && (
                              <p
                                className={`
                                  text-xs
                                  mt-2
                                  ${
                                    problem
                                      ? "text-orange-300"
                                      : "text-slate-400"
                                  }
                                `}
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

          <div
            className="
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-5
            "
          >

            <div className="flex items-center gap-3 mb-4">

              <Package
                size={19}
                className="text-orange-400"
              />

              <div>

                <h3 className="font-black text-white">
                  Package Information
                </h3>

                <p className="text-[10px] text-slate-400">
                  Shipment details
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="bg-black/10 rounded-xl p-3">

                <p className="text-[10px] uppercase font-black text-slate-500">
                  Type
                </p>

                <p className="font-black text-xs text-white mt-1">
                  {booking.package_type ||
                    "Not provided"}
                </p>

              </div>

              <div className="bg-black/10 rounded-xl p-3">

                <p className="text-[10px] uppercase font-black text-slate-500">
                  Quantity
                </p>

                <p className="font-black text-xs text-white mt-1">
                  {booking.package_quantity ??
                    1}
                </p>

              </div>

              <div className="bg-black/10 rounded-xl p-3">

                <p className="text-[10px] uppercase font-black text-slate-500">
                  Weight
                </p>

                <p className="font-black text-xs text-white mt-1">
                  {booking.package_weight !==
                    null &&
                  booking.package_weight !==
                    undefined
                    ? `${booking.package_weight} kg`
                    : "Not provided"}
                </p>

              </div>

              <div className="bg-black/10 rounded-xl p-3">

                <p className="text-[10px] uppercase font-black text-slate-500">
                  Value
                </p>

                <p className="font-black text-xs text-white mt-1">
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

                <p className="text-[10px] uppercase font-black text-slate-500">
                  Description
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {booking.package_description}
                </p>

              </div>
            )}

            {booking.special_handling && (
              <div
                className="
                  mt-4
                  bg-orange-500/10
                  border
                  border-orange-400/20
                  rounded-xl
                  p-3
                "
              >

                <p className="text-[10px] uppercase font-black text-orange-400">
                  Special Handling
                </p>

                <p className="text-xs text-orange-100 font-semibold mt-1">
                  {booking.special_handling}
                </p>

              </div>
            )}

          </div>

          {/* =================================================
              LAST UPDATED
          ================================================= */}

          {booking.last_updated && (
            <div className="text-center text-[10px] text-slate-500 pb-2">

              Last updated:{" "}

              {new Date(
                booking.last_updated
              ).toLocaleString()}

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading &&
        !booking &&
        !errorMessage && (
          <div
            className="
              mt-6
              bg-white/5
              border
              border-white/10
              rounded-2xl
              p-8
              text-center
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-orange-500/10
                border
                border-orange-400/20
                flex
                items-center
                justify-center
                mx-auto
              "
            >

              <Package
                size={26}
                className="text-orange-400"
              />

            </div>

            <h3 className="font-black text-white mt-4">
              Your delivery is moving.
            </h3>

            <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              Enter your tracking number above
              to see the current shipment status,
              location, route and delivery history.
            </p>

          </div>
        )}

    </div>
  );
}