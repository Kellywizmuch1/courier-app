"use client";

import {
  Clock3,
  ShieldCheck,
  MapPinned,
  Headset,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Clock3,
    title: "Fast Delivery",
    description:
      "Quick and reliable shipping to keep your packages moving safely across every destination.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Handling",
    description:
      "Every shipment is professionally handled from pickup to final delivery with maximum care.",
  },
  {
    icon: MapPinned,
    title: "Live Tracking",
    description:
      "Track your shipment in real time with accurate updates and complete visibility.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description:
      "Our customer support team is available around the clock whenever you need assistance.",
  },
];

export default function Services() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">
          <span className="inline-block px-5 py-2 rounded-full bg-orange-100 text-orange-600 font-bold tracking-widest uppercase text-sm">
            Our Services
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Delivering Excellence
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-xl text-slate-700 leading-9">
            Atlas Express provides fast, secure and dependable logistics
            solutions designed for businesses and individuals who expect
            reliable delivery every time.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="group bg-white rounded-3xl p-10 shadow-md border border-slate-200 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
              >
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center transition-all duration-300 group-hover:bg-orange-500">
                  <Icon
                    size={38}
                    className="text-blue-900 group-hover:text-white transition-all duration-300"
                  />
                </div>

                <h3 className="mt-8 text-3xl font-black text-slate-900">
                  {service.title}
                </h3>

                <div className="w-16 h-1 rounded-full bg-orange-500 mt-5 mb-6"></div>

                <p className="text-slate-800 text-lg leading-8">
                  {service.description}
                </p>

                <button className="mt-8 flex items-center gap-2 font-bold text-orange-500 group-hover:text-blue-900 transition-all duration-300">
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}