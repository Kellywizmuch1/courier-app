"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Save,
  Plus,
  Trash2,
} from "lucide-react";

import { supabase } from "../../../../lib/supabase";

type Booking = {
  id: number;
  user_id: string;
  tracking_number: string;
  sender_name: string;
  receiver_name: string;
  pickup_address: string;
  delivery_address: string;
  phone_number: string;
  status: string;
  current_location: string;
  next_location: string;
  estimated_delivery: string;
  last_updated: string;
  created_at?: string;

  package_type?: string | null;
  package_description?: string | null;
  package_weight?: number | null;
  package_quantity?: number | null;
  package_value?: number | null;
  special_handling?: string | null;

  pickup_latitude?: number | null;
  pickup_longitude?: number | null;
  current_latitude?: number | null;
  current_longitude?: number | null;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;

  delivery_issue?: string | null;
  delivery_update?: string | null;
};

type ShipmentUpdate = {
  id: number;
  booking_id: number;
  status: string;
  location: string | null;
  message: string;
  created_at: string;
};

/*
 * IMPORTANT:
 * Confirmed is now included in the shipment workflow.
 */
const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Picked Up",
  "In Transit",
  "Delayed",
  "Delivery Issue",
  "Delivered",
];

export default function AdminShipmentPage() {
  const router = useRouter();
  const params = useParams();

  const shipmentId = String(params.id);

  const [shipment, setShipment] =
    useState<Booking | null>(null);

  const [updates, setUpdates] =
    useState<ShipmentUpdate[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingUpdate, setAddingUpdate] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);

  const [form, setForm] = useState({
    status: "",
    current_location: "",
    next_location: "",
    estimated_delivery: "",
    delivery_issue: "",
    delivery_update: "",

    package_type: "",
    package_description: "",
    package_weight: "",
    package_quantity: "",
    package_value: "",
    special_handling: "",
  });

  const [updateForm, setUpdateForm] = useState({
    status: "",
    location: "",
    message: "",
  });

  useEffect(() => {
    void checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
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
        "You do not have permission to access this page."
      );

      router.replace("/dashboard");
      return;
    }

    await loadShipment();

    setLoading(false);
  }

  async function loadShipment() {
    if (!shipmentId) return;

    let data: Booking | null = null;
    let error: any = null;

    const numericId = Number(shipmentId);

    if (!Number.isNaN(numericId)) {
      const result = await supabase
        .from("bookings")
        .select("*")
        .eq("id", numericId)
        .maybeSingle();

      data = result.data;
      error = result.error;
    }

    if (!data && !error) {
      const result = await supabase
        .from("bookings")
        .select("*")
        .eq(
          "tracking_number",
          shipmentId
        )
        .maybeSingle();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error(
        "SHIPMENT ERROR:",
        error
      );

      alert(
        "Could not load shipment: " +
          (error.message ||
            "Unknown Supabase error")
      );

      return;
    }

    if (!data) {
      alert("Shipment not found.");
      return;
    }

    setShipment(data);

    setForm({
      status: data.status || "Pending",

      current_location:
        data.current_location || "",

      next_location:
        data.next_location || "",

      estimated_delivery:
        data.estimated_delivery || "",

      delivery_issue:
        data.delivery_issue || "",

      delivery_update:
        data.delivery_update || "",

      package_type:
        data.package_type || "",

      package_description:
        data.package_description || "",

      package_weight:
        data.package_weight !== null &&
        data.package_weight !== undefined
          ? String(data.package_weight)
          : "",

      package_quantity:
        data.package_quantity !== null &&
        data.package_quantity !== undefined
          ? String(data.package_quantity)
          : "",

      package_value:
        data.package_value !== null &&
        data.package_value !== undefined
          ? String(data.package_value)
          : "",

      special_handling:
        data.special_handling || "",
    });

    setUpdateForm({
      status: data.status || "Pending",

      location:
        data.current_location || "",

      message: "",
    });

    await loadShipmentUpdates(data.id);
  }

  async function loadShipmentUpdates(
    bookingId: number
  ) {
    const { data, error } =
      await supabase
        .from("shipment_updates")
        .select("*")
        .eq("booking_id", bookingId)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "SHIPMENT UPDATES ERROR:",
        error
      );

      return;
    }

    setUpdates(data || []);
  }

  async function refreshShipment() {
    setRefreshing(true);

    await loadShipment();

    setRefreshing(false);
  }

  async function saveShipment() {
    if (!shipment) return;

    setSaving(true);

    const newStatus =
      form.status || "Pending";

    const { data, error } =
      await supabase
        .from("bookings")
        .update({
          status: newStatus,

          current_location:
            form.current_location.trim() ||
            null,

          next_location:
            form.next_location.trim() ||
            null,

          estimated_delivery:
            form.estimated_delivery.trim() ||
            null,

          delivery_issue:
            form.delivery_issue.trim() ||
            null,

          delivery_update:
            form.delivery_update.trim() ||
            null,

          package_type:
            form.package_type.trim() ||
            null,

          package_description:
            form.package_description.trim() ||
            null,

          package_weight:
            form.package_weight.trim()
              ? Number(form.package_weight)
              : null,

          package_quantity:
            form.package_quantity.trim()
              ? Number(form.package_quantity)
              : null,

          package_value:
            form.package_value.trim()
              ? Number(form.package_value)
              : null,

          special_handling:
            form.special_handling.trim() ||
            null,

          last_updated:
            new Date().toISOString(),
        })
        .eq("id", shipment.id)
        .select()
        .single();

    if (error) {
      console.error(
        "SAVE SHIPMENT ERROR:",
        error
      );

      alert(
        "Could not save shipment: " +
          error.message
      );

      setSaving(false);
      return;
    }

    setShipment(data);

    setUpdateForm((previous) => ({
      ...previous,
      status: newStatus,
      location:
        form.current_location ||
        previous.location,
    }));

    alert(
      "Shipment saved successfully."
    );

    setSaving(false);
  }

  async function addTrackingUpdate() {
    if (!shipment) return;

    if (!updateForm.status) {
      alert(
        "Please select a tracking status."
      );
      return;
    }

    if (!updateForm.message.trim()) {
      alert(
        "Please enter a tracking update message."
      );
      return;
    }

    setAddingUpdate(true);

    const { error } =
      await supabase
        .from("shipment_updates")
        .insert({
          booking_id: shipment.id,

          status: updateForm.status,

          location:
            updateForm.location.trim() ||
            null,

          message:
            updateForm.message.trim(),

          created_at:
            new Date().toISOString(),
        });

    if (error) {
      console.error(
        "ADD TRACKING UPDATE ERROR:",
        error
      );

      alert(
        "Could not add tracking update: " +
          error.message
      );

      setAddingUpdate(false);
      return;
    }

    /*
     * Also update the main shipment status
     * and current location.
     *
     * This means selecting Confirmed here
     * will also make the main shipment
     * Confirmed.
     */
    const {
      data: updatedShipment,
      error: shipmentError,
    } = await supabase
      .from("bookings")
      .update({
        status: updateForm.status,

        current_location:
          updateForm.location.trim() ||
          shipment.current_location ||
          null,

        last_updated:
          new Date().toISOString(),
      })
      .eq("id", shipment.id)
      .select()
      .single();

    if (shipmentError) {
      console.error(
        "UPDATE SHIPMENT AFTER HISTORY ERROR:",
        shipmentError
      );

      alert(
        "Tracking update was added, but the shipment status could not be updated: " +
          shipmentError.message
      );
    } else {
      setShipment(updatedShipment);

      setForm((previous) => ({
        ...previous,

        status:
          updateForm.status,

        current_location:
          updateForm.location ||
          previous.current_location,
      }));
    }

    setUpdateForm((previous) => ({
      ...previous,
      message: "",
    }));

    await loadShipmentUpdates(
      shipment.id
    );

    alert(
      "Tracking update added successfully."
    );

    setAddingUpdate(false);
  }

  async function deleteTrackingUpdate(
    updateId: number
  ) {
    const confirmed = window.confirm(
      "Delete this tracking update?"
    );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from("shipment_updates")
        .delete()
        .eq("id", updateId);

    if (error) {
      console.error(
        "DELETE TRACKING UPDATE ERROR:",
        error
      );

      alert(
        "Could not delete update: " +
          error.message
      );

      return;
    }

    setUpdates((previous) =>
      previous.filter(
        (update) =>
          update.id !== updateId
      )
    );
  }

  function statusStyle(
    status: string
  ) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "In Transit":
        return "bg-orange-100 text-orange-700";

      case "Picked Up":
        return "bg-blue-100 text-blue-700";

      case "Confirmed":
        return "bg-indigo-100 text-indigo-700";

      case "Delayed":
        return "bg-purple-100 text-purple-700";

      case "Delivery Issue":
        return "bg-red-100 text-red-700";

      case "Pending":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

  function statusIcon(
    status: string
  ) {
    switch (status) {
      case "Delivered":
        return (
          <CheckCircle
            size={22}
            className="text-green-600"
          />
        );

      case "Confirmed":
        return (
          <CheckCircle
            size={22}
            className="text-indigo-600"
          />
        );

      case "In Transit":
      case "Picked Up":
        return (
          <Truck
            size={22}
            className="text-orange-600"
          />
        );

      case "Delayed":
      case "Delivery Issue":
        return (
          <AlertTriangle
            size={22}
            className="text-red-600"
          />
        );

      case "Pending":
      default:
        return (
          <Clock
            size={22}
            className="text-yellow-600"
          />
        );
    }
  }

  function inputClass() {
    return "w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 bg-white focus:outline-none focus:border-orange-500";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Loading shipment...
          </p>
        </div>
      </main>
    );
  }

  if (!shipment) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <Package
            size={50}
            className="text-slate-400 mx-auto"
          />

          <h1 className="text-3xl font-black mt-6">
            Shipment Not Found
          </h1>

          <p className="text-slate-500 mt-3">
            We could not find this shipment.
          </p>

          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-2 mt-7 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-black"
          >
            <ArrowLeft size={18} />
            Back to Shipments
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-7">
          <Link
            href="/admin/shipments"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Shipment Management
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mt-6">
            <div>
              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Manage Shipment
              </h1>

              <p className="text-blue-200 mt-2">
                Edit shipment information and tracking activity.
              </p>
            </div>

            <button
              onClick={refreshShipment}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/10 px-6 py-3 rounded-xl font-black transition"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* SHIPMENT HEADER */}

        <div className="bg-slate-950 text-white rounded-3xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-orange-400 text-sm font-black uppercase tracking-widest">
                Tracking Number
              </p>

              <h2 className="text-3xl md:text-4xl font-black mt-2">
                {shipment.tracking_number}
              </h2>

              <p className="text-slate-400 mt-2">
                Shipment ID: {shipment.id}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {statusIcon(
                shipment.status
              )}

              <span
                className={`px-5 py-2.5 rounded-full font-black ${statusStyle(
                  shipment.status
                )}`}
              >
                {shipment.status ||
                  "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* EDIT SHIPMENT */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mt-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package
                size={22}
                className="text-orange-600"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Shipment Information
              </h2>

              <p className="text-slate-500 text-sm">
                Edit the main shipment details.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
            {/* STATUS */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Shipment Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target.value,
                  })
                }
                className={inputClass()}
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* CURRENT LOCATION */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Current Location
              </label>

              <input
                value={
                  form.current_location
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    current_location:
                      e.target.value,
                  })
                }
                placeholder="e.g. Lagos Hub"
                className={inputClass()}
              />
            </div>

            {/* NEXT LOCATION */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Next Location
              </label>

              <input
                value={
                  form.next_location
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    next_location:
                      e.target.value,
                  })
                }
                placeholder="e.g. Abuja Hub"
                className={inputClass()}
              />
            </div>

            {/* DELIVERY */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Estimated Delivery
              </label>

              <input
                value={
                  form.estimated_delivery
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    estimated_delivery:
                      e.target.value,
                  })
                }
                placeholder="e.g. August 12, 2026"
                className={inputClass()}
              />
            </div>

            {/* PACKAGE TYPE */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Package Type
              </label>

              <input
                value={
                  form.package_type
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    package_type:
                      e.target.value,
                  })
                }
                placeholder="Box, Document, Electronics..."
                className={inputClass()}
              />
            </div>

            {/* WEIGHT */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Weight
              </label>

              <input
                type="number"
                value={
                  form.package_weight
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    package_weight:
                      e.target.value,
                  })
                }
                placeholder="kg"
                className={inputClass()}
              />
            </div>

            {/* QUANTITY */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Quantity
              </label>

              <input
                type="number"
                value={
                  form.package_quantity
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    package_quantity:
                      e.target.value,
                  })
                }
                placeholder="1"
                className={inputClass()}
              />
            </div>

            {/* VALUE */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Declared Value
              </label>

              <input
                type="number"
                value={
                  form.package_value
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    package_value:
                      e.target.value,
                  })
                }
                placeholder="Value"
                className={inputClass()}
              />
            </div>

            {/* SPECIAL HANDLING */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Special Handling
              </label>

              <input
                value={
                  form.special_handling
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    special_handling:
                      e.target.value,
                  })
                }
                placeholder="Handle with care..."
                className={inputClass()}
              />
            </div>
          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">
            <label className="block text-sm font-black text-slate-600 mb-2">
              Package Description
            </label>

            <textarea
              value={
                form.package_description
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  package_description:
                    e.target.value,
                })
              }
              rows={4}
              placeholder="Describe the package..."
              className={inputClass()}
            />
          </div>

          {/* DELIVERY ISSUE */}

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Delivery Issue
              </label>

              <textarea
                value={
                  form.delivery_issue
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    delivery_issue:
                      e.target.value,
                  })
                }
                rows={3}
                placeholder="Leave empty if there is no issue."
                className={inputClass()}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Delivery Update
              </label>

              <textarea
                value={
                  form.delivery_update
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    delivery_update:
                      e.target.value,
                  })
                }
                rows={3}
                placeholder="Additional delivery information..."
                className={inputClass()}
              />
            </div>
          </div>

          {/* SAVE */}

          <button
            onClick={saveShipment}
            disabled={saving}
            className="mt-7 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-black transition"
          >
            <Save size={19} />

            {saving
              ? "Saving..."
              : "Save Shipment"}
          </button>
        </div>

        {/* ADD TRACKING UPDATE */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mt-7">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
              <Plus
                size={22}
                className="text-green-600"
              />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                Add Tracking Update
              </h2>

              <p className="text-slate-500 text-sm">
                Add an event that customers will see on the tracking page.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-7">
            {/* UPDATE STATUS */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Update Status
              </label>

              <select
                value={
                  updateForm.status
                }
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    status:
                      e.target.value,
                  })
                }
                className={inputClass()}
              >
                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* UPDATE LOCATION */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Location
              </label>

              <input
                value={
                  updateForm.location
                }
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    location:
                      e.target.value,
                  })
                }
                placeholder="e.g. Abuja Sorting Center"
                className={inputClass()}
              />
            </div>

            {/* UPDATE MESSAGE */}

            <div>
              <label className="block text-sm font-black text-slate-600 mb-2">
                Message
              </label>

              <input
                value={
                  updateForm.message
                }
                onChange={(e) =>
                  setUpdateForm({
                    ...updateForm,
                    message:
                      e.target.value,
                  })
                }
                placeholder="Shipment booking has been confirmed"
                className={inputClass()}
              />
            </div>
          </div>

          <button
            onClick={
              addTrackingUpdate
            }
            disabled={addingUpdate}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-7 py-3.5 rounded-xl font-black transition"
          >
            <Plus size={19} />

            {addingUpdate
              ? "Adding..."
              : "Add Tracking Update"}
          </button>
        </div>

        {/* TRACKING HISTORY */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 mt-7">
          <div>
            <h2 className="text-2xl font-black text-blue-900">
              Tracking History
            </h2>

            <p className="text-slate-500 mt-1">
              Manage the events customers see on the tracking page.
            </p>
          </div>

          {updates.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-8 text-center mt-6">
              <Clock
                size={35}
                className="text-slate-400 mx-auto"
              />

              <p className="font-black text-slate-600 mt-4">
                No tracking updates yet.
              </p>
            </div>
          ) : (
            <div className="mt-7 space-y-4">
              {updates.map(
                (update) => (
                  <div
                    key={update.id}
                    className="border border-slate-200 rounded-2xl p-5"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          {statusIcon(
                            update.status
                          )}
                        </div>

                        <div>
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-sm font-black ${statusStyle(
                              update.status
                            )}`}
                          >
                            {update.status}
                          </span>

                          {update.location && (
                            <p className="flex items-center gap-2 text-sm text-slate-500 mt-3">
                              <MapPin
                                size={16}
                              />

                              {update.location}
                            </p>
                          )}

                          <p className="font-semibold text-slate-700 mt-3">
                            {update.message}
                          </p>

                          <p className="text-xs text-slate-400 mt-3">
                            {update.created_at
                              ? new Date(
                                  update.created_at
                                ).toLocaleString()
                              : "Unknown time"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          deleteTrackingUpdate(
                            update.id
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-black px-4 py-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2
                          size={17}
                        />

                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ACTIONS */}

        <div className="flex flex-col sm:flex-row gap-4 mt-7">
          <Link
            href={`/track?tracking=${encodeURIComponent(
              shipment.tracking_number
            )}`}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-4 rounded-xl font-black transition"
          >
            <Package size={20} />
            View Customer Tracking
          </Link>

          <Link
            href="/admin/shipments"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-black transition"
          >
            <ArrowLeft size={20} />
            Back to Shipments
          </Link>
        </div>
      </section>
    </main>
  );
}