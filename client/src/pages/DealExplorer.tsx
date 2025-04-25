import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search as SearchIcon,
  X as XIcon,
  SlidersHorizontal as SlidersIcon,
  ChevronDown as ChevronDownIcon
} from 'lucide-react';
import DealTable from '@/components/DealTable';
import DealModal from '@/components/DealModal';
import { Deal, DealFilters } from '@/lib/types';
import dealsData from '@/data/deals.json';
import indicationsData from '@/data/indications.json';
import modalitiesData from '@/data/modalities.json';

export default function DealExplorer() {
  const deals = dealsData as Deal[];
  
  // Get unique values for filter options
  const stages = Array.from(new Set(deals.map(deal => deal.stage)));
  const companies = Array.from(new Set(deals.flatMap(deal => [deal.companyA, deal.companyB])));
  
  // Find max total value for slider
  const maxTotalValue = Math.max(...deals.map(deal => deal.total));
  
  // State for filters
  const [filters, setFilters] = useState<DealFilters>({
    indication: [],
    modality: [],
    stage: [],
    valueRange: [0, maxTotalValue],
    dateRange: ['2024-01-01', '2025-12-31'],
    companies: []
  });
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for mobile filter sidebar
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // State for selected deal modal
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filtered deals based on current filters
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>(deals);
  
  // Apply filters
  useEffect(() => {
    let results = [...deals];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(deal => 
        deal.id.toLowerCase().includes(term) || 
        deal.companyA.toLowerCase().includes(term) || 
        deal.companyB.toLowerCase().includes(term) || 
        deal.asset.toLowerCase().includes(term) || 
        deal.indication.toLowerCase().includes(term) || 
        deal.modality.toLowerCase().includes(term)
      );
    }
    
    // Apply indication filter
    if (filters.indication.length > 0) {
      results = results.filter(deal => filters.indication.includes(deal.indication));
    }
    
    // Apply modality filter
    if (filters.modality.length > 0) {
      results = results.filter(deal => filters.modality.includes(deal.modality));
    }
    
    // Apply stage filter
    if (filters.stage.length > 0) {
      results = results.filter(deal => filters.stage.includes(deal.stage));
    }
    
    // Apply value range filter
    results = results.filter(deal => 
      deal.total >= filters.valueRange[0] && deal.total <= filters.valueRange[1]
    );
    
    // Apply date range filter
    results = results.filter(deal => 
      deal.date >= filters.dateRange[0] && deal.date <= filters.dateRange[1]
    );
    
    // Apply companies filter
    if (filters.companies.length > 0) {
      results = results.filter(deal => 
        filters.companies.includes(deal.companyA) || filters.companies.includes(deal.companyB)
      );
    }
    
    setFilteredDeals(results);
  }, [deals, filters, searchTerm]);
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      indication: [],
      modality: [],
      stage: [],
      valueRange: [0, maxTotalValue],
      dateRange: ['2024-01-01', '2025-12-31'],
      companies: []
    });
    setSearchTerm('');
  };
  
  // Toggle filter for checkbox-based filters
  const toggleFilter = (filterType: 'indication' | 'modality' | 'stage' | 'companies', value: string) => {
    setFilters(prev => {
      const currentValues = [...prev[filterType]];
      const index = currentValues.indexOf(value);
      
      if (index === -1) {
        currentValues.push(value);
      } else {
        currentValues.splice(index, 1);
      }
      
      return {
        ...prev,
        [filterType]: currentValues
      };
    });
  };
  
  // Handle deal row click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">Deal Explorer</h2>
        <div className="md:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center"
          >
            <SlidersIcon className="h-4 w-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col-reverse md:flex-row gap-6">
        {/* Filter Sidebar - Desktop */}
        <Card className="w-full md:w-64 shadow hidden md:block">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-secondary">Filters</h3>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="h-8 px-2">
                Reset
              </Button>
            </div>
            
            {/* Indication Filter */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Indication</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {indicationsData.map(indication => (
                  <div key={indication.id} className="flex items-center">
                    <Checkbox 
                      id={`indication-${indication.id}`}
                      checked={filters.indication.includes(indication.name)}
                      onCheckedChange={() => toggleFilter('indication', indication.name)}
                    />
                    <label 
                      htmlFor={`indication-${indication.id}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {indication.name} ({indication.fullName})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Modality Filter */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Modality</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {modalitiesData.map(modality => (
                  <div key={modality.id} className="flex items-center">
                    <Checkbox 
                      id={`modality-${modality.id}`}
                      checked={filters.modality.includes(modality.name)}
                      onCheckedChange={() => toggleFilter('modality', modality.name)}
                    />
                    <label 
                      htmlFor={`modality-${modality.id}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {modality.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Stage Filter */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Development Stage</Label>
              <div className="space-y-2">
                {stages.map((stage, index) => (
                  <div key={index} className="flex items-center">
                    <Checkbox 
                      id={`stage-${index}`}
                      checked={filters.stage.includes(stage)}
                      onCheckedChange={() => toggleFilter('stage', stage)}
                    />
                    <label 
                      htmlFor={`stage-${index}`}
                      className="ml-2 text-sm cursor-pointer"
                    >
                      {stage}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Deal Value Filter */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Deal Value ($M): {filters.valueRange[0]} - {filters.valueRange[1]}
              </Label>
              <Slider
                defaultValue={[0, maxTotalValue]}
                min={0}
                max={maxTotalValue}
                step={100}
                value={filters.valueRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, valueRange: value as [number, number] }))}
                className="my-4"
              />
            </div>
            
            {/* Companies Filter */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Companies</Label>
              <Select
                value=""
                onValueChange={(value) => toggleFilter('companies', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company, index) => (
                      <SelectItem key={index} value={company}>{company}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.companies.map((company, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {company}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleFilter('companies', company)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Filter Sidebar - Mobile */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
            <div className="bg-white h-full w-80 max-w-full p-4 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-secondary">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMobileFilters(false)}
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Same filter content as desktop */}
              {/* Indication Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Indication</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {indicationsData.map(indication => (
                    <div key={indication.id} className="flex items-center">
                      <Checkbox 
                        id={`mobile-indication-${indication.id}`}
                        checked={filters.indication.includes(indication.name)}
                        onCheckedChange={() => toggleFilter('indication', indication.name)}
                      />
                      <label 
                        htmlFor={`mobile-indication-${indication.id}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {indication.name} ({indication.fullName})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Modality Filter */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Modality</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {modalitiesData.map(modality => (
                    <div key={modality.id} className="flex items-center">
                      <Checkbox 
                        id={`mobile-modality-${modality.id}`}
                        checked={filters.modality.includes(modality.name)}
                        onCheckedChange={() => toggleFilter('modality', modality.name)}
                      />
                      <label 
                        htmlFor={`mobile-modality-${modality.id}`}
                        className="ml-2 text-sm cursor-pointer"
                      >
                        {modality.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Other filters */}
              
              <div className="flex space-x-2 mt-6">
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setShowMobileFilters(false);
                  }}
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <Input
                placeholder="Search deals, companies, assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchTerm('')}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Active Filters */}
          {(filters.indication.length > 0 || 
            filters.modality.length > 0 || 
            filters.stage.length > 0 || 
            filters.companies.length > 0) && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {filters.indication.map((indication, index) => (
                  <Badge key={`ind-${index}`} variant="outline" className="gap-1">
                    Indication: {indication}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleFilter('indication', indication)} 
                    />
                  </Badge>
                ))}
                {filters.modality.map((modality, index) => (
                  <Badge key={`mod-${index}`} variant="outline" className="gap-1">
                    Modality: {modality}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleFilter('modality', modality)} 
                    />
                  </Badge>
                ))}
                {filters.stage.map((stage, index) => (
                  <Badge key={`stage-${index}`} variant="outline" className="gap-1">
                    Stage: {stage}
                    <XIcon 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => toggleFilter('stage', stage)} 
                    />
                  </Badge>
                ))}
                {(filters.valueRange[0] > 0 || filters.valueRange[1] < maxTotalValue) && (
                  <Badge variant="outline" className="gap-1">
                    Value: ${filters.valueRange[0]}M - ${filters.valueRange[1]}M
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing <span className="font-medium">{filteredDeals.length}</span> deals
            </p>
            <Select
              defaultValue="date"
              onValueChange={(value) => {
                // Handle sorting here
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date (Newest first)</SelectItem>
                <SelectItem value="value">Value (Highest first)</SelectItem>
                <SelectItem value="company">Company (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Deals Table */}
          <DealTable
            deals={filteredDeals}
            title=""
            showViewAll={false}
            onRowClick={handleDealClick}
          />
          
          {/* No Results */}
          {filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-neutral-500 mb-2">No deals match your current filters</p>
              <Button variant="outline" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Deal Modal */}
      <DealModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        deal={selectedDeal}
      />
    </div>
  );
}
