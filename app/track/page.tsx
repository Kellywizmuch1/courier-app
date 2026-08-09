"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import {
  Search,
  Package,
  MapPin,
  Navigation,
  CalendarDays,
  CheckCircle2,
  Circle,
  Truck,
  ArrowRight,
  Clock3,
  AlertTriangle,
  Map,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

const ShipmentMap = dynamic(
  () => import("../../components/ShipmentMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] rounded-3xl bg-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-bold">
            Loading map...
          </p>
        </div>
      </div>
    ),
  }
);

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [shipmentUpdates, setShipmentUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  /*
    READ TRACKING NUMBER FROM URL

    This allows links such as:

    /track?tracking=TRK123456

    to automatically search for the shipment.
  */

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const tracking = params.get("tracking");

    if (tracking) {
      const formattedTracking =
        tracking.trim().toUpperCase();

      setTrackingNumber(formattedTracking);

      searchShipment(formattedTracking);
    }
  }, []);

  /*
    REALTIME SUBSCRIPTION

    Once a shipment has been found, listen for changes
    to that specific booking and shipment history.
  */

  useEffect(() => {
    if (!booking?.id) {
      return;
    }

    const bookingId = booking.id;

    const bookingChannel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        async (payload) => {
          console.log(
            "Realtime booking update:",
            payload
          );

          if (payload.eventType === "UPDATE") {
            setBooking(payload.new);
          }

          if (payload.eventType === "DELETE") {
            setBooking(null);
            setShipmentUpdates([]);
            setNotFound(true);
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "Booking realtime status:",
          status
        );

        if (status === "SUBSCRIBED") {
          setRealtimeConnected(true);
        } else {
          setRealtimeConnected(false);
        }
      });

    const historyChannel = supabase
      .channel(`shipment-history-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shipment_updates",
          filter: `booking_id=eq.${bookingId}`,
        },
        async () => {
          console.log(
            "Realtime shipment history changed."
          );

          const { data, error } = await supabase
            .from("shipment_updates")
            .select("*")
            .eq("booking_id", bookingId)
            .order("created_at", {
              ascending: false,
            });

          if (!error) {
            setShipmentUpdates(data || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        bookingChannel
      );

      supabase.removeChannel(
        historyChannel
      );

      setRealtimeConnected(false);
    };
  }, [booking?.id]);

  /*
    SEARCH SHIPMENT
  */

  async function searchShipment(
    number: string
  ) {
    if (!number.trim()) {
      setBooking(null);
      setShipmentUpdates([]);
      setNotFound(true);
      return;
    }

    setLoading(true);
    setNotFound(false);
    setBooking(null);
    setShipmentUpdates([]);

    const formattedNumber =
      number.trim().toUpperCase();

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq(
        "tracking_number",
        formattedNumber
      )
      .single();

    if (error || !data) {
      console.error(
        "TRACKING SEARCH ERROR:",
        error
      );

      setLoading(false);
      setNotFound(true);
      return;
    }

    setBooking(data);

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

    if (!historyError) {
      setShipmentUpdates(history || []);
    }

    setLoading(false);
  }

  /*
    TRACK BUTTON
  */

  async function handleTrack() {
    await searchShipment(trackingNumber);
  }

  /*
    REFRESH CURRENT SHIPMENT
  */

  async function refreshShipment() {
    if (!booking?.tracking_number) {
      return;
    }

    await searchShipment(
      booking.tracking_number
    );
  }

  /*
    STATUS COLORS
  */

  function statusColor(status: string) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "Picked Up":
        return "bg-blue-100 text-blue-800 border-blue-200";

      case "In Transit":
        return "bg-orange-100 text-orange-800 border-orange-200";

      case "Delayed":
        return "bg-purple-100 text-purple-800 border-purple-200";

      case "Delivery Issue":
        return "bg-red-100 text-red-800 border-red-200";

      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }

  /*
    PROGRESS STEP
  */

  function getStatusStep(status: string) {
    switch (status) {
      case "Pending":
        return 1;

      case "Picked Up":
        return 2;

      case "In Transit":
      case "Delayed":
      case "Delivery Issue":
        return 3;

      case "Delivered":
        return 4;

      default:
        return 1;
    }
  }

  const currentStep = booking
    ? getStatusStep(booking.status)
    : 0;

  const steps = [
    {
      title: "Booking Confirmed",
      description:
        "Your shipment has been booked successfully.",
    },
    {
      title: "Package Picked Up",
      description:
        "Your shipment has been collected.",
    },
    {
      title: "In Transit",
      description:
        "Your shipment is currently on the move.",
    },
    {
      title: "Delivered",
      description:
        "Your shipment has reached its destination.",
    },
  ];

  /*
    MAP COORDINATES
  */

  const hasMapCoordinates =
    booking &&
    booking.pickup_latitude !== null &&
    booking.pickup_latitude !== undefined &&
    booking.pickup_longitude !== null &&
    booking.pickup_longitude !== undefined &&
    booking.current_latitude !== null &&
    booking.current_latitude !== undefined &&
    booking.current_longitude !== null &&
    booking.current_longitude !== undefined &&
    booking.delivery_latitude !== null &&
    booking.delivery_latitude !== undefined &&
    booking.delivery_longitude !== null &&
    booking.delivery_longitude !== undefined;

  const pickupCoordinates:
    | [number, number]
    | null = hasMapCoordinates
    ? [
        Number(booking.pickup_latitude),
        Number(booking.pickup_longitude),
      ]
    : null;

  const currentCoordinates:
    | [number, number]
    | null = hasMapCoordinates
    ? [
        Number(booking.current_latitude),
        Number(booking.current_longitude),
      ]
    : null;

  const deliveryCoordinates:
    | [number, number]
    | null = hasMapCoordinates
    ? [
        Number(booking.delivery_latitude),
        Number(booking.delivery_longitude),
      ]
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />

        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">

          <div className="text-center max-w-4xl mx-auto">

            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-full px-5 py-3 mb-8">

              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />

              <span className="text-sm font-bold tracking-wide">
                ATLAS EXPRESS TRACKING
              </span>

            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Track Your
              <span className="text-orange-500">
                {" "}Shipment.
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-8">
              Enter your Atlas Express tracking number
              to see the latest shipment information,
              location, history and delivery progress.
            </p>

          </div>

          {/* SEARCH */}

          <div className="max-w-5xl mx-auto mt-12">

            <div className="bg-white rounded-3xl p-4 md:p-5 shadow-2xl">

              <div className="flex flex-col md:flex-row gap-4">

                <div className="relative flex-1">

                  <Search
                    size={24}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) =>
                      setTrackingNumber(
                        e.target.value.toUpperCase()
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTrack();
                      }
                    }}
                    placeholder="Enter your tracking number"
                    className="w-full border-2 border-slate-200 rounded-2xl py-5 pl-14 pr-5 text-lg font-semibold text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:border-orange-500 transition"
                  />

                </div>

                <button
                  onClick={handleTrack}
                  disabled={loading}
                  className="md:w-48 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-2xl px-8 py-5 font-black text-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3"
                >

                  {loading ? (
                    <>
                      <RefreshCw
                        size={20}
                        className="animate-spin"
                      />
                      Searching...
                    </>
                  ) : (
                    <>
                      Track
                      <ArrowRight size={21} />
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

          {/* NOT FOUND */}

          {notFound && (
            <div className="max-w-5xl mx-auto mt-6">

              <div className="bg-red-500/10 border border-red-400/20 rounded-2xl p-5 text-center">

                <p className="text-red-300 font-bold">
                  We couldn't find a shipment with
                  that tracking number.
                </p>

                <p className="text-red-200/70 text-sm mt-1">
                  Please check the tracking number
                  and try again.
                </p>

              </div>

            </div>
          )}

        </div>

      </section>

      {/* RESULTS */}

      {booking && (
        <section className="bg-slate-100 text-slate-900 py-20">

          <div className="max-w-6xl mx-auto px-6">

            {/* LIVE CONNECTION */}

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    realtimeConnected
                      ? "bg-green-500 animate-pulse"
                      : "bg-slate-300"
                  }`}
                />

                <span className="text-sm font-bold text-slate-600">
                  {realtimeConnected
                    ? "Live tracking connected"
                    : "Connecting to live tracking..."}
                </span>

              </div>

              <button
                onClick={refreshShipment}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-orange-400 hover:text-orange-500 rounded-xl px-5 py-2.5 font-bold shadow-sm transition"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh Tracking
              </button>

            </div>

            {/* SHIPMENT HEADER */}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

              <div className="bg-blue-900 text-white p-8 md:p-10">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-3 mb-3">

                      <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Package size={26} />
                      </div>

                      <p className="text-blue-200 font-bold uppercase tracking-wider text-sm">
                        Shipment Details
                      </p>

                    </div>

                    <h2 className="text-3xl md:text-4xl font-black">
                      {booking.tracking_number}
                    </h2>

                  </div>

                  <span
                    className={`px-6 py-3 rounded-full border font-black text-sm ${statusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status || "Pending"}
                  </span>

                </div>

              </div>

              <div className="p-8 md:p-10">

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                  {/* SENDER */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Sender
                    </p>

                    <p className="text-lg font-black">
                      {booking.sender_name ||
                        "Not available"}
                    </p>

                  </div>

                  {/* RECEIVER */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
                      Receiver
                    </p>

                    <p className="text-lg font-black">
                      {booking.receiver_name ||
                        "Not available"}
                    </p>

                  </div>

                  {/* CURRENT LOCATION */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-3">

                      <MapPin
                        size={20}
                        className="text-orange-500"
                      />

                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        Current Location
                      </p>

                    </div>

                    <p className="text-lg font-black">
                      {booking.current_location ||
                        "Awaiting Pickup"}
                    </p>

                  </div>

                  {/* NEXT LOCATION */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-3">

                      <Navigation
                        size={20}
                        className="text-blue-700"
                      />

                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        Next Location
                      </p>

                    </div>

                    <p className="text-lg font-black">
                      {booking.next_location ||
                        "Not Available"}
                    </p>

                  </div>

                  {/* DELIVERY */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-3">

                      <CalendarDays
                        size={20}
                        className="text-purple-600"
                      />

                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        Estimated Delivery
                      </p>

                    </div>

                    <p className="text-lg font-black">
                      {booking.estimated_delivery ||
                        "Not Available"}
                    </p>

                  </div>

                  {/* UPDATED */}

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6">

                    <div className="flex items-center gap-3 mb-3">

                      <Clock3
                        size={20}
                        className="text-green-600"
                      />

                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                        Last Updated
                      </p>

                    </div>

                    <p className="font-black">

                      {booking.last_updated
                        ? new Date(
                            booking.last_updated
                          ).toLocaleString()
                        : "No updates yet"}

                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* MAP */}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 mt-8 overflow-hidden">

              <div className="p-8 md:p-10 pb-6">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                    <Map
                      size={25}
                      className="text-blue-900"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                      Live Shipment Map
                    </p>

                    <h2 className="text-3xl font-black">
                      Shipment Route
                    </h2>

                  </div>

                </div>

              </div>

              {hasMapCoordinates &&
              pickupCoordinates &&
              currentCoordinates &&
              deliveryCoordinates ? (

                <div className="px-6 pb-6">

                  <ShipmentMap
                    pickup={pickupCoordinates}
                    current={currentCoordinates}
                    destination={
                      deliveryCoordinates
                    }
                  />

                  <div className="grid md:grid-cols-3 gap-4 mt-6">

                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">

                      <div className="w-4 h-4 rounded-full bg-blue-600" />

                      <div>

                        <p className="font-black">
                          Pickup
                        </p>

                        <p className="text-sm text-slate-500">
                          Shipment origin
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">

                      <div className="w-4 h-4 rounded-full bg-orange-500" />

                      <div>

                        <p className="font-black">
                          Current Location
                        </p>

                        <p className="text-sm text-slate-500">
                          Current shipment position
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-4">

                      <div className="w-4 h-4 rounded-full bg-red-600" />

                      <div>

                        <p className="font-black">
                          Destination
                        </p>

                        <p className="text-sm text-slate-500">
                          Delivery destination
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="px-8 md:px-10 pb-10">

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center">

                    <Map
                      size={50}
                      className="mx-auto text-slate-300"
                    />

                    <h3 className="text-xl font-black mt-5">
                      Map information not available yet
                    </h3>

                    <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                      Shipment coordinates have not
                      been added yet. The map will
                      appear here once location
                      information is available.
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* DELIVERY ISSUE */}

            {(booking.delivery_issue ||
              booking.delivery_update ||
              booking.status ===
                "Delivery Issue" ||
              booking.status ===
                "Delayed") && (

              <div className="mt-8 bg-white rounded-3xl shadow-xl border border-red-200 overflow-hidden">

                <div className="bg-red-50 p-6 md:p-8">

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">

                      <AlertTriangle
                        size={25}
                        className="text-red-600"
                      />

                    </div>

                    <div>

                      <p className="text-sm font-bold uppercase tracking-wider text-red-500">
                        Delivery Update
                      </p>

                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        {booking.delivery_issue ||
                          booking.status}
                      </h2>

                      {booking.delivery_update && (
                        <p className="text-slate-600 mt-3 leading-7">
                          {booking.delivery_update}
                        </p>
                      )}

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* SHIPMENT HISTORY */}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 mt-8 p-8 md:p-10">

              <div className="flex items-center gap-4 mb-10">

                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">

                  <Clock3
                    size={25}
                    className="text-orange-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                    Tracking Activity
                  </p>

                  <h2 className="text-3xl font-black">
                    Shipment History
                  </h2>

                </div>

              </div>

              {shipmentUpdates.length === 0 ? (

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">

                  <Clock3
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="font-bold text-slate-500 mt-4">
                    No tracking updates yet.
                  </p>

                  <p className="text-sm text-slate-400 mt-1">
                    Shipment activity will appear
                    here as the package moves.
                  </p>

                </div>

              ) : (

                <div className="relative">

                  <div className="absolute left-6 top-3 bottom-3 w-1 bg-slate-200" />

                  <div className="space-y-8">

                    {shipmentUpdates.map(
                      (update) => (

                        <div
                          key={update.id}
                          className="relative flex gap-6"
                        >

                          <div className="relative z-10 w-12 h-12 flex-shrink-0 rounded-full bg-orange-500 border-4 border-white shadow-lg flex items-center justify-center">

                            <CheckCircle2
                              size={22}
                              className="text-white"
                            />

                          </div>

                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                              <div>

                                <span className="inline-flex px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-sm font-black">
                                  {update.status}
                                </span>

                                {update.location && (

                                  <div className="flex items-center gap-2 mt-3 text-slate-600 font-semibold">

                                    <MapPin
                                      size={18}
                                      className="text-orange-500"
                                    />

                                    {update.location}

                                  </div>

                                )}

                              </div>

                              <p className="text-sm text-slate-400 font-semibold">

                                {update.created_at
                                  ? new Date(
                                      update.created_at
                                    ).toLocaleString()
                                  : "Unknown time"}

                              </p>

                            </div>

                            <p className="text-slate-700 font-semibold mt-4 leading-7">
                              {update.message}
                            </p>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>

            {/* PROGRESS */}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 mt-8 p-8 md:p-10">

              <div className="flex items-center gap-3 mb-10">

                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">

                  <Truck
                    size={25}
                    className="text-blue-900"
                  />

                </div>

                <div>

                  <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                    Shipment Journey
                  </p>

                  <h2 className="text-3xl font-black">
                    Delivery Progress
                  </h2>

                </div>

              </div>

              <div className="relative">

                <div className="hidden md:block absolute left-[10%] right-[10%] top-7 h-1 bg-slate-200" />

                <div
                  className="hidden md:block absolute left-[10%] top-7 h-1 bg-orange-500 transition-all duration-700"
                  style={{
                    width:
                      currentStep === 1
                        ? "0%"
                        : currentStep === 2
                        ? "26%"
                        : currentStep === 3
                        ? "53%"
                        : "80%",
                  }}
                />

                <div className="grid md:grid-cols-4 gap-8 relative">

                  {steps.map(
                    (step, index) => {

                      const stepNumber =
                        index + 1;

                      const completed =
                        stepNumber <=
                        currentStep;

                      const active =
                        stepNumber ===
                        currentStep;

                      return (
                        <div
                          key={step.title}
                          className="text-center"
                        >

                          <div className="flex justify-center">

                            {completed ? (

                              <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${
                                  active
                                    ? "bg-orange-500"
                                    : "bg-green-500"
                                }`}
                              >

                                <CheckCircle2
                                  size={25}
                                  className="text-white"
                                />

                              </div>

                            ) : (

                              <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-white shadow flex items-center justify-center">

                                <Circle
                                  size={22}
                                  className="text-slate-400"
                                />

                              </div>

                            )}

                          </div>

                          <h3
                            className={`mt-5 font-black ${
                              completed
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </h3>

                          <p
                            className={`text-sm mt-2 leading-6 ${
                              completed
                                ? "text-slate-600"
                                : "text-slate-400"
                            }`}
                          >
                            {step.description}
                          </p>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* ROUTE SUMMARY */}

            <div className="bg-slate-950 text-white rounded-3xl shadow-xl mt-8 p-8 md:p-10">

              <div className="flex items-center gap-3 mb-8">

                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <Navigation size={24} />
                </div>

                <div>

                  <p className="text-orange-400 text-sm font-bold uppercase tracking-wider">
                    Shipment Route
                  </p>

                  <h2 className="text-3xl font-black">
                    Package Movement
                  </h2>

                </div>

              </div>

              <div className="grid md:grid-cols-3 items-center gap-6">

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                  <p className="text-slate-400 text-sm font-bold">
                    Pickup
                  </p>

                  <p className="text-lg font-black mt-2">
                    {booking.pickup_address ||
                      "Not available"}
                  </p>

                </div>

                <div className="relative">

                  <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-white/10" />

                  <div className="relative bg-orange-500 rounded-2xl p-6 text-center shadow-xl">

                    <Truck
                      size={30}
                      className="mx-auto"
                    />

                    <p className="text-sm font-bold mt-3">
                      Current Shipment Location
                    </p>

                    <p className="font-black mt-1">
                      {booking.current_location ||
                        "Awaiting Pickup"}
                    </p>

                  </div>

                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">

                  <p className="text-slate-400 text-sm font-bold">
                    Destination
                  </p>

                  <p className="text-lg font-black mt-2">
                    {booking.delivery_address ||
                      "Not available"}
                  </p>

                </div>

              </div>

              {booking.next_location && (

                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5 text-center">

                  <p className="text-slate-400 text-sm">
                    Next shipment location
                  </p>

                  <p className="text-orange-400 font-black text-lg mt-1">
                    {booking.next_location}
                  </p>

                </div>

              )}

            </div>

            {/* BOTTOM CTA */}

            <div className="mt-8 bg-blue-900 rounded-3xl p-8 md:p-10 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>

                <p className="text-orange-400 font-bold uppercase tracking-wider text-sm">
                  Atlas Express
                </p>

                <h2 className="text-2xl md:text-3xl font-black mt-2">
                  Your shipment, clearly tracked.
                </h2>

              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 px-7 py-4 rounded-xl font-black transition"
              >
                Back to Home
                <ArrowRight size={20} />
              </Link>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}