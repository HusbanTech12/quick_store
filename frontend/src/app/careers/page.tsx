"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, CheckCircle, Heart, Users, Zap, Star, Globe } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const benefits = [
  { icon: Heart, title: "Health & Wellness", desc: "Comprehensive medical, dental, and vision insurance for you and your family.", gradient: "from-indigo-500 to-violet-500" },
  { icon: Zap, title: "Growth Opportunities", desc: "Continuous learning budget, mentorship programs, and career development plans.", gradient: "from-violet-500 to-purple-500" },
  { icon: Globe, title: "Remote-First", desc: "Work from anywhere in the world with flexible hours and async communication.", gradient: "from-purple-500 to-pink-500" },
  { icon: DollarSign, title: "Competitive Pay", desc: "Top-tier salaries, equity packages, and annual performance bonuses.", gradient: "from-pink-500 to-rose-500" },
];

const openings = [
  { title: "Senior Frontend Engineer", type: "Full-time", location: "Remote", dept: "Engineering", salary: "$120K - $180K" },
  { title: "Backend Developer (Python)", type: "Full-time", location: "Remote", dept: "Engineering", salary: "$110K - $170K" },
  { title: "Product Designer", type: "Full-time", location: "Remote", dept: "Design", salary: "$100K - $150K" },
  { title: "Customer Success Manager", type: "Full-time", location: "Remote", dept: "Support", salary: "$70K - $100K" },
  { title: "Marketing Lead", type: "Full-time", location: "Remote", dept: "Marketing", salary: "$90K - $140K" },
  { title: "Data Analyst", type: "Full-time", location: "Remote", dept: "Analytics", salary: "$80K - $120K" },
];

const values = [
  { title: "Customer Obsession", desc: "Every decision starts with the customer. We build experiences that delight." },
  { title: "Ownership Mindset", desc: "We take responsibility and drive results, no matter the challenge." },
  { title: "Bias for Action", desc: "Speed matters. We move fast, learn faster, and iterate constantly." },
  { title: "Radical Candor", desc: "We give direct feedback with care. Growth comes from honest conversations." },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-xs font-medium text-zinc-600">Join Our Team</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.05] mb-6">
                Let&apos;s Build
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Something Great
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-zinc-500 mb-8 max-w-lg">
                Join a team of passionate builders creating the future of e-commerce. We&apos;re looking for people who care deeply about quality and craft.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="#openings">
                  <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:-translate-y-0.5">
                    View Openings
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <Link href="/contact">
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-8 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl blur-2xl opacity-60" />
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 shadow-2xl shadow-zinc-900/10">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Our Team"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 lg:py-24 bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-indigo-600">Why Join Us</span>
            </div>
            <h2 className="text-h2 text-zinc-900">Benefits & Perks</h2>
            <p className="mt-2 text-body text-zinc-500">We take care of our team so you can do your best work</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUp}
                className="p-6 text-center transition-all border rounded-xl bg-white border-zinc-200 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className={`flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${benefit.gradient} shadow-lg`}>
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-zinc-900">{benefit.title}</h3>
                <p className="text-sm text-zinc-500">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                <Star className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-purple-600">Our Values</span>
            </div>
            <h2 className="text-h2 text-zinc-900">What We Believe In</h2>
            <p className="mt-2 text-body text-zinc-500">The principles that guide how we work and build</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="p-6 border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 mb-1">{value.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-16 lg:py-24 bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-emerald-500">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-label text-teal-600">Open Positions</span>
            </div>
            <h2 className="text-h2 text-zinc-900">Join Our Team</h2>
            <p className="mt-2 text-body text-zinc-500">We&apos;re looking for talented people to help us grow</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="space-y-4 max-w-3xl mx-auto"
          >
            {openings.map((job) => (
              <motion.div
                key={job.title}
                variants={fadeInUp}
                className="group p-5 bg-white border border-zinc-200 rounded-xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Briefcase className="w-3 h-3" />
                        {job.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {job.dept}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 transition-all rounded-lg bg-indigo-50 hover:bg-indigo-100 shrink-0">
                    Apply Now
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-10 text-center">
            <p className="text-sm text-zinc-500 mb-4">Don&apos;t see a role that fits? We&apos;d still love to hear from you.</p>
            <Link href="/contact">
              <button className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300">
                Send Us Your Resume
              </button>
            </Link>
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
            variants={fadeInUp}
            className="text-center"
          >
            <h2 className="text-h2 text-zinc-900 mb-4">Ready to Make an Impact?</h2>
            <p className="text-body text-zinc-500 mb-8 max-w-lg mx-auto">
              Join a team that&apos;s redefining e-commerce. Your next adventure starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="#openings">
                <button className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20 hover:shadow-xl hover:-translate-y-0.5">
                  View Openings
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/about">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-all rounded-lg border bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300">
                  Learn About Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
