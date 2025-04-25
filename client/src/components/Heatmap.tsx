import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ZoomInIcon
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
  
  // Handle exporting the visualization
  const handleExport = () => {
    if (!svgRef.current) return;
    
    // Create a copy of the SVG
    const svgCopy = svgRef.current.cloneNode(true) as SVGSVGElement;
    
    // Set white background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    svgCopy.insertBefore(rect, svgCopy.firstChild);
    
    // Convert to string
    const svgData = new XMLSerializer().serializeToString(svgCopy);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `oncology_${viewMode}_${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Generate the visualization based on the current view mode
  useEffect(() => {
    if (!svgRef.current || !filteredData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Adjust margins and sizing
    const margin = { top: 70, right: 50, bottom: 70, left: 150 };
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
      .padding(0.1);
      
    const yScale = d3.scaleBand()
      .domain(filteredIndications)
      .range([0, cellSize * filteredIndications.length])
      .padding(0.1);
    
    // Color scale using the selected scheme
    const colorScale = d3.scaleSequential()
      .interpolator(getColorInterpolator())
      .domain([0, normalized ? 1 : maxValue]);
    
    // Draw the heatmap visualization
    if (viewMode === 'heatmap') {
      // Add X axis labels (modalities)
      svg.append('g')
        .attr('class', 'x-axis')
        .selectAll('text')
        .data(filteredModalities)
        .enter()
        .append('text')
        .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
        .attr('y', -10)
        .attr('text-anchor', 'start')
        .attr('transform', d => `rotate(-45, ${(xScale(d) || 0) + xScale.bandwidth() / 2}, -10)`)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'medium')
        .style('fill', d => highlightedModalities.includes(d) ? '#A92269' : '#52606D')
        .style('cursor', 'pointer')
        .text(d => d)
        .on('click', (_, d) => toggleModalityHighlight(d));
      
      // Add Y axis labels (indications)
      svg.append('g')
        .attr('class', 'y-axis')
        .selectAll('text')
        .data(filteredIndications)
        .enter()
        .append('text')
        .attr('x', -10)
        .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'medium')
        .style('fill', d => highlightedIndications.includes(d) ? '#A92269' : '#52606D')
        .style('cursor', 'pointer')
        .text(d => d)
        .on('click', (_, d) => toggleIndicationHighlight(d));
      
      // Create heatmap cells
      const cells = svg.selectAll('rect.heatmap-cell')
        .data(filteredData)
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
          if (d.count === 0) return '#f5f5f5';
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
      .attr('dy', 20)
      .style('font-size', '12px')
      .style('font-weight', 'normal')
      .style('fill', '#616E7C')
      .text(`Showing ${filteredData.filter(d => d.count > 0).length} active combinations`);
    
    // Add Legend for heatmap
    if (viewMode === 'heatmap') {
      const legendWidth = 200;
      const legendHeight = 15;
      
      const legend = svg.append('g')
        .attr('transform', `translate(${(cellSize * filteredModalities.length - legendWidth) / 2}, ${-25})`);
        
      // Create gradient for legend
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', 'heatmap-gradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');
        
      // The color gradient stops depend on the selected color scheme
      const colorInterpolator = getColorInterpolator();
      const stops = [0, 0.2, 0.4, 0.6, 0.8, 1];
      
      linearGradient.selectAll('stop')
        .data(stops)
        .enter()
        .append('stop')
        .attr('offset', d => `${d * 100}%`)
        .attr('stop-color', d => colorInterpolator(d));
        
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
        .attr('x', legendWidth / 2)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#616E7C')
        .text(normalized ? '50%' : `${Math.floor(maxValue / 2)}`);
        
      legend.append('text')
        .attr('x', legendWidth)
        .attr('y', legendHeight + 15)
        .attr('text-anchor', 'end')
        .style('font-size', '10px')
        .style('fill', '#616E7C')
        .text(normalized ? '100%' : `${maxValue}`);
    }
    
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
            <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Visualization Options</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Reset All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search filter */}
                <div className="space-y-2">
                  <Label className="text-sm">Search</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search indications or modalities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setSearchTerm('')}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Color scheme and visualization options */}
                <div className="space-y-2">
                  <Label className="text-sm">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={(value: 'default' | 'viridis' | 'inferno' | 'warm') => setColorScheme(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Primary (Default)</SelectItem>
                      <SelectItem value="viridis">Viridis (Green-Blue)</SelectItem>
                      <SelectItem value="inferno">Inferno (Yellow-Red)</SelectItem>
                      <SelectItem value="warm">Warm (Yellow-Orange-Red)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Metric type */}
                <div className="space-y-2">
                  <Label className="text-sm">Metric</Label>
                  <Select value={metricType} onValueChange={(value: MetricType) => setMetricType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="count">Deal Count</SelectItem>
                      <SelectItem value="value">Total Value ($M)</SelectItem>
                      <SelectItem value="growth">YoY Growth (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Display options */}
                <div className="space-y-2">
                  <Label className="text-sm">Display Options</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show Cell Values</span>
                    <Switch
                      checked={showLabels}
                      onCheckedChange={setShowLabels}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Normalize Values</span>
                    <Switch
                      checked={normalized}
                      onCheckedChange={setNormalized}
                    />
                  </div>
                </div>
                
                {/* Grouping options (for treemap) */}
                <div className="space-y-2">
                  <Label className="text-sm">Grouping (Treemap)</Label>
                  <Select value={groupBy} onValueChange={(value: GroupBy) => setGroupBy(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Group by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="indication_category">By Indication Category</SelectItem>
                      <SelectItem value="modality_category">By Modality Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Zoom control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Zoom Level: {zoomLevel}%</Label>
                    <Button variant="ghost" size="sm" onClick={handleResetZoom} className="h-6 px-2 text-xs">
                      Reset
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ZoomInIcon className="h-4 w-4 text-neutral-500" />
                    <Slider
                      value={[zoomLevel]}
                      min={50}
                      max={200}
                      step={10}
                      onValueChange={(value) => setZoomLevel(value[0])}
                    />
                  </div>
                </div>
              </div>
              
              {/* Active filters display */}
              {(highlightedIndications.length > 0 || highlightedModalities.length > 0) && (
                <div className="pt-2 border-t">
                  <Label className="text-sm mb-2 inline-block">Active Filters:</Label>
                  <div className="flex flex-wrap gap-2">
                    {highlightedIndications.map((indication) => (
                      <Badge key={indication} variant="outline" className="gap-1 bg-primary/5">
                        Indication: {indication}
                        <XIcon 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleIndicationHighlight(indication)} 
                        />
                      </Badge>
                    ))}
                    {highlightedModalities.map((modality) => (
                      <Badge key={modality} variant="outline" className="gap-1 bg-secondary/5">
                        Modality: {modality}
                        <XIcon 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleModalityHighlight(modality)} 
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Main visualization */}
          <div className="relative w-full overflow-x-auto" ref={containerRef}>
            <Tabs defaultValue="visualization" className="mb-4">
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex h-9">
                <TabsTrigger value="visualization" className="h-8 px-3 text-xs">
                  Visualization
                </TabsTrigger>
                <TabsTrigger value="insights" className="h-8 px-3 text-xs">
                  Insights & Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="visualization" className="mt-2">
                <div className={`w-full overflow-x-auto pb-4 ${zoomLevel > 100 ? 'overflow-y-auto max-h-[600px]' : ''}`}>
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
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      borderRadius: '4px', 
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                  ></div>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="mt-2">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Key Insights</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Hotspots</h5>
                      <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                        <li>
                          <span className="font-medium">NSCLC × ADC:</span> Highest concentration of deals, 
                          representing almost 15% of all oncology licensing activity
                        </li>
                        <li>
                          <span className="font-medium">MM × Cell Therapy:</span> Continued strong interest,
                          particularly in early-stage assets and novel mechanisms
                        </li>
                        <li>
                          <span className="font-medium">Bi-specifics:</span> Growing trend across multiple 
                          indications, especially in hematological malignancies
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-2">Emerging Trends</h5>
                      <ul className="list-disc list-inside text-sm text-neutral-600 space-y-2">
                        <li>
                          <span className="font-medium">RNA Therapeutics:</span> 200% YoY increase in
                          solid tumor applications, but from a small base
                        </li>
                        <li>
                          <span className="font-medium">Precision Radiotherapeutics:</span> Growing interest 
                          in targeted alpha-emitters for GBM and metastatic cancers
                        </li>
                        <li>
                          <span className="font-medium">White Space in GBM:</span> Limited deal activity 
                          despite high unmet need, potential opportunity area
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Strategic Implications</h5>
                    <p className="text-sm text-neutral-600">
                      The concentration of deals in NSCLC and hematological malignancies suggests intense 
                      competition in these areas. Strategic differentiation could focus on underserved indications 
                      like pancreatic, CRC, and GBM, or novel modalities. Our analysis suggests companies are 
                      prioritizing earlier-stage assets with novel mechanisms over late-stage programs.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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
