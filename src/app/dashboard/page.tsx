"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DashboardLogin } from "@/components/dashboard/DashboardLogin";
import { DashboardMain } from "@/components/dashboard/DashboardMain";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 pt-24 pb-12 px-6">
        {userEmail ? (
          <DashboardMain email={userEmail} />
        ) : (
          <DashboardLogin onLogin={setUserEmail} />
        )}
      </div>
      <Footer />
    </main>
  );
}
