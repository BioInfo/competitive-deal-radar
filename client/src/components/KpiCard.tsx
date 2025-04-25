import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  HeartHandshake, 
  TestTubeIcon, 
  HeartPulseIcon, 
  TrendingUpIcon, 
  TrendingDownIcon 
} from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: 'deals' | 'modality' | 'indication';
  children?: React.ReactNode;
}

export default function KpiCard({ title, value, change, icon, children }: KpiCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'deals':
        return <HeartHandshake className="h-6 w-6 text-primary" />;
      case 'modality':
        return <TestTubeIcon className="h-6 w-6 text-accent" />;
      case 'indication':
        return <HeartPulseIcon className="h-6 w-6 text-secondary" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
            <p className="text-3xl font-semibold mt-1 text-secondary">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-opacity-10"
            style={{ backgroundColor: icon === 'deals' ? 'rgba(169, 34, 105, 0.1)' : 
                                    icon === 'modality' ? 'rgba(23, 143, 143, 0.1)' : 
                                    'rgba(24, 55, 95, 0.1)' }}>
            {renderIcon()}
          </div>
        </div>

        {change && (
          <div className="mt-4 flex items-center">
            <span className={`font-medium text-sm flex items-center ${change.isPositive ? 'text-success' : 'text-error'}`}>
              {change.isPositive ? <TrendingUpIcon className="mr-1 h-4 w-4" /> : <TrendingDownIcon className="mr-1 h-4 w-4" />}
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
            <span className="text-neutral-500 text-sm ml-2">vs. previous year</span>
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
