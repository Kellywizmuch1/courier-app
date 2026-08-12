"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

type ShipmentUpdate = {
  id: number;
  status: string | null;
  message: string | null;
  location: string | null;
  booking_id: number;
  created_at: string | null;
};

type Shipment = {
  id: number;
  status: string | null;
  tracking_number: string | null;
  sender_name: string | null;
  receiver_name: string | null;
  phone_number: string | null;

  pickup_address: string | null;
  delivery_address: string | null;

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

  delivery_issue: string | null;
  delivery_update: string | null;
};

type RpcResponse = {
  shipment?: Shipment | null;
  history?: ShipmentUpdate[] | null;
};

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<RpcResponse | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const tracking = trackingNumber
      .trim()
      .toUpperCase();

    if (!tracking) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);
    setError(null);

    console.log("================================");
    console.log("ATLAS TRACK PAGE IS RUNNING");
    console.log("TRACKING NUMBER:", tracking);
    console.log(
      "SUPABASE URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    console.log(
      "CALLING RPC: get_public_shipment_v2"
    );

    try {
      const { data, error: rpcError } =
        await supabase.rpc(
          "get_public_shipment_v2",
          {
            tracking_number_input: tracking,
          }
        );

      console.log("RPC DATA:", data);
      console.log("RPC ERROR:", rpcError);

      if (rpcError) {
        setError(rpcError);
        return;
      }

      if (!data) {
        console.log(
          "RPC returned no shipment data."
        );

        setResult(null);
        return;
      }

      setResult(data as RpcResponse);
    } catch (err) {
      console.error(
        "RPC EXCEPTION:",
        err
      );

      setError(err);
    } finally {
      setLoading(false);

      console.log("================================");
    }
  }

  const shipment =
    result?.shipment ?? null;

  const history =
    Array.isArray(result?.history)
      ? [...result!.history!].sort(
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="font-black text-xl">
                A
              </span>
            </div>

            <span className="font-black text-xl">
              Atlas Express
            </span>

          </div>
        </div>
      </header>

      {/* SEARCH */}

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          <h1 className="text-3xl font-black text-blue-950">
            Track a Shipment
          </h1>

          {/* DEPLOYMENT TEST */}

          <p className="text-red-600 font-black text-xl mt-4">
            ATLAS TEST 12345
          </p>

          <p className="text-slate-600 mt-2">
            Enter your tracking number below.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col sm:flex-row gap-3 max-w-3xl"
          >

            <input
              type="text"
              value={trackingNumber}
              onChange={(event) =>
                setTrackingNumber(
                  event.target.value
                )
              }
              placeholder="TRK544335"
              className="flex-1 border border-slate-300 rounded-xl px-4 py-3.5 text-slate-900 font-semibold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-black"
            >
              {loading
                ? "Searching..."
                : "Track Shipment"}
            </button>

          </form>
        </div>
      </section>

      {/* RESULTS */}

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* LOADING */}

        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

            <p className="font-bold text-slate-700 mt-4">
              Searching for shipment...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

            <h2 className="text-xl font-black text-red-800">
              Tracking Error
            </h2>

            <p className="text-sm text-red-700 mt-2">
              The database request returned an error.
            </p>

            <pre className="mt-5 bg-white border border-red-200 rounded-xl p-4 text-xs text-red-900 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(
                error,
                null,
                2
              )}
            </pre>

          </div>
        )}

        {/* NOT FOUND */}

        {!loading &&
          searched &&
          !error &&
          !shipment && (

            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

              <h2 className="text-2xl font-black text-blue-950">
                Shipment Not Found
              </h2>

              <p className="text-slate-600 mt-3">
                No shipment was returned for:
              </p>

              <p className="font-black text-orange-600 mt-2">
                {trackingNumber
                  .trim()
                  .toUpperCase()}
              </p>

              <p className="text-xs text-slate-500 mt-5">
                The RPC returned no shipment data.
              </p>

            </div>
          )}

        {/* SHIPMENT */}

        {!loading && shipment && (

          <div className="space-y-5">

            {/* SUCCESS */}

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-green-800">
                Shipment Found
              </h2>

              <p className="text-sm text-green-700 mt-2">
                Atlas Express successfully retrieved
                this shipment.
              </p>

            </div>

            {/* SUMMARY */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-widest font-black text-slate-500">
                    Tracking Number
                  </p>

                  <h2 className="text-3xl font-black text-blue-950 mt-1">
                    {shipment.tracking_number ||
                      "Unavailable"}
                  </h2>

                </div>

                <span className="w-fit bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-black">
                  {shipment.status ||
                    "Pending"}
                </span>

              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

                <Info
                  title="Sender"
                  value={
                    shipment.sender_name
                  }
                />

                <Info
                  title="Receiver"
                  value={
                    shipment.receiver_name
                  }
                />

                <Info
                  title="Status"
                  value={
                    shipment.status
                  }
                />

                <Info
                  title="Current Location"
                  value={
                    shipment.current_location
                  }
                />

                <Info
                  title="Next Location"
                  value={
                    shipment.next_location
                  }
                />

                <Info
                  title="Estimated Delivery"
                  value={
                    shipment.estimated_delivery
                      ? new Date(
                          shipment.estimated_delivery
                        ).toLocaleDateString()
                      : null
                  }
                />

              </div>

            </div>

            {/* ROUTE */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-blue-950">
                Shipment Route
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mt-5">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs uppercase font-black text-slate-500">
                    From
                  </p>

                  <p className="font-black mt-2">
                    {shipment.pickup_address ||
                      "Not available"}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs uppercase font-black text-slate-500">
                    To
                  </p>

                  <p className="font-black mt-2 whitespace-pre-line">
                    {shipment.delivery_address ||
                      "Not available"}
                  </p>

                </div>

              </div>

            </div>

            {/* HISTORY */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-blue-950">
                Tracking History
              </h2>

              <p className="text-sm text-slate-600 mt-1">
                Latest shipment activity.
              </p>

              {history.length > 0 ? (

                <div className="mt-6 space-y-4">

                  {history.map(
                    (update) => (

                      <div
                        key={update.id}
                        className="border border-slate-200 rounded-xl p-4"
                      >

                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">

                          <div>

                            <h3 className="font-black text-slate-900">
                              {update.status ||
                                "Shipment Update"}
                            </h3>

                            {update.location && (
                              <p className="text-sm text-slate-600 mt-1">
                                {update.location}
                              </p>
                            )}

                          </div>

                          {update.created_at && (
                            <span className="text-xs text-slate-500 font-semibold">
                              {new Date(
                                update.created_at
                              ).toLocaleString()}
                            </span>
                          )}

                        </div>

                        {update.message && (
                          <p className="text-sm text-slate-700 mt-3">
                            {update.message}
                          </p>
                        )}

                      </div>
                    )
                  )}

                </div>

              ) : (

                <p className="text-slate-600 mt-5">
                  No tracking history available.
                </p>

              )}

            </div>

            {/* PACKAGE */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-blue-950">
                Package Information
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">

                <Info
                  title="Type"
                  value={
                    shipment.package_type
                  }
                />

                <Info
                  title="Quantity"
                  value={
                    shipment.package_quantity !==
                    null
                      ? String(
                          shipment.package_quantity
                        )
                      : null
                  }
                />

                <Info
                  title="Weight"
                  value={
                    shipment.package_weight !==
                    null
                      ? `${shipment.package_weight} kg`
                      : null
                  }
                />

                <Info
                  title="Value"
                  value={
                    shipment.package_value !==
                    null
                      ? `$${shipment.package_value}`
                      : null
                  }
                />

              </div>

              {shipment.package_description && (
                <div className="mt-5">

                  <p className="text-xs uppercase font-black text-slate-500">
                    Description
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    {shipment.package_description}
                  </p>

                </div>
              )}

              {shipment.special_handling && (
                <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4">

                  <p className="text-xs uppercase font-black text-orange-700">
                    Special Handling
                  </p>

                  <p className="text-sm text-slate-800 font-semibold mt-2">
                    {shipment.special_handling}
                  </p>

                </div>
              )}

            </div>

            {/* LAST UPDATED */}

            {shipment.last_updated && (
              <div className="text-center text-xs text-slate-500 pb-5">
                Last updated:{" "}
                {new Date(
                  shipment.last_updated
                ).toLocaleString()}
              </div>
            )}

            {/* DEBUG */}

            <details className="bg-slate-900 rounded-2xl p-5">

              <summary className="text-white font-black cursor-pointer">
                Developer Response
              </summary>

              <pre className="mt-4 text-xs text-green-300 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>

            </details>

          </div>
        )}

      </section>
    </main>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string | null | undefined;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">

      <p className="text-xs uppercase font-black text-slate-500">
        {title}
      </p>

      <p className="font-black mt-2">
        {value || "Not available"}
      </p>

    </div>
  );
}