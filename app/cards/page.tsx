"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Settings,
  ShieldCheck,
  Snowflake,
  WalletCards,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

type CardData = {
  id: string;
  card_name: string;
  card_type: string;
  last_four: string;
  expiry_month: number;
  expiry_year: number;
  status: string;
};

export default function CardsPage() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNumber, setShowNumber] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  async function loadCards() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/signin";
        return;
      }

      const { data, error: cardsError } = await supabase
        .from("cards")
        .select(
          "id, card_name, card_type, last_four, expiry_month, expiry_year, status"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (cardsError) {
        throw new Error(cardsError.message);
      }

      setCards(data || []);
    } catch (err) {
      console.error("CARDS ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load your cards.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleFreeze(card: CardData) {
    const newStatus =
      card.status === "frozen"
        ? "active"
        : "frozen";

    try {
      const { error: updateError } = await supabase
        .from("cards")
        .update({
          status: newStatus,
        })
        .eq("id", card.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setCards((current) =>
        current.map((item) =>
          item.id === card.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error("CARD STATUS ERROR:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to update card status.");
      }
    }
  }

  function formatExpiry(
    month: number,
    year: number
  ) {
    return `${String(month).padStart(2, "0")}/${String(
      year
    ).slice(-2)}`;
  }

  function cardStatusLabel(status: string) {
    switch (status) {
      case "active":
        return "Active";

      case "frozen":
        return "Frozen";

      case "blocked":
        return "Blocked";

      case "expired":
        return "Expired";

      default:
        return status;
    }
  }

  function cardStatusClass(status: string) {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400";

      case "frozen":
        return "bg-amber-500/10 text-amber-400";

      case "blocked":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-800 text-slate-400";
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

            <p className="mt-4 text-sm text-slate-400">
              Loading your cards...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      {/* HEADER */}
      <header className="border-b border-slate-800/80 bg-[#090e19]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <CreditCard
                size={19}
              />
            </div>

            <div>
              <p className="font-semibold">
                BlueBank
              </p>

              <p className="text-xs text-slate-500">
                Cards
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 hover:text-white"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </header>

      {/* PAGE */}
      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        {/* TITLE */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">
              Cards & Payments
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your Cards
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Manage your cards, review their status,
              and control card security from one place.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
          >
            <Plus size={17} />
            Add Card
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {cards.length === 0 && (
          <div className="mt-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <WalletCards
                size={28}
                className="text-blue-400"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No cards yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your available cards will appear here
              once they have been added to your account.
            </p>

            <button
              type="button"
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
            >
              Add your first card
            </button>
          </div>
        )}

        {/* CARDS */}
        {cards.length > 0 && (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            {/* CARD LIST */}
            <div className="space-y-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/10"
                >
                  {/* VISUAL CARD */}
                  <div className="p-5 sm:p-7">
                    <div className="relative min-h-[230px] overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 shadow-xl shadow-blue-950/30 sm:min-h-[270px] sm:p-8">
                      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />

                      <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

                      <div className="relative flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-100">
                            BlueBank
                          </p>

                          <p className="mt-1 text-xs text-blue-200/70">
                            {card.card_type}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium backdrop-blur">
                          {cardStatusLabel(
                            card.status
                          )}
                        </div>
                      </div>

                      <div className="relative mt-10">
                        <div className="h-10 w-14 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-400 shadow-md" />

                        <p className="mt-5 font-mono text-xl tracking-[0.18em] text-white sm:text-2xl">
                          {showNumber
                            ? `•••• •••• •••• ${card.last_four}`
                            : `•••• •••• •••• ••••`}
                        </p>
                      </div>

                      <div className="relative mt-7 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-blue-200/70">
                            Cardholder
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {card.card_name}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-blue-200/70">
                            Expires
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {formatExpiry(
                              card.expiry_month,
                              card.expiry_year
                            )}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-bold italic text-white/80">
                            VISA
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CARD CONTROLS */}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setShowNumber(
                            (current) => !current
                          )
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
                      >
                        {showNumber ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                        {showNumber
                          ? "Hide details"
                          : "Show details"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleFreeze(card)
                        }
                        disabled={
                          card.status ===
                          "blocked"
                        }
                        className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Snowflake size={16} />

                        {card.status ===
                        "frozen"
                          ? "Unfreeze card"
                          : "Freeze card"}
                      </button>
                    </div>
                  </div>

                  {/* CARD INFORMATION */}
                  <div className="border-t border-slate-800 bg-slate-950/40 p-5 sm:p-7">
                    <div className="grid gap-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-slate-500">
                          Card type
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {card.card_type}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Last four digits
                        </p>

                        <p className="mt-1 font-mono text-sm">
                          •••• {card.last_four}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Status
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${cardStatusClass(
                            card.status
                          )}`}
                        >
                          {cardStatusLabel(
                            card.status
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SIDE PANEL */}
            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
                  <ShieldCheck
                    size={21}
                    className="text-emerald-400"
                  />
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Card security
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Keep control of your cards and
                  quickly freeze a card whenever you
                  need to.
                </p>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-4">
                    <Lock
                      size={17}
                      className="text-blue-400"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Secure controls
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Manage card access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-4">
                    <Snowflake
                      size={17}
                      className="text-blue-400"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Freeze instantly
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Temporarily disable a card
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Card settings
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Manage your card preferences
                    </p>
                  </div>

                  <Settings
                    size={20}
                    className="text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  className="mt-5 flex w-full items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  Manage settings
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}