"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  MapPin,
  User,
  Phone,
  Calendar,
  Pencil,
  Save,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type Booking = {
  id: number;
  user_id: string | null;
  tracking_number: string | null;

  sender_name: string | null;
  receiver_name: string | null;

  pickup_address: string | null;
  delivery_address: string | null;

  phone_number: string | null;

  package_type: string | null;
  package_description: string | null;
  package_weight: number | null;
  package_quantity: number | null;
  package_value: number | null;
  special_handling: string | null;

  status: string | null;

  current_location: string | null;
  next_location: string | null;

  estimated_delivery: string | null;
  last_updated: string | null;
  created_at: string | null;
};

type EditingValues = {
  pickup_address: string;
  delivery_address: string;
  current_location: string;
  next_location: string;
  status: string;
  estimated_delivery: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingValues, setEditingValues] =
    useState<EditingValues>({
      pickup_address: "",
      delivery_address: "",
      current_location: "",
      next_location: "",
      status: "Pending",
      estimated_delivery: "",
    });

  const [savingId, setSavingId] =
    useState<number | null>(null);

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

    const email = session.user.email?.toLowerCase();

    if (email !== "michealkellywiz@gmail.com") {
      alert(
        "You do not have permission to access the admin dashboard."
      );

      router.replace("/dashboard");
      return;
    }

    await loadBookings();

    setLoading(false);
  }

  async function loadBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("id", {
        ascending: false,
      });

    if (error) {
      console.error(
        "ADMIN DASHBOARD BOOKINGS ERROR:",
        error
      );

      alert(
        "Could not load bookings:\n\n" +
          error.message
      );

      return;
    }

    console.log(
      "ADMIN DASHBOARD BOOKINGS:",
      data
    );

    setBookings((data as Booking[]) || []);
  }

  async function refreshBookings() {
    setRefreshing(true);

    await loadBookings();

    setRefreshing(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
  }

  function startEditing(booking: Booking) {
    setEditingId(booking.id);

    setEditingValues({
      pickup_address:
        booking.pickup_address || "",

      delivery_address:
        booking.delivery_address || "",

      current_location:
        booking.current_location || "",

      next_location:
        booking.next_location || "",

      status:
        booking.status || "Pending",

      estimated_delivery:
        booking.estimated_delivery || "",
    });
  }

  function cancelEditing() {
    setEditingId(null);

    setEditingValues({
      pickup_address: "",
      delivery_address: "",
      current_location: "",
      next_location: "",
      status: "Pending",
      estimated_delivery: "",
    });
  }

  function updateEditingValue(
    field: keyof EditingValues,
    value: string
  ) {
    setEditingValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function saveShipment(bookingId: number) {
    setSavingId(bookingId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Your session has expired. Please log in again.");
        router.replace("/login");
        return;
      }

      const email = session.user.email?.toLowerCase();

      if (email !== "michealkellywiz@gmail.com") {
        alert("You are not authorized to update shipments.");
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("bookings")
        .update({
          pickup_address:
            editingValues.pickup_address.trim() ||
            null,

          delivery_address:
            editingValues.delivery_address.trim() ||
            null,

          current_location:
            editingValues.current_location.trim() ||
            null,

          next_location:
            editingValues.next_location.trim() ||
            null,

          status:
            editingValues.status.trim() ||
            "Pending",

          estimated_delivery:
            editingValues.estimated_delivery.trim() ||
            null,

          last_updated: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single();

      if (error) {
        console.error(
          "SAVE SHIPMENT ERROR:",
          error
        );

        alert(
          "Could not save shipment.\n\n" +
            error.message
        );

        return;
      }

      if (!data) {
        alert(
          "The shipment was not updated."
        );

        return;
      }

      setBookings((previous) =>
        previous.map((booking) =>
          booking.id === bookingId
            ? (data as Booking)
            : booking
        )
      );

      setEditingId(null);

      alert(
        "Shipment updated successfully."
      );
    } catch (error) {
      console.error(
        "SHIPMENT SAVE ERROR:",
        error
      );

      alert(
        "Something went wrong while saving the shipment."
      );
    } finally {
      setSavingId(null);
    }
  }

  const totalShipments =
    bookings.length;

  const activeShipments =
    bookings.filter(
      (booking) =>
        booking.status !== "Delivered"
    ).length;

  const deliveredShipments =
    bookings.filter(
      (booking) =>
        booking.status === "Delivered"
    ).length;

  const attentionRequired =
    bookings.filter(
      (booking) =>
        booking.status === "Delayed" ||
        booking.status === "Delivery Issue"
    ).length;

  function getStatusClass(
    status: string | null
  ) {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";

      case "In Transit":
        return "bg-orange-100 text-orange-700";

      case "Picked Up":
        return "bg-blue-100 text-blue-700";

      case "Delayed":
        return "bg-purple-100 text-purple-700";

      case "Delivery Issue":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  }

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
    <main className="min-h-screen bg-slate-100">
      {/* HEADER */}

      <header className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Admin Dashboard
              </h1>

              <p className="text-blue-200 mt-2">
                Manage customer shipments and monitor deliveries.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={refreshBookings}
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-60 border border-white/10 px-5 py-3 rounded-xl font-black transition"
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

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-black transition"
              >
                <LogOut size={18} />

                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}

      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* STATISTICS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package
                size={24}
                className="text-blue-800"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Total Shipments
            </p>

            <p className="text-3xl font-black text-slate-900 mt-1">
              {totalShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Truck
                size={24}
                className="text-orange-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Active Shipments
            </p>

            <p className="text-3xl font-black text-slate-900 mt-1">
              {activeShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle
                size={24}
                className="text-green-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Delivered
            </p>

            <p className="text-3xl font-black text-slate-900 mt-1">
              {deliveredShipments}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle
                size={24}
                className="text-red-600"
              />
            </div>

            <p className="text-sm font-bold text-slate-500 mt-5">
              Attention Required
            </p>

            <p className="text-3xl font-black text-slate-900 mt-1">
              {attentionRequired}
            </p>
          </div>
        </div>

        {/* SHIPMENT LIST */}

        <div className="mt-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-orange-500 font-black uppercase tracking-widest text-sm">
                Customer Bookings
              </p>

              <h2 className="text-3xl font-black text-slate-900 mt-1">
                Recent Shipments
              </h2>
            </div>

            <a
              href="/admin/shipments"
              className="inline-flex items-center justify-center bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-black transition"
            >
              Open Shipment Management
            </a>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                <Package
                  size={30}
                  className="text-slate-400"
                />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mt-6">
                No bookings found
              </h2>

              <p className="text-slate-500 mt-2">
                Customer shipments will appear here after they book a delivery.
              </p>

              <button
                type="button"
                onClick={refreshBookings}
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black"
              >
                Check Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const isEditing =
                  editingId === booking.id;

                const isSaving =
                  savingId === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    {/* SHIPMENT HEADER */}

                    <div className="bg-slate-950 text-white p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                          <p className="text-orange-400 text-xs font-black uppercase tracking-widest">
                            Shipment #{booking.id}
                          </p>

                          <h3 className="text-2xl md:text-3xl font-black mt-1">
                            {booking.tracking_number ||
                              "No tracking number"}
                          </h3>

                          <p className="text-slate-400 mt-2">
                            Created{" "}
                            {booking.created_at
                              ? new Date(
                                  booking.created_at
                                ).toLocaleString()
                              : "Unknown"}
                          </p>
                        </div>

                        {!isEditing && (
                          <span
                            className={`inline-flex items-center justify-center px-5 py-3 rounded-full font-black ${getStatusClass(
                              booking.status
                            )}`}
                          >
                            {booking.status ||
                              "Pending"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      {/* CUSTOMER INFORMATION */}

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-slate-400">
                            <User size={17} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Sender
                            </p>
                          </div>

                          <p className="font-black text-slate-900 mt-2">
                            {booking.sender_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-slate-400">
                            <User size={17} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Receiver
                            </p>
                          </div>

                          <p className="font-black text-slate-900 mt-2">
                            {booking.receiver_name ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-blue-500">
                            <Phone size={17} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Phone
                            </p>
                          </div>

                          <p className="font-black text-slate-900 mt-2">
                            {booking.phone_number ||
                              "Not provided"}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-orange-500">
                            <MapPin size={17} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Current Location
                            </p>
                          </div>

                          {!isEditing ? (
                            <p className="font-black text-slate-900 mt-2">
                              {booking.current_location ||
                                "Awaiting pickup"}
                            </p>
                          ) : (
                            <input
                              type="text"
                              value={
                                editingValues.current_location
                              }
                              onChange={(event) =>
                                updateEditingValue(
                                  "current_location",
                                  event.target.value
                                )
                              }
                              className="w-full mt-2 px-3 py-2 rounded-lg border border-orange-200 bg-white text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                              placeholder="Current location"
                            />
                          )}
                        </div>
                      </div>

                      {/* EDIT BUTTON */}

                      {!isEditing && (
                        <div className="flex justify-end mt-6">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(booking)
                            }
                            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-black transition"
                          >
                            <Pencil size={17} />

                            Edit Shipment
                          </button>
                        </div>
                      )}

                      {/* EDIT PANEL */}

                      {isEditing && (
                        <div className="mt-6 border-2 border-orange-200 bg-orange-50 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-5">
                            <div>
                              <h4 className="text-xl font-black text-slate-900">
                                Edit Shipment
                              </h4>

                              <p className="text-sm text-slate-500 mt-1">
                                Changes will be saved to the shipment.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <X size={19} />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-2 gap-5">
                            {/* PICKUP ADDRESS */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Pickup Address
                              </label>

                              <textarea
                                value={
                                  editingValues.pickup_address
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "pickup_address",
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Enter pickup address"
                              />
                            </div>

                            {/* DELIVERY ADDRESS */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Delivery Address
                              </label>

                              <textarea
                                value={
                                  editingValues.delivery_address
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "delivery_address",
                                    event.target.value
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Enter delivery address"
                              />
                            </div>

                            {/* CURRENT LOCATION */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Current Location
                              </label>

                              <input
                                type="text"
                                value={
                                  editingValues.current_location
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "current_location",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Current shipment location"
                              />
                            </div>

                            {/* NEXT LOCATION */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Next Location
                              </label>

                              <input
                                type="text"
                                value={
                                  editingValues.next_location
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "next_location",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Next shipment location"
                              />
                            </div>

                            {/* STATUS */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Shipment Status
                              </label>

                              <select
                                value={
                                  editingValues.status
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "status",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                              >
                                <option value="Pending">
                                  Pending
                                </option>

                                <option value="Confirmed">
                                  Confirmed
                                </option>

                                <option value="Picked Up">
                                  Picked Up
                                </option>

                                <option value="In Transit">
                                  In Transit
                                </option>

                                <option value="Delayed">
                                  Delayed
                                </option>

                                <option value="Delivery Issue">
                                  Delivery Issue
                                </option>

                                <option value="Delivered">
                                  Delivered
                                </option>
                              </select>
                            </div>

                            {/* ESTIMATED DELIVERY */}

                            <div>
                              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                                Estimated Delivery
                              </label>

                              <input
                                type="text"
                                value={
                                  editingValues.estimated_delivery
                                }
                                onChange={(event) =>
                                  updateEditingValue(
                                    "estimated_delivery",
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-orange-400"
                                placeholder="Example: August 15, 2026"
                              />
                            </div>
                          </div>

                          {/* SAVE / CANCEL */}

                          <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button
                              type="button"
                              onClick={() =>
                                saveShipment(
                                  booking.id
                                )
                              }
                              disabled={isSaving}
                              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-6 py-4 rounded-xl font-black transition"
                            >
                              <Save size={18} />

                              {isSaving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="sm:w-40 inline-flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-60 text-slate-800 px-6 py-4 rounded-xl font-black transition"
                            >
                              <X size={18} />

                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ROUTE */}

                      <div className="grid md:grid-cols-2 gap-5 mt-6">
                        <div className="border border-slate-200 rounded-2xl p-5">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Pickup Address
                          </p>

                          {!isEditing ? (
                            <p className="font-bold text-slate-800 mt-2">
                              {booking.pickup_address ||
                                "Not provided"}
                            </p>
                          ) : (
                            <p className="font-bold text-orange-700 mt-2">
                              Editing above
                            </p>
                          )}
                        </div>

                        <div className="border border-slate-200 rounded-2xl p-5">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                            Delivery Address
                          </p>

                          {!isEditing ? (
                            <p className="font-bold text-slate-800 mt-2">
                              {booking.delivery_address ||
                                "Not provided"}
                            </p>
                          ) : (
                            <p className="font-bold text-orange-700 mt-2">
                              Editing above
                            </p>
                          )}
                        </div>
                      </div>

                      {/* PACKAGE INFORMATION */}

                      <div className="mt-6 border-2 border-slate-200 rounded-2xl overflow-hidden">
                        <div className="bg-blue-950 text-white px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Package size={22} />

                            <div>
                              <h4 className="font-black text-lg">
                                Package Information
                              </h4>

                              <p className="text-blue-200 text-sm">
                                Information submitted with this booking
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs font-black uppercase text-slate-400">
                                Package Type
                              </p>

                              <p className="font-black text-slate-900 mt-2">
                                {booking.package_type ||
                                  "Not provided"}
                              </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs font-black uppercase text-slate-400">
                                Quantity
                              </p>

                              <p className="font-black text-slate-900 mt-2">
                                {booking.package_quantity ??
                                  "Not provided"}
                              </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs font-black uppercase text-slate-400">
                                Weight
                              </p>

                              <p className="font-black text-slate-900 mt-2">
                                {booking.package_weight !==
                                  null &&
                                booking.package_weight !==
                                  undefined
                                  ? `${booking.package_weight} kg`
                                  : "Not provided"}
                              </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4">
                              <p className="text-xs font-black uppercase text-slate-400">
                                Declared Value
                              </p>

                              <p className="font-black text-slate-900 mt-2">
                                {booking.package_value !==
                                  null &&
                                booking.package_value !==
                                  undefined
                                  ? `$${booking.package_value}`
                                  : "Not provided"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5">
                            <p className="text-xs font-black uppercase text-slate-400">
                              Package Description
                            </p>

                            <p className="text-slate-700 font-semibold mt-2">
                              {booking.package_description ||
                                "No description provided."}
                            </p>
                          </div>

                          {booking.special_handling && (
                            <div className="mt-5 bg-orange-50 border border-orange-100 rounded-xl p-4">
                              <p className="text-xs font-black uppercase text-orange-500">
                                Special Handling
                              </p>

                              <p className="text-slate-700 font-semibold mt-2">
                                {booking.special_handling}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* DELIVERY INFORMATION */}

                      <div className="grid md:grid-cols-2 gap-5 mt-6">
                        <div className="bg-blue-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-blue-500">
                            <Calendar size={18} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Estimated Delivery
                            </p>
                          </div>

                          <p className="font-black text-slate-900 mt-2">
                            {booking.estimated_delivery ||
                              "Not available"}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-2xl p-5">
                          <div className="flex items-center gap-2 text-orange-500">
                            <MapPin size={18} />

                            <p className="text-xs font-black uppercase tracking-wider">
                              Next Location
                            </p>
                          </div>

                          <p className="font-black text-slate-900 mt-2">
                            {booking.next_location ||
                              "Not assigned"}
                          </p>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <a
                          href={`/admin/shipments/${booking.id}`}
                          className="flex-1 inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl font-black transition"
                        >
                          Manage Shipment
                        </a>

                        <a
                          href={`/track?tracking=${encodeURIComponent(
                            booking.tracking_number ||
                              ""
                          )}`}
                          className="flex-1 inline-flex items-center justify-center bg-blue-900 hover:bg-blue-800 text-white px-6 py-4 rounded-xl font-black transition"
                        >
                          View Tracking
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}