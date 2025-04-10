const WhyKnotReels = () => {
    const features = [
      "🎭 Creator-first: no subscriptions required",
      "🪙 Micro-tipping with PayPal & Stripe",
      "🚀 Boost-based visibility ranking",
      "🎨 Personalized profiles",
      "⚡ Built with Next.js, Firebase & Tailwind"
    ];
  
    return (
      <section className="py-16 bg-gray-950 text-white text-center">
        <h2 className="text-4xl font-bold mb-10">Why Creators Love KnotReels</h2>
        <ul className="max-w-4xl mx-auto space-y-4 text-lg">
          {features.map((feat, i) => (
            <li key={i} className="bg-gray-800 px-6 py-4 rounded-md">{feat}</li>
          ))}
        </ul>
      </section>
    );
  };
  
  export default WhyKnotReels;
  