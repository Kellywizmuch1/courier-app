"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Truck,
  Phone,
  MapPin,
  User,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

type Driver = {
  id: number;
  name: string;
  phone: string | null;
  status: string;
  current_location: string | null;
  created_at: string;
  updated_at: string;
};

export default function DriversPage() {
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("Available");
  const [location, setLocation] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    await loadDrivers();

    setLoading(false);
  }

  async function loadDrivers() {
    const { data, error } = await supabase
      .from("drivers")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      alert("Could not load drivers: " + error.message);
      return;
    }

    setDrivers(data || []);
  }

  async function addDriver() {
    if (!name.trim()) {
      alert("Please enter the driver's name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("drivers")
      .insert({
        name: name.trim(),
        phone: phone.trim() || null,
        status,
        current_location: location.trim() || null,
      });

    setSaving(false);

    if (error) {
      alert("Could not add driver: " + error.message);
      return;
    }

    setName("");
    setPhone("");
    setStatus("Available");
    setLocation("");

    await loadDrivers();
  }

  async function updateDriver(
    id: number,
    newStatus: string,
    newLocation: string
  ) {
    const { error } = await supabase
      .from("drivers")
      .update({
        status: newStatus,
        current_location: newLocation.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      alert("Could not update driver: " + error.message);
      return;
    }

    await loadDrivers();
  }

  async function deleteDriver(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this driver?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Could not delete driver: " + error.message);
      return;
    }

    await loadDrivers();
  }

  function statusStyle(driverStatus: string) {
    switch (driverStatus) {
      case "Available":
        return "bg-green-100 text-green-700";

      case "On Delivery":
        return "bg-blue-100 text-blue-700";

      case "Offline":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function statusIcon(driverStatus: string) {
    switch (driverStatus) {
      case "Available":
        return (
          <CheckCircle2
            size={18}
            className="text-green-600"
          />
        );

      case "On Delivery":
        return (
          <Truck
            size={18}
            className="text-blue-600"
          />
        );

      case "Offline":
        return (
          <XCircle
            size={18}
            className="text-slate-500"
          />
        );

      default:
        return (
          <Clock3
            size={18}
            className="text-yellow-600"
          />
        );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 font-bold text-slate-600">
            Loading drivers...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-900 text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center">
                <Truck size={30} />
              </div>

              <div>

                <p className="text-orange-400 font-bold uppercase tracking-wider text-sm">
                  Atlas Express
                </p>

                <h1 className="text-3xl md:text-4xl font-black">
                  Driver Management
                </h1>

              </div>

            </div>

            <button
              onClick={() => router.push("/admin")}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl font-bold transition"
            >
              <ArrowLeft size={18} />
              Back to Admin
            </button>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* ADD DRIVER */}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">

          <div className="flex items-center gap-4 mb-8">

            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Plus
                size={25}
                className="text-orange-600"
              />
            </div>

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                Fleet
              </p>

              <h2 className="text-2xl font-black">
                Add Driver
              </h2>

            </div>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>

              <label className="block text-sm font-bold text-slate-600 mb-2">
                Driver Name
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Driver name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
              />

            </div>

            <div>

              <label className="block text-sm font-bold text-slate-600 mb-2">
                Phone
              </label>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="Phone number"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
              />

            </div>

            <div>

              <label className="block text-sm font-bold text-slate-600 mb-2">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
              >
                <option>Available</option>
                <option>On Delivery</option>
                <option>Offline</option>
              </select>

            </div>

            <div>

              <label className="block text-sm font-bold text-slate-600 mb-2">
                Current Location
              </label>

              <input
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                placeholder="Current location"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
              />

            </div>

          </div>

          <button
            onClick={addDriver}
            disabled={saving}
            className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-black transition"
          >
            <Plus size={20} />

            {saving
              ? "Adding..."
              : "Add Driver"}
          </button>

        </div>

        {/* DRIVER LIST */}

        <div className="mt-8">

          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
                Fleet Overview
              </p>

              <h2 className="text-3xl font-black">
                Your Drivers
              </h2>

            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 font-black shadow-sm">
              {drivers.length} Drivers
            </div>

          </div>

          {drivers.length === 0 ? (

            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-12 text-center">

              <Truck
                size={50}
                className="mx-auto text-slate-300"
              />

              <h3 className="text-xl font-black mt-5">
                No drivers yet
              </h3>

              <p className="text-slate-500 mt-2">
                Add your first driver above.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {drivers.map((driver) => (

                <div
                  key={driver.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden"
                >

                  <div className="bg-blue-900 text-white p-6">

                    <div className="flex items-center justify-between">

                      <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                        <User size={25} />
                      </div>

                      <span
                        className={`px-4 py-2 rounded-full text-sm font-black ${statusStyle(
                          driver.status
                        )}`}
                      >
                        {driver.status}
                      </span>

                    </div>

                    <h3 className="text-2xl font-black mt-5">
                      {driver.name}
                    </h3>

                  </div>

                  <div className="p-6">

                    <div className="space-y-4">

                      <div className="flex items-center gap-3">

                        <Phone
                          size={19}
                          className="text-orange-500"
                        />

                        <span className="font-semibold">
                          {driver.phone ||
                            "No phone added"}
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        <MapPin
                          size={19}
                          className="text-blue-600"
                        />

                        <span className="font-semibold">
                          {driver.current_location ||
                            "Location not set"}
                        </span>

                      </div>

                      <div className="flex items-center gap-3">

                        {statusIcon(driver.status)}

                        <span className="font-semibold">
                          {driver.status}
                        </span>

                      </div>

                    </div>

                    <div className="border-t border-slate-200 mt-6 pt-6">

                      <label className="block text-sm font-bold text-slate-600 mb-2">
                        Update Status
                      </label>

                      <select
                        value={driver.status}
                        onChange={(e) =>
                          updateDriver(
                            driver.id,
                            e.target.value,
                            driver.current_location || ""
                          )
                        }
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                      >
                        <option>Available</option>
                        <option>On Delivery</option>
                        <option>Offline</option>
                      </select>

                      <label className="block text-sm font-bold text-slate-600 mb-2 mt-4">
                        Update Location
                      </label>

                      <input
                        defaultValue={
                          driver.current_location || ""
                        }
                        onBlur={(e) =>
                          updateDriver(
                            driver.id,
                            driver.status,
                            e.target.value
                          )
                        }
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                        placeholder="Current location"
                      />

                    </div>

                    <button
                      onClick={() =>
                        deleteDriver(driver.id)
                      }
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold transition"
                    >
                      <Trash2 size={18} />
                      Remove Driver
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}