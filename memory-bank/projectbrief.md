# Project Brief: Competitive Deal Radar

## Overview
Competitive Deal Radar is a visually intuitive web application designed for tracking and analyzing competitive deals across oncology indications. The platform serves strategy, business development, and competitive intelligence teams by providing comprehensive insights into the oncology deal landscape.

## Core Requirements

### Functional Requirements
1. **Dashboard Home**: Display KPI cards, timeline charts, and recent deals overview
2. **Deal Explorer**: Provide faceted filtering and detailed deal information
3. **Company Profiles**: Show company information and associated deals
4. **Indication Heatmap**: Visualize deal activity across indications and modalities
5. **Responsive Design**: Ensure optimal viewing experience on both desktop and mobile devices

### Technical Requirements
1. **Modern Frontend**: React 18 with TypeScript for type safety
2. **Responsive UI**: Tailwind CSS with shadcn/ui components
3. **Data Visualization**: D3.js and Recharts for interactive charts
4. **State Management**: React Query for efficient data fetching and caching
5. **Backend API**: Express.js server for data handling
6. **Database**: Drizzle ORM with NeonDB (serverless Postgres)
7. **Build System**: Vite and ESBuild for fast development and production builds

## Project Goals
1. Provide a comprehensive view of the oncology deal landscape
2. Enable data-driven decision making for business development teams
3. Track competitive activity across different indications and modalities
4. Deliver insights through intuitive visualizations and filtering capabilities
5. Support both high-level overview and detailed deal analysis

## Target Users
- Strategy teams
- Business development professionals
- Competitive intelligence analysts
- Oncology portfolio managers
- Executive leadership

## Success Metrics
1. User adoption and engagement metrics
2. Time saved in competitive intelligence gathering
3. Improved decision-making for deal opportunities
4. Comprehensive coverage of oncology deal landscape

## Project Scope
### In Scope
- Oncology-focused deal tracking
- Visual analytics and reporting
- Company and indication-specific insights
- Data import/export capabilities
- User-friendly filtering and search

### Out of Scope (Future Enhancements)
- Authentication and role-based access control
- Real-time API integration to deal databases
- ElasticSearch backend for complex querying
- Slack/Teams daily digest bot
- Deal valuation analytics module

## Timeline
MVP development with local JSON data before transitioning to full database implementation.