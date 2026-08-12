"use client";

import { FormEvent, useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Truck,
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type Shipment = {
  id?: number;
  tracking_number?: string | null;

  sender_name?: string | null;
  receiver_name?: string | null;

  pickup_address?: string | null;
  delivery_address?: string | null;

  status?: string | null;

  current_location?: string | null;
  next_location?: string | null;

  estimated_delivery?: string | null;
  last_updated?: string | null;
  created_at?: string | null;

  package_type?: string | null;
  package_description?: string | null;
  package_weight?: number | null;
  package_quantity?: number | null;
  package_value?: number | null;

  special_handling?: string | null;
};

type ShipmentUpdate = {
  id: number;
  booking_id?: number;
  status?: string | null;
  location?: string | null;
  message?: string | null;
  created_at?: string | null;
};

type TrackingResponse = {
  shipment: Shipment;
  history: ShipmentUpdate[];
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tracking = trackingNumber.trim().toUpperCase();

    if (!tracking) {
      setErrorMessage("Please enter a tracking number.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "get_public_shipment_v2",
        {
          tracking_number_input: tracking,
        }
      );

      if (error) {
        console.error("TRACKING ERROR:", error);
        setErrorMessage(
          "We were unable to retrieve this shipment. Please try again."
        );
        return;
      }

      if (!data) {
        setErrorMessage(
          "No shipment was found with that tracking number."
        );
        return;
      }

      let normalizedData: any = data;

      if (Array.isArray(data)) {
        if (data.length === 0) {
          setErrorMessage(
            "No shipment was found with that tracking number."
          );
          return;
        }

        normalizedData = data[0];
      }

      if (!normalizedData?.shipment) {
        setErrorMessage(
          "No shipment was found with that tracking number."
        );
        return;
      }

      const history = Array.isArray(normalizedData.history)
        ? [...normalizedData.history].sort((a, b) => {
            const first = a.created_at
              ? new Date(a.created_at).getTime()
              : 0;

            const second = b.created_at
              ? new Date(b.created_at).getTime()
              : 0;

            return second - first;
          })
        : [];

      setResult({
        shipment: normalizedData.shipment,
        history,
      });
    } catch (err) {
      console.error("TRACKING EXCEPTION:", err);

      setErrorMessage(
        "Something went wrong while tracking this shipment."
      );
    } finally {
      setLoading(false);
    }
  }

  const shipment = result?.shipment;
  const history = result?.history || [];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* TOP NAVIGATION */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
                <Package size={23} />
              </div>

              <div>
                <p className="font-black text-lg">
                  Atlas Express
                </p>

                <p className="text-xs text-blue-200">
                  Reliable Shipment Tracking
                </p>
              </div>

            </div>

            <div className="hidden sm:flex items-center gap-2 text-sm text-blue-200">
              <ShieldCheck size={17} />
              Secure Tracking
            </div>

          </div>

        </div>
      </header>


      {/* HERO / SEARCH */}

      <section className="bg-blue-950 text-white">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-14">

          <div className="max-w-3xl">

            <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
              Shipment Tracking
            </p>

            <h1 className="text-4xl sm:text-5xl font-black mt-3">
              Track your shipment
            </h1>

            <p className="text-blue-200 text-base sm:text-lg mt-4 leading-relaxed">
              Enter your tracking number to see the latest
              location, shipment status, estimated delivery,
              and tracking history.
            </p>

          </div>


          <form
            onSubmit={handleSearch}
            className="mt-8 max-w-4xl"
          >

            <div className="bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2">

              <div className="relative flex-1">

                <Search
                  size={21}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(event.target.value)
                  }
                  placeholder="Enter tracking number"
                  className="w-full rounded-xl px-12 py-4 text-slate-900 font-bold outline-none"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-black transition inline-flex items-center justify-center gap-2"
              >

                <Search size={19} />

                {loading
                  ? "Tracking..."
                  : "Track Shipment"}

              </button>

            </div>

          </form>

        </div>

      </section>


      {/* MAIN CONTENT */}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">


        {/* LOADING */}

        {loading && (

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <h2 className="font-black text-xl mt-5 text-blue-950">
              Locating your shipment
            </h2>

            <p className="text-slate-500 mt-2">
              Please wait while we retrieve the latest
              tracking information.
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading && errorMessage && (

          <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">

            <div className="bg-red-50 p-7">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertTriangle
                    size={22}
                    className="text-red-600"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-black text-red-900">
                    Tracking unavailable
                  </h2>

                  <p className="text-red-700 mt-2">
                    {errorMessage}
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* INITIAL STATE */}

        {!loading &&
          !searched &&
          !errorMessage && (

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10">

              <div className="max-w-2xl mx-auto text-center">

                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">

                  <Package
                    size={31}
                    className="text-blue-800"
                  />

                </div>

                <h2 className="text-2xl font-black text-blue-950 mt-6">
                  Ready to track your package?
                </h2>

                <p className="text-slate-600 mt-3">
                  Enter your tracking number above to view
                  the current status and complete shipment
                  history.
                </p>

              </div>

            </div>

          )}


        {/* SHIPMENT RESULT */}

        {!loading && shipment && (

          <div className="space-y-6">


            {/* TRACKING HEADER */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="bg-slate-950 text-white px-6 sm:px-8 py-7">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>

                    <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                      Tracking Number
                    </p>

                    <h2 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
                      {shipment.tracking_number ||
                        "Unavailable"}
                    </h2>

                  </div>

                  <StatusBadge
                    status={shipment.status}
                  />

                </div>

              </div>


              {/* SUMMARY */}

              <div className="p-6 sm:p-8">

                <div className="grid md:grid-cols-3 gap-5">


                  <SummaryCard
                    icon={
                      <MapPin
                        size={22}
                        className="text-orange-600"
                      />
                    }
                    label="Current Location"
                    value={
                      shipment.current_location ||
                      "Awaiting update"
                    }
                  />


                  <SummaryCard
                    icon={
                      <Navigation
                        size={22}
                        className="text-blue-700"
                      />
                    }
                    label="Next Location"
                    value={
                      shipment.next_location ||
                      "Not available"
                    }
                  />


                  <SummaryCard
                    icon={
                      <CalendarDays
                        size={22}
                        className="text-green-600"
                      />
                    }
                    label="Estimated Delivery"
                    value={
                      formatDate(
                        shipment.estimated_delivery
                      ) || "Not available"
                    }
                  />

                </div>


                {/* ROUTE */}

                <div className="mt-6 grid md:grid-cols-2 gap-5">

                  <RouteCard
                    label="From"
                    value={
                      shipment.pickup_address ||
                      "Not available"
                    }
                  />

                  <RouteCard
                    label="To"
                    value={
                      shipment.delivery_address ||
                      "Not available"
                    }
                  />

                </div>

              </div>

            </div>


            {/* TRACKING PROGRESS */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="px-6 sm:px-8 py-6 border-b border-slate-200">

                <p className="text-orange-500 text-xs font-black uppercase tracking-widest">
                  Shipment Progress
                </p>

                <h2 className="text-2xl font-black text-blue-950 mt-1">
                  Tracking History
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                  Latest shipment activity and location
                  updates.
                </p>

              </div>


              <div className="p-6 sm:p-8">

                {history.length === 0 ? (

                  <div className="py-10 text-center">

                    <Clock
                      size={38}
                      className="text-slate-300 mx-auto"
                    />

                    <h3 className="font-black text-lg text-slate-700 mt-4">
                      No tracking updates yet
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      Shipment activity will appear here
                      when updates are recorded.
                    </p>

                  </div>

                ) : (

                  <div className="relative">

                    {/* TIMELINE LINE */}

                    <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200" />


                    <div className="space-y-8">

                      {history.map(
                        (update, index) => {

                          const isFirst =
                            index === 0;

                          const isProblem =
                            isProblemStatus(
                              update.status
                            );

                          const isCompleted =
                            isCompletedStatus(
                              update.status
                            );

                          return (

                            <div
                              key={update.id}
                              className="relative flex gap-5"
                            >

                              {/* TIMELINE ICON */}

                              <div
                                className={`relative z-10 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 ${
                                  isProblem
                                    ? "bg-orange-100"
                                    : isCompleted
                                    ? "bg-green-100"
                                    : "bg-blue-50"
                                }`}
                              >

                                {isProblem ? (

                                  <AlertTriangle
                                    size={17}
                                    className="text-orange-600"
                                  />

                                ) : isCompleted ? (

                                  <CheckCircle2
                                    size={18}
                                    className="text-green-600"
                                  />

                                ) : (

                                  <Truck
                                    size={17}
                                    className="text-blue-700"
                                  />

                                )}

                              </div>


                              {/* CONTENT */}

                              <div className="flex-1 pb-1">

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                                  <div>

                                    <div className="flex flex-wrap items-center gap-2">

                                      <h3
                                        className={`font-black text-lg ${
                                          isProblem
                                            ? "text-orange-700"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {update.status ||
                                          "Shipment Update"}
                                      </h3>

                                      {isFirst && (

                                        <span className="text-xs font-black bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                          Latest
                                        </span>

                                      )}

                                    </div>

                                  </div>


                                  {update.created_at && (

                                    <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">

                                      {formatDateTime(
                                        update.created_at
                                      )}

                                    </span>

                                  )}

                                </div>


                                {update.location && (

                                  <div className="flex items-center gap-2 mt-2">

                                    <MapPin
                                      size={15}
                                      className="text-orange-500"
                                    />

                                    <span className="text-sm font-bold text-slate-700">
                                      {update.location}
                                    </span>

                                  </div>

                                )}


                                {update.message && (

                                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                    {update.message}
                                  </p>

                                )}

                              </div>

                            </div>

                          );
                        }
                      )}

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* SHIPMENT DETAILS */}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="px-6 sm:px-8 py-6 border-b border-slate-200">

                <p className="text-orange-500 text-xs font-black uppercase tracking-widest">
                  Shipment Details
                </p>

                <h2 className="text-2xl font-black text-blue-950 mt-1">
                  Package Information
                </h2>

              </div>


              <div className="p-6 sm:p-8">

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                  <Detail
                    label="Package Type"
                    value={
                      shipment.package_type
                    }
                  />

                  <Detail
                    label="Quantity"
                    value={
                      shipment.package_quantity
                    }
                  />

                  <Detail
                    label="Weight"
                    value={
                      shipment.package_weight !==
                      null &&
                      shipment.package_weight !==
                      undefined
                        ? `${shipment.package_weight} kg`
                        : null
                    }
                  />

                  <Detail
                    label="Package Value"
                    value={
                      shipment.package_value !==
                      null &&
                      shipment.package_value !==
                      undefined
                        ? `$${shipment.package_value}`
                        : null
                    }
                  />

                </div>


                {shipment.package_description && (

                  <div className="mt-4 bg-slate-50 rounded-2xl p-5">

                    <p className="text-xs uppercase tracking-wider font-black text-slate-500">
                      Description
                    </p>

                    <p className="text-sm font-semibold text-slate-700 mt-2">
                      {shipment.package_description}
                    </p>

                  </div>

                )}


                {shipment.special_handling && (

                  <div className="mt-4 bg-orange-50 border border-orange-100 rounded-2xl p-5">

                    <p className="text-xs uppercase tracking-wider font-black text-orange-600">
                      Special Handling
                    </p>

                    <p className="text-sm font-semibold text-orange-800 mt-2">
                      {shipment.special_handling}
                    </p>

                  </div>

                )}

              </div>

            </div>


            {/* SHIPMENT PARTIES */}

            <div className="grid md:grid-cols-2 gap-6">

              <PersonCard
                title="Sender"
                name={
                  shipment.sender_name
                }
                address={
                  shipment.pickup_address
                }
              />

              <PersonCard
                title="Recipient"
                name={
                  shipment.receiver_name
                }
                address={
                  shipment.delivery_address
                }
              />

            </div>


            {/* LAST UPDATED */}

            {shipment.last_updated && (

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">

                <Clock size={15} />

                <span>
                  Last updated{" "}
                  {formatDateTime(
                    shipment.last_updated
                  )}
                </span>

              </div>

            )}

          </div>

        )}

      </section>


      {/* FOOTER */}

      <footer className="bg-blue-950 text-blue-200 mt-10">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>

              <p className="text-white font-black">
                Atlas Express
              </p>

              <p className="text-xs mt-1">
                Professional shipment tracking
              </p>

            </div>

            <p className="text-xs">
              Tracking information is provided for
              informational purposes.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   COMPONENTS
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>

        <p className="text-xs uppercase tracking-wider font-black text-slate-500">
          {label}
        </p>

      </div>

      <p className="font-black text-slate-900 mt-4">
        {value}
      </p>

    </div>
  );
}


function RouteCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">

      <div className="flex items-center gap-2">

        <MapPin
          size={17}
          className="text-orange-500"
        />

        <p className="text-xs uppercase tracking-wider font-black text-slate-500">
          {label}
        </p>

      </div>

      <p className="font-black text-slate-900 mt-3">
        {value}
      </p>

    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">

      <p className="text-xs uppercase tracking-wider font-black text-slate-500">
        {label}
      </p>

      <p className="font-black text-slate-900 mt-2 break-words">
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? String(value)
          : "Not provided"}
      </p>

    </div>
  );
}


function PersonCard({
  title,
  name,
  address,
}: {
  title: string;
  name?: string | null;
  address?: string | null;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">

      <p className="text-orange-500 text-xs font-black uppercase tracking-widest">
        {title}
      </p>

      <h3 className="text-xl font-black text-blue-950 mt-2">
        {name || "Not provided"}
      </h3>

      <div className="flex items-start gap-2 mt-4 text-sm text-slate-600">

        <MapPin
          size={17}
          className="text-slate-400 mt-0.5 shrink-0"
        />

        <span>
          {address || "Address not available"}
        </span>

      </div>

    </div>
  );
}


function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const value =
    status?.trim().toLowerCase() || "pending";

  let classes =
    "bg-slate-100 text-slate-700";

  if (value === "delivered") {
    classes =
      "bg-green-100 text-green-700";
  } else if (
    value === "in transit" ||
    value === "picked up"
  ) {
    classes =
      "bg-blue-100 text-blue-700";
  } else if (value === "delayed") {
    classes =
      "bg-orange-100 text-orange-700";
  } else if (
    value === "delivery issue"
  ) {
    classes =
      "bg-red-100 text-red-700";
  } else if (value === "confirmed") {
    classes =
      "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black ${classes}`}
    >
      <span className="w-2 h-2 rounded-full bg-current" />

      {status || "Pending"}
    </span>
  );
}


/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  status?: string | null
) {
  return status?.trim().toLowerCase() || "";
}


function isCompletedStatus(
  status?: string | null
) {
  const value = normalizeStatus(status);

  return (
    value === "delivered" ||
    value === "picked up" ||
    value === "in transit" ||
    value === "confirmed"
  );
}


function isProblemStatus(
  status?: string | null
) {
  const value = normalizeStatus(status);

  return (
    value === "delayed" ||
    value === "delivery issue"
  );
}


function formatDate(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}


function formatDateTime(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}