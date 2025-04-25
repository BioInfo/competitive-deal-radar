import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileDownIcon, 
  ShareIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { Deal } from '@/lib/types';

interface DealModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

export default function DealModal({ isOpen, onOpenChange, deal }: DealModalProps) {
  const [formattedDate, setFormattedDate] = useState('');
  
  useEffect(() => {
    if (deal) {
      const date = new Date(deal.date);
      setFormattedDate(date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }));
    }
  }, [deal]);
  
  if (!deal) return null;
  
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Preclinical':
        return 'bg-neutral-200 text-neutral-700';
      case 'Phase 1':
        return 'bg-warning/10 text-warning';
      case 'Phase 2':
        return 'bg-accent/10 text-accent';
      case 'Phase 3':
        return 'bg-primary/10 text-primary';
      case 'Approved':
        return 'bg-success/10 text-success';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-secondary">
            Deal Details
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 text-neutral-500 hover:text-neutral-800" />
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h4 className="font-medium text-neutral-500 mb-2">Deal Overview</h4>
            <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">ID:</span>
                <span className="text-sm font-medium">{deal.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Date:</span>
                <span className="text-sm font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Type:</span>
                <span className="text-sm font-medium">Licensing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-500">Status:</span>
                <span className="text-sm font-medium text-success flex items-center">
                  <CheckCircleIcon className="mr-1 h-4 w-4" />
                  Closed
                </span>
              </div>
            </div>
            
            <h4 className="font-medium text-neutral-500 mb-2 mt-6">Companies</h4>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {deal.companyA.substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-secondary">{deal.companyA}</p>
                    <p className="text-xs text-neutral-500">Licensee</p>
                  </div>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  <a href={`/company/${deal.companyA.toLowerCase()}`} className="text-xs text-primary flex items-center">
                    View Profile
                    <ExternalLinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    {deal.companyB.substring(0, 2)}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-secondary">{deal.companyB}</p>
                    <p className="text-xs text-neutral-500">Licensor</p>
                  </div>
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto">
                  <a href={`/company/${deal.companyB.toLowerCase()}`} className="text-xs text-primary flex items-center">
                    View Profile
                    <ExternalLinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-500 mb-2">Asset Details</h4>
            <div className="bg-neutral-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="text-sm text-neutral-500">Asset Name:</span>
                <p className="font-medium">{deal.asset}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Modality:</span>
                <p className="font-medium">{deal.modality}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Indication:</span>
                <p className="font-medium">{deal.indication}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-500">Development Stage:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(deal.stage)}`}>
                  {deal.stage}
                </span>
              </div>
            </div>
            
            <h4 className="font-medium text-neutral-500 mb-2 mt-6">Financial Terms</h4>
            <div className="bg-neutral-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 mb-1">Upfront</p>
                  <p className="text-lg font-semibold font-mono text-primary">${deal.upfront}M</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 mb-1">Milestones</p>
                  <p className="text-lg font-semibold font-mono text-secondary">${deal.milestones}M</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                  <p className="text-xs text-neutral-500 mb-1">Total Value</p>
                  <p className="text-lg font-semibold font-mono text-accent">${deal.total}M</p>
                </div>
              </div>
              <p className="text-xs text-neutral-500">
                Additional terms include tiered royalties ranging from mid-single to low double-digit percentages on net sales.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-neutral-500 mb-2">Deal Summary</h4>
          <p className="text-sm text-neutral-700 leading-relaxed">
            This strategic collaboration grants {deal.companyA} exclusive global rights to develop and commercialize {deal.companyB}'s novel {deal.asset} for the treatment of {deal.indication}. 
            Currently in {deal.stage} clinical trials, the asset has shown promising efficacy in early studies with a manageable safety profile. 
            The agreement includes development and commercial milestone payments, as well as tiered royalties on future sales.
            {deal.companyA} will lead global development activities with input from {deal.companyB}'s scientific team.
          </p>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline">
            <FileDownIcon className="mr-1 h-4 w-4" />
            Export PDF
          </Button>
          <Button>
            <ShareIcon className="mr-1 h-4 w-4" />
            Share Deal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
