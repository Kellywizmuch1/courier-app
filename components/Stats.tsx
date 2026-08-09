import {
  PackageCheck,
  Globe2,
  Clock3,
  Users,
} from "lucide-react";

export default function Stats() {
  const stats = [
    {
      icon: PackageCheck,
      number: "50K+",
      label: "Packages Delivered",
    },
    {
      icon: Globe2,
      number: "120+",
      label: "Countries Served",
    },
    {
      icon: Clock3,
      number: "99.8%",
      label: "On-Time Delivery",
    },
    {
      icon: Users,
      number: "24/7",
      label: "Customer Support",
    },
  ];

  return (
    <section className="bg-blue-900 py-20">
      <div className="max-w-7xl mx-auto px-8">

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="text-center bg-blue-800 rounded-3xl p-8 hover:bg-blue-700 transition"
              >
                <Icon
                  size={42}
                  className="mx-auto text-orange-400 mb-5"
                />

                <h2 className="text-5xl font-extrabold text-white">
                  {stat.number}
                </h2>

                <p className="text-blue-100 mt-3 text-lg">
                  {stat.label}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}