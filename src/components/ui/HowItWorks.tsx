const HowItWorks = () => {
    const steps = [
      "Sign up or log in",
      "Create your profile",
      "Watch and discover clips",
      "Tip or boost your favorite creators",
      "Upload your own short film",
      "Grow your profile with support"
    ];
  
    return (
      <section className="py-16 bg-gray-900 text-white text-center">
        <h2 className="text-4xl font-bold mb-10">How KnotReels Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded-lg shadow-md hover:scale-105 transition">
              <div className="text-3xl font-extrabold mb-4">{i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default HowItWorks;
  