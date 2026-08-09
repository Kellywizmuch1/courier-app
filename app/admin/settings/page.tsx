"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Settings,
  Building2,
  Truck,
  ShieldCheck,
  Bell,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

export default function AdminSettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] =
    useState("Atlas Express");

  const [supportEmail, setSupportEmail] =
    useState("support@atlasexpress.com");

  const [supportPhone, setSupportPhone] =
    useState("");

  const [defaultDeliveryDays, setDefaultDeliveryDays] =
    useState("7");

  const [defaultLocation, setDefaultLocation] =
    useState("Origin Warehouse");

  const [maintenanceMode, setMaintenanceMode] =
    useState(false);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [smsNotifications, setSmsNotifications] =
    useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      router.replace("/login");
      return;
    }

    const email =
      session.user.email?.toLowerCase();

    if (
      email !==
      "michealkellywiz@gmail.com"
    ) {
      alert(
        "You do not have permission to access admin settings."
      );

      router.replace("/dashboard");
      return;
    }

    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);

    /*
      For now these settings are stored
      locally in the browser.

      Later we can move them into a
      Supabase settings table so every
      admin device uses the same settings.
    */

    const settings = {
      companyName,
      supportEmail,
      supportPhone,
      defaultDeliveryDays,
      defaultLocation,
      maintenanceMode,
      emailNotifications,
      smsNotifications,
    };

    localStorage.setItem(
      "atlas_admin_settings",
      JSON.stringify(settings)
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    setSaving(false);

    alert(
      "Admin settings saved successfully!"
    );
  }

  useEffect(() => {
    const saved =
      localStorage.getItem(
        "atlas_admin_settings"
      );

    if (!saved) return;

    try {
      const settings =
        JSON.parse(saved);

      if (settings.companyName)
        setCompanyName(
          settings.companyName
        );

      if (settings.supportEmail)
        setSupportEmail(
          settings.supportEmail
        );

      if (settings.supportPhone)
        setSupportPhone(
          settings.supportPhone
        );

      if (settings.defaultDeliveryDays)
        setDefaultDeliveryDays(
          settings.defaultDeliveryDays
        );

      if (settings.defaultLocation)
        setDefaultLocation(
          settings.defaultLocation
        );

      if (
        typeof settings.maintenanceMode ===
        "boolean"
      ) {
        setMaintenanceMode(
          settings.maintenanceMode
        );
      }

      if (
        typeof settings.emailNotifications ===
        "boolean"
      ) {
        setEmailNotifications(
          settings.emailNotifications
        );
      }

      if (
        typeof settings.smsNotifications ===
        "boolean"
      ) {
        setSmsNotifications(
          settings.smsNotifications
        );
      }
    } catch (error) {
      console.error(
        "SETTINGS LOAD ERROR:",
        error
      );
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Checking administrator access...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-6xl mx-auto px-6 py-8">

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </button>

          <div className="flex items-center gap-4 mt-7">

            <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center">
              <Settings size={28} />
            </div>

            <div>

              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-1">
                Admin Settings
              </h1>

              <p className="text-blue-200 mt-2">
                Manage your courier platform settings.
              </p>

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-6xl mx-auto px-6 py-10">

        <div className="space-y-8">

          {/* COMPANY */}

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2
                    size={22}
                    className="text-blue-800"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-black">
                    Company Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Basic information displayed across your courier platform.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-black text-slate-700 mb-2">
                  Company Name
                </label>

                <input
                  value={companyName}
                  onChange={(e) =>
                    setCompanyName(
                      e.target.value
                    )
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 font-semibold focus:outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="block text-sm font-black text-slate-700 mb-2">
                  Support Email
                </label>

                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) =>
                    setSupportEmail(
                      e.target.value
                    )
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 font-semibold focus:outline-none focus:border-orange-500"
                />

              </div>

              <div>

                <label className="block text-sm font-black text-slate-700 mb-2">
                  Support Phone
                </label>

                <input
                  type="tel"
                  value={supportPhone}
                  onChange={(e) =>
                    setSupportPhone(
                      e.target.value
                    )
                  }
                  placeholder="+234..."
                  className="w-full border-2 border-slate-200 rounded-xl p-4 font-semibold focus:outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </section>

          {/* DELIVERY */}

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Truck
                    size={22}
                    className="text-orange-600"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-black">
                    Delivery Settings
                  </h2>

                  <p className="text-sm text-slate-500">
                    Configure default shipment behaviour.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">

              <div>

                <label className="block text-sm font-black text-slate-700 mb-2">
                  Default Delivery Time
                </label>

                <div className="flex">

                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={defaultDeliveryDays}
                    onChange={(e) =>
                      setDefaultDeliveryDays(
                        e.target.value
                      )
                    }
                    className="w-full border-2 border-slate-200 rounded-l-xl p-4 font-semibold focus:outline-none focus:border-orange-500"
                  />

                  <div className="bg-slate-100 border-2 border-l-0 border-slate-200 rounded-r-xl px-5 flex items-center font-bold text-slate-600">
                    days
                  </div>

                </div>

              </div>

              <div>

                <label className="block text-sm font-black text-slate-700 mb-2">
                  Default Starting Location
                </label>

                <input
                  value={defaultLocation}
                  onChange={(e) =>
                    setDefaultLocation(
                      e.target.value
                    )
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 font-semibold focus:outline-none focus:border-orange-500"
                />

              </div>

            </div>

          </section>

          {/* NOTIFICATIONS */}

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                  <Bell
                    size={22}
                    className="text-green-600"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-black">
                    Notifications
                  </h2>

                  <p className="text-sm text-slate-500">
                    Choose how shipment updates should be handled.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6 space-y-5">

              <label className="flex items-center justify-between gap-5 cursor-pointer">

                <div>

                  <p className="font-black">
                    Email Notifications
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Enable shipment updates through email.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    emailNotifications
                  }
                  onChange={(e) =>
                    setEmailNotifications(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-orange-500"
                />

              </label>

              <label className="flex items-center justify-between gap-5 cursor-pointer">

                <div>

                  <p className="font-black">
                    SMS Notifications
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Enable shipment updates through SMS.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    smsNotifications
                  }
                  onChange={(e) =>
                    setSmsNotifications(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-orange-500"
                />

              </label>

            </div>

          </section>

          {/* SECURITY */}

          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ShieldCheck
                    size={22}
                    className="text-purple-600"
                  />
                </div>

                <div>

                  <h2 className="text-xl font-black">
                    Platform Controls
                  </h2>

                  <p className="text-sm text-slate-500">
                    Control the availability of the platform.
                  </p>

                </div>

              </div>

            </div>

            <div className="p-6">

              <label className="flex items-center justify-between gap-5 cursor-pointer">

                <div>

                  <p className="font-black">
                    Maintenance Mode
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Temporarily disable normal customer access while maintenance is being performed.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    maintenanceMode
                  }
                  onChange={(e) =>
                    setMaintenanceMode(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-orange-500"
                />

              </label>

              {maintenanceMode && (

                <div className="mt-5 bg-orange-50 border border-orange-200 rounded-2xl p-5">

                  <p className="font-black text-orange-800">
                    Maintenance mode is enabled.
                  </p>

                  <p className="text-sm text-orange-700 mt-1">
                    Remember that this setting is currently saved only in this browser.
                  </p>

                </div>

              )}

            </div>

          </section>

          {/* SAVE */}

          <div className="flex justify-end">

            <button
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-black text-lg transition"
            >

              <Save size={20} />

              {saving
                ? "Saving Settings..."
                : "Save Settings"}

            </button>

          </div>

        </div>

      </section>

    </main>
  );
}