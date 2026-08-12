"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [error, setError] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleSearch(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const tracking =
      trackingNumber.trim().toUpperCase();

    if (!tracking) {
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    console.log(
      "================================"
    );

    console.log(
      "TRACKING NUMBER:",
      tracking
    );

    console.log(
      "SUPABASE URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );

    try {
      const { data, error } =
        await supabase.rpc(
          "get_public_shipment_v2",
          {
            tracking_number_input:
              tracking,
          }
        );

      console.log(
        "RPC DATA:",
        data
      );

      console.log(
        "RPC ERROR:",
        error
      );

      if (error) {
        setError(error);
      } else {
        setResult(data);
      }

    } catch (err) {
      console.error(
        "RPC EXCEPTION:",
        err
      );

      setError(err);

    } finally {
      setLoading(false);

      console.log(
        "================================"
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">

                <span className="font-black">
                  A
                </span>

              </div>

              <span className="font-black text-lg">
                Atlas Express
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* SEARCH */}

      <section className="bg-white border-b border-slate-200">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          <h1 className="text-3xl font-black text-blue-950">
            Track a Shipment
          </h1>

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
              RPC ERROR
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

        {/* SUCCESS */}

        {!loading && result && (

          <div className="space-y-5">

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-green-800">
                Shipment Found
              </h2>

              <p className="text-sm text-green-700 mt-2">
                The Vercel application successfully received data from Supabase.
              </p>

            </div>

            {/* SHIPMENT SUMMARY */}

            {result.shipment && (

              <div className="bg-white border border-slate-200 rounded-2xl p-6">

                <h2 className="text-2xl font-black text-blue-950">
                  {result.shipment.tracking_number}
                </h2>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Sender
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.sender_name ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Receiver
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.receiver_name ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Status
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.status ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Current Location
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.current_location ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Next Location
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.next_location ||
                        "Not available"}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">

                    <p className="text-xs uppercase font-black text-slate-500">
                      Estimated Delivery
                    </p>

                    <p className="font-black mt-2">
                      {result.shipment.estimated_delivery ||
                        "Not available"}
                    </p>

                  </div>

                </div>

              </div>

            )}

            {/* HISTORY */}

            <div className="bg-white border border-slate-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-blue-950">
                Tracking History
              </h2>

              {Array.isArray(
                result.history
              ) &&
              result.history.length > 0 ? (

                <div className="mt-5 space-y-4">

                  {result.history.map(
                    (
                      update: any
                    ) => (

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

                <p className="text-slate-600 mt-4">
                  No tracking history available.
                </p>

              )}

            </div>

            {/* RAW RESPONSE */}

            <div className="bg-slate-900 rounded-2xl p-5">

              <h2 className="text-white font-black">
                Raw RPC Response
              </h2>

              <pre className="mt-4 text-xs text-green-300 whitespace-pre-wrap overflow-auto max-h-[500px]">
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>

            </div>

          </div>

        )}

        {/* NOTHING YET */}

        {!loading &&
          !result &&
          !error && (

            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

              <p className="font-bold text-slate-600">
                Enter a tracking number to begin.
              </p>

            </div>

          )}

      </section>

    </main>
  );
}