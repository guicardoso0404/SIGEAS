import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  gradient = false 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.02 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        ${gradient ? 'bg-gradient-to-br from-white to-blue-50/50' : 'bg-white/80'}
        backdrop-blur-xl border border-white/20 rounded-2xl shadow-elegant
        hover:shadow-premium transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  textColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  textColor,
  trend
}) => {
  return (
    <Card className="p-6" gradient>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`${bgColor} p-4 rounded-2xl shadow-lg`}>
            <Icon className={`w-8 h-8 ${textColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span className="font-medium">
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-slate-500 ml-1">vs último mês</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};