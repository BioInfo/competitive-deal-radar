import React, { useState } from 'react';
import KpiCard from '@/components/KpiCard';
import TimelineChart from '@/components/TimelineChart';
import DealTable from '@/components/DealTable';
import DealModal from '@/components/DealModal';
import { Deal, TimelineDataPoint } from '@/lib/types';
import dealsData from '@/data/deals.json';

export default function Dashboard() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Prepare data
  const deals = dealsData as Deal[];
  
  // Current year deals (2025)
  const currentYearDeals = deals.filter(deal => deal.date.startsWith('2025'));
  
  // Count deals by modality
  const modalityCounts: Record<string, number> = {};
  currentYearDeals.forEach(deal => {
    modalityCounts[deal.modality] = (modalityCounts[deal.modality] || 0) + 1;
  });
  
  // Get top modality
  const topModality = Object.entries(modalityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([modality]) => modality)[0];
  
  // Count deals by indication
  const indicationCounts: Record<string, number> = {};
  currentYearDeals.forEach(deal => {
    indicationCounts[deal.indication] = (indicationCounts[deal.indication] || 0) + 1;
  });
  
  // Get top indication
  const topIndication = Object.entries(indicationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([indication]) => indication)[0];
  
  // Prepare timeline data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timelineData: TimelineDataPoint[] = months.map(month => ({
    month,
    count: currentYearDeals.filter(deal => {
      const dealMonth = new Date(deal.date).toLocaleString('en-US', { month: 'short' });
      return dealMonth === month;
    }).length
  }));
  
  // Get total deals YTD
  const totalDealsYTD = currentYearDeals.length;
  
  // Handler for deal row click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };
  
  // Create data for the top modality card
  const topModalityData = [
    { modality: 'ADC', count: modalityCounts['ADC'] || 0 },
    { modality: 'mAb', count: modalityCounts['mAb'] || 0 },
    { modality: 'Cell Therapy', count: modalityCounts['Cell Therapy'] || 0 }
  ].sort((a, b) => b.count - a.count);
  
  // Create data for the top indication card
  const topIndicationData = [
    { indication: 'NSCLC', count: indicationCounts['NSCLC'] || 0 },
    { indication: 'TNBC', count: indicationCounts['TNBC'] || 0 },
    { indication: 'MM', count: indicationCounts['MM'] || 0 },
    { indication: 'AML', count: indicationCounts['AML'] || 0 }
  ].sort((a, b) => b.count - a.count);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">Dashboard Overview</h2>
        <div className="flex space-x-2 items-center">
          <span className="text-sm text-neutral-500">Data as of:</span>
          <span className="text-sm font-medium text-secondary">March 31, 2025</span>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Deals YTD Card */}
        <KpiCard
          title="Deals YTD"
          value={totalDealsYTD}
          change={{ value: 23, isPositive: true }}
          icon="deals"
        >
          <div className="mt-3">
            <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${Math.min(100, (totalDealsYTD / 175) * 100)}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-500">
              <span>Q1: {timelineData.slice(0, 3).reduce((sum, month) => sum + month.count, 0)}</span>
              <span>Q2: {timelineData.slice(3, 6).reduce((sum, month) => sum + month.count, 0)}</span>
              <span>Q3: {timelineData.slice(6, 9).reduce((sum, month) => sum + month.count, 0)}</span>
              <span>Target: 175</span>
            </div>
          </div>
        </KpiCard>
        
        {/* Top Modalities Card */}
        <KpiCard
          title="Top Modalities"
          value={topModality}
          icon="modality"
        >
          <div className="mt-4 space-y-3">
            {topModalityData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm font-medium">{item.modality}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">{item.count}</span>
                  <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-accent' : 'bg-secondary'}`}
                      style={{ width: `${Math.min(100, (item.count / (topModalityData[0].count || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </KpiCard>
        
        {/* Hot Indications Card */}
        <KpiCard
          title="Hot Indications"
          value={topIndication}
          icon="indication"
        >
          <div className="mt-4 grid grid-cols-2 gap-3">
            {topIndicationData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 rounded-md bg-neutral-50">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-primary' : 
                    index === 1 ? 'bg-accent' : 
                    index === 2 ? 'bg-secondary' : 
                    'bg-warning'
                  }`}
                ></div>
                <span className="text-sm font-medium">{item.indication}</span>
                <span className="ml-auto text-xs font-medium text-neutral-600">{item.count}</span>
              </div>
            ))}
          </div>
        </KpiCard>
      </div>
      
      {/* Timeline Chart */}
      <TimelineChart
        data={timelineData}
        title="Monthly Deal Activity (2025)"
      />
      
      {/* Recent Deals Table */}
      <DealTable
        deals={deals.slice(0, 5)}
        title="Recent Deals"
        showViewAll={true}
        viewAllLink="/deal"
        onRowClick={handleDealClick}
      />
      
      {/* Deal Modal */}
      <DealModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        deal={selectedDeal}
      />
    </div>
  );
}
