export function StatsSection() {
  const stats = [
    { value: "10K+", label: "Reels Analyzed Weekly" },
    { value: "47%", label: "Avg. Engagement Lift" },
    { value: "3.2x", label: "More Leads Generated" },
    { value: "50", label: "Beta Spots Available" },
  ];

  return (
    <section className="py-16 px-6 border-y border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-4xl md:text-5xl font-bold gradient-text">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
