"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, Star, Users, Zap, Shield, Package, Award, Heart, Globe } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const stats = [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Premium Products" },
  { value: "4.9", label: "Average Rating" },
  { value: "24/7", label: "Expert Support" },
];

const values = [
  { icon: Package, title: "Quality First", desc: "Every product is tested and verified to meet our high standards before listing.", gradient: "from-indigo-500 to-violet-500" },
  { icon: Zap, title: "Fast Delivery", desc: "Free shipping on orders over $50 with express delivery options available.", gradient: "from-violet-500 to-purple-500" },
  { icon: Heart, title: "Customer Love", desc: "Over 10,000 satisfied customers with a 4.9-star average rating.", gradient: "from-purple-500 to-pink-500" },
  { icon: Shield, title: "Secure Shopping", desc: "SSL encrypted checkout and buyer protection on every purchase.", gradient: "from-pink-500 to-rose-500" },
];

const team = [
  { name: "Sarah Ahmed", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Ali Khan", role: "Head of Product", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Fatima Noor", role: "Creative Director", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Omar Hassan", role: "Tech Lead", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-zinc-600">Premium Shopping Experience</span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05] mb-6">
                About
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Shop.pk
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg leading-relaxed text-zinc-500 mb-8 max-w-lg">
                We believe shopping should be a premium experience — curated, seamless, and delightful. Every product is carefully vetted to ensure it meets our high standards.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-6 border-t border-zinc-100">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-2xl opacity-60" />
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-900/10">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Our Team"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -top-4 -right-4 px-4 py-3 rounded-xl bg-white border border-zinc-200 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Trusted Since 2020</p>
                    <p className="text-[10px] text-zinc-500">50,000+ orders delivered</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="relative p-8 lg:p-12 overflow-hidden border rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 border-white/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">Our Mission</h2>
                </div>
                <p className="text-lg leading-relaxed text-white/80">
                  Shop.pk was founded with a simple vision: to create an e-commerce platform that prioritizes{" "}
                  <span className="font-semibold text-white">quality over quantity</span>. Every product in our catalog is carefully vetted to ensure it meets our premium standards. We&apos;re not just another marketplace — we&apos;re your trusted curator.
                </p>
              </div>
              <div className="relative h-64 lg:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-indigo-600">Our Values</span>
            </div>
            <h2 className="text-h2 text-zinc-900">What Drives Us</h2>
            <p className="mt-2 text-body text-zinc-500">The principles that guide every decision we make</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="p-6 text-center transition-all border rounded-xl bg-white border-zinc-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${value.gradient} shadow-lg`}>
                  <value.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-zinc-900">{value.title}</h3>
                <p className="text-sm text-zinc-500">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-purple-600">Our Team</span>
            </div>
            <h2 className="text-h2 text-zinc-900">Meet the People Behind Shop.pk</h2>
            <p className="mt-2 text-body text-zinc-500">Passionate individuals dedicated to your experience</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {team.map((member) => (
              <motion.div key={member.name} variants={fadeInScale}>
                <div className="group text-center">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-indigo-300 transition-all shadow-md group-hover:shadow-xl group-hover:shadow-indigo-500/10">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900">{member.name}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-16 lg:py-24 bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500">
                  <Globe className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-label text-teal-600">Global Reach</span>
              </div>
              <h2 className="text-h2 text-zinc-900 mb-4">Delivering Excellence Worldwide</h2>
              <p className="text-body text-zinc-500 mb-6 leading-relaxed">
                From our headquarters, we&apos;ve built a network that connects premium products with customers across the globe. Our logistics partners ensure every order arrives safely and on time.
              </p>
              <ul className="space-y-3">
                {[
                  "Free shipping on orders over $50",
                  "Express 2-3 day delivery available",
                  "Real-time order tracking",
                  "30-day hassle-free returns",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-zinc-600">
                    <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-4 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl blur-2xl opacity-60" />
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-900/10">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Global shipping"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInScale}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h2 className="text-h2 text-zinc-900 mb-4">Ready to Experience Premium Shopping?</h2>
            <p className="text-body text-zinc-500 mb-8 max-w-lg mx-auto">
              Join thousands of happy customers who trust Shop.pk for their premium shopping needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products">
                <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:-translate-y-0.5">
                  Explore Products
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300">
                  Contact Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
