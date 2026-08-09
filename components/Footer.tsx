import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 lg:grid-cols-4 gap-10">

        <div>
          <h2 className="text-3xl font-extrabold">
            Atlas <span className="text-orange-500">Express</span>
          </h2>

          <p className="mt-5 text-slate-400 leading-7">
            Moving the World,
            <br />
            One Delivery at a Time.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-5">
            Navigation
          </h3>

          <div className="space-y-3">

            <Link href="/" className="block hover:text-orange-500">
              Home
            </Link>

            <Link href="/book" className="block hover:text-orange-500">
              Book
            </Link>

            <Link href="/track" className="block hover:text-orange-500">
              Track
            </Link>

            <Link href="/admin" className="block hover:text-orange-500">
              Admin
            </Link>

          </div>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-5">
            Services
          </h3>

          <div className="space-y-3 text-slate-300">
            <p>Express Delivery</p>
            <p>Worldwide Shipping</p>
            <p>Business Logistics</p>
            <p>Real-Time Tracking</p>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-xl mb-5">
            Contact
          </h3>

          <div className="space-y-4">

            <div className="flex items-center gap-3">
              <Mail className="text-orange-500" size={18} />
              <span>support@atlasexpress.com</span>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-orange-500" size={18} />
              <span>+1 (555) 123-4567</span>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-orange-500" size={18} />
              <span>Worldwide Operations</span>
            </div>

          </div>
        </div>

      </div>

      <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
        © 2026 Atlas Express. All rights reserved.
      </div>
    </footer>
  );
}
