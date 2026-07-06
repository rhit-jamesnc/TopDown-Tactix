import React from 'react';
import type { SmoothLineChartProps } from '../../../../../shared/types/props';
import './GameStatisticsModal.css';

// Helper function to generate smooth Bézier curve commands for SVG
const getSvgPath = (points: number[], width: number, height: number): string => {
  const n = points.length;
  if (n < 2) return '';

  // Calculate spacing between points on X-axis
  const stepX = width / (n - 1);
  
  // Function to map data value (0-100) to SVG Y-coordinate (inverted)
  const getY = (value: number) => height - (value / 100) * height;

  // Start point
  let path = `M 0 ${getY(points[0])}`;

  // Generate Cubic Bézier curves for smoothness
  // We loop through points to calculate control points
  for (let i = 0; i < n - 1; i++) {
    const x0 = i * stepX;
    const y0 = getY(points[i]);
    
    const x1 = (i + 1) * stepX;
    const y1 = getY(points[i + 1]);

    // Define control points for smooth curve
    // cpx1, cpy1 (control point for start), cpx2, cpy2 (control point for end)
    const cpx1 = x0 + stepX / 2;
    const cpy1 = y0;
    const cpx2 = x0 + stepX / 2;
    const cpy2 = y1;

    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x1} ${y1}`;
  }

  return path;
};

export const SmoothLineChart: React.FC<SmoothLineChartProps> = ({ 
  data, 
  color = '#10B981' 
}) => {
  // Define viewbox dimensions. Internal coordinate system.
  const VIEWBOX_WIDTH = 1000; 
  const VIEWBOX_HEIGHT = 100;

  const linePath = getSvgPath(data, VIEWBOX_WIDTH, VIEWBOX_HEIGHT);
  
  // Create a polygon path for the area fill by connecting end points back to base
  const areaFillPath = `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`;

  return (
    <div className="stats-line-chart-wrapper">
      <svg 
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} 
        className="stats-line-chart"
        preserveAspectRatio="none" // Stretches to container width
      >
        {/* Area fill under line */}
        <path 
          d={areaFillPath} 
          className="chart-area-fill" 
          style={{ fill: color.replace('rgb', 'rgba').replace(')', ', 0.1)') }} // fallback
        />
        {/* The main line */}
        <path 
          d={linePath} 
          className="chart-line" 
          style={{ stroke: color }}
        />
      </svg>
      
      {/* X-Axis Labels (Assuming 4-hour blocks over 24 hours for now) */}
      <div className="chart-labels">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
};