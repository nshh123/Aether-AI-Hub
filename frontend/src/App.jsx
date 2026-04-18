/**
 * App.jsx
 * Root component — layout shell with sidebar + main content area.
 */

import React, { useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { useMetrics } from "./hooks/useMetrics.js";

export default function App() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const { data, loading, error, refetch } = useMetrics();

  return (
    <>
      {/* Animated mesh background */}
      <div className="mesh-bg" aria-hidden="true" />

      {/* App shell */}
      <div className="flex min-h-screen">
        <Sidebar active={activeNav} onNavigate={setActiveNav} />

        <main className="flex-1 overflow-y-auto">
          {/* For now all routes render the Dashboard; additional views can be added here */}
          <Dashboard data={data} loading={loading} error={error} refetch={refetch} />
        </main>
      </div>
    </>
  );
}
