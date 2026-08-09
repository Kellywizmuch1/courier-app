"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Package, MapPin, CalendarDays, ArrowRight } from "lucide-react";

export default function BookingSuccessPage() {
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    const savedBooking = sessionStorage.getItem("latestBooking");

    if (savedBooking) {
      try {
        setBooking(JSON.parse(savedBooking));
      } catch (error) {
        console.error("Could not read booking:", error);
      }
    }
  }, []);

  if (!booking) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          <Package size={60} className="mx-auto text-orange-500" />

          <h1 className="text-3xl font-black mt-6">
            Booking information not found
          </h1>

          <p className="text-slate-400 mt-3">
            We couldn't find the booking information on this device.
          </p>

          <Link
            href="/book"
            className="inline-flex items-center gap-2 mt-8 bg-orange-500 hover:bg-orange-600 px-7 py-4 rounded-xl font-black"
          >
            Make a Booking
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-700/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20">

          {/* SUCCESS ICON */}

          <div className="text-center">

            <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto">

              <CheckCircle2
                size={58}
                className="text-green-400"
              />

            </div>

            <p className="text-orange-400 font-bold uppercase tracking-wider text-sm mt-8">
              Atlas Express
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-3">
              Booking Confirmed!
            </h1>

            <p className="text-slate-300 text-lg mt-5 max-w-2xl mx-auto leading-8">
              Your shipment has been successfully booked.
              Keep your tracking number safe so you can
              follow your package at any time.
            </p>

          </div>

          {/* TRACKING NUMBER */}

          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl mt-12 p-8 md:p-10 text-center">

            <p className="text-sm font-black uppercase tracking-wider text-slate-500">
              Your Tracking Number
            </p>

            <div className="mt-4 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-6">

              <p className="text-3xl md:text-4xl font-black tracking-widest text-blue-950 break-all">
                {booking.tracking_number || "Not available"}
              </p>

            </div>

            <p className="text-slate-500 text-sm mt-4">
              Use this number on the Track Shipment page.
            </p>

          </div>

          {/* BOOKING DETAILS */}

          <div className="bg-white text-slate-900 rounded-3xl shadow-2xl mt-8 p-8 md:p-10">

            <div className="flex items-center gap-4 mb-8">

              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">

                <Package
                  size={25}
                  className="text-orange-600"
                />

              </div>

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                  Shipment Details
                </p>

                <h2 className="text-3xl font-black">
                  Your Booking
                </h2>

              </div>

            </div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* SENDER */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Sender
                </p>

                <p className="text-xl font-black mt-2">
                  {booking.sender_name || "Not available"}
                </p>

              </div>

              {/* RECEIVER */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Receiver
                </p>

                <p className="text-xl font-black mt-2">
                  {booking.receiver_name || "Not available"}
                </p>

              </div>

              {/* PICKUP */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center gap-3">

                  <MapPin
                    size={21}
                    className="text-blue-600"
                  />

                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Pickup Location
                  </p>

                </div>

                <p className="font-black text-lg mt-3">
                  {booking.pickup_address || "Not available"}
                </p>

              </div>

              {/* DELIVERY */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">

                <div className="flex items-center gap-3">

                  <MapPin
                    size={21}
                    className="text-red-600"
                  />

                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Delivery Location
                  </p>

                </div>

                <p className="font-black text-lg mt-3">
                  {booking.delivery_address || "Not available"}
                </p>

              </div>

              {/* ESTIMATED DELIVERY */}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:col-span-2">

                <div className="flex items-center gap-3">

                  <CalendarDays
                    size={21}
                    className="text-green-600"
                  />

                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Estimated Delivery
                  </p>

                </div>

                <p className="font-black text-lg mt-3">
                  {booking.estimated_delivery || "To be confirmed"}
                </p>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="grid md:grid-cols-2 gap-5 mt-8">

            <Link
              href={`/track?tracking=${encodeURIComponent(
                booking.tracking_number || ""
              )}`}
              className="bg-orange-500 hover:bg-orange-600 rounded-2xl p-5 flex items-center justify-center gap-3 font-black text-lg transition hover:-translate-y-1"
            >
              Track Shipment
              <ArrowRight size={21} />
            </Link>

            <Link
              href="/"
              className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-5 flex items-center justify-center gap-3 font-black text-lg transition"
            >
              Back to Home
            </Link>

          </div>

          {/* FOOTER MESSAGE */}

          <div className="text-center mt-12">

            <p className="text-slate-400">
              Thank you for choosing
              <span className="text-orange-400 font-bold">
                {" "}Atlas Express
              </span>
              .
            </p>

            <p className="text-slate-500 text-sm mt-2">
              Keep your tracking number available for future shipment updates.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}