import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { Deal } from '@/lib/types';

interface DealTableProps {
  deals: Deal[];
  title: string;
  showViewAll?: boolean;
  viewAllLink?: string;
  onRowClick: (deal: Deal) => void;
}

type SortColumn = 'date' | 'companies' | 'asset' | 'indication' | 'stage' | 'total';
type SortDirection = 'asc' | 'desc';

export default function DealTable({ deals, title, showViewAll = true, viewAllLink = "/deal", onRowClick }: DealTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  const sortedDeals = [...deals].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortColumn) {
      case 'date':
        return modifier * a.date.localeCompare(b.date);
      case 'companies':
        return modifier * a.companyA.localeCompare(b.companyA);
      case 'asset':
        return modifier * a.asset.localeCompare(b.asset);
      case 'indication':
        return modifier * a.indication.localeCompare(b.indication);
      case 'stage':
        return modifier * a.stage.localeCompare(b.stage);
      case 'total':
        return modifier * (a.total - b.total);
      default:
        return 0;
    }
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
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
  
  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ChevronDownIcon className="ml-1 h-4 w-4 text-neutral-400" />;
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="ml-1 h-4 w-4 text-primary" />
      : <ChevronDownIcon className="ml-1 h-4 w-4 text-primary" />;
  };
  
  return (
    <Card className="shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-secondary">{title}</h3>
          {showViewAll && (
            <Button variant="link" className="text-primary p-0 h-auto" asChild>
              <a href={viewAllLink} className="flex items-center text-sm">
                View All Deals
                <ArrowRightIcon className="ml-1 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon column="date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('companies')}
                >
                  <div className="flex items-center">
                    Companies
                    <SortIcon column="companies" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('asset')}
                >
                  <div className="flex items-center">
                    Asset
                    <SortIcon column="asset" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('indication')}
                >
                  <div className="flex items-center">
                    Indication
                    <SortIcon column="indication" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary"
                  onClick={() => handleSort('stage')}
                >
                  <div className="flex items-center">
                    Stage
                    <SortIcon column="stage" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-primary text-right"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-end">
                    Total Value ($M)
                    <SortIcon column="total" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDeals.map((deal) => (
                <TableRow 
                  key={deal.id} 
                  className="cursor-pointer hover:bg-primary/5"
                  onClick={() => onRowClick(deal)}
                >
                  <TableCell className="text-sm">{formatDate(deal.date)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium text-sm text-secondary">{deal.companyA}</span>
                      <ArrowRightIcon className="mx-2 h-4 w-4 text-neutral-400" />
                      <span className="text-sm">{deal.companyB}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{deal.asset}</TableCell>
                  <TableCell className="text-sm">{deal.indication}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(deal.stage)}`}>
                      {deal.stage}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium font-mono">${deal.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
