interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-primary-800">{value}</p>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-sm font-medium ${
              trend.isPositive ? 'text-custom-green-600' : 'text-custom-red-500'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend.value).toFixed(1)}%</span>
              <span className="ml-1 text-neutral-500 font-normal">
                {trend.isPositive ? 'improvement' : 'decrease'}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-primary-300 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
