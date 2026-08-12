"use client";


import { FormEvent, useEffect, useState } from "react";
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
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";


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


  package_type?: string | null;
  package_description?: string | null;
  package_weight?: number | null;
  package_quantity?: number | null;
  package_value?: number | null;
  special_handling?: string | null;
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


export default function DashboardPage() {
  const router = useRouter();


  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");


  /* =========================================================
     TRACKING STATE
  ========================================================= */


  const [trackingInput, setTrackingInput] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingSearched, setTrackingSearched] = useState(false);


  const [trackedShipment, setTrackedShipment] =
    useState<Booking | null>(null);


  const [trackingHistory, setTrackingHistory] =
    useState<ShipmentUpdate[]>([]);


  /* =========================================================
     LOAD DASHBOARD
  ========================================================= */


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


  /* =========================================================
     LOGOUT
  ========================================================= */


  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }


  /* =========================================================
     TRACKING HELPERS
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


    return (
      value === "delayed" ||
      value === "delivery issue"
    );
  }


  function trackingStatusStyle(status: string | null) {
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


  function trackingIcon(status: string | null) {
    const value = normalizeStatus(status);


    if (
      value === "delivered" ||
      value === "picked up"
    ) {
      return (
        <CheckCircle
          size={19}
          className="text-green-600"
        />
      );
    }


    if (value === "in transit") {
      return (
        <Truck
          size={19}
          className="text-green-600"
        />
      );
    }


    if (
      value === "delayed" ||
      value === "delivery issue"
    ) {
      return (
        <AlertTriangle
          size={19}
          className={
            value === "delayed"
              ? "text-orange-600"
              : "text-red-600"
          }
        />
      );
    }


    return (
      <Clock
        size={19}
        className="text-slate-500"
      />
    );
  }


  function timelineCircle(status: string | null) {
    if (isSuccessfulStatus(status)) {
      return "bg-green-100 border-green-200";
    }


    if (isProblemStatus(status)) {
      return "bg-orange-100 border-orange-200";
    }


    return "bg-white border-slate-300";
  }


  function statusStyle(status: string | null) {
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


  /* =========================================================
     TRACK SHIPMENT
  ========================================================= */


  async function trackShipment(event?: FormEvent) {
    event?.preventDefault();


    const cleanedTracking =
      trackingInput.trim().toUpperCase();


    if (!cleanedTracking) {
      return;
    }


    setTrackingLoading(true);
    setTrackingSearched(true);
    setTrackedShipment(null);
    setTrackingHistory([]);


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
          "DASHBOARD TRACKING ERROR:",
          error
        );
        return;
      }


      if (!data) {
        return;
      }


      const result =
        data as PublicShipmentResponse;


      setTrackedShipment(result.shipment);


      const sortedHistory = [
        ...(result.history || []),
      ].sort((a, b) => {
        const aTime = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;


        const bTime = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;


        return bTime - aTime;
      });


      setTrackingHistory(sortedHistory);
    } catch (error) {
      console.error(
        "DASHBOARD TRACKING ERROR:",
        error
      );
    } finally {
      setTrackingLoading(false);
    }
  }


  /* =========================================================
     LOADING
  ========================================================= */


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


  /* =========================================================
     DASHBOARD
  ========================================================= */


  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">


      {/* =====================================================
          HEADER
      ===================================================== */}


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


      {/* =====================================================
          CONTENT
      ===================================================== */}


      <section className="max-w-7xl mx-auto px-6 py-10">


        {/* ===================================================
            TRACKING OVERVIEW
        =================================================== */}


        <div className="mb-10">


          {/* TRACKING SEARCH */}


          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">


            <div className="max-w-4xl">


              <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
                Shipment Tracking
              </p>


              <h2 className="text-2xl md:text-3xl font-black text-blue-950 mt-1">
                Track your shipment
              </h2>


              <p className="text-slate-600 mt-2">
                Enter your tracking number to view
                the latest shipment information.
              </p>


              <form
                onSubmit={trackShipment}
                className="mt-5"
              >


                <div className="flex flex-col sm:flex-row gap-3">


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
                    disabled={trackingLoading}
                    className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-black transition"
                  >


                    <Search size={18} />


                    {trackingLoading
                      ? "Searching..."
                      : "Track"}


                  </button>


                </div>


              </form>


            </div>


          </div>


          {/* =================================================
              DEFAULT OVERVIEW
          ================================================= */}


          {!trackingSearched &&
            !trackingLoading && (


              <div className="mt-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">


                <div className="bg-slate-950 text-white p-6 md:p-7">


                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                    <div>


                      <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                        Tracking Overview
                      </p>


                      <h3 className="text-2xl md:text-3xl font-black mt-1">
                        Shipment Status
                      </h3>


                    </div>


                    <span className="inline-flex w-fit px-4 py-2 rounded-full bg-white/10 text-white text-sm font-black">
                      Ready to track
                    </span>


                  </div>


                </div>


                <div className="p-6 md:p-7">


                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <Package
                          size={19}
                          className="text-orange-500"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Tracking Number
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        Enter a tracking number
                      </p>


                    </div>


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <MapPin
                          size={19}
                          className="text-orange-500"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Current Location
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        Awaiting tracking
                      </p>


                    </div>


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <CalendarDays
                          size={19}
                          className="text-green-600"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Estimated Delivery
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        —
                      </p>


                    </div>


                  </div>


                  <div className="mt-5 grid md:grid-cols-2 gap-4">


                    <div className="bg-slate-50 rounded-2xl p-5">


                      <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                        From
                      </p>


                      <p className="font-black text-slate-900 mt-2">
                        Shipment origin
                      </p>


                    </div>


                    <div className="bg-slate-50 rounded-2xl p-5">


                      <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                        To
                      </p>


                      <p className="font-black text-slate-900 mt-2">
                        Shipment destination
                      </p>


                    </div>


                  </div>


                  <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">


                    <div className="flex items-center gap-3">


                      <Truck
                        size={22}
                        className="text-blue-700"
                      />


                      <div>


                        <p className="font-black text-blue-950">
                          Ready for shipment tracking
                        </p>


                        <p className="text-sm text-slate-700 mt-1">
                          Enter a tracking number above
                          to display the live shipment
                          overview here.
                        </p>


                      </div>


                    </div>


                  </div>


                </div>


              </div>


            )}


          {/* =================================================
              TRACKING LOADING
          ================================================= */}


          {trackingLoading && (


            <div className="mt-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center">


              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />


              <p className="font-bold text-slate-700 mt-4">
                Finding your shipment...
              </p>


            </div>


          )}


          {/* =================================================
              NOT FOUND
          ================================================= */}


          {!trackingLoading &&
            trackingSearched &&
            !trackedShipment && (


              <div className="mt-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">


                <AlertTriangle
                  size={38}
                  className="text-red-500 mx-auto"
                />


                <h3 className="text-xl font-black mt-4">
                  Shipment Not Found
                </h3>


                <p className="text-slate-600 mt-2">
                  We could not find a shipment with
                  that tracking number.
                </p>


              </div>


            )}


          {/* =================================================
              REAL TRACKING RESULT
          ================================================= */}


          {!trackingLoading &&
            trackedShipment && (


              <div className="mt-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">


                {/* RESULT HEADER */}


                <div className="bg-slate-950 text-white p-6 md:p-7">


                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">


                    <div>


                      <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                        Tracking Number
                      </p>


                      <h2 className="text-2xl md:text-3xl font-black mt-1">
                        {trackedShipment.tracking_number ||
                          "Unavailable"}
                      </h2>


                    </div>


                    <span
                      className={`inline-flex w-fit px-4 py-2 rounded-full text-sm font-black ${trackingStatusStyle(
                        trackedShipment.status
                      )}`}
                    >
                      {trackedShipment.status ||
                        "Pending"}
                    </span>


                  </div>


                </div>


                {/* DETAILS */}


                <div className="p-6 md:p-7">


                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <MapPin
                          size={18}
                          className="text-orange-500"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Current Location
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        {trackedShipment.current_location ||
                          "Awaiting update"}
                      </p>


                    </div>


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <Truck
                          size={18}
                          className="text-blue-700"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Next Location
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        {trackedShipment.next_location ||
                          "Not available"}
                      </p>


                    </div>


                    <div className="border border-slate-200 rounded-2xl p-5">


                      <div className="flex items-center gap-2 text-slate-700">


                        <CalendarDays
                          size={18}
                          className="text-green-600"
                        />


                        <p className="text-xs uppercase tracking-wide font-black">
                          Estimated Delivery
                        </p>


                      </div>


                      <p className="font-black text-slate-900 mt-2">
                        {trackedShipment.estimated_delivery ||
                          "Not available"}
                      </p>


                    </div>


                  </div>


                  {/* ROUTE */}


                  <div className="mt-5 grid md:grid-cols-2 gap-4">


                    <div className="bg-slate-50 rounded-2xl p-5">


                      <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                        From
                      </p>


                      <p className="font-black text-slate-900 mt-2">
                        {trackedShipment.pickup_address ||
                          "Not available"}
                      </p>


                    </div>


                    <div className="bg-slate-50 rounded-2xl p-5">


                      <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                        To
                      </p>


                      <p className="font-black text-slate-900 mt-2">
                        {trackedShipment.delivery_address ||
                          "Not available"}
                      </p>


                    </div>


                  </div>


                  {/* HISTORY */}


                  <div className="mt-7 border-t border-slate-200 pt-7">


                    <h3 className="text-xl font-black text-blue-950">
                      Tracking History
                    </h3>


                    {trackingHistory.length === 0 ? (


                      <div className="py-8 text-center">


                        <Clock
                          size={32}
                          className="text-slate-400 mx-auto"
                        />


                        <p className="font-bold text-slate-600 mt-3">
                          No tracking updates yet.
                        </p>


                      </div>


                    ) : (


                      <div className="mt-6">


                        {trackingHistory.map(
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
                              trackingHistory.length - 1;


                            return (


                              <div
                                key={update.id}
                                className="flex gap-4"
                              >


                                <div className="flex flex-col items-center">


                                  <div
                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${timelineCircle(
                                      update.status
                                    )}`}
                                  >
                                    {trackingIcon(
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
                                          : "bg-slate-200"
                                      }`}
                                    />


                                  )}


                                </div>


                                <div className="flex-1 pb-7">


                                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">


                                    <div>


                                      <div className="flex flex-wrap items-center gap-2">


                                        <h4
                                          className={`font-black ${
                                            problem
                                              ? "text-orange-700"
                                              : "text-slate-900"
                                          }`}
                                        >
                                          {update.status ||
                                            "Shipment Update"}
                                        </h4>


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


                                      <span className="text-xs text-slate-500 font-semibold">
                                        {new Date(
                                          update.created_at
                                        ).toLocaleString()}
                                      </span>


                                    )}


                                  </div>


                                  {update.location && (


                                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-700">


                                      <MapPin size={15} />


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


                  {/* PACKAGE INFORMATION */}


                  <div className="mt-2 border-t border-slate-200 pt-7">


                    <h3 className="text-xl font-black text-blue-950">
                      Package Information
                    </h3>


                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">


                      <div className="bg-slate-50 rounded-xl p-4">


                        <p className="text-xs uppercase font-black text-slate-600">
                          Type
                        </p>


                        <p className="font-black text-slate-900 text-sm mt-2">
                          {trackedShipment.package_type ||
                            "Not provided"}
                        </p>


                      </div>


                      <div className="bg-slate-50 rounded-xl p-4">


                        <p className="text-xs uppercase font-black text-slate-600">
                          Quantity
                        </p>


                        <p className="font-black text-slate-900 text-sm mt-2">
                          {trackedShipment.package_quantity ??
                            1}
                        </p>


                      </div>


                      <div className="bg-slate-50 rounded-xl p-4">


                        <p className="text-xs uppercase font-black text-slate-600">
                          Weight
                        </p>


                        <p className="font-black text-slate-900 text-sm mt-2">


                          {trackedShipment.package_weight !==
                            null &&
                          trackedShipment.package_weight !==
                            undefined
                            ? `${trackedShipment.package_weight} kg`
                            : "Not provided"}


                        </p>


                      </div>


                      <div className="bg-slate-50 rounded-xl p-4">


                        <p className="text-xs uppercase font-black text-slate-600">
                          Value
                        </p>


                        <p className="font-black text-slate-900 text-sm mt-2">


                          {trackedShipment.package_value !==
                            null &&
                          trackedShipment.package_value !==
                            undefined
                            ? `$${trackedShipment.package_value}`
                            : "Not provided"}


                        </p>


                      </div>


                    </div>


                  </div>


                </div>


              </div>


            )}


        </div>


        {/* ===================================================
            QUICK STATS
        =================================================== */}


        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">


          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">


            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">


              <Package
                size={24}
                className="text-blue-800"
              />


            </div>


            <p className="text-sm font-bold text-slate-600 mt-5">
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


            <p className="text-sm font-bold text-slate-600 mt-5">
              In Transit
            </p>


            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    "In Transit"
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


            <p className="text-sm font-bold text-slate-600 mt-5">
              Delivered
            </p>


            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    "Delivered"
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


            <p className="text-sm font-bold text-slate-600 mt-5">
              Active Shipments
            </p>


            <p className="text-3xl font-black mt-1">
              {
                bookings.filter(
                  (booking) =>
                    booking.status !==
                    "Delivered"
                ).length
              }
            </p>


          </div>


        </div>


        {/* ===================================================
            BOOK DELIVERY
        =================================================== */}


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


        {/* ===================================================
            SHIPMENT HISTORY
        =================================================== */}


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


          </div>


          {bookings.length === 0 ? (


            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">


              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">


                <Package
                  size={30}
                  className="text-slate-500"
                />


              </div>


              <h3 className="text-2xl font-black mt-6">
                No shipments yet
              </h3>


              <p className="text-slate-600 mt-2">
                Your shipments will appear here after
                you create a booking.
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


              {bookings.map(
                (booking) => (


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
                          {booking.status ||
                            "Pending"}
                        </span>


                      </div>


                    </div>


                    {/* CARD BODY */}


                    <div className="p-6">


                      <div className="grid sm:grid-cols-2 gap-4">


                        <div className="bg-slate-50 rounded-2xl p-5">


                          <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                            Sender
                          </p>


                          <p className="font-black mt-2">
                            {booking.sender_name ||
                              "Not provided"}
                          </p>


                        </div>


                        <div className="bg-slate-50 rounded-2xl p-5">


                          <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                            Receiver
                          </p>


                          <p className="font-black mt-2">
                            {booking.receiver_name ||
                              "Not provided"}
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


                            <p className="text-xs uppercase tracking-wide font-black text-slate-600">
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


                            <p className="text-xs uppercase tracking-wide font-black text-slate-600">
                              Estimated Delivery
                            </p>


                            <p className="font-black mt-1">
                              {booking.estimated_delivery ||
                                "Not available"}
                            </p>


                          </div>


                        </div>


                      </div>


                      <div className="mt-4 text-sm text-slate-700">


                        <span className="font-bold">
                          Pickup:
                        </span>{" "}


                        {booking.pickup_address ||
                          "Not provided"}


                      </div>


                      <div className="mt-2 text-sm text-slate-700">


                        <span className="font-bold">
                          Destination:
                        </span>{" "}


                        {booking.delivery_address ||
                          "Not provided"}


                      </div>


                      <Link
                        href={`/shipments/${booking.id}`}
                        className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-black transition"
                      >
                        View Shipment
                        <ArrowRight size={18} />
                      </Link>


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