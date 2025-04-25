import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  MenuIcon, 
  XIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z" fill="#A92269"/>
              <path d="M16 5L19 11H13L16 5Z" fill="white"/>
              <path d="M16 27L13 21H19L16 27Z" fill="white"/>
              <path d="M5 16L11 13V19L5 16Z" fill="white"/>
              <path d="M27 16L21 19V13L27 16Z" fill="white"/>
            </svg>
            <h1 className="text-lg md:text-xl font-semibold">
              <span className="text-primary">Oncology</span>
              <span className="text-secondary"> Deal Radar</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <a className={`nav-item py-4 font-medium ${isActive('/') ? 'active' : 'text-neutral-600 hover:text-primary'}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/deal">
              <a className={`nav-item py-4 font-medium ${isActive('/deal') ? 'active' : 'text-neutral-600 hover:text-primary'}`}>
                Deal Explorer
              </a>
            </Link>
            <Link href="/company/astrazeneca">
              <a className={`nav-item py-4 font-medium ${location.startsWith('/company') ? 'active' : 'text-neutral-600 hover:text-primary'}`}>
                Company Profiles
              </a>
            </Link>
            <Link href="/heatmap">
              <a className={`nav-item py-4 font-medium ${isActive('/heatmap') ? 'active' : 'text-neutral-600 hover:text-primary'}`}>
                Indication Heatmap
              </a>
            </Link>
            <Link href="/about">
              <a className={`nav-item py-4 font-medium ${isActive('/about') ? 'active' : 'text-neutral-600 hover:text-primary'}`}>
                About
              </a>
            </Link>
          </nav>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </Button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="container mx-auto px-4 py-2 flex flex-col">
            <Link href="/">
              <a className={`py-3 px-4 font-medium ${isActive('/') ? 'text-primary border-l-4 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                Dashboard
              </a>
            </Link>
            <Link href="/deal">
              <a className={`py-3 px-4 font-medium ${isActive('/deal') ? 'text-primary border-l-4 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                Deal Explorer
              </a>
            </Link>
            <Link href="/company/astrazeneca">
              <a className={`py-3 px-4 font-medium ${location.startsWith('/company') ? 'text-primary border-l-4 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                Company Profiles
              </a>
            </Link>
            <Link href="/heatmap">
              <a className={`py-3 px-4 font-medium ${isActive('/heatmap') ? 'text-primary border-l-4 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                Indication Heatmap
              </a>
            </Link>
            <Link href="/about">
              <a className={`py-3 px-4 font-medium ${isActive('/about') ? 'text-primary border-l-4 border-primary' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                About
              </a>
            </Link>
          </nav>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-neutral-500">
                © 2025 AstraZeneca Oncology Competitive-Deal Radar. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/about#data-sources">
                <a className="text-sm text-neutral-500 hover:text-primary">Data Sources</a>
              </Link>
              <Link href="/about#terms">
                <a className="text-sm text-neutral-500 hover:text-primary">Terms of Use</a>
              </Link>
              <Link href="/about#privacy">
                <a className="text-sm text-neutral-500 hover:text-primary">Privacy Policy</a>
              </Link>
              <Link href="/about#contact">
                <a className="text-sm text-neutral-500 hover:text-primary">Contact Support</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
