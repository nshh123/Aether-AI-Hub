/**
 * LatencyChart.jsx
 * Multi-line chart showing average latency (ms) per model per day.
 * One line is rendered per unique model found in the data.
 */

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Deterministic neon palette for up to N models
const MODEL_COLORS = [
  "hsl(185, 100%, 55%)",  // cyan
  "hsl(275, 90%, 65%)",   // purple
  "hsl(38, 100%, 60%)",   // amber
  "hsl(145, 80%, 50%)",   // green
  "hsl(350, 90%, 65%)",   // rose
  "hsl(220, 80%, 65%)",   // blue
];

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
          <span style={{ color: "var(--text-muted)" }}>ms · {p.name}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * @param {{ data: Array<{date:string, model:string, avg_latency_ms:number}> }} props
 */
export default function LatencyChart({ data = [] }) {
  // Pivot flat [{date, model, avg_latency_ms}] → [{label, modelA, modelB, …}]
  const { pivoted, models } = useMemo(() => {
    const modelSet = new Set();
    const byDay = {};

    data.forEach(({ date, model, avg_latency_ms }) => {
      modelSet.add(model);
      if (!byDay[date]) {
        byDay[date] = {
          date,
          label: new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
        };
      }
      byDay[date][model] = avg_latency_ms;
    });

    const allModels = [...modelSet];

    // Fill missing model values with 0 for complete chart lines
    Object.values(byDay).forEach((row) => {
      allModels.forEach((m) => {
        if (row[m] === undefined) row[m] = null;
      });
    });

    return {
      pivoted: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      models: allModels,
    };
  }, [data]);

  const isEmpty = models.length === 0;

  return (
    <div className="glass-card p-5 fade-in-up delay-3">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Latency by Model
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Average response time in milliseconds
          </p>
        </div>
        {models.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {models.map((m, i) => (
              <span key={m} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span style={{
                  width: 10, height: 2,
                  background: MODEL_COLORS[i % MODEL_COLORS.length],
                  display: "inline-block", borderRadius: 2,
                }} />
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="chart-container" style={{ height: 240 }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No latency data yet
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Send a request through the gateway to populate this chart
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pivoted} margin={{ top: 4, right: 4, bottom: 4, left: -10 }}>
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
                tickFormatter={(v) => `${v}ms`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
              {models.map((model, i) => (
                <Line
                  key={model}
                  type="monotone"
                  dataKey={model}
                  name={model}
                  stroke={MODEL_COLORS[i % MODEL_COLORS.length]}
                  strokeWidth={2.5}
                  connectNulls
                  dot={{ r: 3, fill: MODEL_COLORS[i % MODEL_COLORS.length], strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
