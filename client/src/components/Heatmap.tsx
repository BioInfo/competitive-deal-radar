import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { HeatmapCell } from '@/lib/types';

interface HeatmapProps {
  data: HeatmapCell[];
  indications: string[];
  modalities: string[];
  title: string;
  onCellClick: (indication: string, modality: string) => void;
}

export default function Heatmap({ data, indications, modalities, title, onCellClick }: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    const margin = { top: 60, right: 40, bottom: 40, left: 150 };
    const width = svgRef.current.parentElement?.clientWidth || 800;
    const cellSize = Math.min(40, (width - margin.left - margin.right) / modalities.length);
    const height = cellSize * indications.length + margin.top + margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Create scales
    const xScale = d3.scaleBand()
      .domain(modalities)
      .range([0, cellSize * modalities.length])
      .padding(0.05);
      
    const yScale = d3.scaleBand()
      .domain(indications)
      .range([0, cellSize * indications.length])
      .padding(0.05);
      
    // Find max value for color scale
    const maxValue = d3.max(data, d => d.count) || 10;
    
    // Color scale - from light to dark primary color
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolate('rgb(250, 233, 242)', 'rgb(169, 34, 105)'))
      .domain([0, maxValue]);
      
    // Add X axis labels (modalities)
    svg.append('g')
      .attr('transform', `translate(0,${-10})`)
      .selectAll('text')
      .data(modalities)
      .enter()
      .append('text')
      .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr('y', 0)
      .attr('text-anchor', 'start')
      .attr('transform', (d, i) => `rotate(-45, ${(xScale(d) || 0) + xScale.bandwidth() / 2}, 0)`)
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'medium')
      .style('fill', '#52606D')
      .text(d => d);
      
    // Add Y axis labels (indications)
    svg.append('g')
      .selectAll('text')
      .data(indications)
      .enter()
      .append('text')
      .attr('x', -10)
      .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'medium')
      .style('fill', '#52606D')
      .text(d => d);
      
    // Create heatmap cells
    const cells = svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.modality) || 0)
      .attr('y', d => yScale(d.indication) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => d.count > 0 ? colorScale(d.count) : '#f5f5f5')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');
      
    // Add text to cells with values
    svg.selectAll('text.cell-text')
      .data(data.filter(d => d.count > 0))
      .enter()
      .append('text')
      .attr('class', 'cell-text')
      .attr('x', d => (xScale(d.modality) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.indication) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'medium')
      .style('fill', d => d.count > maxValue * 0.7 ? '#fff' : '#52606D')
      .text(d => d.count);
      
    // Add interactivity with tooltip and click
    cells
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#A92269')
          .attr('stroke-width', 3);
        
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('opacity', 1)
          .html(`<b>${d.indication} × ${d.modality}</b><br/>${d.count} deals`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2);
        
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('opacity', 0);
      })
      .on('click', function(_, d) {
        onCellClick(d.indication, d.modality);
      });
      
    // Add title
    svg.append('text')
      .attr('x', (cellSize * modalities.length) / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#323F4B')
      .text('Number of Deals by Indication and Modality');
      
    // Add Legend
    const legendWidth = 200;
    const legendHeight = 15;
    
    const legend = svg.append('g')
      .attr('transform', `translate(${(cellSize * modalities.length - legendWidth) / 2}, ${-25})`);
      
    // Create gradient for legend
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
      
    linearGradient.selectAll('stop')
      .data([
        {offset: '0%', color: 'rgb(250, 233, 242)'},
        {offset: '100%', color: 'rgb(169, 34, 105)'}
      ])
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-color', d => d.color);
      
    // Draw legend rectangle
    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)')
      .attr('rx', 3)
      .attr('ry', 3);
      
    // Add legend labels
    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 15)
      .style('font-size', '10px')
      .style('fill', '#616E7C')
      .text('0');
      
    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 15)
      .attr('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#616E7C')
      .text(maxValue);
      
  }, [data, indications, modalities, onCellClick]);
  
  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">{title}</h3>
        <div className="relative w-full overflow-x-auto">
          <svg 
            ref={svgRef} 
            className="w-full" 
            style={{ minWidth: `${Math.max(800, indications.length * 40 + 200)}px` }}
          ></svg>
          <div 
            ref={tooltipRef} 
            className="tooltip" 
            style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
          ></div>
        </div>
        <p className="text-sm text-neutral-500 mt-4">
          Click on a cell to view deals for that indication-modality combination.
        </p>
      </CardContent>
    </Card>
  );
}
