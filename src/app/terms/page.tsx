"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="relative bg-[#121212] text-gray-300 max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6">
        {/* Close button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg"
          aria-label="Close"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Terms & Conditions</h1>

        <p className="mb-4">
          Welcome to KnotReels. By using our platform, you agree to the following terms and conditions. Please read them carefully.
        </p>

        <h2 className="text-lg font-semibold text-white mt-8 mb-2">1. Use of Service</h2>
        <p className="mb-4">
          KnotReels allows users to upload and share content. You agree to comply with all laws and respect others’ rights while using the platform.
        </p>

        <h2 className="text-lg font-semibold text-white mt-8 mb-2">2. User Content</h2>
        <p className="mb-4">
          You retain rights to your content but allow us to use it to promote KnotReels and display it to others.
        </p>

        <h2 className="text-lg font-semibold text-white mt-8 mb-2">3. Prohibited Conduct</h2>
        <p className="mb-4">
          Don’t post unlawful, abusive, or offensive material. We reserve the right to remove content and ban users who violate these terms.
        </p>

        <h2 className="text-lg font-semibold text-white mt-8 mb-2">4. Termination</h2>
        <p className="mb-4">
          We may suspend or terminate accounts if users violate these terms or abuse the platform.
        </p>

        <h2 className="text-lg font-semibold text-white mt-8 mb-2">5. Contact</h2>
        <p className="mb-4">
          Questions? Email us at{" "}
          <a
            href="mailto:info@knotreels.com"
            className="text-blue-400 hover:underline"
          >
            info@knotreels.com
          </a>
        </p>

        <p className="mt-10 text-sm text-gray-500">
          © {new Date().getFullYear()} KnotReels, Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
}
