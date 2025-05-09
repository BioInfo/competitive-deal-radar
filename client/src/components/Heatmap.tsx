import { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { HeatmapCell } from '@/lib/types';
import { 
  DownloadIcon, 
  InfoIcon, 
  FilterIcon, 
  BarChart3Icon, 
  GridIcon, 
  SlidersHorizontal, 
  XIcon, 
  SearchIcon,
  ZoomInIcon,
  TrendingUpIcon,
  FileTextIcon
} from 'lucide-react';

interface HeatmapProps {
  data: HeatmapCell[];
  indications: string[];
  modalities: string[];
  title: string;
  onCellClick: (indication: string, modality: string) => void;
}

type ViewMode = 'heatmap' | 'bubble' | 'treemap';
type GroupBy = 'none' | 'indication_category' | 'modality_category';
type MetricType = 'count' | 'value' | 'growth';

export default function Heatmap({ data, indications, modalities, title, onCellClick }: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for enhanced UI controls
  const [viewMode, setViewMode] = useState<ViewMode>('heatmap');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [metricType, setMetricType] = useState<MetricType>('count');
  const [showLabels, setShowLabels] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState(['2024', '2025']);
  const [valueThreshold, setValueThreshold] = useState([0, 2000]);
  const [highlightedIndications, setHighlightedIndications] = useState<string[]>([]);
  const [highlightedModalities, setHighlightedModalities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [colorScheme, setColorScheme] = useState<'default' | 'viridis' | 'inferno' | 'warm'>('default');
  const [normalized, setNormalized] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Filter the data based on search term and other filters
  const filteredData = data.filter(d => {
    // Apply search filter
    if (searchTerm && !d.indication.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !d.modality.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply highlighted filters
    if (highlightedIndications.length > 0 && !highlightedIndications.includes(d.indication)) {
      return false;
    }
    
    if (highlightedModalities.length > 0 && !highlightedModalities.includes(d.modality)) {
      return false;
    }
    
    return true;
  });
  
  // Filter indications and modalities based on search
  const filteredIndications = searchTerm ? 
    indications.filter(ind => ind.toLowerCase().includes(searchTerm.toLowerCase())) : 
    indications;
  
  const filteredModalities = searchTerm ? 
    modalities.filter(mod => mod.toLowerCase().includes(searchTerm.toLowerCase())) : 
    modalities;
  
  // Reset zoom level
  const handleResetZoom = () => {
    setZoomLevel(100);
  };
  
  // Handle export of data
  const handleExport = () => {
    // Create exportable data
    const exportData = filteredData.map(d => ({
      indication: d.indication,
      modality: d.modality,
      count: d.count,
      metric: metricType === 'value' ? 'Deal Value ($M)' : 
              metricType === 'growth' ? 'YoY Growth (%)' : 'Deal Count'
    }));
    
    // Convert to JSON
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement('a');
    link.href = url;
    link.download = `oncology_heatmap_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL object
    URL.revokeObjectURL(url);
  };
  
  // Toggle highlight for an indication
  const toggleIndicationHighlight = (indication: string) => {
    setHighlightedIndications(prev => {
      if (prev.includes(indication)) {
        return prev.filter(i => i !== indication);
      } else {
        return [...prev, indication];
      }
    });
  };
  
  // Toggle highlight for a modality
  const toggleModalityHighlight = (modality: string) => {
    setHighlightedModalities(prev => {
      if (prev.includes(modality)) {
        return prev.filter(m => m !== modality);
      } else {
        return [...prev, modality];
      }
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setHighlightedIndications([]);
    setHighlightedModalities([]);
    setYearFilter(['2024', '2025']);
    setValueThreshold([0, 2000]);
  };
  
  // Get color interpolator based on selected scheme
  const getColorInterpolator = () => {
    switch (colorScheme) {
      case 'viridis':
        return d3.interpolateViridis;
      case 'inferno':
        return d3.interpolateInferno;
      case 'warm':
        return d3.interpolateWarm;
      default:
        return d3.interpolate('rgb(250, 233, 242)', 'rgb(169, 34, 105)');
    }
  };
  
  
  
  // Generate the visualization based on the current view mode
  useEffect(() => {
    if (!svgRef.current || !filteredData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Adjust margins and sizing - increase top margin to prevent overlap with title
    const margin = { top: 100, right: 50, bottom: 70, left: 150 };
    const width = containerRef.current?.clientWidth || 800;
    const baseWidth = Math.max(width, 800);
    const adjustedWidth = baseWidth * (zoomLevel / 100);
    
    // Calculate cell size based on view mode and available space
    const cellSize = Math.min(
      48, 
      (adjustedWidth - margin.left - margin.right) / filteredModalities.length
    );
    
    // Height calculation depends on the number of indicators
    const height = Math.max(
      400,
      cellSize * filteredIndications.length + margin.top + margin.bottom
    );
    
    // Create SVG with proper dimensions
    const svg = d3.select(svgRef.current)
      .attr('width', adjustedWidth)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Find max value for color scale
    const maxValue = d3.max(filteredData, d => d.count) || 10;
    
    // Create scales for axes
    const xScale = d3.scaleBand()
      .domain(filteredModalities)
      .range([0, cellSize * filteredModalities.length])
      .padding(0.2); // Increased padding for better spacing
      
    const yScale = d3.scaleBand()
      .domain(filteredIndications)
      .range([0, cellSize * filteredIndications.length])
      .padding(0.2); // Increased padding for better spacing
    
    // Color scale using the selected scheme
    const colorScale = d3.scaleSequential()
      .interpolator(getColorInterpolator())
      .domain([0, normalized ? 1 : maxValue]);
    
    // Draw the heatmap visualization
    if (viewMode === 'heatmap') {
      // Create a background for the grid
      svg.append('rect')
        .attr('width', cellSize * filteredModalities.length)
        .attr('height', cellSize * filteredIndications.length)
        .attr('fill', '#f8f9fa')
        .attr('rx', 6)
        .attr('ry', 6);
      
      // Add grid lines for better readability
      svg.selectAll('line.grid-x')
        .data(d3.range(filteredModalities.length + 1))
        .enter()
        .append('line')
        .attr('class', 'grid-x')
        .attr('x1', d => d * cellSize)
        .attr('y1', 0)
        .attr('x2', d => d * cellSize)
        .attr('y2', cellSize * filteredIndications.length)
        .attr('stroke', '#eaeaea')
        .attr('stroke-width', 1);
      
      svg.selectAll('line.grid-y')
        .data(d3.range(filteredIndications.length + 1))
        .enter()
        .append('line')
        .attr('class', 'grid-y')
        .attr('x1', 0)
        .attr('y1', d => d * cellSize)
        .attr('x2', cellSize * filteredModalities.length)
        .attr('y2', d => d * cellSize)
        .attr('stroke', '#eaeaea')
        .attr('stroke-width', 1);
        
      // Add X axis labels (modalities) with improved spacing and readability
      svg.append('g')
        .attr('class', 'x-axis')
        .selectAll('text')
        .data(filteredModalities)
        .enter()
        .append('text')
        .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('y', -15) // Moved further up to avoid overlap
        .attr('transform', d => `rotate(-45, ${(xScale(d) || 0) + xScale.bandwidth() / 2}, -15)`) // Increased rotation angle
        .attr('text-anchor', 'end')
        .style('font-size', '12px') // Slightly larger font
        .style('font-weight', 'medium')
        .style('fill', d => highlightedModalities.includes(d) ? '#A92269' : '#52606D')
        .style('cursor', 'pointer')
        .text(d => d)
        .on('click', (_, d) => toggleModalityHighlight(d));
      
      // Add modality header - positioned higher to avoid overlap
      svg.append('text')
        .attr('x', (cellSize * filteredModalities.length) / 2)
        .attr('y', -60) // Moved higher up
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'medium')
        .style('fill', '#333')
        .text('Modality');
      
      // Add Y axis labels (indications) - with improved positioning
      svg.append('g')
        .attr('class', 'y-axis')
        .selectAll('text')
        .data(filteredIndications)
        .enter()
        .append('text')
        .attr('x', -15) // Move labels left slightly
        .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'medium')
        .style('fill', d => highlightedIndications.includes(d) ? '#A92269' : '#52606D')
        .style('cursor', 'pointer')
        .text(d => d)
        .on('click', (_, d) => toggleIndicationHighlight(d));
        
      // Add indication header
      svg.append('text')
        .attr('x', -80)
        .attr('y', (cellSize * filteredIndications.length) / 2)
        .attr('text-anchor', 'middle')
        .attr('transform', `rotate(-90, -80, ${(cellSize * filteredIndications.length) / 2})`)
        .style('font-size', '14px')
        .style('font-weight', 'medium')
        .style('fill', '#333')
        .text('Indication');
      
      // First create all empty cells for the grid (areas where deals could potentially occur)
      const allPossibleCells: {indication: string, modality: string, count: number}[] = [];
      
      filteredIndications.forEach(indication => {
        filteredModalities.forEach(modality => {
          // Check if this cell exists in the actual data
          const existingCell = filteredData.find(d => 
            d.indication === indication && d.modality === modality
          );
          
          if (existingCell) {
            // Use the existing data
            allPossibleCells.push(existingCell);
          } else {
            // Create an empty cell
            allPossibleCells.push({
              indication,
              modality,
              count: 0
            });
          }
        });
      });
      
      // Create background empty cells with dashed pattern
      const emptyCell = svg.selectAll('rect.empty-cell')
        .data(allPossibleCells.filter(d => d.count === 0))
        .enter()
        .append('rect')
        .attr('class', 'empty-cell')
        .attr('x', d => xScale(d.modality) || 0)
        .attr('y', d => yScale(d.indication) || 0)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', '#fbfbfb')
        .attr('stroke', '#eaeaea')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '2,2')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('fill', '#f5f5f5')
            .attr('stroke', '#d0d0d0')
            .attr('stroke-width', 2);
          
          // Show tooltip for potential opportunity
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 1)
            .html(`
              <div class="p-2 bg-white shadow-lg rounded-lg border">
                <div class="text-sm font-semibold mb-1">${d.indication} × ${d.modality}</div>
                <div class="text-xs text-neutral-600">
                  No deals recorded in this combination
                </div>
                <div class="mt-1 text-xs text-primary">Potential opportunity area</div>
              </div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('fill', '#fbfbfb')
            .attr('stroke', '#eaeaea')
            .attr('stroke-width', 1);
          
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 0);
        })
        .on('click', function(_, d) {
          onCellClick(d.indication, d.modality);
        });
        
      // Create filled cells for actual data
      const cells = svg.selectAll('rect.heatmap-cell')
        .data(allPossibleCells.filter(d => d.count > 0))
        .enter()
        .append('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', d => xScale(d.modality) || 0)
        .attr('y', d => yScale(d.indication) || 0)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', d => {
          const value = normalized ? d.count / maxValue : d.count;
          return colorScale(value);
        })
        .attr('stroke', d => {
          if (highlightedIndications.includes(d.indication) || 
              highlightedModalities.includes(d.modality)) {
            return '#A92269';
          }
          return '#fff';
        })
        .attr('stroke-width', d => {
          if (highlightedIndications.includes(d.indication) || 
              highlightedModalities.includes(d.modality)) {
            return 3;
          }
          return 2;
        })
        .style('cursor', 'pointer');
      
      // Add text to cells if showLabels is true
      if (showLabels) {
        svg.selectAll('text.cell-text')
          .data(filteredData.filter(d => d.count > 0))
          .enter()
          .append('text')
          .attr('class', 'cell-text')
          .attr('x', d => (xScale(d.modality) || 0) + xScale.bandwidth() / 2)
          .attr('y', d => (yScale(d.indication) || 0) + yScale.bandwidth() / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'medium')
          .style('pointer-events', 'none')
          .style('fill', d => {
            const value = normalized ? d.count / maxValue : d.count;
            return value > 0.7 ? '#fff' : '#52606D';
          })
          .text(d => d.count);
      }
      
      // Add color legend on the right side
      const legendWidth = 20;
      const legendHeight = cellSize * filteredIndications.length;
      const legendX = cellSize * filteredModalities.length + 50;
      
      // Create gradient definition
      const defs = svg.append('defs');
      const gradient = defs.append('linearGradient')
        .attr('id', 'color-gradient')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '0%')
        .attr('y2', '100%');
        
      // Add gradient stops
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(normalized ? 1 : maxValue));
      
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', colorScale(normalized ? 0.5 : maxValue/2));
        
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(normalized ? 0 : 0));
        
      // Create legend rect filled with gradient
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', 0)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', 'url(#color-gradient)')
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('stroke', '#eaeaea')
        .attr('stroke-width', 1);
        
      // Add legend title
      svg.append('text')
        .attr('x', legendX + legendWidth / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'medium')
        .style('fill', '#52606D')
        .text('Deal Count');
        
      // Add max value at top
      svg.append('text')
        .attr('x', legendX + legendWidth + 5)
        .attr('y', 10)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', '#52606D')
        .text(maxValue.toString());
        
      // Add mid value
      svg.append('text')
        .attr('x', legendX + legendWidth + 5)
        .attr('y', legendHeight / 2)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', '#52606D')
        .text(Math.floor(maxValue / 2).toString());
        
      // Add min value at bottom
      svg.append('text')
        .attr('x', legendX + legendWidth + 5)
        .attr('y', legendHeight - 5)
        .attr('text-anchor', 'start')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '10px')
        .style('fill', '#52606D')
        .text('0');
      
      // Add interactivity with tooltip and click
      cells
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke', '#A92269')
            .attr('stroke-width', 3);
          
          // Enhanced tooltip with more information
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 1)
            .html(`
              <div class="p-2 bg-white shadow-lg rounded-lg border">
                <div class="text-sm font-semibold mb-1">${d.indication} × ${d.modality}</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>Deals: <span class="font-medium">${d.count}</span></div>
                  <div>% of Total: <span class="font-medium">${((d.count / (d3.sum(filteredData, d => d.count) || 1)) * 100).toFixed(1)}%</span></div>
                </div>
                <div class="mt-1 text-xs text-neutral-500">Click for details</div>
              </div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function(_, d) {
          d3.select(this)
            .attr('stroke', d => {
              if (highlightedIndications.includes(d.indication) || 
                  highlightedModalities.includes(d.modality)) {
                return '#A92269';
              }
              return '#fff';
            })
            .attr('stroke-width', d => {
              if (highlightedIndications.includes(d.indication) || 
                  highlightedModalities.includes(d.modality)) {
                return 3;
              }
              return 2;
            });
          
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 0);
        })
        .on('click', function(_, d) {
          onCellClick(d.indication, d.modality);
        });
    } else if (viewMode === 'bubble') {
      // Create bubble chart
      const bubbleWidth = adjustedWidth - margin.left - margin.right;
      const bubbleHeight = height - margin.top - margin.bottom;
      
      // Pack layout for bubbles
      const pack = d3.pack()
        .size([bubbleWidth, bubbleHeight])
        .padding(3);
      
      // Prepare hierarchical data
      const hierarchyData = {
        name: "root",
        children: filteredData.filter(d => d.count > 0).map(d => ({
          name: `${d.indication}-${d.modality}`,
          indication: d.indication,
          modality: d.modality,
          value: d.count
        }))
      };
      
      const root = d3.hierarchy(hierarchyData)
        .sum(d => (d as any).value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));
      
      // Generate bubble layout
      pack(root);
      
      // Create bubbles
      const bubbles = svg.selectAll('circle.bubble')
        .data(root.leaves())
        .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0)
        .attr('r', d => d.r || 0)
        .attr('fill', d => {
          const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
          return colorScale(value);
        })
        .attr('stroke', d => {
          const data = d.data as any;
          if (highlightedIndications.includes(data.indication) || 
              highlightedModalities.includes(data.modality)) {
            return '#A92269';
          }
          return '#fff';
        })
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');
      
      // Add labels to larger bubbles if showLabels is true
      if (showLabels) {
        svg.selectAll('text.bubble-text')
          .data(root.leaves().filter(d => (d.r || 0) > 15))
          .enter()
          .append('text')
          .attr('class', 'bubble-text')
          .attr('x', d => d.x || 0)
          .attr('y', d => (d.y || 0))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '10px')
          .style('pointer-events', 'none')
          .style('fill', d => {
            const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
            return value > 0.7 ? '#fff' : '#52606D';
          })
          .text(d => {
            const data = d.data as any;
            return `${data.indication.substring(0, 3)}-${data.value}`;
          });
        
        svg.selectAll('text.bubble-subtext')
          .data(root.leaves().filter(d => (d.r || 0) > 25))
          .enter()
          .append('text')
          .attr('class', 'bubble-subtext')
          .attr('x', d => d.x || 0)
          .attr('y', d => (d.y || 0) + 12)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '9px')
          .style('pointer-events', 'none')
          .style('fill', d => {
            const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
            return value > 0.7 ? '#fff' : '#52606D';
          })
          .text(d => {
            const data = d.data as any;
            return data.modality.substring(0, 6);
          });
      }
      
      // Add interactivity
      bubbles
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('stroke', '#A92269')
            .attr('stroke-width', 3);
          
          const data = d.data as any;
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 1)
            .html(`
              <div class="p-2 bg-white shadow-lg rounded-lg border">
                <div class="text-sm font-semibold mb-1">${data.indication} × ${data.modality}</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>Deals: <span class="font-medium">${data.value}</span></div>
                  <div>% of Total: <span class="font-medium">${((data.value / (d3.sum(filteredData, d => d.count) || 1)) * 100).toFixed(1)}%</span></div>
                </div>
                <div class="mt-1 text-xs text-neutral-500">Click for details</div>
              </div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function(_, d) {
          d3.select(this)
            .attr('stroke', d => {
              const data = d.data as any;
              if (highlightedIndications.includes(data.indication) || 
                  highlightedModalities.includes(data.modality)) {
                return '#A92269';
              }
              return '#fff';
            })
            .attr('stroke-width', 2);
          
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 0);
        })
        .on('click', function(_, d) {
          const data = d.data as any;
          onCellClick(data.indication, data.modality);
        });
    } else if (viewMode === 'treemap') {
      // Implement treemap visualization
      const treemapWidth = adjustedWidth - margin.left - margin.right;
      const treemapHeight = height - margin.top - margin.bottom;
      
      // Prepare hierarchical data for treemap
      let hierarchyData: any = { name: "root", children: [] };
      
      if (groupBy === 'indication_category') {
        // Group by indication categories (simplified example)
        const categories: Record<string, any[]> = {};
        
        // Group indications into simplified categories
        filteredData.filter(d => d.count > 0).forEach(d => {
          let category;
          if (d.indication.includes('NSCLC') || d.indication.includes('SCLC')) {
            category = 'Lung Cancer';
          } else if (d.indication.includes('BC') || d.indication.includes('TNBC')) {
            category = 'Breast Cancer';
          } else if (d.indication.includes('CRC')) {
            category = 'Colorectal Cancer';
          } else if (d.indication.includes('MM') || d.indication.includes('AML') || d.indication.includes('NHL')) {
            category = 'Hematological';
          } else {
            category = 'Other Solid Tumors';
          }
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          categories[category].push({
            name: `${d.indication}-${d.modality}`,
            indication: d.indication,
            modality: d.modality,
            value: d.count
          });
        });
        
        hierarchyData.children = Object.entries(categories).map(([category, items]) => ({
          name: category,
          children: items
        }));
      } else if (groupBy === 'modality_category') {
        // Group by modality categories (simplified example)
        const categories: Record<string, any[]> = {};
        
        filteredData.filter(d => d.count > 0).forEach(d => {
          let category;
          if (d.modality.includes('mAb')) {
            category = 'Antibodies';
          } else if (d.modality.includes('ADC')) {
            category = 'Antibody-Drug Conjugates';
          } else if (d.modality.includes('Cell') || d.modality.includes('CAR-T')) {
            category = 'Cell Therapies';
          } else if (d.modality.includes('RNA') || d.modality.includes('DNA')) {
            category = 'Genetic Medicines';
          } else {
            category = 'Other Modalities';
          }
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          categories[category].push({
            name: `${d.indication}-${d.modality}`,
            indication: d.indication,
            modality: d.modality,
            value: d.count
          });
        });
        
        hierarchyData.children = Object.entries(categories).map(([category, items]) => ({
          name: category,
          children: items
        }));
      } else {
        // No grouping, flat treemap
        hierarchyData.children = filteredData.filter(d => d.count > 0).map(d => ({
          name: `${d.indication}-${d.modality}`,
          indication: d.indication,
          modality: d.modality,
          value: d.count
        }));
      }
      
      // Generate treemap layout
      const root = d3.hierarchy(hierarchyData)
        .sum(d => (d as any).value || 0)
        .sort((a, b) => (b.value || 0) - (a.value || 0));
      
      const treemap = d3.treemap()
        .size([treemapWidth, treemapHeight])
        .paddingTop(groupBy !== 'none' ? 20 : 4)
        .paddingInner(4)
        .round(true);
      
      treemap(root);
      
      // Draw treemap cells
      const cells = svg.selectAll('g.treemap-cell')
        .data(root.descendants().filter(d => d.depth > 0))
        .enter()
        .append('g')
        .attr('class', 'treemap-cell')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);
      
      cells.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => {
          if (d.depth === 1 && groupBy !== 'none') {
            return d3.schemeCategory10[d.parent?.children?.indexOf(d) % 10 || 0];
          }
          
          const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
          return colorScale(value);
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('cursor', d => d.depth > 1 || groupBy === 'none' ? 'pointer' : 'default');
      
      // Add labels for categories
      cells.filter(d => d.depth === 1 && groupBy !== 'none')
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('font-weight', 'bold')
        .attr('font-size', '12px')
        .attr('fill', '#fff')
        .text(d => (d.data as any).name);
      
      // Add labels for cells if they're big enough
      if (showLabels) {
        cells.filter(d => {
          const width = d.x1 - d.x0;
          const height = d.y1 - d.y0;
          return (width > 60 && height > 30) || (d.depth === 2 && width > 40 && height > 25);
        })
        .append('text')
        .attr('x', 4)
        .attr('y', d => d.depth === 1 && groupBy !== 'none' ? 35 : 14)
        .attr('font-size', '10px')
        .attr('fill', d => {
          if (d.depth === 1 && groupBy !== 'none') return '#fff';
          const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
          return value > 0.7 ? '#fff' : '#52606D';
        })
        .text(d => {
          if (d.depth === 1 && groupBy !== 'none') return '';
          const data = d.data as any;
          if (data.indication && data.modality) {
            return `${data.indication}`;
          }
          return data.name;
        });
        
        cells.filter(d => {
          const width = d.x1 - d.x0;
          const height = d.y1 - d.y0;
          return (width > 60 && height > 50) || (d.depth === 2 && width > 40 && height > 40);
        })
        .append('text')
        .attr('x', 4)
        .attr('y', d => d.depth === 1 && groupBy !== 'none' ? 55 : 30)
        .attr('font-size', '10px')
        .attr('fill', d => {
          if (d.depth === 1 && groupBy !== 'none') return '#fff';
          const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
          return value > 0.7 ? '#fff' : '#52606D';
        })
        .text(d => {
          const data = d.data as any;
          if (data.modality) {
            return `${data.modality}`;
          }
          return '';
        });
        
        // Add count values
        cells.filter(d => {
          const width = d.x1 - d.x0;
          const height = d.y1 - d.y0;
          return (width > 60 && height > 50) || (d.depth === 2 && width > 40 && height > 40);
        })
        .append('text')
        .attr('x', d => (d.x1 - d.x0) - 20)
        .attr('y', d => (d.y1 - d.y0) - 8)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', d => {
          const value = normalized ? (d.value || 0) / maxValue : (d.value || 0);
          return value > 0.7 ? '#fff' : '#52606D';
        })
        .text(d => d.value);
      }
      
      // Add interactivity
      cells.filter(d => d.depth > 1 || groupBy === 'none')
        .on('mouseover', function(event, d) {
          d3.select(this).select('rect')
            .attr('stroke', '#A92269')
            .attr('stroke-width', 2);
          
          const data = d.data as any;
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 1)
            .html(`
              <div class="p-2 bg-white shadow-lg rounded-lg border">
                <div class="text-sm font-semibold mb-1">${data.indication} × ${data.modality}</div>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>Deals: <span class="font-medium">${data.value}</span></div>
                  <div>% of Total: <span class="font-medium">${((data.value / (d3.sum(filteredData, d => d.count) || 1)) * 100).toFixed(1)}%</span></div>
                </div>
                <div class="mt-1 text-xs text-neutral-500">Click for details</div>
              </div>
            `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          d3.select(this).select('rect')
            .attr('stroke', '#fff')
            .attr('stroke-width', 1);
          
          const tooltip = d3.select(tooltipRef.current);
          tooltip.style('opacity', 0);
        })
        .on('click', function(_, d) {
          const data = d.data as any;
          if (data.indication && data.modality) {
            onCellClick(data.indication, data.modality);
          }
        });
    }
    
    // Add title
    svg.append('text')
      .attr('x', (cellSize * filteredModalities.length) / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#323F4B')
      .text(`${title} (${metricType === 'count' ? 'Deal Count' : 
        metricType === 'value' ? 'Total Value ($M)' : 'YoY Growth'})`)
      .append('tspan')
      .attr('x', (cellSize * filteredModalities.length) / 2)
      .attr('y', -35) // Repositioned to avoid overlap
      .style('font-size', '12px')
      .style('font-weight', 'normal')
      .style('fill', '#616E7C')
      .text(`Showing ${filteredData.filter(d => d.count > 0).length} active combinations`);
    
    // Removed redundant top legend - keeping only the right side legend
    
  }, [
    filteredData, filteredIndications, filteredModalities, 
    viewMode, groupBy, showLabels, colorScheme, normalized, 
    highlightedIndications, highlightedModalities, zoomLevel,
    metricType, onCellClick
  ]);
  
  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Header area with title and controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-lg font-semibold text-secondary">{title}</h3>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1"
              >
                <FilterIcon className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="View Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heatmap">
                    <div className="flex items-center gap-2">
                      <GridIcon className="h-4 w-4" />
                      <span>Heatmap</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bubble">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <span>Bubble</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="treemap">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <span>Treemap</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleExport}
                title="Export Visualization"
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline" size="icon">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="space-y-2">
                    <h4 className="font-medium">Visualization Guide</h4>
                    <p className="text-sm text-neutral-600">
                      This visualization shows deal activity across indications and modalities.
                    </p>
                    <p className="text-sm text-neutral-600">
                      • <span className="font-medium">Heatmap</span>: Grid view showing concentration of deals<br/>
                      • <span className="font-medium">Bubble</span>: Size represents deal volume<br/>
                      • <span className="font-medium">Treemap</span>: Hierarchical view with optional grouping
                    </p>
                    <p className="text-sm text-neutral-600">
                      Click on any cell to explore deals for that combination.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
          
          {/* Filters area */}
          {showFilters && (
            <div className="bg-neutral-50 p-3 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold text-secondary">Visualization Controls</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
                  Reset Filters
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* View mode */}
                <div>
                  <Label className="text-xs mb-1 text-neutral-500">View Type</Label>
                  <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="View Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heatmap">
                        <div className="flex items-center gap-2">
                          <GridIcon className="h-4 w-4" />
                          <span>Heatmap</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bubble">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                          <span>Bubble</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="treemap">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <rect x="3" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <rect x="13" y="3" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <rect x="3" y="13" width="8" height="8" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                          <span>Treemap</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Color scheme */}
                <div>
                  <Label className="text-xs mb-1 text-neutral-500">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={(value: 'default' | 'viridis' | 'inferno' | 'warm') => setColorScheme(value)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Primary (Default)</SelectItem>
                      <SelectItem value="viridis">Viridis (Green-Blue)</SelectItem>
                      <SelectItem value="inferno">Inferno (Yellow-Red)</SelectItem>
                      <SelectItem value="warm">Warm (Yellow-Red-Orange)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Metric type */}
                <div>
                  <Label className="text-xs mb-1 text-neutral-500">Metric</Label>
                  <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Deal Count</SelectItem>
                      <SelectItem value="value">Total Value ($M)</SelectItem>
                      <SelectItem value="growth">YoY Growth (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Grouping (only for treemap) */}
                <div>
                  <Label className="text-xs mb-1 text-neutral-500">Grouping (Treemap)</Label>
                  <Select 
                    value={groupBy} 
                    onValueChange={(value: GroupBy) => setGroupBy(value)}
                    disabled={viewMode !== 'treemap'}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Group by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="indication_category">By Indication</SelectItem>
                      <SelectItem value="modality_category">By Modality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {/* Search filter */}
                <div>
                  <Label className="text-xs mb-1 text-neutral-500">Search</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Filter by indication or modality..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-8"
                        onClick={() => setSearchTerm('')}
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Quick options */}
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-labels"
                      checked={showLabels}
                      onCheckedChange={setShowLabels}
                      className="h-4 w-7 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="show-labels" className="text-xs">Show Values</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="normalize"
                      checked={normalized}
                      onCheckedChange={setNormalized}
                      className="h-4 w-7 data-[state=checked]:bg-primary"
                    />
                    <Label htmlFor="normalize" className="text-xs">Normalize</Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs whitespace-nowrap">Zoom: {zoomLevel}%</Label>
                    <Slider
                      value={[zoomLevel]}
                      min={50}
                      max={200}
                      step={10}
                      onValueChange={(value) => setZoomLevel(value[0])}
                      className="w-24 h-4"
                    />
                    <Button variant="ghost" size="sm" onClick={handleResetZoom} className="h-6 w-6 p-0">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3h18v18H3z" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Active filters display */}
              {(highlightedIndications.length > 0 || highlightedModalities.length > 0) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-neutral-200">
                  <div className="text-xs text-neutral-500 mr-1 pt-1">Active Filters:</div>
                  {highlightedIndications.map((indication) => (
                    <Badge key={indication} variant="outline" className="h-6 gap-1 bg-primary/5 rounded-full px-2 py-0 text-xs">
                      {indication}
                      <XIcon 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleIndicationHighlight(indication)} 
                      />
                    </Badge>
                  ))}
                  {highlightedModalities.map((modality) => (
                    <Badge key={modality} variant="outline" className="h-6 gap-1 bg-secondary/5 rounded-full px-2 py-0 text-xs">
                      {modality}
                      <XIcon 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleModalityHighlight(modality)} 
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Main visualization */}
          <div className="relative w-full overflow-x-auto" ref={containerRef}>
            <div className="flex items-center border-b mb-3">
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-7 text-xs rounded-none border-b-2 border-primary">
                  Visualization
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs rounded-none hover:text-primary"
                  onClick={handleExport}
                >
                  <DownloadIcon className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
            
            <div className={`w-full overflow-x-auto pb-2 ${zoomLevel > 100 ? 'overflow-y-auto max-h-[600px]' : ''}`}>
              <svg 
                ref={svgRef} 
                className="w-full"
                style={{ 
                  minWidth: viewMode === 'heatmap' ? 
                    `${Math.max(800, filteredIndications.length * 40 + 200)}px` : 
                    '800px'
                }}
              ></svg>
              <div 
                ref={tooltipRef} 
                className="tooltip z-50" 
                style={{ 
                  opacity: 0, 
                  position: 'absolute', 
                  pointerEvents: 'none',
                  backgroundColor: 'white', 
                  borderRadius: '6px', 
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #eaeaea'
                }}
              ></div>
            </div>
            
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">
                    1
                  </div>
                  <h5 className="text-sm font-medium">Key Hotspots</h5>
                </div>
                <ul className="list-none text-xs text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                    <div>
                      <span className="font-medium">NSCLC × ADC:</span> 15% of all oncology deals, highest concentration
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                    <div>
                      <span className="font-medium">MM × Cell Therapy:</span> Strong interest in novel mechanisms
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                    <div>
                      <span className="font-medium">Bispecifics:</span> Growing trend across hematological malignancies
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center text-white text-[10px]">
                    2
                  </div>
                  <h5 className="text-sm font-medium">Emerging Trends</h5>
                </div>
                <ul className="list-none text-xs text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <span className="font-medium">RNA Therapeutics:</span> 200% YoY increase in solid tumors
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <span className="font-medium">Radiopharmaceuticals:</span> Interest in targeted therapies
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <span className="font-medium">White Space in GBM:</span> Low activity despite high unmet need
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center text-white text-[10px]">
                    3
                  </div>
                  <h5 className="text-sm font-medium">Strategic Implications</h5>
                </div>
                <ul className="list-none text-xs text-neutral-600 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-1.5"></div>
                    <div>
                      <span className="font-medium">High Competition:</span> NSCLC and hematological indications
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-1.5"></div>
                    <div>
                      <span className="font-medium">Differentiation:</span> Focus on underserved tumor types
                    </div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <div className="min-w-[6px] h-[6px] rounded-full bg-accent mt-1.5"></div>
                    <div>
                      <span className="font-medium">Early Stage:</span> Companies favoring novel mechanisms
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500">
            Click on a cell to view deals for that indication-modality combination.
            Click on axis labels to highlight specific indications or modalities.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
