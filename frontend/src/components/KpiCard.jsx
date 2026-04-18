/**
 * KpiCard.jsx
 * Reusable Key Performance Indicator card with icon, label, value, and trend badge.
 */

import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * @param {object} props
 * @param {React.ElementType} props.icon        Lucide icon component
 * @param {string} props.label                  Display label
 * @param {string|number} props.value           Primary metric value
 * @param {string} props.unit                   Unit suffix (optional)
 * @param {string} props.accentClass            CSS class for the icon wrapper (glow-cyan etc.)
 * @param {string} props.iconColor              Tailwind text color class for icon
 * @param {number|null} props.trend             % change vs yesterday (positive = good or bad based on context)
 * @param {boolean} props.trendInverse          If true, a negative trend is rendered green (for cost/latency KPIs)
 * @param {string} props.animationDelay         CSS animation-delay class (delay-1 .. delay-4)
 */
export default function KpiCard({
  icon: Icon,
  label,
  value,
  unit = "",
  accentClass = "glow-cyan",
  iconColor = "text-cyan-400",
  trend = null,
  trendInverse = false,
  animationDelay = "",
}) {
  const trendPositive = trendInverse ? trend < 0 : trend >= 0;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;
  const trendColor = trendPositive ? "text-emerald-400" : "text-rose-400";

  return (
    <div className={`glass-card p-5 fade-in-up ${animationDelay}`}>
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-2.5 rounded-xl bg-white/5 ${accentClass}`}
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
        </div>

        {trend !== null && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 ${trendColor}`}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Value */}
      <p
        className="kpi-value"
        style={{
          background:
            "linear-gradient(135deg, hsl(210,40%,96%) 0%, hsl(210,25%,70%) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
        {unit && (
          <span className="text-lg font-normal" style={{ WebkitTextFillColor: "hsl(210,25%,65%)" }}>
            {" "}{unit}
          </span>
        )}
      </p>

      {/* Label */}
      <p className="text-xs font-medium mt-1.5" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
    </div>
  );
}
