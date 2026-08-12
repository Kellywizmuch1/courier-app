"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type BookingData = {
  user_id: string;
  sender_name: string;
  receiver_name: string;
  pickup_address: string;
  delivery_address: string;
  phone_number: string;
  package_type: string;
  package_description: string;
  package_weight: number;
  package_quantity: number;
  package_value: number | null;
  special_handling: string | null;
  tracking_number: string;
  status: string;
  current_location: string;
  estimated_delivery: string;
  last_updated: string;
};

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
    void checkUser();
  }, []);

  async function checkUser(): Promise<void> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      router.push("/login");
      return;
    }

    setUserEmail(session.user.email ?? "");
    setCheckingAuth(false);
  }

  async function handleBooking(
    event: React.FormEvent
  ): Promise<void> {
    event.preventDefault();

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

    // Package description is OPTIONAL.
    // No validation is required here.

    if (!packageWeight.trim()) {
      alert("Please enter the package weight.");
      return;
    }

    const weight = Number(packageWeight);
    const quantity = Number(packageQuantity);

    // Package value is OPTIONAL.
    const value =
      packageValue.trim() === ""
        ? null
        : Number(packageValue);

    if (!Number.isFinite(weight) || weight <= 0) {
      alert("Package weight must be greater than 0.");
      return;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      alert("Number of packages must be at least 1.");
      return;
    }

    if (
      value !== null &&
      (!Number.isFinite(value) || value < 0)
    ) {
      alert("Please enter a valid package value.");
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

    const trackingNumber =
      "TRK" +
      Math.floor(
        100000 + Math.random() * 900000
      );

    const estimatedDelivery = new Date();

    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + 7
    );

    const estimatedDeliveryDate =
      estimatedDelivery
        .toISOString()
        .split("T")[0];

    const booking: BookingData = {
      user_id: session.user.id,

      sender_name: senderName.trim(),
      receiver_name: receiverName.trim(),

      pickup_address: pickup.trim(),
      delivery_address: destination.trim(),

      phone_number: phoneNumber.trim(),

      package_type: packageType,

      // Empty description is allowed.
      package_description:
        packageDescription.trim(),

      package_weight: weight,
      package_quantity: quantity,

      // Empty package value becomes null.
      package_value: value,

      special_handling:
        specialHandling.trim() || null,

      tracking_number: trackingNumber,

      status: "Pending",

      current_location: "Origin Warehouse",

      estimated_delivery:
        estimatedDeliveryDate,

      last_updated:
        new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(
        "BOOKING ERROR:",
        error
      );

      alert(
        "Booking failed:\n\n" +
          error.message
      );

      return;
    }

    console.log(
      "BOOKING CREATED:",
      data
    );

    sessionStorage.setItem(
      "latestBooking",
      JSON.stringify(data)
    );

    router.push("/booking-success");
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
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
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
            Atlas Express
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-3">
            Book a Delivery
          </h1>

          <p className="text-blue-200 mt-4 text-lg">
            Create a shipment and receive your
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

            <h2 className="text-3xl font-black mt-2">
              Tell us about your delivery
            </h2>

            <p className="text-slate-500 mt-2">
              Enter the sender, receiver, route,
              and package information.
            </p>
          </div>

          <div>
            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Contact Information
            </p>

            <h3 className="text-2xl font-black mt-2">
              Sender and Receiver
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Sender Name
              </label>

              <input
                type="text"
                value={senderName}
                onChange={(event) =>
                  setSenderName(
                    event.target.value
                  )
                }
                placeholder="Enter sender name"
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                Receiver Name
              </label>

              <input
                type="text"
                value={receiverName}
                onChange={(event) =>
                  setReceiverName(
                    event.target.value
                  )
                }
                placeholder="Enter receiver name"
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Contact Phone Number
              </label>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(
                    event.target.value
                  )
                }
                placeholder="Enter contact phone number"
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-200">
            <p className="text-orange-500 font-black uppercase tracking-wider text-sm">
              Route Information
            </p>

            <h3 className="text-2xl font-black mt-2">
              Where is the package going?
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Pickup Address
                </label>

                <textarea
                  rows={3}
                  value={pickup}
                  onChange={(event) =>
                    setPickup(
                      event.target.value
                    )
                  }
                  placeholder="Where should we collect the package?"
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Delivery Address
                </label>

                <textarea
                  rows={3}
                  value={destination}
                  onChange={(event) =>
                    setDestination(
                      event.target.value
                    )
                  }
                  placeholder="Where should we deliver it?"
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-10 border-t border-slate-200">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <p className="text-orange-600 font-black uppercase tracking-wider text-sm">
                Package Information
              </p>

              <h3 className="text-2xl font-black mt-2">
                Tell us what you are shipping
              </h3>

              <p className="text-slate-600 mt-2">
                Provide accurate information about
                the package.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Package Type
                </label>

                <select
                  value={packageType}
                  onChange={(event) =>
                    setPackageType(
                      event.target.value
                    )
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 bg-white text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="">
                    Select package type
                  </option>

                  <option value="Document">
                    Document
                  </option>

                  <option value="Envelope">
                    Envelope
                  </option>

                  <option value="Box">
                    Box
                  </option>

                  <option value="Parcel">
                    Parcel
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
                  onChange={(event) =>
                    setPackageQuantity(
                      event.target.value
                    )
                  }
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
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
                  value={packageWeight}
                  onChange={(event) =>
                    setPackageWeight(
                      event.target.value
                    )
                  }
                  placeholder="Example: 2.5"
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2">
                  Declared Package Value{" "}
                  <span className="text-slate-400 font-medium">
                    (Optional)
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={packageValue}
                  onChange={(event) =>
                    setPackageValue(
                      event.target.value
                    )
                  }
                  placeholder="Example: 250"
                  className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Package Description{" "}
                <span className="text-slate-400 font-medium">
                  (Optional)
                </span>
              </label>

              <textarea
                rows={4}
                value={packageDescription}
                onChange={(event) =>
                  setPackageDescription(
                    event.target.value
                  )
                }
                placeholder="Describe what is inside the package (optional)"
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-black text-slate-700 mb-2">
                Special Handling Instructions
              </label>

              <textarea
                rows={3}
                value={specialHandling}
                onChange={(event) =>
                  setSpecialHandling(
                    event.target.value
                  )
                }
                placeholder="Example: Handle with care..."
                className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 resize-none focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="font-black text-blue-900">
              🔒 Your shipment belongs to your
              account
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