import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TimelineDataPoint } from '@/lib/types';

interface TimelineChartProps {
  data: TimelineDataPoint[];
  title: string;
}

export default function TimelineChart({ data, title }: TimelineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'YTD' | '12M'>('12M');
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // X scale - using band scale for months
    const x = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);
    
    // Y scale
    const maxCount = d3.max(data, d => d.count) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxCount * 1.2]) // Adding 20% padding at the top
      .range([innerHeight, 0]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#616E7C');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toString()))
      .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#616E7C');
    
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(5))
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => y(d))
      .attr('y2', d => y(d))
      .attr('stroke', '#E4E7EB')
      .attr('stroke-width', 1);
    
    // Create a gradient for the area
    const areaGradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'areaGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    
    areaGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#A92269')
      .attr('stop-opacity', 0.7);
    
    areaGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#A92269')
      .attr('stop-opacity', 0.1);
    
    // Add the area
    const areaGenerator = d3.area<TimelineDataPoint>()
      .x(d => (x(d.month) || 0) + (x.bandwidth() / 2))
      .y0(innerHeight)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX);
      
    svg.append('path')
      .datum(data)
      .attr('fill', 'url(#areaGradient)')
      .attr('d', areaGenerator);
    
    // Add the line
    const lineGenerator = d3.line<TimelineDataPoint>()
      .x(d => (x(d.month) || 0) + (x.bandwidth() / 2))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);
      
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#A92269')
      .attr('stroke-width', 3)
      .attr('d', lineGenerator);
    
    // Add the dots for actual data points
    const dots = svg.selectAll('.dot')
      .data(data.filter(d => d.count > 0))
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', d => (x(d.month) || 0) + (x.bandwidth() / 2))
      .attr('cy', d => y(d.count))
      .attr('r', 5)
      .attr('fill', '#A92269')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);
    
    // Add interactivity with tooltip
    dots.on('mouseover', function(event, d) {
      const circle = d3.select(this);
      circle.attr('r', 7).attr('stroke-width', 3);
      
      const tooltip = d3.select(tooltipRef.current);
      tooltip.style('opacity', 1)
        .html(`${d.month} 2025: <b>${d.count} deals</b>`)
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 20}px`);
    })
    .on('mouseout', function() {
      const circle = d3.select(this);
      circle.attr('r', 5).attr('stroke-width', 2);
      
      const tooltip = d3.select(tooltipRef.current);
      tooltip.style('opacity', 0);
    });
    
    // Add projected line for future months
    const projectedData = data.filter(d => d.count === 0);
    if (projectedData.length > 0) {
      const realData = data.filter(d => d.count > 0);
      if (realData.length > 0) {
        const lastRealData = realData[realData.length - 1];
        const projectedStartX = (x(lastRealData.month) || 0) + (x.bandwidth() / 2);
        const projectedStartY = y(lastRealData.count);
        
        const projectedLine = d3.line<TimelineDataPoint>()
          .x(d => (x(d.month) || 0) + (x.bandwidth() / 2))
          .y(() => projectedStartY)
          .curve(d3.curveMonotoneX);
          
        svg.append('path')
          .datum(projectedData)
          .attr('fill', 'none')
          .attr('stroke', '#A92269')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('d', projectedLine);
      }
    }
    
  }, [data, filter]);
  
  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary">{title}</h3>
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'YTD' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('YTD')}
            >
              YTD
            </Button>
            <Button 
              variant={filter === '12M' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('12M')}
            >
              Last 12 Months
            </Button>
          </div>
        </div>
        <div className="relative w-full h-[300px]">
          <svg ref={svgRef} className="w-full h-full"></svg>
          <div 
            ref={tooltipRef} 
            className="tooltip" 
            style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}
