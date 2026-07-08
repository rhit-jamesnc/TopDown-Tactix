import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SmoothLineChartProps } from '../../../../../shared/types/props';
import './GameStatisticsModal.css';

export const SmoothLineChart: React.FC<SmoothLineChartProps> = ({ 
  data, 
  color = '#10B981' 
}) => {
    
    const { t } = useTranslation();

    const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: number, time: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!data || !Array.isArray(data)) {
        return null; 
    }

    const VIEWBOX_WIDTH = 1000;
    const VIEWBOX_HEIGHT = 100;

    const getSvgPath = (points: number[], width: number, height: number): string => {
        const n = points.length;
        if (n < 2) return '';
        const stepX = width / (n - 1);
        const getY = (value: number) => height - (value / 100) * height;
        let path = `M 0 ${getY(points[0])}`;
        for (let i = 0; i < n - 1; i++) {
        const x0 = i * stepX;
        const y0 = getY(points[i]);
        const x1 = (i + 1) * stepX;
        const y1 = getY(points[i + 1]);
        path += ` C ${x0 + stepX / 2} ${y0}, ${x0 + stepX / 2} ${y1}, ${x1} ${y1}`;
        }
        return path;
    };

    const linePath = getSvgPath(data, VIEWBOX_WIDTH, VIEWBOX_HEIGHT);
    const areaFillPath = `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`;
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        let relX = (e.clientX - rect.left) / rect.width;
        relX = Math.max(0, Math.min(1, relX)); // Clamp between 0 and 1
        
        const index = Math.round(relX * (data.length - 1));
        const value = data[index];
        
        const x = relX * VIEWBOX_WIDTH;
        const y = VIEWBOX_HEIGHT - (value / 100) * VIEWBOX_HEIGHT;
        
        const hoursAgo = (data.length - 1) - index;
        const date = new Date();
        date.setHours(date.getHours() - hoursAgo);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setHoveredPoint({ 
            x: x,
            y: y, 
            value, 
            time: timeString 
        });
    };

    return (
        <div 
        className="stats-line-chart-wrapper" 
        ref={containerRef} 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
        style={{ position: 'relative' }}
        >
            <svg 
                viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} 
                className="stats-line-chart"
                preserveAspectRatio="none"
            >
                {[25, 50, 75].map((yVal) => (
                    <line
                        key={`h-line-${yVal}`}
                        x1="0"
                        y1={VIEWBOX_HEIGHT - yVal}
                        x2={VIEWBOX_WIDTH}
                        y2={VIEWBOX_HEIGHT - yVal}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                {[0.25, 0.5, 0.75].map((xRatio) => (
                    <line
                        key={`v-line-${xRatio}`}
                        x1={xRatio * VIEWBOX_WIDTH}
                        y1="0"
                        x2={xRatio * VIEWBOX_WIDTH}
                        y2={VIEWBOX_HEIGHT}
                        stroke="#374151"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                <path 
                d={areaFillPath} 
                className="chart-area-fill" 
                style={{ fill: color.replace('rgb', 'rgba').replace(')', ', 0.1)') }}
                />
                
                <path 
                d={linePath} 
                className="chart-line" 
                style={{ stroke: color }}
                />

                {hoveredPoint && (
                    <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="15" fill={color} fillOpacity="0.3" />
                )}
            </svg>

            <div className="chart-labels">
                <span>{t('24h ago')}</span>
                <span>{t('12h ago')}</span>
                <span>{t('Now')}</span>
            </div>
        
            {hoveredPoint && (
                <div className="chart-tooltip" style={{ 
                        left: `${(hoveredPoint.x / VIEWBOX_WIDTH) * 100}%`,
                        top: `${(hoveredPoint.y / VIEWBOX_HEIGHT) * 100}%`
                    }}>
                    {hoveredPoint.time} - {hoveredPoint.value}% {t('Activity')}
                </div>
            )}
        </div>
    );
};