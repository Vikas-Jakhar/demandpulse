"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Decomposition } from "@/types";

export function DecompositionChart({ data }: { data: Decomposition[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-ink">Trend component</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] p-2 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} minTickGap={50} />
              <YAxis tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="trend" stroke="#4FD1C5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-ink">Seasonal component</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] p-2 pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232A34" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} minTickGap={50} />
              <YAxis tick={{ fill: "#8A93A1", fontSize: 10 }} axisLine={{ stroke: "#232A34" }} tickLine={false} width={44} />
              <Tooltip contentStyle={{ background: "#171C24", border: "1px solid #232A34", borderRadius: 6, fontSize: 12 }} />
              <Line type="monotone" dataKey="seasonal" stroke="#F5A623" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
