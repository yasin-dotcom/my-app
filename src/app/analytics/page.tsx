import Analytics from "@/components/Analytics";
import Nav from "@/components/Nav";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Nav />
      </div>
      <h1 className="mb-8 text-3xl font-bold">Analytics</h1>
      <Analytics />
    </div>
  );
}
