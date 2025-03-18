'use client';

import React, { ReactNode } from 'react';

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: string;
  bgColor?: string;
};

const KpiCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  color = '#5e4fd1', 
  bgColor = '#f0eeff' 
}: KpiCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 h-full">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold" style={{ color: color }}>{value}</p>
            
            {trend && (
              <span className={`ml-2 flex items-center text-sm ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.positive ? (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                  </svg>
                ) : (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
