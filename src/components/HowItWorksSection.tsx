export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Tell us your niche",
      description:
        "Share your Instagram handle, business type, and target audience. We'll calibrate our AI to your specific market.",
    },
    {
      step: "02",
      title: "We analyze your space",
      description:
        "Our agent scans thousands of top-performing Reels from creators and competitors in your niche, extracting every pattern that matters.",
    },
    {
      step: "03",
      title: "Get your intelligence report",
      description:
        "Every week, receive a detailed breakdown of what's working, why it's working, and exactly how to replicate it for your service business.",
    },
    {
      step: "04",
      title: "Create content that converts",
      description:
        "Use our proven frameworks, hook templates, and script structures to create Reels that actually generate leads and bookings.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            How <span className="gradient-text">ReelIntel</span> works
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            From signup to your first intelligence report in under 48 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/50 to-transparent z-0" />
              )}
              <div className="relative z-10">
                <div className="text-5xl font-bold text-violet-500/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
