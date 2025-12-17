'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
      tension?: number;
    }[];
  };
  options?: any;
  height?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  options = {}, 
  height = 300,
  className = '' 
}) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
              label += new Intl.NumberFormat('id-ID').format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280',
          callback: function(value: any) {
            // Format y-axis labels
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
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2,
        hoverBorderWidth: 3
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    ...options
  };

  // Apply default styling to datasets if not provided
  const styledData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const colors = [
        {
          border: '#2563EB',
          background: 'rgba(37, 99, 235, 0.1)'
        },
        {
          border: '#3DBD61',
          background: 'rgba(61, 189, 97, 0.1)'
        },
        {
          border: '#F59E0B',
          background: 'rgba(245, 158, 11, 0.1)'
        },
        {
          border: '#EF4444',
          background: 'rgba(239, 68, 68, 0.1)'
        },
        {
          border: '#8B5CF6',
          background: 'rgba(139, 92, 246, 0.1)'
        }
      ];
      
      const colorSet = colors[index % colors.length];
      
      return {
        ...dataset,
        borderColor: dataset.borderColor || colorSet.border,
        backgroundColor: dataset.backgroundColor || colorSet.background,
        fill: dataset.fill !== undefined ? dataset.fill : true,
        tension: dataset.tension !== undefined ? dataset.tension : 0.4
      };
    })
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <Line data={styledData} options={defaultOptions} />
    </div>
  );
};

export default LineChart;