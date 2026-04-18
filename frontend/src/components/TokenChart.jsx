/**
 * TokenChart.jsx
 * Line chart showing daily prompt + completion token volumes over 7 days.
 * Uses Recharts LineChart with custom tooltip and neon styling.
 */

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CYAN = "hsl(185, 100%, 55%)";
const PURPLE = "hsl(275, 90%, 65%)";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: "0.8rem",
    }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          <span className="mono">{p.value.toLocaleString()}</span>{" "}
          <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * @param {{ data: Array<{date:string, prompt_tokens:number, completion_tokens:number}> }} props
 */
export default function TokenChart({ data = [] }) {
  // Shorten date labels to "Apr 18" format
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  }));

  return (
    <div className="glass-card p-5 fade-in-up delay-2">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Token Volume — Last 7 Days
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Prompt vs completion tokens per day
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 2, background: CYAN, display: "inline-block", borderRadius: 2 }} />
            Prompt
          </span>
          <span className="flex items-center gap-1">
            <span style={{ width: 10, height: 2, background: PURPLE, display: "inline-block", borderRadius: 2 }} />
            Completion
          </span>
        </div>
      </div>

      <div className="chart-container" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <defs>
              <filter id="glowCyan">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glowPurple">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(210,15%,40%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fill: "hsl(210,15%,40%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
            <Line
              type="monotone"
              dataKey="prompt_tokens"
              name="Prompt"
              stroke={CYAN}
              strokeWidth={2.5}
              dot={{ r: 3, fill: CYAN, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: CYAN, filter: "url(#glowCyan)" }}
              filter="url(#glowCyan)"
            />
            <Line
              type="monotone"
              dataKey="completion_tokens"
              name="Completion"
              stroke={PURPLE}
              strokeWidth={2.5}
              dot={{ r: 3, fill: PURPLE, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: PURPLE, filter: "url(#glowPurple)" }}
              filter="url(#glowPurple)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
