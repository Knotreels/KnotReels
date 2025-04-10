import React from "react";

const SupportSection = () => {
    return (
      <section className="py-20 bg-black text-white">
        <h2 className="text-4xl font-bold text-center mb-12">Support Creators Instantly</h2>
        <div className="flex flex-col md:flex-row justify-center gap-12 text-left max-w-6xl mx-auto">
          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full">
            <h3 className="text-2xl font-semibold mb-4">💸 Tipping</h3>
            <p>Send creators one-time support — as low as $0.99. 100% direct, no subscriptions needed.</p>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full">
            <h3 className="text-2xl font-semibold mb-4">🚀 Boosting</h3>
            <p>Boost visibility for your favorite clips. Each boost helps a creator climb the featured board.</p>
          </div>
        </div>
      </section>
    );
  };
  
  export default SupportSection;
  