# Competitive Deal Radar 📊

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)

A visually intuitive radar for tracking competitive deals across oncology indications. Designed for strategy, business development, and competitive intelligence teams.

![Competitive Deal Radar Logo](https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-d3f8-61f7-b530-948380b5526b/raw?se=2025-04-25T23%3A35%3A41Z&sp=r&sv=2024-08-04&sr=b&scid=ab656593-627a-555e-92b1-d664e7193e7b&skoid=cbbaa726-4a2e-4147-932c-56e6e553f073&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-25T17%3A34%3A53Z&ske=2025-04-26T17%3A34%3A53Z&sks=b&skv=2024-08-04&sig=wb5TU08Nf5nNSZNa0Papt4IQYp7ldecUieXeD/AgKlw%3D)

## 🚀 Features

- **Dashboard Home**: KPI cards, timeline charts, and recent deals overview
- **Deal Explorer**: Faceted filtering and detailed deal information
- **Company Profiles**: Company information and associated deals
- **Indication Heatmap**: Visual representation of deal activity across indications and modalities
- **Responsive Design**: Optimized for both desktop and mobile viewing

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui components
- **Charts & Visualization**: D3.js, Recharts
- **State Management**: React Query
- **Backend**: Express.js
- **Database**: Drizzle ORM with NeonDB (serverless Postgres)
- **Build Tools**: Vite, ESBuild

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/competitive-deal-radar.git
   cd competitive-deal-radar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 🏗️ Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

## 📊 Data Structure

The application uses local JSON files for the MVP:

- `deals.json`: Information about oncology deals
- `companies.json`: Company profiles and metadata
- `indications.json`: Oncology indications
- `modalities.json`: Treatment modalities

Example deal structure:
```json
{
  "id": "D-2025-0007",
  "date": "2025-03-15",
  "companyA": "AstraZeneca",
  "companyB": "Genentech",
  "asset": "Anti-TROP2 ADC",
  "modality": "ADC",
  "indication": "TNBC",
  "stage": "Phase 2",
  "upfront": 250,
  "milestones": 750,
  "total": 1000
}
```

## 🔍 Core Pages

1. **Dashboard Home**: Overview of key metrics and recent activity
2. **Deal Explorer**: Comprehensive deal listing with advanced filtering
3. **Company Profiles**: Detailed company information and associated deals
4. **Indication Heatmap**: Visual representation of deal activity by indication and modality
5. **About/Methodology**: Information about data sources and methodology

## 🔮 Future Enhancements

- API integration to real-time deal database
- Authentication and role-based access control
- ElasticSearch backend for complex querying
- Slack/Teams daily digest bot
- Deal valuation analytics module

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contact

Project Owner: Justin Johnson - Executive Director, Oncology Data Science

---

<p align="center">
  <img src="https://sdmntprsouthcentralus.oaiusercontent.com/files/00000000-d3f8-61f7-b530-948380b5526b/raw?se=2025-04-25T23%3A35%3A41Z&sp=r&sv=2024-08-04&sr=b&scid=ab656593-627a-555e-92b1-d664e7193e7b&skoid=cbbaa726-4a2e-4147-932c-56e6e553f073&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-04-25T17%3A34%3A53Z&ske=2025-04-26T17%3A34%3A53Z&sks=b&skv=2024-08-04&sig=wb5TU08Nf5nNSZNa0Papt4IQYp7ldecUieXeD/AgKlw%3D" alt="Competitive Deal Radar Logo" width="200">
</p>