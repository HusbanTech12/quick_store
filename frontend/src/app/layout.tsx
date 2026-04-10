import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import AppShell from "@/components/AppShell";
=======
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "QuickStore - Premium E-commerce Experience",
  description: "Discover extraordinary products with premium quality and unbeatable prices. Curated with precision, delivered with care.",
=======
  title: "QuickStore - Premium E-commerce",
  description: "Modern e-commerce store built with Next.js and Tailwind CSS. Discover premium products with fast shipping and secure checkout.",
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
<<<<<<< HEAD
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <AppShell>{children}</AppShell>
=======
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ErrorBoundary>
          <ToastProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ToastProvider>
        </ErrorBoundary>
>>>>>>> 1551b0ae5580588a9ce383fb80c7b9910c18be27
      </body>
    </html>
  );
}
