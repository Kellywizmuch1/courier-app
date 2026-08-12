"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tracking = trackingNumber.trim().toUpperCase();

    if (!tracking) {
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null);
    setError(null);

    console.log("================================");
    console.log("TRACKING SEARCH STARTED");
    console.log("TRACKING NUMBER:", tracking);

    try {
      console.log("Calling RPC:");
      console.log("get_public_shipment_v2");

      const response = await supabase.rpc(
        "get_public_shipment_v2",
        {
          tracking_number_input: tracking,
        }
      );

      console.log("FULL SUPABASE RESPONSE:");
      console.log(response);

      console.log("RPC DATA:");
      console.log(response.data);

      console.log("RPC ERROR:");
      console.log(response.error);

      if (response.error) {
        console.error(
          "PUBLIC TRACKING RPC ERROR:",
          response.error
        );

        setError(response.error);
        return;
      }

      if (response.data === null || response.data === undefined) {
        console.log("RPC returned NULL/UNDEFINED");

        setError({
          message: "The RPC returned no data.",
          tracking_number: tracking,
        });

        return;
      }

      /*
       * IMPORTANT:
       * Supabase can return the RPC result as either
       * an object or an array depending on how the
       * PostgreSQL function is defined.
       */

      let normalizedResult = response.data;

      if (Array.isArray(response.data)) {
        console.log(
          "RPC DATA IS AN ARRAY:",
          response.data
        );

        if (response.data.length === 0) {
          setError({
            message:
              "The RPC returned an empty array.",
            tracking_number: tracking,
          });

          return;
        }

        /*
         * If PostgreSQL returned:
         *
         * [
         *   {
         *     shipment: {...},
         *     history: [...]
         *   }
         * ]
         *
         * use the first object.
         */
        normalizedResult = response.data[0];
      }

      console.log(
        "NORMALIZED RESULT:",
        normalizedResult
      );

      setResult(normalizedResult);

    } catch (err) {
      console.error(
        "RPC EXCEPTION:",
        err
      );

      setError(err);

    } finally {
      setLoading(false);

      console.log(
        "TRACKING SEARCH FINISHED"
      );

      console.log("================================");
    }
  }

  const shipment = result?.shipment;

  const history = Array.isArray(result?.history)
    ? result.history
    : [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">

                <span className="font-black text-xl">
                  A
                </span>

              </div>

              <div>

                <p className="font-black text-lg">
                  Atlas Express
                </p>

                <p className="text-xs text-blue-200">
                  Shipment Tracking
                </p>

              </div>

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
                setTrackingNumber(event.target.value)
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
              Tracking Request Result
            </h2>

            <p className="text-sm text-red-700 mt-2">
              Supabase responded, but the shipment
              could not be loaded.
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


        {/* SHIPMENT FOUND */}

        {!loading && result && (

          <div className="space-y-5">

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

              <h2 className="text-xl font-black text-green-800">
                Shipment Found
              </h2>

              <p className="text-sm text-green-700 mt-2">
                Supabase successfully returned the
                shipment data.
              </p>

            </div>


            {/* SHIPMENT */}

            {shipment && (

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

                <div className="p-6">

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

                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-black w-fit">
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
                      }
                    />

                    <Info
                      title="Pickup Address"
                      value={
                        shipment.pickup_address
                      }
                    />

                    <Info
                      title="Delivery Address"
                      value={
                        shipment.delivery_address
                      }
                    />

                    <Info
                      title="Package Type"
                      value={
                        shipment.package_type
                      }
                    />

                    <Info
                      title="Package Weight"
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
                      title="Quantity"
                      value={
                        shipment.package_quantity
                      }
                    />

                  </div>

                </div>

              </div>

            )}


            {/* HISTORY */}

            <div className="bg-white border border-slate-200 rounded-2xl">

              <div className="p-6 border-b border-slate-200">

                <h2 className="text-xl font-black text-blue-950">
                  Tracking History
                </h2>

                <p className="text-sm text-slate-600 mt-1">
                  Latest shipment activity.
                </p>

              </div>

              <div className="p-6">

                {history.length === 0 ? (

                  <p className="text-slate-600">
                    No tracking history available.
                  </p>

                ) : (

                  <div className="space-y-4">

                    {history.map(
                      (
                        update: any
                      ) => (

                        <div
                          key={update.id}
                          className="border border-slate-200 rounded-xl p-5"
                        >

                          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                            <div>

                              <h3 className="font-black text-slate-900">
                                {update.status ||
                                  "Shipment Update"}
                              </h3>

                              {update.location && (

                                <p className="text-sm text-blue-700 font-semibold mt-1">
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

                )}

              </div>

            </div>


            {/* RAW RESPONSE */}

            <div className="bg-slate-900 rounded-2xl p-6">

              <h2 className="text-white font-black">
                Database Response
              </h2>

              <p className="text-slate-400 text-xs mt-1">
                This is exactly what the browser
                received from get_public_shipment_v2.
              </p>

              <pre className="mt-4 text-xs text-green-300 whitespace-pre-wrap overflow-auto max-h-[600px]">
                {JSON.stringify(
                  result,
                  null,
                  2
                )}
              </pre>

            </div>

          </div>

        )}


        {/* NOTHING */}

        {!loading &&
          !result &&
          !error &&
          searched && (

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">

              <h2 className="text-xl font-black text-yellow-800">
                No shipment data returned
              </h2>

              <p className="text-sm text-yellow-700 mt-2">
                The database function completed but
                returned no shipment.
              </p>

            </div>

          )}


        {/* INITIAL */}

        {!loading &&
          !result &&
          !error &&
          !searched && (

            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">

              <p className="font-bold text-slate-600">
                Enter a tracking number to begin.
              </p>

              <p className="text-sm text-slate-400 mt-2">
                Try TRK544335
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
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4">

      <p className="text-xs uppercase tracking-wide font-black text-slate-500">
        {title}
      </p>

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