"use client";

import Link from "next/link";
import ShipmentTracker from "./ShipmentTracker";
import {
  ArrowRight,
  Package,
  ShieldCheck,
  Globe2,
  Zap,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 min-h-[720px] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_40%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 backdrop-blur-md rounded-full px-5 py-3 text-white mb-8">
              <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />

              <span className="text-sm font-bold tracking-wide">
                SMARTER LOGISTICS. BETTER DELIVERY.
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight">
              Delivering What
              <span className="block text-orange-500">
                Matters Most.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 text-lg md:text-xl text-slate-300 max-w-xl leading-9">
              Fast, secure and reliable delivery solutions designed to
              keep your shipments moving and your business connected.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href="/book"
                className="group inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-7 py-4 rounded-xl font-extrabold transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-orange-500/20"
              >
                Book a Delivery

                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <div className="w-full mt-4 max-w-xl">
                <ShipmentTracker />
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-8 mt-12">
              {/* Secure */}
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className="text-orange-500"
                  size={22}
                />

                <div>
                  <p className="text-white font-bold text-sm">
                    Secure
                  </p>

                  <p className="text-slate-400 text-xs">
                    Shipment handling
                  </p>
                </div>
              </div>

              {/* Connected */}
              <div className="flex items-center gap-3">
                <Globe2
                  className="text-orange-500"
                  size={22}
                />

                <div>
                  <p className="text-white font-bold text-sm">
                    Connected
                  </p>

                  <p className="text-slate-400 text-xs">
                    Global logistics
                  </p>
                </div>
              </div>

              {/* Fast */}
              <div className="flex items-center gap-3">
                <Zap
                  className="text-orange-500"
                  size={22}
                />

                <div>
                  <p className="text-white font-bold text-sm">
                    Fast
                  </p>

                  <p className="text-slate-400 text-xs">
                    Reliable delivery
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative hidden lg:block">
            {/* Main card */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/15 rounded-[2rem] p-8 shadow-2xl">
              {/* Floating package icon */}
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl rotate-6">
                <Package
                  className="text-white"
                  size={30}
                />
              </div>

              {/* Card heading */}
              <div className="mb-8">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">
                  Shipment Overview
                </p>

                <h2 className="text-3xl font-black text-white mt-2">
                  Your delivery is moving.
                </h2>
              </div>

              {/* Tracking line */}
              <div className="space-y-7">
                {/* Picked up */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 bg-green-400 rounded-full" />
                  </div>

                  <div>
                    <p className="text-white font-bold">
                      Package Picked Up
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      Shipment successfully collected
                    </p>
                  </div>
                </div>

                <div className="ml-5 h-8 border-l border-dashed border-slate-500" />

                {/* In transit */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
                  </div>

                  <div>
                    <p className="text-white font-bold">
                      In Transit
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      Shipment is currently on the move
                    </p>
                  </div>
                </div>

                <div className="ml-5 h-8 border-l border-dashed border-slate-500" />

                {/* Delivered */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                    <span className="w-3 h-3 bg-blue-400 rounded-full" />
                  </div>

                  <div>
                    <p className="text-white font-bold">
                      Delivered
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      Awaiting final delivery
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom information */}
              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs">
                    Tracking
                  </p>

                  <p className="text-white font-bold mt-1">
                    TRK-EXPRESS
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-slate-400 text-xs">
                    Status
                  </p>

                  <p className="text-orange-400 font-bold mt-1">
                    In Transit
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-8 -left-10 bg-white rounded-2xl shadow-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <ShieldCheck
                  className="text-blue-900"
                  size={25}
                />
              </div>

              <div>
                <p className="text-slate-900 font-black">
                  Secure Delivery
                </p>

                <p className="text-slate-500 text-sm">
                  Every shipment matters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}