"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Package,
  Truck,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";

import { supabase } from "../lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setUserEmail(session.user.email || "");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUserEmail("");
    setMenuOpen(false);

    router.push("/login");
  }

  function isActive(path: string) {
    return pathname === path;
  }

  return (
    <nav className="sticky top-0 z-50 bg-blue-950 text-white shadow-lg">

      <div className="max-w-7xl mx-auto px-6">

        <div className="h-20 flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3"
          >

            <div className="w-11 h-11 bg-orange-500 rounded-xl flex items-center justify-center">
              <Truck size={23} />
            </div>

            <div>

              <p className="font-black text-xl leading-none">
                Atlas Express
              </p>

              <p className="text-blue-300 text-xs mt-1">
                Fast. Safe. Reliable.
              </p>

            </div>

          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden lg:flex items-center gap-2">

            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-bold transition ${
                isActive("/")
                  ? "bg-white/15 text-orange-400"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                isActive("/dashboard")
                  ? "bg-white/15 text-orange-400"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <LayoutDashboard size={17} />
              Dashboard
            </Link>

            <Link
              href="/track"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                isActive("/track")
                  ? "bg-white/15 text-orange-400"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Package size={17} />
              Track
            </Link>

            <Link
              href="/book"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${
                isActive("/book")
                  ? "bg-white/15 text-orange-400"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Truck size={17} />
              Book Delivery
            </Link>

            {userEmail && (
              <div className="ml-3 pl-4 border-l border-white/20 flex items-center gap-3">

                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={18} />
                </div>

                <div className="max-w-[180px]">

                  <p className="text-xs text-blue-300">
                    Signed in as
                  </p>

                  <p className="text-sm font-bold truncate">
                    {userEmail}
                  </p>

                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>

              </div>
            )}

          </div>

          {/* MOBILE BUTTON */}

          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="lg:hidden w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>

        {/* MOBILE MENU */}

        {menuOpen && (

          <div className="lg:hidden pb-6 border-t border-white/10 pt-4">

            <div className="space-y-2">

              <Link
                href="/"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="block px-4 py-3 rounded-xl font-bold hover:bg-white/10"
              >
                🏠 Home
              </Link>

              <Link
                href="/dashboard"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="block px-4 py-3 rounded-xl font-bold hover:bg-white/10"
              >
                📊 Dashboard
              </Link>

              <Link
                href="/track"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="block px-4 py-3 rounded-xl font-bold hover:bg-white/10"
              >
                📦 Track Shipment
              </Link>

              <Link
                href="/book"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="block px-4 py-3 rounded-xl font-bold hover:bg-white/10"
              >
                🚚 Book Delivery
              </Link>

              {userEmail && (

                <div className="border-t border-white/10 mt-4 pt-4">

                  <div className="px-4 py-3">

                    <p className="text-xs text-blue-300">
                      Signed in as
                    </p>

                    <p className="font-bold mt-1 break-all">
                      {userEmail}
                    </p>

                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl font-bold"
                  >
                    <LogOut size={17} />
                    Logout
                  </button>

                </div>

              )}

            </div>

          </div>

        )}

      </div>

    </nav>
  );
}