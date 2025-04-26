# Technical Context: Competitive Deal Radar

## Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI library for building component-based interfaces |
| TypeScript | 5.6 | Type-safe JavaScript superset |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| shadcn/ui | - | Accessible component library built on Radix UI |
| Vite | 5.4 | Build tool and development server |
| React Query | 5.x | Data fetching and caching library |
| D3.js | 7.x | Low-level data visualization library |
| Recharts | 2.x | React charting library built on D3 |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Express.js | 4.21 | Node.js web application framework |
| Node.js | 18+ | JavaScript runtime |
| Drizzle ORM | - | TypeScript ORM for SQL databases |
| NeonDB | - | Serverless Postgres database |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting and style enforcement |
| Prettier | Code formatting |
| TypeScript | Static type checking |
| Vite | Fast development server with HMR |
| npm | Package management |

## Development Setup

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager
- Git for version control

### Local Development Environment
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

4. Access the application:
   ```
   http://localhost:3000
   ```

### Build Process
1. Create production build:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start
   ```

### Project Structure
```
competitive-deal-radar/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── data/           # JSON data files (MVP)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and types
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite integration
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Data schema definitions
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.ts      # Tailwind CSS configuration
```

## Technical Constraints

### Browser Support
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- No support for Internet Explorer
- Responsive design for mobile and desktop viewports

### Performance Requirements
- Initial load time under 2 seconds on broadband connections
- Smooth interactions (60fps) for animations and transitions
- Efficient data loading with pagination for large datasets

### Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

### Security Considerations
- Input validation for all user inputs
- Protection against common web vulnerabilities (XSS, CSRF)
- Secure API endpoints (future authentication implementation)

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "express": "^4.21.0",
    "drizzle-orm": "latest",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.0.0",
    "d3": "^7.0.0"
  }
}
```

### UI Component Libraries
- shadcn/ui: Collection of accessible UI components
- Radix UI: Unstyled, accessible components used by shadcn/ui
- Lucide Icons: SVG icon library

### Development Dependencies
```json
{
  "devDependencies": {
    "vite": "^5.4.0",
    "eslint": "latest",
    "prettier": "latest",
    "@types/react": "^18.3.0",
    "@types/express": "^4.17.0",
    "autoprefixer": "latest",
    "postcss": "latest"
  }
}
```

## Environment Variables
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: NeonDB connection string (for production)
- `NODE_ENV`: Environment mode (development/production)

## Deployment Strategy
- Frontend: Static site deployment (Vercel/Netlify)
- Backend: Node.js hosting (Render/Railway/Fly.io)
- Database: NeonDB serverless Postgres

## Integration Points
- Future API integration with real-time deal databases
- Potential for Slack/Teams notifications
- Export functionality to Excel/PDF

## Technical Debt and Limitations
- Currently using local JSON files instead of a database
- Limited search functionality without ElasticSearch
- No authentication system in the MVP
- Limited offline capabilities