"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function BookPage() {
  const router = useRouter();

  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [packageType, setPackageType] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageWeight, setPackageWeight] = useState("");
  const [packageQuantity, setPackageQuantity] = useState("1");
  const [packageValue, setPackageValue] = useState("");
  const [specialHandling, setSpecialHandling] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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

    setUserEmail(session.user.email || "");
    setCheckingAuth(false);
  }

  async function handleBooking(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!senderName.trim()) {
      alert("Please enter the sender name.");
      return;
    }

    if (!receiverName.trim()) {
      alert("Please enter the receiver name.");
      return;
    }

    if (!pickup.trim()) {
      alert("Please enter the pickup address.");
      return;
    }

    if (!destination.trim()) {
      alert("Please enter the delivery address.");
      return;
    }

    if (!phoneNumber.trim()) {
      alert("Please enter the phone number.");
      return;
    }

    if (!packageType) {
      alert("Please select a package type.");
      return;
    }

    if (!packageDescription.trim()) {
      alert("Please describe the package.");
      return;
    }

    if (!packageWeight.trim()) {
      alert("Please enter the package weight.");
      return;
    }

    if (Number(packageWeight) <= 0) {
      alert("Package weight must be greater than 0.");
      return;
    }

    if (Number(packageQuantity) < 1) {
      alert("Number of packages must be at least 1.");
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setLoading(false);
      alert(
        "Your session has expired. Please log in again."
      );
      router.push("/login");
      return;
    }

    const userId = session.user.id;

    const trackingNumber =
      "TRK" +
      Math.floor(100000 + Math.random() * 900000);

    const estimatedDelivery = new Date();

    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + 7
    );

    const estimatedDeliveryDate =
      estimatedDelivery.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          user_id: userId,

          sender_name: senderName.trim(),
          receiver_name: receiverName.trim(),

          pickup_address: pickup.trim(),
          delivery_address: destination.trim(),

          phone_number: phoneNumber.trim(),

          package_type: packageType,
          package_description: packageDescription.trim(),
          package_weight: Number(packageWeight),
          package_quantity: Number(packageQuantity),
          package_value: packageValue
            ? Number(packageValue)
            : null,
          special_handling:
            specialHandling.trim() || null,

          tracking_number: trackingNumber,

          status: "Pending",

          current_location: "Origin Warehouse",

          estimated_delivery:
            estimatedDeliveryDate,

          last_updated: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("BOOKING ERROR:", error);

      alert(
        "Booking failed:\n\n" + error.message
      );

      return;
    }

    console.log("BOOKING CREATED:", data);

    sessionStorage.setItem(
      "latestBooking",
      JSON.stringify(data)
    );

    setSenderName("");
    setReceiverName("");
    setPickup("");
    setDestination("");
    setPhoneNumber("");

    setPackageType("");
    setPackageDescription("");
    setPackageWeight("");
    setPackageQuantity("1");
    setPackageValue("");
    setSpecialHandling("");

    router.push("/booking-success");
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="mt-5 font-bold text-slate-700">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <p className="text-orange-400 font-black uppercase tracking-widest text-sm">
            Atlas Express
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-3">
            Book a Delivery
          </h1>

          <p className="text-blue-200 mt-4 text-lg">
            Create a shipment and we'll give you a
            tracking number immediately.
          </p>

          {userEmail && (
            <div className="mt-6 inline-flex items-center bg-white/10 border border-white/10 rounded-xl px-4 py-3">
              <span className="text-sm text-blue-200">
                Signed in as&nbsp;
              </span>

              <span className="font-bold">
                {userEmail}
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <form
          onSubmit={handleBooking}
          className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10"
        >
          <div className="mb-10">
            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Shipment Information
            </p>

            <h2 className="text-3xl font-black mt-2 text-slate-900">
              Tell us about your delivery
            </h2>

            <p className="text-slate-500 mt-2">
              Enter the sender, receiver, route, and
              package information below.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Sender Name
              </label>

              <input
                type="text"
                placeholder="Enter sender name"
                value={senderName}
                onChange={(e) =>
                  setSenderName(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Receiver Name
              </label>

              <input
                type="text"
                placeholder="Enter receiver name"
                value={receiverName}
                onChange={(e) =>
                  setReceiverName(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Contact Phone Number
              </label>

              <input
                type="tel"
                placeholder="Enter contact phone number"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="mt-10">
            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Route Information
            </p>

            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Where is the package going?
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Pickup Address
              </label>

              <input
                type="text"
                placeholder="Where should we collect the package?"
                value={pickup}
                onChange={(e) =>
                  setPickup(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Delivery Address
              </label>

              <input
                type="text"
                placeholder="Where should we deliver it?"
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="mt-10 pt-10 border-t border-slate-200">
            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Package Information
            </p>

            <h3 className="text-2xl font-black text-slate-900 mt-2">
              Tell us what you are shipping
            </h3>

            <p className="text-slate-500 mt-2">
              Provide accurate package information so
              Atlas Express can process the shipment
              correctly.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Package Type
                </label>

                <select
                  value={packageType}
                  onChange={(e) =>
                    setPackageType(e.target.value)
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 bg-white focus:outline-none focus:border-orange-500 transition"
                >
                  <option value="">
                    Select package type
                  </option>
                  <option value="Document">
                    Document
                  </option>
                  <option value="Box">
                    Box
                  </option>
                  <option value="Parcel">
                    Parcel
                  </option>
                  <option value="Envelope">
                    Envelope
                  </option>
                  <option value="Electronics">
                    Electronics
                  </option>
                  <option value="Clothing">
                    Clothing
                  </option>
                  <option value="Fragile Item">
                    Fragile Item
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Number of Packages
                </label>

                <input
                  type="number"
                  min="1"
                  value={packageQuantity}
                  onChange={(e) =>
                    setPackageQuantity(e.target.value)
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Package Weight (kg)
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Example: 2.5"
                  value={packageWeight}
                  onChange={(e) =>
                    setPackageWeight(e.target.value)
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Declared Package Value
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Example: 250"
                  value={packageValue}
                  onChange={(e) =>
                    setPackageValue(e.target.value)
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500 transition"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Package Description
              </label>

              <textarea
                rows={4}
                placeholder="Describe what is inside the package..."
                value={packageDescription}
                onChange={(e) =>
                  setPackageDescription(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500 transition"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Special Handling Instructions
              </label>

              <textarea
                rows={3}
                placeholder="Example: Keep upright, handle with care, etc."
                value={specialHandling}
                onChange={(e) =>
                  setSpecialHandling(e.target.value)
                }
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="font-black text-blue-900">
              🔒 Your shipment belongs to your account
            </p>

            <p className="text-sm text-blue-700 mt-1">
              This booking will be linked to your
              logged-in Atlas Express account.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl py-4 font-black text-lg transition"
          >
            {loading
              ? "Creating Shipment..."
              : "Book Delivery"}
          </button>
        </form>
      </section>
    </main>
  );
}
