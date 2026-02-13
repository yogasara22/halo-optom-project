import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = memo(({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/30',
      icon: 'text-[#2563EB]',
      glow: 'shadow-[#2563EB]/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-[#3DBD61]/20 to-[#3DBD61]/30',
      icon: 'text-[#3DBD61]',
      glow: 'shadow-[#3DBD61]/20'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-amber-100/50 to-amber-200/50',
      icon: 'text-amber-600',
      glow: 'shadow-amber-200/40'
    },
    red: {
      bg: 'bg-gradient-to-br from-rose-100/50 to-rose-200/50',
      icon: 'text-rose-600',
      glow: 'shadow-rose-200/40'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-100/50 to-purple-200/50',
      icon: 'text-purple-600',
      glow: 'shadow-purple-200/40'
    },
  };

  return (
    <Card className={clsx('group hover:shadow-lg transition-all duration-300 overflow-hidden', colorClasses[color].glow)}>
      <CardContent className="flex items-center p-6 relative">
        <div className="flex items-center w-full">
          <div className={clsx(
            'flex items-center justify-center w-14 h-14 rounded-xl shrink-0',
            'shadow-md group-hover:shadow-lg transition-all duration-300',
            'group-hover:scale-105 backdrop-blur-sm',
            colorClasses[color].bg
          )}>
            <Icon className={clsx(
              'w-7 h-7 transition-all duration-300',
              colorClasses[color].icon
            )} />
          </div>
          <div className="ml-5 flex-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 group-hover:text-gray-800 transition-colors">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <div className={clsx(
                  'flex items-center px-2 py-1 rounded-full text-xs font-semibold',
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                )}>
                  <span className={clsx(
                    'mr-1',
                    trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                  )}>
                    {trend.isPositive ? '↗' : '↘'}
                  </span>
                  {Math.abs(trend.value)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

export default StatCard;