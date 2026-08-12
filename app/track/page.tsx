"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Package,
  MapPin,
  CalendarDays,
  Truck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  ArrowRight,
} from "lucide-react";

type Shipment = {
  id?: number;
  tracking_number?: string | null;

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

  delivery_issue?: string | null;
  delivery_update?: string | null;
};

type ShipmentUpdate = {
  id: number;
  booking_id?: number;
  status?: string | null;
  location?: string | null;
  message?: string | null;
  created_at?: string | null;
};

type PublicShipmentResponse = {
  shipment: Shipment;
  history: ShipmentUpdate[];
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] =
    useState<PublicShipmentResponse | null>(null);

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const tracking =
      trackingNumber.trim().toUpperCase();

    if (!tracking) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);
    setError(null);

    try {
      const response = await supabase.rpc(
        "get_public_shipment_v2",
        {
          tracking_number_input: tracking,
        }
      );

      console.log(
        "TRACKING RPC RESPONSE:",
        response
      );

      if (response.error) {
        console.error(
          "PUBLIC TRACKING RPC ERROR:",
          response.error
        );

        setError(response.error);
        return;
      }

      if (
        response.data === null ||
        response.data === undefined
      ) {
        setError({
          message:
            "The tracking service returned no shipment data.",
        });

        return;
      }

      let normalizedResult: any =
        response.data;

      if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setError({
            message:
              "No shipment was found with that tracking number.",
          });

          return;
        }

        normalizedResult =
          response.data[0];
      }

      setResult(
        normalizedResult as PublicShipmentResponse
      );
    } catch (err) {
      console.error(
        "TRACKING EXCEPTION:",
        err
      );

      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const shipment = result?.shipment;

  const history = Array.isArray(
    result?.history
  )
    ? [...result.history].sort(
        (a, b) => {
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
        }
      )
    : [];

  function normalizeStatus(
    status?: string | null
  ) {
    return (
      status
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, " ") || ""
    );
  }

  function statusColor(
    status?: string | null
  ) {
    const value =
      normalizeStatus(status);

    if (value === "delivered") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (
      value === "in transit" ||
      value === "picked up"
    ) {
      return "bg-orange-100 text-orange-700 border-orange-200";
    }

    if (value === "delayed") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    if (
      value === "delivery issue"
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (
      value === "confirmed" ||
      value === "processing"
    ) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-slate-100 text-slate-700 border-slate-200";
  }

  function historyIcon(
    status?: string | null
  ) {
    const value =
      normalizeStatus(status);

    if (value === "delivered") {
      return (
        <CheckCircle2
          size={19}
          className="text-green-600"
        />
      );
    }

    if (
      value === "in transit" ||
      value === "picked up"
    ) {
      return (
        <Truck
          size={19}
          className="text-orange-600"
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
          className="text-red-600"
        />
      );
    }

    return (
      <Clock3
        size={19}
        className="text-slate-500"
      />
    );
  }

  function historyCircle(
    status?: string | null
  ) {
    const value =
      normalizeStatus(status);

    if (value === "delivered") {
      return "bg-green-50 border-green-200";
    }

    if (
      value === "in transit" ||
      value === "picked up"
    ) {
      return "bg-orange-50 border-orange-200";
    }

    if (
      value === "delayed" ||
      value === "delivery issue"
    ) {
      return "bg-red-50 border-red-200";
    }

    return "bg-white border-slate-300";
  }

  function historyLine(
    status?: string | null
  ) {
    const value =
      normalizeStatus(status);

    if (value === "delivered") {
      return "bg-green-300";
    }

    if (
      value === "in transit" ||
      value === "picked up"
    ) {
      return "bg-orange-300";
    }

    if (
      value === "delayed" ||
      value === "delivery issue"
    ) {
      return "bg-red-200";
    }

    return "bg-slate-200";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">

                <span className="font-black text-2xl">
                  A
                </span>

              </div>

              <div>

                <p className="font-black text-xl">
                  Atlas Express
                </p>

                <p className="text-xs text-blue-200">
                  Professional Shipment Tracking
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          HERO / SEARCH
      ===================================================== */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

          <div className="max-w-4xl">

            <p className="text-orange-500 text-sm font-black uppercase tracking-widest">
              Shipment Tracking
            </p>

            <h1 className="text-4xl md:text-5xl font-black text-blue-950 mt-2">
              Track your shipment
            </h1>

            <p className="text-slate-600 text-lg mt-3">
              Enter your tracking number to see
              the latest location, delivery status,
              and shipment history.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-7 flex flex-col sm:flex-row gap-3 max-w-4xl"
            >

              <div className="relative flex-1">

                <Package
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(event) =>
                    setTrackingNumber(
                      event.target.value
                    )
                  }
                  placeholder="Enter tracking number"
                  className="w-full border border-slate-300 rounded-xl px-4 py-4 pl-12 text-slate-900 font-semibold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-black transition shadow-sm"
              >

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Navigation size={19} />
                    Track Shipment
                  </>
                )}

              </button>

            </form>

          </div>

        </div>

      </section>


      {/* =====================================================
          RESULTS
      ===================================================== */}

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* LOADING */}

        {loading && (

          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center">

            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <h2 className="font-black text-xl text-blue-950 mt-5">
              Finding your shipment
            </h2>

            <p className="text-slate-600 mt-2">
              Please wait while we retrieve
              the latest tracking information.
            </p>

          </div>

        )}


        {/* ERROR */}

        {!loading && error && (

          <div className="bg-white border border-red-200 rounded-3xl shadow-sm overflow-hidden">

            <div className="bg-red-50 p-7">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">

                  <AlertTriangle
                    size={23}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <h2 className="text-xl font-black text-red-800">
                    Shipment not found
                  </h2>

                  <p className="text-red-700 mt-1">
                    We could not find a shipment
                    matching that tracking number.
                    Please check the number and try again.
                  </p>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* NO DATA */}

        {!loading &&
          !error &&
          searched &&
          !result && (

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center">

              <AlertTriangle
                size={38}
                className="text-orange-500 mx-auto"
              />

              <h2 className="text-xl font-black text-blue-950 mt-5">
                No shipment information available
              </h2>

              <p className="text-slate-600 mt-2">
                Please verify the tracking number
                and try again.
              </p>

            </div>

          )}


        {/* =====================================================
            SHIPMENT RESULT
        ===================================================== */}

        {!loading &&
          !error &&
          shipment && (

            <div className="space-y-6">


              {/* SHIPMENT HEADER */}

              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

                <div className="bg-slate-950 text-white p-7 md:p-8">

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                    <div>

                      <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                        Tracking Number
                      </p>

                      <h2 className="text-3xl md:text-4xl font-black mt-1">
                        {shipment.tracking_number ||
                          "Unavailable"}
                      </h2>

                    </div>

                    <span
                      className={`inline-flex w-fit px-5 py-2.5 rounded-full border text-sm font-black ${statusColor(
                        shipment.status
                      )}`}
                    >
                      {shipment.status ||
                        "Pending"}
                    </span>

                  </div>

                </div>


                {/* MAIN DETAILS */}

                <div className="p-6 md:p-8">

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">


                    <Info
                      icon={
                        <MapPin
                          size={19}
                          className="text-orange-500"
                        />
                      }
                      title="Current Location"
                      value={
                        shipment.current_location
                      }
                    />


                    <Info
                      icon={
                        <Truck
                          size={19}
                          className="text-blue-700"
                        />
                      }
                      title="Next Location"
                      value={
                        shipment.next_location
                      }
                    />


                    <Info
                      icon={
                        <CalendarDays
                          size={19}
                          className="text-green-600"
                        />
                      }
                      title="Estimated Delivery"
                      value={
                        shipment.estimated_delivery
                      }
                    />


                    <Info
                      icon={
                        <MapPin
                          size={19}
                          className="text-blue-700"
                        />
                      }
                      title="Pickup Address"
                      value={
                        shipment.pickup_address
                      }
                    />


                    <Info
                      icon={
                        <Navigation
                          size={19}
                          className="text-orange-600"
                        />
                      }
                      title="Delivery Address"
                      value={
                        shipment.delivery_address
                      }
                    />


                    <Info
                      icon={
                        <Package
                          size={19}
                          className="text-purple-600"
                        />
                      }
                      title="Package Type"
                      value={
                        shipment.package_type
                      }
                    />

                  </div>


                  {/* ROUTE */}

                  <div className="mt-6 grid md:grid-cols-2 gap-4">

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

                      <p className="text-xs uppercase tracking-wide font-black text-slate-500">
                        From
                      </p>

                      <p className="font-black text-slate-900 mt-2">
                        {shipment.pickup_address ||
                          "Not available"}
                      </p>

                    </div>


                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

                      <p className="text-xs uppercase tracking-wide font-black text-slate-500">
                        To
                      </p>

                      <p className="font-black text-slate-900 mt-2">
                        {shipment.delivery_address ||
                          "Not available"}
                      </p>

                    </div>

                  </div>


                  {/* DELIVERY ISSUE */}

                  {(shipment.delivery_issue ||
                    shipment.delivery_update) && (

                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-2xl p-5">

                      <div className="flex items-start gap-3">

                        <AlertTriangle
                          size={21}
                          className="text-orange-600 mt-0.5 shrink-0"
                        />

                        <div>

                          <h3 className="font-black text-orange-800">
                            Delivery Update
                          </h3>

                          <p className="text-sm text-orange-700 mt-1">
                            {shipment.delivery_issue ||
                              shipment.delivery_update}
                          </p>

                        </div>

                      </div>

                    </div>

                  )}


                  {/* PACKAGE INFORMATION */}

                  <div className="mt-8 border-t border-slate-200 pt-7">

                    <h3 className="text-xl font-black text-blue-950">
                      Package Information
                    </h3>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">


                      <Info
                        title="Package Type"
                        value={
                          shipment.package_type
                        }
                      />


                      <Info
                        title="Quantity"
                        value={
                          shipment.package_quantity
                        }
                      />


                      <Info
                        title="Weight"
                        value={
                          shipment.package_weight !==
                            null &&
                          shipment.package_weight !==
                            undefined
                            ? `${shipment.package_weight} kg`
                            : null
                        }
                      />


                      <Info
                        title="Declared Value"
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

                        <p className="text-xs uppercase tracking-wide font-black text-slate-500">
                          Description
                        </p>

                        <p className="text-slate-800 font-semibold mt-2">
                          {shipment.package_description}
                        </p>

                      </div>

                    )}


                    {shipment.special_handling && (

                      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-5">

                        <p className="text-xs uppercase tracking-wide font-black text-blue-700">
                          Special Handling
                        </p>

                        <p className="text-slate-800 font-semibold mt-2">
                          {shipment.special_handling}
                        </p>

                      </div>

                    )}

                  </div>

                </div>

              </div>


              {/* =================================================
                  TRACKING HISTORY
              ================================================= */}

              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

                <div className="p-6 md:p-7 border-b border-slate-200">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">

                      <Truck
                        size={22}
                        className="text-blue-800"
                      />

                    </div>

                    <div>

                      <h2 className="text-2xl font-black text-blue-950">
                        Tracking History
                      </h2>

                      <p className="text-sm text-slate-600 mt-1">
                        Latest shipment activity and
                        movement updates.
                      </p>

                    </div>

                  </div>

                </div>


                <div className="p-6 md:p-8">

                  {history.length === 0 ? (

                    <div className="py-8 text-center">

                      <Clock3
                        size={35}
                        className="text-slate-400 mx-auto"
                      />

                      <p className="font-bold text-slate-600 mt-3">
                        No tracking updates available yet.
                      </p>

                    </div>

                  ) : (

                    <div>

                      {history.map(
                        (update, index) => {

                          const isLast =
                            index ===
                            history.length - 1;

                          const status =
                            normalizeStatus(
                              update.status
                            );

                          const isProblem =
                            status ===
                              "delayed" ||
                            status ===
                              "delivery issue";

                          return (

                            <div
                              key={
                                update.id
                              }
                              className="flex gap-4"
                            >

                              {/* TIMELINE */}

                              <div className="flex flex-col items-center">

                                <div
                                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0 ${historyCircle(
                                    update.status
                                  )}`}
                                >

                                  {historyIcon(
                                    update.status
                                  )}

                                </div>


                                {!isLast && (

                                  <div
                                    className={`w-0.5 flex-1 min-h-16 ${historyLine(
                                      update.status
                                    )}`}
                                  />

                                )}

                              </div>


                              {/* EVENT */}

                              <div className="flex-1 pb-8">

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                                  <div>

                                    <div className="flex flex-wrap items-center gap-2">

                                      <h3
                                        className={`font-black text-lg ${
                                          isProblem
                                            ? "text-red-700"
                                            : "text-slate-900"
                                        }`}
                                      >
                                        {update.status ||
                                          "Shipment Update"}
                                      </h3>

                                      {status ===
                                        "delivered" && (

                                        <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                          Completed
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

                                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-700">

                                    <MapPin
                                      size={15}
                                    />

                                    <span className="font-bold">
                                      {update.location}
                                    </span>

                                  </div>

                                )}


                                {update.message && (

                                  <p
                                    className={`text-sm mt-2 leading-6 ${
                                      isProblem
                                        ? "text-red-700 font-semibold"
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


              {/* LAST UPDATED */}

              {shipment.last_updated && (

                <div className="text-center">

                  <p className="text-xs text-slate-500 font-semibold">

                    Last updated{" "}

                    {new Date(
                      shipment.last_updated
                    ).toLocaleString()}

                  </p>

                </div>

              )}

            </div>

          )}


        {/* =====================================================
            INITIAL STATE
        ===================================================== */}

        {!loading &&
          !searched && (

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 md:p-14 text-center">

              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">

                <Package
                  size={31}
                  className="text-blue-800"
                />

              </div>

              <h2 className="text-2xl font-black text-blue-950 mt-6">
                Ready to track your shipment?
              </h2>

              <p className="text-slate-600 mt-2 max-w-lg mx-auto">
                Enter your tracking number above
                to view your shipment's current
                status, location, estimated delivery,
                and tracking history.
              </p>

            </div>

          )}

      </section>

    </main>
  );
}


/* =========================================================
   INFO COMPONENT
========================================================= */

function Info({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center gap-2">

        {icon}

        <p className="text-xs uppercase tracking-wide font-black text-slate-500">
          {title}
        </p>

      </div>

      <p className="font-black text-slate-900 mt-2 break-words">

        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? String(value)
          : "Not available"}

      </p>

    </div>
  );
}