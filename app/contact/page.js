import React from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Movieslab. Send us your feedback, suggestions, or questions about the platform.",
  alternates: {
    canonical: "https://movieslab.online/contact",
  },
  openGraph: {
    title: "Contact Movieslab",
    description: "Get in touch with Movieslab. Send us your feedback, suggestions, or questions about the platform.",
    url: "https://movieslab.online/contact",
    siteName: "Movieslab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Movieslab",
    description: "Get in touch with Movieslab. Send us your feedback, suggestions, or questions about the platform.",
  },
};

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen bg-black text-white pb-20 px-4 lg:px-[5vw]">
      <h1 className="text-3xl font-comfortaa font-bold mt-8">Contact Movieslab</h1>
      <p className="text-zinc-400 mt-4 max-w-2xl">
        Use the form in the footer to send us a message. We read all messages and
        will respond if needed.
      </p>
      <div className="mt-8">
        {/* Optionally add more contact details here */}
      </div>

      <Footer />
    </main>
  );
}
