'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'blue' | 'green' | 'amber';
}

const colorClasses = {
  purple: 'bg-purple-900/50 border-purple-700 text-purple-400',
  blue: 'bg-blue-900/50 border-blue-700 text-blue-400',
  green: 'bg-green-900/50 border-green-700 text-green-400',
  amber: 'bg-amber-900/50 border-amber-700 text-amber-400',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'purple',
}: StatsCardProps) {
  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={`text-xs font-semibold mt-2 ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}% from last month
            </p>
          )}
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );
}
