export function FeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "Hook Analysis",
      description:
        "We break down every hook style — pattern interrupts, bold claims, questions, storytelling openers — and show you which ones drive the most engagement in your niche.",
    },
    {
      icon: "📝",
      title: "Script Templates",
      description:
        "Get proven script frameworks with emotional arcs mapped out. See exactly when top creators build tension, deliver value, and drop their CTA.",
    },
    {
      icon: "🔥",
      title: "Conversion Triggers",
      description:
        "Identify the exact moments that turn viewers into leads — urgency cues, social proof drops, authority signals, and booking prompts that actually convert.",
    },
    {
      icon: "📊",
      title: "Engagement Metrics",
      description:
        "Views, likes, comments, shares, saves — all tracked and benchmarked against your niche. Know exactly what 'good' looks like for service businesses.",
    },
    {
      icon: "🧠",
      title: "AI-Powered Insights",
      description:
        "Our Claude-powered agent doesn't just collect data. It finds patterns, predicts what will work for YOUR specific audience, and generates actionable concepts.",
    },
    {
      icon: "📅",
      title: "Weekly Intelligence Reports",
      description:
        "Every week you get a curated report: top-performing concepts, trending hooks, content calendar suggestions, and competitor moves in your space.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything your content strategy{" "}
            <span className="gradient-text">needs</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
            Built specifically for coaches, consultants, agencies, and
            freelancers who want to turn Reels into a lead generation machine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card rounded-2xl p-8 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
