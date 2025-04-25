import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Database,
  FileText,
  Shield,
  Mail,
  ExternalLink,
  Microscope,
  DollarSign,
  Bookmark
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-secondary">About & Methodology</h2>
      </div>

      <Card className="shadow">
        <CardContent className="p-6">
          <p className="text-neutral-600 mb-6">
            The Oncology Competitive-Deal Radar provides AstraZeneca's Oncology Strategy, BD, and Competitive-Intelligence
            teams with a quick, visually intuitive overview of recent competitive deals across oncology indications.
            This MVP demonstrates the core visualization and interaction capabilities using static data.
          </p>

          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Data Sources</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="methodology" className="flex items-center gap-2">
                <Microscope className="h-4 w-4" />
                <span className="hidden sm:inline">Methodology</span>
                <span className="sm:hidden">Method</span>
              </TabsTrigger>
              <TabsTrigger value="glossary" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Glossary</span>
                <span className="sm:hidden">Terms</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Contact</span>
                <span className="sm:hidden">Support</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" id="data-sources">Data Sources</h3>
                <p className="text-neutral-600 mb-4">
                  This MVP uses static JSON data to demonstrate the application's functionality.
                  In the full version, deal data would be sourced from the following:
                </p>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
                  <li>
                    <span className="font-medium">Primary sources:</span> Company press releases, SEC filings, investor presentations
                  </li>
                  <li>
                    <span className="font-medium">Commercial databases:</span> BioCentury, Evaluate Pharma, GlobalData
                  </li>
                  <li>
                    <span className="font-medium">Regulatory submissions:</span> Clinical trial registries, FDA/EMA documentation
                  </li>
                  <li>
                    <span className="font-medium">Scientific publications:</span> Peer-reviewed journals, conference abstracts
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Update Frequency</h3>
                <p className="text-neutral-600">
                  In the production version, deal data would be updated daily with automated extraction from news feeds
                  and manual verification by the competitive intelligence team.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Deal Valuation Methodology</h3>
                <p className="text-neutral-600 mb-4">
                  All financial figures are presented in millions of USD. For deals reported in other currencies,
                  conversion is performed using the exchange rate on the date of the announcement.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Deal Components</h4>
                      <p className="text-sm text-neutral-600">
                        Total deal values include upfront payments, development and commercial milestones,
                        and research funding. They exclude royalties unless specified as a fixed amount.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Bookmark className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Milestone Probability Adjustment</h4>
                      <p className="text-sm text-neutral-600">
                        For strategic analysis, milestones can be risk-adjusted based on development stage
                        and historical probability of success in the relevant indication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Deal Classification</h3>
                <p className="text-neutral-600 mb-4">
                  Deals are classified by primary indication and modality. For multi-indication deals,
                  the lead indication is used for visualization purposes.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="glossary" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" id="glossary">Glossary of Terms</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="font-medium">ADC (Antibody-Drug Conjugate)</h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      A class of biopharmaceuticals that combine monoclonal antibodies with cytotoxic agents
                      using a chemical linker, allowing targeted delivery of the cytotoxic agent to cancer cells.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">mAb (Monoclonal Antibody)</h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      Laboratory-created proteins that mimic the immune system's ability to fight off
                      harmful antigens such as cancer cells.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">NSCLC (Non-Small Cell Lung Cancer)</h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      A type of lung cancer that encompasses several subtypes, including adenocarcinoma,
                      squamous cell carcinoma, and large cell carcinoma.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">TNBC (Triple-Negative Breast Cancer)</h4>
                    <p className="text-sm text-neutral-600 mb-2">
                      A type of breast cancer that tests negative for estrogen receptors, progesterone
                      receptors, and excess HER2 protein.
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium">MM (Multiple Myeloma)</h4>
                    <p className="text-sm text-neutral-600">
                      A cancer of plasma cells, a type of white blood cell that normally produces antibodies.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" id="contact">Contact Information</h3>
                <p className="text-neutral-600 mb-4">
                  For questions about the Oncology Competitive-Deal Radar or to provide feedback on this MVP, please contact:
                </p>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      JJ
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium">Justin Johnson</h4>
                      <p className="text-sm text-neutral-600">Executive Director, Oncology Data Science</p>
                      <p className="text-sm text-primary mt-1">justin.johnson@astrazeneca.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2" id="terms">Terms of Use</h3>
                <p className="text-neutral-600 mb-2">
                  This application is for internal AstraZeneca use only. All deal information contained
                  within is confidential and should not be shared externally.
                </p>
                <p className="text-neutral-600">
                  <a href="#" className="text-primary hover:underline inline-flex items-center">
                    View Full Terms of Use
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2" id="privacy">Privacy Policy</h3>
                <p className="text-neutral-600 mb-2">
                  Usage of this application is subject to AstraZeneca's internal data privacy policies.
                </p>
                <p className="text-neutral-600">
                  <a href="#" className="text-primary hover:underline inline-flex items-center">
                    View Privacy Policy
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-secondary">MVP Scope & Limitations</h3>
          </div>
          <p className="text-neutral-600 mb-4">
            This MVP (Minimum Viable Product) version of the Oncology Competitive-Deal Radar has been developed
            to demonstrate the core functionality and user experience of the application. It has the following limitations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 ml-4">
            <li>Uses static JSON data files instead of live API connections</li>
            <li>No authentication or role-based access control</li>
            <li>Limited data set focused on recent oncology deals</li>
            <li>Simplified visualizations without drill-down capabilities</li>
            <li>No integration with internal AstraZeneca systems</li>
          </ul>
          <p className="mt-4 text-neutral-600">
            Future versions will incorporate real-time data feeds, advanced analytics, and integration with
            AstraZeneca's business intelligence platforms.
          </p>
        </CardContent>
      </Card>
      
      <Card className="shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-secondary">Documentation</h3>
          </div>
          <p className="text-neutral-600 mb-4">
            For more detailed information about using the application, please refer to the following resources:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="p-4 border rounded-lg hover:bg-neutral-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">User Guide</h4>
                <p className="text-sm text-neutral-500">Complete instructions for using the application</p>
              </div>
            </a>
            <a href="#" className="p-4 border rounded-lg hover:bg-neutral-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">API Documentation</h4>
                <p className="text-sm text-neutral-500">Technical details for integration</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
