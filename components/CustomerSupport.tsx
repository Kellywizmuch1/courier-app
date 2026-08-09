"use client";

import { useState } from "react";
import {
  MessageCircle,
  PhoneCall,
  Mail,
  X,
  Headset,
} from "lucide-react";

export default function CustomerSupport() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 right-6 z-50">

        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="group flex items-center gap-3 bg-blue-900 hover:bg-blue-950 text-white px-5 py-4 rounded-full shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              <Headset size={22} />
            </span>

            <span className="font-bold pr-1">
              Need Help?
            </span>
          </button>
        )}

        {/* Support Panel */}
        {open && (
          <div className="w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            {/* Header */}
            <div className="bg-blue-900 text-white p-6">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <Headset size={24} />
                  </div>

                  <div>
                    <h3 className="font-black text-lg">
                      Atlas Express
                    </h3>

                    <p className="text-blue-200 text-sm">
                      Customer Support
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition"
                  aria-label="Close support"
                >
                  <X size={20} />
                </button>

              </div>

            </div>

            {/* Body */}
            <div className="p-6">

              <h4 className="text-xl font-black text-slate-900">
                How can we help?
              </h4>

              <p className="text-slate-600 mt-2 mb-6">
                Choose an option below and our team will help you with your shipment.
              </p>

              {/* Live Chat */}
              <button
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageCircle
                    size={22}
                    className="text-blue-900"
                  />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Live Chat
                  </p>

                  <p className="text-sm text-slate-500">
                    Chat with our support team
                  </p>
                </div>
              </button>

              {/* Phone */}
              <button
                className="w-full flex items-center gap-4 p-4 mt-3 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                  <PhoneCall
                    size={22}
                    className="text-orange-600"
                  />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Phone Support
                  </p>

                  <p className="text-sm text-slate-500">
                    Speak with our team
                  </p>
                </div>
              </button>

              {/* Email */}
              <button
                className="w-full flex items-center gap-4 p-4 mt-3 rounded-2xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  <Mail
                    size={22}
                    className="text-green-600"
                  />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    Email Support
                  </p>

                  <p className="text-sm text-slate-500">
                    Send us a message
                  </p>
                </div>
              </button>

              <div className="mt-6 p-4 rounded-2xl bg-slate-50 text-center">
                <p className="text-sm text-slate-600">
                  Our support team is ready to assist you.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </>
  );
}