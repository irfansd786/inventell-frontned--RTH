# INVINTELL — Intelligent Retail Analytics Platform

**INVINTELL** is a unified intelligent retail platform connecting CCTV computer vision intelligence (OpenCV, YOLO, ByteTrack) with sales, POS billing, product inventory, and warehouse operations.

## Technology Stack

- **Framework**: React 18 + Vite 5 (JavaScript / JSX)
- **Styling**: Tailwind CSS v4 with custom enterprise dark sidebar design system
- **Routing**: React Router DOM v6 (Protected routes with frontend mock session)
- **Data Visualization**: Recharts (Area charts, Donut charts, Bar graphs)
- **Icons**: Lucide React
- **Animations**: Framer Motion

## Phase 1 Implemented Features

### 1. Authentication (`/login`)
- Premium split-screen login layout with retail intelligence graphics.
- Pre-filled mock authentication (`admin@invintell.com` / `admin123`).
- Show/hide password toggle, remember me checkbox, invalid credentials alert.
- `localStorage` session state persistence with automatic route guard protection.

### 2. Command Center Dashboard (`/dashboard`)
- **Header**: Live greeting, date & clock display, store switcher (`Main Street Store - ST-001`), system operational badge.
- **KPI Metrics**: 7 real-time cards (Total Visitors, Current Occupancy, Avg Dwell Time, Peak Hour, Total Sales, Low Stock Items, Active Alerts).
- **Footfall Trend**: Recharts area chart with hourly visitor count.
- **Visitors by Type**: Donut chart showing 72% New vs 28% Repeat visitors.
- **Live Store Monitor Card**: Simulated CCTV canvas with green bounding boxes and tracking IDs (`ID:101`, `ID:102`, `ID:103`), live telemetry stats (People in store, Entry/Exit counts, Occupancy rate).
- **Queue Overview**: Status of 4 checkout counters with Wait Times and Normal/High alerts.
- **Store Heatmap**: Interactive CSS/SVG grid representing density across store aisles with traffic legend.
- **Zone Analytics**: Interactive table with dwell time, traffic share, and trend indicators.
- **Sales Overview**: Real-time POS revenue trajectory area chart.
- **Top Products**: Ranked list of top selling items today with revenue and category badges.
- **Inventory Summary**: Stock health overview (Total, Low Stock, Out of Stock, Inventory Value) + Low stock reorder list.
- **Warehouse Overview**: Order fulfillment pipeline (Orders -> Allocation -> Picking -> Packing -> Dispatch) for single central warehouse.
- **AI Recommendations**: Prescriptive cross-domain intelligence actions with modal action dispatches.
- **Alerts & System Stream**: Live incident panel and system component health monitors.

### 3. Live Store Monitor (`/monitoring`)
- Fullscreen CCTV monitoring interface.
- Simulated CCTV vision canvas with bounding box overlays and dwell tracking.
- Interactive camera controls (Play, Pause, Stop, Snapshot, Camera switcher dropdown).
- CCTV Video File Uploader widget supporting drag & drop, file validation, and simulated AI detection processing states.
- Live Statistics telemetry grid.
- Detection Event Timeline feed.
- Detection Overlay Legend.

## Getting Started

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start local development server
npm run dev

# Run production build
npm run build
```
