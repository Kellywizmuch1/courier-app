import { Star } from "lucide-react";

export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah Johnson",
      company: "E-Commerce Store",
      review:
        "Atlas Express has completely changed how we handle deliveries. Fast, reliable, and always on time.",
    },
    {
      name: "Michael Brown",
      company: "Business Owner",
      review:
        "The live tracking gives both us and our customers peace of mind. Excellent service.",
    },
    {
      name: "Emily Davis",
      company: "Online Seller",
      review:
        "Professional support and quick shipping. I highly recommend Atlas Express.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">

        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900">
            What Our Customers Say
          </h2>

          <p className="text-slate-600 text-xl mt-5">
            Trusted by businesses and individuals around the world.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-3xl shadow-lg p-8 hover:shadow-2xl transition"
            >

              <div className="flex gap-1 mb-5 text-orange-500">
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
                <Star fill="currentColor" />
              </div>

              <p className="text-slate-600 leading-8 italic">
                "{review.review}"
              </p>

              <div className="mt-8">
                <h3 className="font-bold text-xl text-slate-900">
                  {review.name}
                </h3>

                <p className="text-slate-500">
                  {review.company}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}