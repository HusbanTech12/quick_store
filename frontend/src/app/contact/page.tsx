"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight, CheckCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@store.pk",
    sub: "We reply within 24 hours",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+1 (555) 123-4567",
    sub: "Mon-Fri, 9am-6pm EST",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "San Francisco, CA",
    sub: "123 Commerce Street",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: "Mon-Fri: 9am-6pm",
    sub: "Sat-Sun: 10am-4pm",
    gradient: "from-pink-500 to-rose-500",
  },
];

const faqs = [
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 day delivery.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day hassle-free return policy. Items must be in original condition with tags attached.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes! We ship to over 50 countries worldwide. International shipping rates vary by destination.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can also check status in your Orders page.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 to-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-40" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-white border-zinc-200 shadow-sm">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-medium text-zinc-600">Get in Touch</span>
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05] mb-6">
                We&apos;d Love to
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Hear From You
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-zinc-500 max-w-lg">
                Have a question, feedback, or need help? Our team is here to assist you with anything you need.
              </p>
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
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Customer Support"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 lg:py-20 bg-zinc-50">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <h2 className="text-h2 text-zinc-900">Contact Information</h2>
            <p className="mt-2 text-body text-zinc-500">Reach out through any of these channels</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {contactInfo.map((info) => (
              <motion.div key={info.title} variants={fadeInUp}>
                <div className="p-5 bg-white border border-zinc-200 rounded-xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                  <div className={`flex items-center justify-center w-10 h-10 mb-4 rounded-lg bg-gradient-to-br ${info.gradient}`}>
                    <info.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1">{info.title}</h3>
                  <p className="text-sm font-medium text-zinc-700">{info.details}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{info.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form + FAQ */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="mx-auto px-6 max-w-7xl lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <h2 className="text-h2 text-zinc-900 mb-2">Send Us a Message</h2>
              <p className="text-body text-zinc-500 mb-8">Fill out the form and we&apos;ll get back to you shortly.</p>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-green-900 mb-1">Message Sent!</h3>
                  <p className="text-sm text-green-700">We&apos;ll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-zinc-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border-zinc-200 bg-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-zinc-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border-zinc-200 bg-white"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700">Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border-zinc-200 bg-white text-zinc-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Issue</option>
                      <option value="return">Return/Refund</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-zinc-700">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border-zinc-200 bg-white resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all rounded-lg bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/20"
                  >
                    Send Message
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </form>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <h2 className="text-h2 text-zinc-900 mb-2">Frequently Asked Questions</h2>
              <p className="text-body text-zinc-500 mb-8">Quick answers to common questions</p>

              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question} className="p-5 border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-2">{faq.question}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <h3 className="text-sm font-semibold text-zinc-900 mb-1">Still need help?</h3>
                <p className="text-xs text-zinc-500 mb-3">Our support team is available 24/7 to assist you.</p>
                <a href="mailto:support@store.pk" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                  support@store.pk
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
