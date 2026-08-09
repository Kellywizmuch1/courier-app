import {
  ShieldCheck,
  Clock3,
  MapPinned,
  Headset,
} from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Clock3,
      title: "Fast Delivery",
      description:
        "Quick and reliable shipping to keep your packages moving.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Handling",
      description:
        "Every shipment is handled carefully from pickup to delivery.",
    },
    {
      icon: MapPinned,
      title: "Live Tracking",
      description:
        "Track your shipment in real time with accurate updates.",
    },
    {
      icon: Headset,
      title: "24/7 Support",
      description:
        "Our support team is always ready to help whenever you need us.",
    },
  ];

  return (
    <section className="bg-slate-50 py-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-slate-900">
            Why Choose Atlas Express?
          </h2>

          <p className="mt-5 text-xl text-slate-700 max-w-3xl mx-auto leading-8">
            We combine speed, technology and reliability to deliver a
            world-class shipping experience for every customer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-lg p-8 border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <Icon
                    size={30}
                    className="text-blue-900"
                  />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-4">
                  {feature.title}
                </h3>

                <p className="text-slate-800 text-lg leading-8">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}