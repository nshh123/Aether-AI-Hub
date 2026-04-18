/**
 * CostChart.jsx
 * Bar + area chart showing estimated daily spend in USD over 7 days.
 */

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const AMBER = "hsl(38, 100%, 60%)";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const cost = payload[0]?.value ?? 0;
  return (
    <div style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 10,
      padding: "10px 14px",
      fontSize: "0.8rem",
    }}>
      <p style={{ color: "var(--text-secondary)", marginBottom: 6 }}>{label}</p>
      <p style={{ color: AMBER }}>
        <span className="mono">${cost.toFixed(6)}</span>
      </p>
    </div>
  );
}

/**
 * @param {{ data: Array<{date:string, cost:number}> }} props
 */
export default function CostChart({ data = [] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  }));

  const maxCost = Math.max(...formatted.map((d) => d.cost), 0.000001);

  return (
    <div className="glass-card p-5 fade-in-up delay-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Daily Spend
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Estimated cost (USD) per day
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
          style={{
            background: "rgba(255,165,0,0.1)",
            border: "1px solid rgba(255,165,0,0.25)",
            color: AMBER,
          }}
        >
          <span>$</span>
          <span className="mono">
            {data.reduce((s, d) => s + d.cost, 0).toFixed(4)}
          </span>
          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>7-day total</span>
        </div>
      </div>

      <div className="chart-container" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formatted} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AMBER} stopOpacity={0.35} />
                <stop offset="95%" stopColor={AMBER} stopOpacity={0.02} />
              </linearGradient>
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
              tickFormatter={(v) => `$${v.toFixed(3)}`}
              domain={[0, maxCost * 1.3]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)" }} />
            <Area
              type="monotone"
              dataKey="cost"
              fill="url(#costGradient)"
              stroke={AMBER}
              strokeWidth={2.5}
              dot={false}
            />
            <Bar
              dataKey="cost"
              fill={AMBER}
              fillOpacity={0.15}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
