import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import Heatmap from '@/components/Heatmap';
import DealTable from '@/components/DealTable';
import DealModal from '@/components/DealModal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, FilterIcon } from 'lucide-react';
import { Deal, HeatmapCell } from '@/lib/types';
import dealsData from '@/data/deals.json';
import indicationsData from '@/data/indications.json';
import modalitiesData from '@/data/modalities.json';

export default function IndicationHeatmap() {
  const [, setLocation] = useLocation();
  const deals = dealsData as Deal[];
  
  // Extract unique indications and modalities for the heatmap
  const indications = indicationsData.map(ind => ind.name);
  const modalities = modalitiesData.map(mod => mod.name);
  
  // State for filtered deals view
  const [showingFiltered, setShowingFiltered] = useState(false);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [filterCriteria, setFilterCriteria] = useState({ indication: '', modality: '' });
  
  // State for deal modal
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Prepare data for heatmap
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  
  useEffect(() => {
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
    
    setHeatmapData(gridData);
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">
          {showingFiltered ? 'Filtered Deals' : 'Indication Heatmap'}
        </h2>
        {showingFiltered && (
          <Button variant="outline" onClick={handleBackToHeatmap} className="flex items-center">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Heatmap
          </Button>
        )}
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
        </>
      ) : (
        <>
          <p className="text-neutral-600 mb-4">
            This heatmap shows the concentration of deals across different indications and modalities. 
            Click on any cell to view the specific deals for that combination.
          </p>
          
          <Heatmap
            data={heatmapData}
            indications={indications}
            modalities={modalities}
            title="Oncology Deal Activity by Indication and Modality"
            onCellClick={handleCellClick}
          />
          
          <Card className="shadow">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-secondary mb-4">Heatmap Insights</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Hot Areas</h4>
                  <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                    <li>NSCLC continues to be the most active indication across multiple modalities</li>
                    <li>ADC deals are trending upward, particularly in breast and lung cancers</li>
                    <li>Cell therapy approaches remain strong in hematological malignancies</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">White Space Opportunities</h4>
                  <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                    <li>Limited deals in GBM despite high unmet need</li>
                    <li>Few mRNA-based deals in solid tumors outside of lung cancer</li>
                    <li>Potential for novel modalities in colorectal and pancreatic cancers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
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
