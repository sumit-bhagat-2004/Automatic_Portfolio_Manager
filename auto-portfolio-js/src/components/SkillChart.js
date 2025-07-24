'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SkillChart({ repo }) {
  if (!repo.languages || Object.keys(repo.languages).length === 0) {
    return <div className="text-muted-foreground text-sm mt-2">No language data</div>;
  }
  
  const data = Object.entries(repo.languages).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Tooltip
          contentStyle={{
            background: "rgba(20, 20, 20, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "0.5rem",
          }}
          itemStyle={{ color: "#fafafa" }}
        />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
