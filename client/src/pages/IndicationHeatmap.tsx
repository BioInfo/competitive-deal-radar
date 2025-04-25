import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import Heatmap from '@/components/Heatmap';
import DealTable from '@/components/DealTable';
import DealModal from '@/components/DealModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeftIcon, 
  FilterIcon, 
  TrendingUpIcon, 
  ZapIcon, 
  SearchIcon,
  FileTextIcon,
  DownloadIcon
} from 'lucide-react';
import { Deal, HeatmapCell } from '@/lib/types';
import dealsData from '@/data/deals.json';
import indicationsData from '@/data/indications.json';
import modalitiesData from '@/data/modalities.json';

export default function IndicationHeatmap() {
  const [, setLocation] = useLocation();
  const deals = dealsData as Deal[];
  
  // Extract unique indications and modalities for the heatmap
  const indications = useMemo(() => indicationsData.map(ind => ind.name), []);
  const modalities = useMemo(() => modalitiesData.map(mod => mod.name), []);
  
  // State for filtered deals view
  const [showingFiltered, setShowingFiltered] = useState(false);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [filterCriteria, setFilterCriteria] = useState({ indication: '', modality: '' });
  
  // State for deal modal
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Prepare data for heatmap using useMemo to prevent infinite rendering
  const heatmapData = useMemo(() => {
    // Create grid data for all combinations of indications and modalities
    const gridData: HeatmapCell[] = [];
    
    indications.forEach(indication => {
      modalities.forEach(modality => {
        // Count deals for this indication/modality combination
        const count = deals.filter(
          deal => deal.indication === indication && deal.modality === modality
        ).length;
        
        gridData.push({
          indication,
          modality,
          count
        });
      });
    });
    
    return gridData;
  }, [deals, indications, modalities]);
  
  // Handle cell click in heatmap
  const handleCellClick = (indication: string, modality: string) => {
    // Filter deals based on selected cell
    const filtered = deals.filter(
      deal => deal.indication === indication && deal.modality === modality
    );
    
    setFilteredDeals(filtered);
    setFilterCriteria({ indication, modality });
    setShowingFiltered(true);
  };
  
  // Handle deal row click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };
  
  // Reset filters and go back to the heatmap
  const handleBackToHeatmap = () => {
    setShowingFiltered(false);
    setFilteredDeals([]);
    setFilterCriteria({ indication: '', modality: '' });
  };
  
  // Generate reports and insights
  const exportHeatmapData = () => {
    const jsonData = JSON.stringify(heatmapData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oncology_heatmap_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">
          {showingFiltered ? 'Filtered Deals' : 'Indication Heatmap'}
        </h2>
        <div className="flex gap-2">
          {showingFiltered ? (
            <Button variant="outline" onClick={handleBackToHeatmap} className="flex items-center">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Heatmap
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" className="flex items-center" onClick={exportHeatmapData}>
                <DownloadIcon className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Export Data</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {showingFiltered ? (
        <>
          <Card className="shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FilterIcon className="h-5 w-5 text-neutral-500" />
                <span className="text-lg font-medium">
                  Filtered by: <span className="text-primary">{filterCriteria.indication}</span> × <span className="text-accent">{filterCriteria.modality}</span>
                </span>
              </div>
              
              {filteredDeals.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-500 mb-2">No deals found for this combination</p>
                  <Button variant="outline" onClick={handleBackToHeatmap}>
                    Back to Heatmap
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-neutral-600">
                    Showing <span className="font-medium">{filteredDeals.length}</span> deals for <span className="font-medium">{filterCriteria.indication}</span> and <span className="font-medium">{filterCriteria.modality}</span>
                  </div>
                  
                  <DealTable
                    deals={filteredDeals}
                    title=""
                    showViewAll={false}
                    onRowClick={handleDealClick}
                  />
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Related insights for filtered view */}
          {filteredDeals.length > 0 && (
            <Card className="shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-secondary mb-4">Combination Insights</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4 bg-neutral-50">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUpIcon className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">Market Dynamics</h4>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {filterCriteria.indication} × {filterCriteria.modality} represents 
                      <span className="font-medium"> {((filteredDeals.length / deals.length) * 100).toFixed(1)}%</span> of 
                      total oncology deal activity in this period.
                    </p>
                    <div className="mt-3">
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(filteredDeals.length / deals.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-neutral-50">
                    <div className="flex items-center gap-2 mb-3">
                      <ZapIcon className="h-5 w-5 text-warning" />
                      <h4 className="font-medium">Competitive Landscape</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                      <li>Most deals in {filterCriteria.indication} focus on {filterCriteria.modality} approaches</li>
                      <li>Average deal value: 
                        <span className="font-medium"> ${Math.round(filteredDeals.reduce((sum, deal) => sum + deal.total, 0) / filteredDeals.length)}M</span>
                      </li>
                      <li>Predominantly {filteredDeals.find(d => d.stage)?.stage || 'early-stage'} programs</li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-neutral-50">
                    <div className="flex items-center gap-2 mb-3">
                      <SearchIcon className="h-5 w-5 text-accent" />
                      <h4 className="font-medium">Opportunity Analysis</h4>
                    </div>
                    <ul className="text-sm text-neutral-600 space-y-1 list-disc list-inside">
                      <li>Active area with significant competition</li>
                      <li>Consider differentiated mechanism/formulation</li>
                      <li>Focus on unmet needs: 
                        {filterCriteria.indication === 'NSCLC' ? ' resistance mechanisms, brain metastases' : 
                         filterCriteria.indication === 'MM' ? ' earlier line settings, combinations' : 
                         ' novel biomarkers, combo approaches'}
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <>
          <p className="text-neutral-600 mb-4">
            This interactive heatmap shows the concentration of oncology deals across different indications and modalities. 
            Use the visualization controls to customize the view, filter specific areas, or switch between visualization modes.
            Click on any cell to view the specific deals for that combination.
          </p>
          
          <Heatmap
            data={heatmapData}
            indications={indications}
            modalities={modalities}
            title="Oncology Deal Activity by Indication and Modality"
            onCellClick={handleCellClick}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-secondary">Key Trends</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Hot Areas</h4>
                    <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                      <li>NSCLC continues to be the most active indication across multiple modalities</li>
                      <li>ADC deals are trending upward, particularly in breast and lung cancers</li>
                      <li>Cell therapy approaches remain strong in hematological malignancies</li>
                      <li>Growing interest in bispecific antibodies across multiple tumor types</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Value Trends</h4>
                    <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                      <li>Highest valuations in ADC and cell therapy deals</li>
                      <li>Earlier stage deals showing increased upfront payments</li>
                      <li>Premium for first-in-class vs. follow-on mechanisms</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileTextIcon className="h-5 w-5 text-accent" />
                  <h3 className="text-lg font-semibold text-secondary">Strategic Insights</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">White Space Opportunities</h4>
                    <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                      <li>Limited deals in GBM despite high unmet need</li>
                      <li>Few mRNA-based deals in solid tumors outside of lung cancer</li>
                      <li>Potential for novel modalities in colorectal and pancreatic cancers</li>
                      <li>Underdeveloped space in brain metastases and leptomeningeal disease</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Competitive Implications</h4>
                    <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                      <li>Differentiation critical in crowded NSCLC and breast cancer spaces</li>
                      <li>Consider novel combinations or patient selection strategies</li>
                      <li>First-mover advantage in emerging modalities for underserved indications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Deal Modal */}
      <DealModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        deal={selectedDeal}
      />
    </div>
  );
}
