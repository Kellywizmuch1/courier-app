"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [updates, setUpdates] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [addingUpdateId, setAddingUpdateId] =
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
      console.error("BOOKINGS ERROR:", error);

      alert(
        "Could not load bookings: " +
          error.message
      );

      return;
    }

    setBookings(data || []);

    if (data && data.length > 0) {
      await loadAllUpdates(data);
    } else {
      setUpdates({});
    }
  }

  async function loadAllUpdates(
    bookingsList: any[]
  ) {
    const bookingIds = bookingsList.map(
      (booking) => booking.id
    );

    const { data, error } = await supabase
      .from("shipment_updates")
      .select("*")
      .in("booking_id", bookingIds)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "SHIPMENT HISTORY ERROR:",
        error
      );

      return;
    }

    const grouped: Record<number, any[]> = {};

    bookingsList.forEach((booking) => {
      grouped[booking.id] = [];
    });

    (data || []).forEach((update) => {
      if (!grouped[update.booking_id]) {
        grouped[update.booking_id] = [];
      }

      grouped[update.booking_id].push(update);
    });

    setUpdates(grouped);
  }

  async function createNotification(
    booking: any,
    title: string,
    message: string,
    type: string
  ) {
    if (!booking.user_id) {
      console.error(
        "Cannot create notification: booking has no user_id."
      );

      return;
    }

    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: booking.user_id,
        booking_id: booking.id,
        title,
        message,
        type,
        is_read: false,
      });

    if (error) {
      console.error(
        "NOTIFICATION ERROR:",
        error
      );
    }
  }

  async function updateBooking(
    booking: any,
    container: HTMLElement
  ) {
    setSavingId(booking.id);

    const getValue = (name: string) => {
      const element = container.querySelector(
        `[name="${name}"]`
      ) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;

      return element?.value || "";
    };

    const status = getValue("status");
    const currentLocation = getValue(
      "current_location"
    );
    const nextLocation = getValue(
      "next_location"
    );

    const estimatedDelivery = getValue(
      "estimated_delivery"
    );

    const pickupLatitudeValue =
      getValue("pickup_latitude");

    const pickupLongitudeValue =
      getValue("pickup_longitude");

    const currentLatitudeValue =
      getValue("current_latitude");

    const currentLongitudeValue =
      getValue("current_longitude");

    const deliveryLatitudeValue =
      getValue("delivery_latitude");

    const deliveryLongitudeValue =
      getValue("delivery_longitude");

    const deliveryIssue =
      getValue("delivery_issue");

    const deliveryUpdate =
      getValue("delivery_update");

    const pickupLatitude =
      pickupLatitudeValue === ""
        ? null
        : Number(pickupLatitudeValue);

    const pickupLongitude =
      pickupLongitudeValue === ""
        ? null
        : Number(pickupLongitudeValue);

    const currentLatitude =
      currentLatitudeValue === ""
        ? null
        : Number(currentLatitudeValue);

    const currentLongitude =
      currentLongitudeValue === ""
        ? null
        : Number(currentLongitudeValue);

    const deliveryLatitude =
      deliveryLatitudeValue === ""
        ? null
        : Number(deliveryLatitudeValue);

    const deliveryLongitude =
      deliveryLongitudeValue === ""
        ? null
        : Number(deliveryLongitudeValue);

    const { error } = await supabase
      .from("bookings")
      .update({
        status,
        current_location: currentLocation,
        next_location: nextLocation,
        estimated_delivery:
          estimatedDelivery,

        pickup_latitude:
          pickupLatitude,

        pickup_longitude:
          pickupLongitude,

        current_latitude:
          currentLatitude,

        current_longitude:
          currentLongitude,

        delivery_latitude:
          deliveryLatitude,

        delivery_longitude:
          deliveryLongitude,

        delivery_issue:
          deliveryIssue || null,

        delivery_update:
          deliveryUpdate || null,

        last_updated:
          new Date().toISOString(),
      })
      .eq("id", booking.id);

    setSavingId(null);

    if (error) {
      alert(
        "Update failed: " +
          error.message
      );

      return;
    }

    /*
      Create a customer notification
      whenever the shipment is updated.
    */

    let notificationType = "shipment";

    if (status === "Delivered") {
      notificationType = "delivered";
    } else if (
      status === "In Transit" ||
      status === "Picked Up"
    ) {
      notificationType = "transit";
    } else if (
      status === "Delayed" ||
      status === "Delivery Issue"
    ) {
      notificationType = "issue";
    }

    let notificationTitle =
      "Shipment Updated";

    let notificationMessage =
      `Your shipment ${booking.tracking_number} has been updated.`;

    if (status === "Delivered") {
      notificationTitle =
        "Shipment Delivered";

      notificationMessage =
        `Your shipment ${booking.tracking_number} has been delivered successfully.`;
    } else if (status === "In Transit") {
      notificationTitle =
        "Shipment In Transit";

      notificationMessage =
        `Your shipment ${booking.tracking_number} is now in transit. Current location: ${
          currentLocation ||
          "Unknown"
        }.`;
    } else if (status === "Picked Up") {
      notificationTitle =
        "Shipment Picked Up";

      notificationMessage =
        `Your shipment ${booking.tracking_number} has been picked up and is being processed.`;
    } else if (status === "Delayed") {
      notificationTitle =
        "Shipment Delayed";

      notificationMessage =
        `Your shipment ${booking.tracking_number} has been delayed. ${
          deliveryUpdate ||
          "Please check your tracking page for updates."
        }`;
    } else if (
      status === "Delivery Issue"
    ) {
      notificationTitle =
        "Delivery Issue";

      notificationMessage =
        `There is an issue with shipment ${booking.tracking_number}. ${
          deliveryUpdate ||
          deliveryIssue ||
          "Please check your tracking page for more information."
        }`;
    } else if (currentLocation) {
      notificationTitle =
        "Shipment Location Updated";

      notificationMessage =
        `Your shipment ${booking.tracking_number} is currently at ${currentLocation}.`;
    }

    await createNotification(
      booking,
      notificationTitle,
      notificationMessage,
      notificationType
    );

    alert(
      "Shipment updated successfully!\n\nThe customer has been notified."
    );

    await loadBookings();
  }

  async function addShipmentUpdate(
    booking: any,
    container: HTMLElement
  ) {
    setAddingUpdateId(booking.id);

    const getValue = (name: string) => {
      const element = container.querySelector(
        `[name="${name}"]`
      ) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;

      return element?.value.trim() || "";
    };

    const status =
      getValue("history_status");

    const location =
      getValue("history_location");

    const message =
      getValue("history_message");

    if (!status) {
      alert(
        "Please select a status."
      );

      setAddingUpdateId(null);

      return;
    }

    if (!message) {
      alert(
        "Please enter an update message."
      );

      setAddingUpdateId(null);

      return;
    }

    const { error } = await supabase
      .from("shipment_updates")
      .insert({
        booking_id: booking.id,
        status,
        location:
          location || null,
        message,
      });

    if (error) {
      alert(
        "Could not add shipment update: " +
          error.message
      );

      setAddingUpdateId(null);

      return;
    }

    /*
      Also notify the customer about
      the new tracking event.
    */

    let notificationType =
      "shipment";

    if (
      status === "Delivered"
    ) {
      notificationType =
        "delivered";
    } else if (
      status === "In Transit" ||
      status === "Picked Up" ||
      status ===
        "Out for Delivery"
    ) {
      notificationType =
        "transit";
    } else if (
      status === "Delayed" ||
      status === "Delivery Issue"
    ) {
      notificationType =
        "issue";
    }

    const notificationTitle =
      "Tracking Update";

    const notificationMessage =
      location
        ? `${message} Location: ${location}.`
        : message;

    await createNotification(
      booking,
      notificationTitle,
      `Shipment ${booking.tracking_number}: ${notificationMessage}`,
      notificationType
    );

    await loadBookings();

    setAddingUpdateId(null);

    alert(
      "Tracking update added successfully!\n\nThe customer has been notified."
    );
  }

  async function deleteShipmentUpdate(
    updateId: number
  ) {
    const confirmed =
      window.confirm(
        "Delete this shipment update?"
      );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("shipment_updates")
      .delete()
      .eq("id", updateId);

    if (error) {
      alert(
        "Could not delete update: " +
          error.message
      );

      return;
    }

    await loadBookings();
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-4 font-bold text-slate-700">
            Checking administrator access...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      <header className="bg-blue-950 text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-orange-400 font-bold uppercase tracking-wider text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl font-black mt-1">
                Admin Dashboard
              </h1>

              <p className="text-blue-200 mt-2">
                Administrator access confirmed.
              </p>

            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">

        {bookings.length === 0 ? (

          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">

            <h2 className="text-2xl font-black">
              No bookings found
            </h2>

            <p className="text-slate-500 mt-2">
              Customer shipments will appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-8">

            {bookings.map(
              (booking) => (

                <div
                  key={booking.id}
                  data-booking-card
                  className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden"
                >

                  <div className="bg-slate-950 text-white p-6 md:p-8">

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      <div>

                        <p className="text-orange-400 text-sm font-bold uppercase tracking-wider">
                          Tracking Number
                        </p>

                        <h2 className="text-3xl font-black mt-1">
                          {booking.tracking_number}
                        </h2>

                        <p className="text-slate-400 mt-2">
                          {booking.sender_name} →{" "}
                          {booking.receiver_name}
                        </p>

                      </div>

                      <div className="bg-white/10 rounded-2xl px-5 py-4">

                        <p className="text-xs text-slate-400 uppercase font-bold">
                          Current Status
                        </p>

                        <p className="text-lg font-black text-orange-400 mt-1">
                          {booking.status ||
                            "Pending"}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="p-6 md:p-8 space-y-10">

                    <div>

                      <h3 className="text-xl font-black text-blue-900 mb-5">
                        Shipment Status
                      </h3>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

                        <div>

                          <label className="block text-sm font-bold text-slate-600 mb-2">
                            Status
                          </label>

                          <select
                            name="status"
                            defaultValue={
                              booking.status ||
                              "Pending"
                            }
                            className="w-full border-2 border-slate-200 rounded-xl p-3 bg-white font-semibold"
                          >
                            <option>
                              Pending
                            </option>

                            <option>
                              Picked Up
                            </option>

                            <option>
                              In Transit
                            </option>

                            <option>
                              Delayed
                            </option>

                            <option>
                              Delivery Issue
                            </option>

                            <option>
                              Delivered
                            </option>
                          </select>

                        </div>

                        <div>

                          <label className="block text-sm font-bold text-slate-600 mb-2">
                            Current Location
                          </label>

                          <input
                            name="current_location"
                            defaultValue={
                              booking.current_location ||
                              ""
                            }
                            className="w-full border-2 border-slate-200 rounded-xl p-3 font-semibold"
                          />

                        </div>

                        <div>

                          <label className="block text-sm font-bold text-slate-600 mb-2">
                            Next Location
                          </label>

                          <input
                            name="next_location"
                            defaultValue={
                              booking.next_location ||
                              ""
                            }
                            className="w-full border-2 border-slate-200 rounded-xl p-3 font-semibold"
                          />

                        </div>

                        <div>

                          <label className="block text-sm font-bold text-slate-600 mb-2">
                            Estimated Delivery
                          </label>

                          <input
                            name="estimated_delivery"
                            type="date"
                            defaultValue={
                              booking.estimated_delivery ||
                              ""
                            }
                            className="w-full border-2 border-slate-200 rounded-xl p-3 font-semibold"
                          />

                        </div>

                      </div>

                    </div>

                    <div className="border-t border-slate-200 pt-8">

                      <h3 className="text-xl font-black text-blue-900 mb-5">
                        Shipment Coordinates
                      </h3>

                      <div className="grid md:grid-cols-3 gap-5">

                        {[
                          [
                            "pickup_latitude",
                            "Pickup Latitude",
                            booking.pickup_latitude,
                          ],
                          [
                            "pickup_longitude",
                            "Pickup Longitude",
                            booking.pickup_longitude,
                          ],
                          [
                            "current_latitude",
                            "Current Latitude",
                            booking.current_latitude,
                          ],
                          [
                            "current_longitude",
                            "Current Longitude",
                            booking.current_longitude,
                          ],
                          [
                            "delivery_latitude",
                            "Delivery Latitude",
                            booking.delivery_latitude,
                          ],
                          [
                            "delivery_longitude",
                            "Delivery Longitude",
                            booking.delivery_longitude,
                          ],
                        ].map(
                          ([
                            name,
                            label,
                            value,
                          ]) => (

                            <div
                              key={
                                name as string
                              }
                            >

                              <label className="block text-sm font-bold text-slate-600 mb-2">
                                {label as string}
                              </label>

                              <input
                                name={
                                  name as string
                                }
                                type="number"
                                step="any"
                                defaultValue={
                                  value ?? ""
                                }
                                className="w-full border-2 border-slate-200 rounded-xl p-3"
                              />

                            </div>

                          )
                        )}

                      </div>

                    </div>

                    <div className="border-t border-slate-200 pt-8">

                      <h3 className="text-xl font-black text-blue-900 mb-5">
                        Delivery Issue / Update
                      </h3>

                      <div className="grid md:grid-cols-2 gap-5">

                        <input
                          name="delivery_issue"
                          defaultValue={
                            booking.delivery_issue ||
                            ""
                          }
                          placeholder="Issue title"
                          className="border-2 border-slate-200 rounded-xl p-4"
                        />

                        <textarea
                          name="delivery_update"
                          defaultValue={
                            booking.delivery_update ||
                            ""
                          }
                          placeholder="Customer update"
                          rows={4}
                          className="border-2 border-slate-200 rounded-xl p-4 resize-none"
                        />

                      </div>

                    </div>

                    <div className="border-t border-slate-200 pt-8">

                      <button
                        type="button"
                        disabled={
                          savingId ===
                          booking.id
                        }
                        onClick={(e) => {

                          const card =
                            e.currentTarget.closest(
                              "[data-booking-card]"
                            );

                          if (!card) {
                            return;
                          }

                          updateBooking(
                            booking,
                            card as HTMLElement
                          );

                        }}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-black"
                      >

                        {savingId ===
                        booking.id
                          ? "Saving..."
                          : "Save Shipment Update"}

                      </button>

                    </div>

                    <div className="border-t border-slate-200 pt-8">

                      <h3 className="text-2xl font-black text-blue-900">
                        Shipment History
                      </h3>

                      <p className="text-slate-500 mt-2 mb-6">
                        Add tracking events as the shipment moves.
                      </p>

                      <div
                        data-history-container
                        className="bg-slate-50 border border-slate-200 rounded-3xl p-6"
                      >

                        <div className="grid md:grid-cols-3 gap-5">

                          <select
                            name="history_status"
                            defaultValue=""
                            className="border-2 border-slate-200 rounded-xl p-3 bg-white"
                          >

                            <option value="">
                              Select status
                            </option>

                            <option>
                              Booking Confirmed
                            </option>

                            <option>
                              Picked Up
                            </option>

                            <option>
                              In Transit
                            </option>

                            <option>
                              Arrived at Facility
                            </option>

                            <option>
                              Out for Delivery
                            </option>

                            <option>
                              Delayed
                            </option>

                            <option>
                              Delivery Issue
                            </option>

                            <option>
                              Delivered
                            </option>

                          </select>

                          <input
                            name="history_location"
                            placeholder="Location"
                            className="border-2 border-slate-200 rounded-xl p-3 bg-white"
                          />

                          <input
                            name="history_message"
                            placeholder="What happened?"
                            className="border-2 border-slate-200 rounded-xl p-3 bg-white"
                          />

                        </div>

                        <button
                          type="button"
                          disabled={
                            addingUpdateId ===
                            booking.id
                          }
                          onClick={(e) => {

                            const container =
                              e.currentTarget
                                .parentElement;

                            if (!container) {
                              return;
                            }

                            addShipmentUpdate(
                              booking,
                              container
                            );

                          }}
                          className="mt-5 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white px-7 py-3 rounded-xl font-black"
                        >

                          {addingUpdateId ===
                          booking.id
                            ? "Adding..."
                            : "+ Add Tracking Update"}

                        </button>

                      </div>

                      <div className="mt-6 space-y-4">

                        {(
                          updates[
                            booking.id
                          ] || []
                        ).map(
                          (update) => (

                            <div
                              key={update.id}
                              className="border border-slate-200 rounded-2xl p-5"
                            >

                              <div className="flex justify-between gap-4">

                                <div>

                                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-black">
                                    {update.status}
                                  </span>

                                  {update.location && (
                                    <p className="text-sm text-slate-500 mt-3">
                                      📍{" "}
                                      {
                                        update.location
                                      }
                                    </p>
                                  )}

                                  <p className="font-semibold mt-3">
                                    {
                                      update.message
                                    }
                                  </p>

                                  <p className="text-xs text-slate-400 mt-2">
                                    {update.created_at
                                      ? new Date(
                                          update.created_at
                                        ).toLocaleString()
                                      : "Unknown time"}
                                  </p>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteShipmentUpdate(
                                      update.id
                                    )
                                  }
                                  className="text-red-500 font-bold text-sm"
                                >
                                  Delete
                                </button>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  );
}