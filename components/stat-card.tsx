'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export default function StatCard({ label, value, icon: Icon }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 500;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <Card className="bg-card border-border hover:border-accent transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{label}</p>
            <p className="text-3xl font-bold text-foreground">{displayValue.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-accent bg-opacity-10 rounded-lg">
            <Icon className="text-accent" size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
