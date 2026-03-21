export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I was spending 4+ hours a week studying competitor Reels. Now I get a report that tells me exactly what to make and why it'll work.",
      name: "Sarah K.",
      role: "Business Coach",
      metric: "3x more discovery calls",
    },
    {
      quote:
        "The hook analysis alone is worth it. I stopped guessing and started using proven frameworks. My save rate went from 1% to 6%.",
      name: "Marcus T.",
      role: "Marketing Consultant",
      metric: "6x save rate increase",
    },
    {
      quote:
        "As a therapist, I didn't know what content would resonate. ReelIntel showed me the emotional arcs that my ideal clients respond to.",
      name: "Dr. Amanda L.",
      role: "Licensed Therapist",
      metric: "47% more profile visits",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Early testers are{" "}
            <span className="gradient-text">seeing results</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            From our pilot program with service-based creators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-8">
              <div className="text-violet-400 text-4xl mb-4">&ldquo;</div>
              <p className="text-gray-300 leading-relaxed mb-6">{t.quote}</p>
              <div className="border-t border-white/10 pt-4">
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-gray-400">{t.role}</div>
                <div className="mt-2 text-sm font-medium text-green-400">
                  {t.metric}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
