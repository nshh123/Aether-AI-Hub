/**
 * Sidebar.jsx
 * Collapsible dark sidebar with branding, navigation links, and a status footer.
 */

import {
  Activity,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Gauge,
  LayoutDashboard,
  Settings,
  Zap,
} from "lucide-react";
import React from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "latency", label: "Latency", icon: Activity },
  { id: "tokens", label: "Token Analytics", icon: BarChart3 },
  { id: "cost", label: "Cost Explorer", icon: Gauge },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * @param {{ active: string, onNavigate: (id:string) => void }} props
 */
export default function Sidebar({ active, onNavigate }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className="sidebar flex flex-col h-screen sticky top-0 z-20 shrink-0 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 64 : 228 }}
    >
      {/* Logo / Branding */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center glow-cyan"
          style={{
            background: "linear-gradient(135deg, hsl(185,100%,30%), hsl(275,80%,40%))",
          }}
        >
          <Bot className="w-5 h-5 text-white" strokeWidth={1.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold leading-tight gradient-text-cyan">Aether</p>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              AI Hub
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`nav-${id}`}
            onClick={() => onNavigate(id)}
            className={`nav-link w-full ${active === id ? "active" : ""}`}
            title={collapsed ? label : undefined}
            style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} style={{ width: 18, height: 18 }} />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer: Live indicator + collapse toggle */}
      <div
        className="px-3 py-4 space-y-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2">
            <div className="pulse-dot" />
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Gateway Live
            </span>
            <Zap className="w-3 h-3 ml-auto" style={{ color: "var(--neon-amber)" }} />
          </div>
        )}

        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed((c) => !c)}
          className="nav-link w-full"
          style={{ justifyContent: collapsed ? "center" : "flex-start" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
