"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Truck,
  Package,
  ArrowLeft,
  Check,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

type Notification = {
  id: number;
  user_id: string;
  booking_id: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "NOTIFICATIONS ERROR:",
        error
      );

      setNotifications([]);
      setLoading(false);

      return;
    }

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(
    notificationId: number
  ) {
    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .eq("id", notificationId);

    if (error) {
      console.error(
        "MARK READ ERROR:",
        error
      );

      return;
    }

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter(
        (notification) =>
          !notification.is_read
      )
      .map(
        (notification) =>
          notification.id
      );

    if (unreadIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
      })
      .in("id", unreadIds);

    if (error) {
      console.error(
        "MARK ALL READ ERROR:",
        error
      );

      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  async function refresh() {
    setRefreshing(true);

    await loadNotifications();

    setRefreshing(false);
  }

  function notificationIcon(
    type: string
  ) {
    switch (type) {
      case "delivered":
        return (
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle
              size={24}
              className="text-green-600"
            />
          </div>
        );

      case "issue":
        return (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle
              size={24}
              className="text-red-600"
            />
          </div>
        );

      case "transit":
        return (
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
            <Truck
              size={24}
              className="text-orange-600"
            />
          </div>
        );

      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Package
              size={24}
              className="text-blue-700"
            />
          </div>
        );
    }
  }

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">

          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Loading notifications...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}

      <header className="bg-blue-950 text-white">

        <div className="max-w-5xl mx-auto px-6 py-8">

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-bold transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mt-7">

            <div>

              <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
                Atlas Express
              </p>

              <h1 className="text-4xl md:text-5xl font-black mt-2">
                Notifications
              </h1>

              <p className="text-blue-200 mt-2">
                Stay updated on your shipments.
              </p>

            </div>

            <div className="flex gap-3">

              <button
                onClick={refresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl font-bold transition disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-5 py-3 rounded-xl font-bold transition"
                >
                  <Check size={18} />
                  Mark All Read
                </button>
              )}

            </div>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <section className="max-w-5xl mx-auto px-6 py-10">

        {/* SUMMARY */}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">

          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">

              <Bell
                size={28}
                className="text-orange-600"
              />

            </div>

            <div>

              <p className="text-sm font-bold text-slate-500">
                Notification Center
              </p>

              <h2 className="text-2xl font-black">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread notification${
                      unreadCount === 1
                        ? ""
                        : "s"
                    }`}
              </h2>

            </div>

          </div>

        </div>

        {/* NOTIFICATIONS */}

        {notifications.length === 0 ? (

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">

              <Bell
                size={30}
                className="text-slate-400"
              />

            </div>

            <h2 className="text-2xl font-black mt-6">
              No notifications yet
            </h2>

            <p className="text-slate-500 mt-2">
              Shipment updates will appear here.
            </p>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black"
            >
              View Dashboard
            </Link>

          </div>

        ) : (

          <div className="space-y-4">

            {notifications.map(
              (notification) => (

                <div
                  key={notification.id}
                  className={`bg-white rounded-3xl border shadow-sm p-6 transition ${
                    notification.is_read
                      ? "border-slate-200"
                      : "border-orange-300 bg-orange-50/30"
                  }`}
                >

                  <div className="flex gap-5">

                    {notificationIcon(
                      notification.type
                    )}

                    <div className="flex-1 min-w-0">

                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-3">

                            <h3 className="text-xl font-black">
                              {
                                notification.title
                              }
                            </h3>

                            {!notification.is_read && (
                              <span className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded-full">
                                NEW
                              </span>
                            )}

                          </div>

                          <p className="text-slate-600 mt-2 leading-relaxed">
                            {
                              notification.message
                            }
                          </p>

                          <p className="text-xs text-slate-400 mt-3">
                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString()
                              : "Unknown time"}
                          </p>

                        </div>

                        {!notification.is_read && (
                          <button
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 text-blue-900 hover:text-orange-500 font-black text-sm"
                          >
                            <Check size={16} />
                            Mark Read
                          </button>
                        )}

                      </div>

                      {notification.booking_id && (
                        <Link
                          href={`/shipment/${notification.booking_id}`}
                          className="inline-flex items-center mt-4 text-blue-900 hover:text-orange-500 font-black text-sm"
                        >
                          View Shipment →
                        </Link>
                      )}

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