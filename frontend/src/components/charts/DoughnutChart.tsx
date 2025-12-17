'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
      borderWidth?: number;
      cutout?: string;
    }[];
  };
  options?: any;
  height?: number;
  className?: string;
  showLegend?: boolean;
  centerText?: {
    title: string;
    subtitle?: string;
  };
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ 
  data, 
  options = {}, 
  height = 300,
  className = '',
  showLegend = true,
  centerText
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor ? dataset.borderColor[i] : dataset.backgroundColor[i],
                  lineWidth: dataset.borderWidth || 0,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return `${label}: ${new Intl.NumberFormat('id-ID').format(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    ...options
  };

  // Apply default styling to datasets if not provided
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset) => {
      const defaultColors = [
        '#2563EB', // Blue
        '#3DBD61', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#EC4899', // Pink
        '#10B981', // Emerald
        '#F97316', // Orange
        '#6366F1'  // Indigo
      ];
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || defaultColors.slice(0, data.labels.length),
        borderColor: dataset.borderColor || defaultColors.slice(0, data.labels.length),
        borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 2,
        cutout: dataset.cutout || '60%'
      };
    })
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <div className="relative">
        <Doughnut data={styledData} options={defaultOptions} />
        
        {/* Center Text Overlay */}
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {centerText.title}
              </div>
              {centerText.subtitle && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {centerText.subtitle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoughnutChart;