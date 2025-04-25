import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Search as SearchIcon, 
  MapPin as MapPinIcon,
  Globe as GlobeIcon,
  Target as TargetIcon,
  Building as BuildingIcon
} from 'lucide-react';
import DealTable from '@/components/DealTable';
import DealModal from '@/components/DealModal';
import { Deal, Company } from '@/lib/types';
import dealsData from '@/data/deals.json';
import companiesData from '@/data/companies.json';

export default function CompanyProfile() {
  const [location] = useLocation();
  const companySlug = location.split('/').pop() || '';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDeals, setCompanyDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  const deals = dealsData as Deal[];
  const companies = companiesData as Company[];
  
  // Find the company based on the slug
  useEffect(() => {
    const company = companies.find(c => c.name.toLowerCase() === companySlug);
    if (company) {
      setSelectedCompany(company);
      
      // Find deals related to this company
      const relatedDeals = deals.filter(
        deal => deal.companyA === company.name || deal.companyB === company.name
      );
      
      setCompanyDeals(relatedDeals);
    }
  }, [companySlug, companies, deals]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.length > 1) {
      const term = searchTerm.toLowerCase();
      const results = companies.filter(
        company => company.name.toLowerCase().includes(term)
      );
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, companies]);
  
  // Handle deal row click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };
  
  if (!selectedCompany) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-secondary mb-2">Company not found</h2>
          <p className="text-neutral-500 mb-4">Please search for a company below</p>
          <div className="relative max-w-md mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10">
                {searchResults.length === 0 ? (
                  <div className="p-2 text-sm text-neutral-500">No results found</div>
                ) : (
                  <ul>
                    {searchResults.map((company) => (
                      <li key={company.id}>
                        <a
                          href={`/company/${company.name.toLowerCase()}`}
                          className="block p-2 hover:bg-neutral-50 text-sm"
                        >
                          {company.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">Company Profile</h2>
        <div className="relative w-64">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-10">
              {searchResults.length === 0 ? (
                <div className="p-2 text-sm text-neutral-500">No results found</div>
              ) : (
                <ul>
                  {searchResults.map((company) => (
                    <li key={company.id}>
                      <a
                        href={`/company/${company.name.toLowerCase()}`}
                        className="block p-2 hover:bg-neutral-50 text-sm"
                      >
                        {company.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Company Overview Card */}
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
              {selectedCompany.logo}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-secondary">{selectedCompany.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
                <div className="flex items-center text-sm text-neutral-600">
                  <MapPinIcon className="h-4 w-4 mr-1 text-neutral-400" />
                  {selectedCompany.hq}
                </div>
                <div className="flex items-center text-sm text-neutral-600">
                  <GlobeIcon className="h-4 w-4 mr-1 text-neutral-400" />
                  <a 
                    href={selectedCompany.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedCompany.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
              <p className="mt-3 text-neutral-700">{selectedCompany.description}</p>
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <TargetIcon className="h-4 w-4 mr-2 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-600">Focus Areas:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCompany.focus.map((area, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col gap-2">
              <Button variant="outline" className="w-full md:w-auto">
                <BuildingIcon className="h-4 w-4 mr-2" />
                Company Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Deal Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm font-medium text-neutral-500">Total Deals</h4>
            <p className="text-3xl font-semibold mt-1 text-primary">{companyDeals.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm font-medium text-neutral-500">As Licensor</h4>
            <p className="text-3xl font-semibold mt-1 text-secondary">
              {companyDeals.filter(d => d.companyB === selectedCompany.name).length}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow">
          <CardContent className="p-4 text-center">
            <h4 className="text-sm font-medium text-neutral-500">As Licensee</h4>
            <p className="text-3xl font-semibold mt-1 text-accent">
              {companyDeals.filter(d => d.companyA === selectedCompany.name).length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Deals */}
      <DealTable
        deals={companyDeals}
        title={`${selectedCompany.name} Deals`}
        showViewAll={false}
        onRowClick={handleDealClick}
      />
      
      {/* Pipeline Snapshot - Placeholder card */}
      <Card className="shadow">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">Pipeline Snapshot</h3>
          <div className="bg-neutral-100 rounded-lg h-64 flex items-center justify-center">
            <p className="text-neutral-500">Pipeline visualization would appear here in the full version</p>
          </div>
          <div className="mt-4 text-sm text-neutral-500">
            <p>This static demo shows a placeholder for the pipeline visualization. In the complete product, this would display the company's oncology pipeline across different development stages and therapeutic areas.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Deal Modal */}
      <DealModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        deal={selectedDeal}
      />
    </div>
  );
}
