import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About QuickStore
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We believe shopping should be a premium experience — curated, seamless, and delightful.
          </p>
        </div>

        <div className="space-y-12">
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              QuickStore was founded with a simple vision: to create an e-commerce platform that
              prioritizes quality over quantity. Every product in our catalog is carefully vetted
              to ensure it meets our premium standards. We&apos;re not just another marketplace —
              we&apos;re your trusted curator for the best products available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Quality First",
                description: "Every product is tested and verified to meet our high standards.",
                icon: "✦",
              },
              {
                title: "Fast Delivery",
                description: "Free shipping on orders over $50 with express options available.",
                icon: "⚡",
              },
              {
                title: "Happy Customers",
                description: "Over 50,000 satisfied customers with a 4.9-star average rating.",
                icon: "♥",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 p-6 text-center shadow-sm"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore Our Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
