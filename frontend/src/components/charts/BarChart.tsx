'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      borderRadius?: number;
    }[];
  };
  options?: any;
  height?: number;
  className?: string;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  options = {}, 
  height = 300,
  className = '',
  horizontal = false
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              // Format numbers with Indonesian locale
              const value = horizontal ? context.parsed.x : context.parsed.y;
              label += new Intl.NumberFormat('id-ID').format(value);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: !horizontal,
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value: any) {
            if (horizontal) return value;
            // Format x-axis labels for vertical bars
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      y: {
        grid: {
          display: horizontal,
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value: any) {
            if (!horizontal) return value;
            // Format y-axis labels for horizontal bars
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderSkipped: false
      }
    },
    ...options
  };

  // Apply default styling to datasets if not provided
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const colors = [
        '#2563EB', // Blue
        '#3DBD61', // Green
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#EC4899', // Pink
        '#10B981'  // Emerald
      ];
      
      const backgroundColors = [
        'rgba(37, 99, 235, 0.8)',
        'rgba(61, 189, 97, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(16, 185, 129, 0.8)'
      ];
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || backgroundColors[index % backgroundColors.length],
        borderColor: dataset.borderColor || colors[index % colors.length],
        borderWidth: dataset.borderWidth !== undefined ? dataset.borderWidth : 2,
        borderRadius: dataset.borderRadius !== undefined ? dataset.borderRadius : 6
      };
    })
  };

  const ChartComponent = Bar;

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <ChartComponent data={styledData} options={defaultOptions} />
    </div>
  );
};

export default BarChart;