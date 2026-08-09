"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Send,
  Truck,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    tracking_number: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter your name.");
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (!form.message.trim()) {
      setErrorMessage("Please enter your message.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("support_messages")
      .insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        tracking_number:
          form.tracking_number.trim().toUpperCase() || null,
        message: form.message.trim(),
        status: "New",
      });

    if (error) {
      console.error("SUPPORT MESSAGE ERROR:", error);

      setErrorMessage(
        "We couldn't send your message right now. Please try again."
      );

      setLoading(false);
      return;
    }

    setForm({
      name: "",
      email: "",
      phone: "",
      tracking_number: "",
      message: "",
    });

    setSuccess(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-700/20 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-3xl" />

        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-20">

          {/* BACK */}

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition font-semibold"
          >
            <ArrowLeft size={19} />
            Back to Home
          </Link>

          {/* TITLE */}

          <div className="text-center max-w-4xl mx-auto mt-16">

            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/10 rounded-full px-5 py-3">

              <MessageSquare
                size={18}
                className="text-orange-500"
              />

              <span className="text-sm font-bold tracking-wide">
                ATLAS EXPRESS SUPPORT
              </span>

            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mt-8">

              How can we

              <span className="text-orange-500">
                {" "}help?
              </span>

            </h1>

            <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-8">

              Have a question about your shipment? Send our
              support team a message and we'll get back to you.

            </p>

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="bg-slate-100 text-slate-900 py-20">

        <div className="max-w-6xl mx-auto px-6">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* CONTACT INFORMATION */}

            <div className="space-y-6">

              <div>

                <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
                  Customer Care
                </p>

                <h2 className="text-3xl font-black mt-2">
                  We're here to help.
                </h2>

                <p className="text-slate-500 mt-4 leading-7">
                  Whether you have a tracking question, delivery
                  concern, or need help with a booking, contact
                  our support team.
                </p>

              </div>

              {/* TRACK */}

              <Link
                href="/track"
                className="block bg-blue-900 text-white rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition"
              >

                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">

                  <Package size={24} />

                </div>

                <h3 className="text-xl font-black mt-5">
                  Track a Shipment
                </h3>

                <p className="text-blue-200 mt-2 leading-6">
                  Check your shipment status, location and
                  delivery progress.
                </p>

              </Link>

              {/* CONTACT CARDS */}

              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                <div className="flex gap-4">

                  <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">

                    <Mail
                      size={21}
                      className="text-orange-600"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-400 uppercase">
                      Email
                    </p>

                    <p className="font-black mt-1">
                      support@atlasexpress.com
                    </p>

                  </div>

                </div>

              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                <div className="flex gap-4">

                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">

                    <Phone
                      size={21}
                      className="text-blue-700"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-400 uppercase">
                      Phone
                    </p>

                    <p className="font-black mt-1">
                      Customer Support
                    </p>

                  </div>

                </div>

              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                <div className="flex gap-4">

                  <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">

                    <Truck
                      size={21}
                      className="text-green-700"
                    />

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-400 uppercase">
                      Shipment Help
                    </p>

                    <p className="font-black mt-1">
                      Include your tracking number
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* FORM */}

            <div className="lg:col-span-2">

              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

                <div className="bg-blue-900 text-white p-8 md:p-10">

                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">

                      <Send size={24} />

                    </div>

                    <div>

                      <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">
                        Contact Support
                      </p>

                      <h2 className="text-3xl font-black">
                        Send us a message
                      </h2>

                    </div>

                  </div>

                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-8 md:p-10"
                >

                  {/* SUCCESS */}

                  {success && (

                    <div className="mb-8 rounded-2xl bg-green-50 border border-green-200 p-6">

                      <div className="flex items-start gap-4">

                        <CheckCircle2
                          size={28}
                          className="text-green-600 flex-shrink-0"
                        />

                        <div>

                          <h3 className="font-black text-green-800 text-lg">
                            Message sent successfully!
                          </h3>

                          <p className="text-green-700 mt-1">
                            Our support team has received your
                            message.
                          </p>

                        </div>

                      </div>

                    </div>

                  )}

                  {/* ERROR */}

                  {errorMessage && (

                    <div className="mb-8 rounded-2xl bg-red-50 border border-red-200 p-5">

                      <p className="text-red-700 font-bold">
                        {errorMessage}
                      </p>

                    </div>

                  )}

                  {/* NAME + EMAIL */}

                  <div className="grid md:grid-cols-2 gap-6">

                    <div>

                      <label
                        htmlFor="name"
                        className="block text-sm font-black text-slate-700 mb-2"
                      >
                        Full Name *
                      </label>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 font-semibold focus:outline-none focus:border-orange-500 transition"
                        required
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="email"
                        className="block text-sm font-black text-slate-700 mb-2"
                      >
                        Email Address *
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 font-semibold focus:outline-none focus:border-orange-500 transition"
                        required
                      />

                    </div>

                  </div>

                  {/* PHONE + TRACKING */}

                  <div className="grid md:grid-cols-2 gap-6 mt-6">

                    <div>

                      <label
                        htmlFor="phone"
                        className="block text-sm font-black text-slate-700 mb-2"
                      >
                        Phone Number
                      </label>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 font-semibold focus:outline-none focus:border-orange-500 transition"
                      />

                    </div>

                    <div>

                      <label
                        htmlFor="tracking_number"
                        className="block text-sm font-black text-slate-700 mb-2"
                      >
                        Tracking Number
                      </label>

                      <input
                        id="tracking_number"
                        name="tracking_number"
                        type="text"
                        value={form.tracking_number}
                        onChange={handleChange}
                        placeholder="e.g. ATX123456"
                        className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 font-semibold uppercase focus:outline-none focus:border-orange-500 transition"
                      />

                    </div>

                  </div>

                  {/* MESSAGE */}

                  <div className="mt-6">

                    <label
                      htmlFor="message"
                      className="block text-sm font-black text-slate-700 mb-2"
                    >
                      How can we help? *
                    </label>

                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what you need help with..."
                      rows={7}
                      className="w-full border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 font-semibold resize-none focus:outline-none focus:border-orange-500 transition"
                      required
                    />

                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-7 w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl px-6 py-4 font-black text-lg flex items-center justify-center gap-3 transition"
                  >

                    {loading ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send size={20} />
                      </>
                    )}

                  </button>

                  <p className="text-center text-sm text-slate-400 mt-4">
                    Please provide your tracking number if your
                    question is about a shipment.
                  </p>

                </form>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="bg-slate-950 text-white py-10">

        <div className="max-w-6xl mx-auto px-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="font-black text-xl">
                Atlas Express
              </p>

              <p className="text-slate-500 text-sm mt-1">
                Reliable shipment tracking and delivery.
              </p>

            </div>

            <div className="flex items-center gap-5 text-sm">

              <Link
                href="/"
                className="text-slate-400 hover:text-white transition"
              >
                Home
              </Link>

              <Link
                href="/track"
                className="text-slate-400 hover:text-white transition"
              >
                Track Shipment
              </Link>

              <Link
                href="/book"
                className="text-slate-400 hover:text-white transition"
              >
                Book Delivery
              </Link>

            </div>

          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-center text-slate-600 text-sm">
            © {new Date().getFullYear()} Atlas Express. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}