"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Package,
  MapPin,
  CalendarDays,
  Truck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Search,
} from "lucide-react";

type Shipment = {
  tracking_number?: string | null;
  receiver_name?: string | null;
  pickup_address?: string | null;
  delivery_address?: string | null;
  status?: string | null;
  current_location?: string | null;
  next_location?: string | null;
  estimated_delivery?: string | null;
  last_updated?: string | null;
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
  status?: string | null;
  location?: string | null;
  message?: string | null;
  created_at?: string | null;
};

type PublicShipmentResponse = {
  shipment: Shipment;
  history: ShipmentUpdate[];
};

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] =
    useState<PublicShipmentResponse | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleTrack(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const tracking =
      trackingNumber.trim().toUpperCase();

    if (!tracking) {
      setError("Please enter a tracking number.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);
    setError("");

    try {
      const response = await supabase.rpc(
        "get_public_shipment_v2",
        {
          tracking_number_input: tracking,
        }
      );

      console.log(
        "HOMEPAGE TRACKING RESPONSE:",
        response
      );

      if (response.error) {
        console.error(
          "HOMEPAGE TRACKING ERROR:",
          response.error
        );

        setError(
          "We could not find a shipment with that tracking number."
        );

        return;
      }

      if (
        response.data === null ||
        response.data === undefined
      ) {
        setError(
          "We could not find a shipment with that tracking number."
        );

        return;
      }

      let data: any = response.data;

      if (Array.isArray(response.data)) {
        if (response.data.length === 0) {
          setError(
            "We could not find a shipment with that tracking number."
          );

          return;
        }

        data = response.data[0];
      }

      if (!data?.shipment) {
        setError(
          "We could not find a shipment with that tracking number."
        );

        return;
      }

      setResult(
        data as PublicShipmentResponse
      );
    } catch (err) {
      console.error(
        "HOMEPAGE TRACKING EXCEPTION:",
        err
      );

      setError(
        "Something went wrong while looking up your shipment."
      );
    } finally {
      setLoading(false);
    }
  }

  const shipment = result?.shipment;

  const history = Array.isArray(result?.history)
    ? [...result.history].sort((a, b) => {
        const aTime = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;

        const bTime = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return bTime - aTime;
      })
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

  function isCompletedStatus(
    status?: string | null
  ) {
    const value = normalizeStatus(status);

    return (
      value === "confirmed" ||
      value === "picked up" ||
      value === "in transit" ||
      value === "delivered"
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

  function statusClass(
    status?: string | null
  ) {
    const value = normalizeStatus(status);

    if (value === "delivered") {
      return "bg-green-500/15 text-green-400 border-green-400/20";
    }

    if (
      value === "confirmed" ||
      value === "picked up"
    ) {
      return "bg-blue-500/15 text-blue-300 border-blue-400/20";
    }

    if (value === "in transit") {
      return "bg-orange-500/15 text-orange-400 border-orange-400/20";
    }

    if (
      value === "delayed" ||
      value === "delivery issue"
    ) {
      return "bg-red-500/15 text-red-400 border-red-400/20";
    }

    return "bg-white/10 text-slate-300 border-white/10";
  }

  function historyIcon(
    status?: string | null
  ) {
    const value = normalizeStatus(status);

    if (
      value === "confirmed" ||
      value === "picked up" ||
      value === "delivered"
    ) {
      return (
        <CheckCircle2
          size={19}
          className="text-green-400"
        />
      );
    }

    if (value === "in transit") {
      return (
        <Truck
          size={19}
          className="text-orange-400"
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
          className="text-red-400"
        />
      );
    }

    return (
      <Clock3
        size={19}
        className="text-slate-400"
      />
    );
  }

  function historyCircle(
    status?: string | null
  ) {
    const value = normalizeStatus(status);

    if (
      value === "confirmed" ||
      value === "picked up" ||
      value === "delivered"
    ) {
      return "bg-green-500/10 border-green-400/30";
    }

    if (value === "in transit") {
      return "bg-orange-500/10 border-orange-400/30";
    }

    if (
      value === "delayed" ||
      value === "delivery issue"
    ) {
      return "bg-red-500/10 border-red-400/30";
    }

    return "bg-white/5 border-white/10";
  }

  return (
    <div className="w-full max-w-3xl">
      {/* TRACKING BOX */}

      <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-[2rem] p-6 md:p-7 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <Package
              size={22}
              className="text-white"
            />
          </div>

          <div>
            <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
              Shipment Tracking
            </p>

            <h2 className="text-white text-2xl font-black">
              Track your delivery
            </h2>
          </div>
        </div>

        <p className="text-slate-400 text-sm mt-3">
          Enter your tracking number to see the
          latest shipment information.
        </p>

        <form
          onSubmit={handleTrack}
          className="flex flex-col sm:flex-row gap-3 mt-5"
        >
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={trackingNumber}
              onChange={(event) => {
                setTrackingNumber(
                  event.target.value
                );
                setError("");
              }}
              placeholder="Enter tracking number"
              className="w-full h-14 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-white/20 px-5 pl-11 font-bold outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-14 px-7 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black transition-all shadow-lg shadow-orange-500/20"
          >
            {loading
              ? "Tracking..."
              : "Track Shipment"}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-400/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={19}
                className="text-red-400 shrink-0"
              />

              <p className="text-red-300 text-sm font-semibold">
                {error}
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-5 text-center py-5">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="text-slate-400 text-sm font-semibold mt-3">
              Finding your shipment...
            </p>
          </div>
        )}
      </div>

      {/* RESULTS */}

      {!loading && shipment && (
        <div className="mt-6 space-y-5">
          {/* SHIPMENT SUMMARY */}

          <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="bg-slate-900 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                    Tracking Number
                  </p>

                  <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                    {shipment.tracking_number ||
                      trackingNumber}
                  </h3>
                </div>

                <span
                  className={`w-fit px-4 py-2 rounded-full border text-sm font-black ${statusClass(
                    shipment.status
                  )}`}
                >
                  {shipment.status ||
                    "Pending"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <ResultInfo
                  icon={
                    <MapPin
                      size={17}
                      className="text-orange-500"
                    />
                  }
                  title="Current Location"
                  value={
                    shipment.current_location
                  }
                />

                <ResultInfo
                  icon={
                    <Truck
                      size={17}
                      className="text-blue-600"
                    />
                  }
                  title="Next Location"
                  value={
                    shipment.next_location
                  }
                />

                <ResultInfo
                  icon={
                    <CalendarDays
                      size={17}
                      className="text-green-600"
                    />
                  }
                  title="Estimated Delivery"
                  value={
                    shipment.estimated_delivery
                  }
                />

                <ResultInfo
                  icon={
                    <Package
                      size={17}
                      className="text-purple-600"
                    />
                  }
                  title="Package Type"
                  value={
                    shipment.package_type
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    From
                  </p>

                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {shipment.pickup_address ||
                      "Not available"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    To
                  </p>

                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {shipment.delivery_address ||
                      "Not available"}
                  </p>
                </div>
              </div>

              {(shipment.delivery_issue ||
                shipment.delivery_update) && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={18}
                      className="text-orange-600 shrink-0 mt-0.5"
                    />

                    <div>
                      <p className="font-black text-orange-800">
                        Delivery Update
                      </p>

                      <p className="text-sm text-orange-700 mt-1">
                        {shipment.delivery_issue ||
                          shipment.delivery_update}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TRACKING HISTORY */}

          <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Truck
                    size={20}
                    className="text-blue-800"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-black text-blue-950">
                    Tracking History
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Latest shipment activity
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {history.length === 0 ? (
                <div className="py-5 text-center">
                  <Clock3
                    size={30}
                    className="text-slate-400 mx-auto"
                  />

                  <p className="text-sm font-bold text-slate-500 mt-2">
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

                      const problem =
                        isProblemStatus(
                          update.status
                        );

                      const completed =
                        isCompletedStatus(
                          update.status
                        );

                      return (
                        <div
                          key={update.id}
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
                                className={`w-0.5 flex-1 min-h-14 ${
                                  completed
                                    ? "bg-green-200"
                                    : "bg-slate-200"
                                }`}
                              />
                            )}
                          </div>

                          {/* EVENT */}

                          <div className="flex-1 pb-7">
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4
                                    className={`font-black text-lg ${
                                      problem
                                        ? "text-red-700"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {update.status ||
                                      "Shipment Update"}
                                  </h4>

                                  {completed && (
                                    <span className="inline-flex items-center gap-1 text-xs font-black text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                      <CheckCircle2
                                        size={13}
                                      />
                                      Completed
                                    </span>
                                  )}
                                </div>

                                {update.location && (
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <MapPin
                                      size={14}
                                      className="text-blue-600"
                                    />

                                    <span className="text-sm text-blue-700 font-bold">
                                      {update.location}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {update.created_at && (
                                <span className="text-xs text-slate-400 font-semibold">
                                  {new Date(
                                    update.created_at
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {update.message && (
                              <p
                                className={`text-sm mt-2 leading-6 ${
                                  problem
                                    ? "text-red-700 font-semibold"
                                    : "text-slate-600"
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
            <p className="text-center text-xs text-slate-500 font-semibold">
              Last updated{" "}
              {new Date(
                shipment.last_updated
              ).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* EMPTY STATE */}

      {!loading &&
        searched &&
        !result &&
        !error && (
          <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-slate-400 font-semibold">
              Enter a tracking number to begin.
            </p>
          </div>
        )}
    </div>
  );
}

function ResultInfo({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">
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