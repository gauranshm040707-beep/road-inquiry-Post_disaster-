# Disaster Road Inspector (REOC)
### Post-Disaster Road Damage Assessment, Automated Prioritization & Inspection Triage System

A modern, responsive emergency operations web application built for disaster authorities, DOT engineers, and emergency response teams to identify disaster-affected roads, record damage, and prioritize field inspections and repairs.

---

## 🌟 Key Features

### 1. Emergency Command Dashboard
- **KPI Metrics Cards**: Total Affected Roads, High/Critical Priority Lifelines, Pending Field Inspections, Completed Repairs, and Network Clearance Rate.
- **Priority Severity Strip**: Visual breakdown of High (Red), Medium (Orange), and Low (Green) priority tiers with automated weighting.
- **Interactive Recharts**:
  - *Damage Type Breakdown*: Donut chart showing distribution across bridge fractures, mudslides, floodwaters, sinkholes, and fissures.
  - *Inspection Status by Priority*: Stacked bar chart showing progress across triage stages.
  - *Incident Velocity Timeline*: Area chart tracking cumulative damage reports vs. clearance velocity.
- **Top Urgent Attention Triage Table**: Ranked dynamically by automated algorithmic priority score with one-click access to inspection dossiers.

### 2. Interactive GIS Disaster Map (Leaflet & OpenStreetMap)
- **High-Definition Mapping**: Tactical Dark Matter, Satellite Recon (Esri), and Standard OpenStreetMap tile layers.
- **Color-Coded Severity Markers**:
  - 🔴 **Red**: High Priority (Score 70–100) with animated pulsing radar halos.
  - 🟠 **Orange**: Medium Priority (Score 40–69).
  - 🟢 **Green**: Low Priority (Score < 40).
- **Hazard Zones Overlay**: Cascadia seismic epicenter perimeter and river surge inundation polygons.
- **Critical Evacuation Lifeline Polyline**: Visual highlight of primary hospital and relief corridors.
- **Interactive Coordinate Picker**: "Pick on Map" mode allows authorities to click anywhere on the terrain to capture GPS coordinates for new damage reports.
- **Rich Popups**: Previews with photographic evidence, road name, passage status, and one-click dossier launcher.

### 3. Report Affected Roads (Automated Priority Engine)
- **Comprehensive Damage Form**: Road name, sector, damage type, severity, road importance, passage accessibility, safety risk factors, estimated repair hours, and field observations.
- **Live Automated Priority Preview**: Calculates real-time priority scores (0–100) and displays clear explanatory reasoning tags before submission.
- **GPS Integration**: One-click "Use My GPS" via HTML5 Geolocation API, plus interactive map pin picker.
- **Photo Evidence**: Drag-and-drop multi-image upload with local preview, plus instant preset realistic disaster photo options.

### 4. Transparent Algorithmic Prioritization Formula
The system automatically assigns priority using a weighted decision matrix:
1. **Damage Severity (35%)**: High (+35), Medium (+20), Low (+10)
2. **Passage Accessibility (25%)**: Completely Blocked (+25), Emergency Only (+18), Single Lane (+10), Passable (+4)
3. **Road Lifeline Importance (25%)**: Hospital/Evac Lifeline (+25), Major Arterial (+18), Secondary Collector (+10), Local Road (+5)
4. **Public Safety & Structural Risk (15%)**: Imminent Threat (+15), Structural Integrity (+10), Moderate (+5), Low (+2)

### 5. Road Inspection Management (Kanban & Table Views)
- **4-Stage Kanban Workflow**:
  - `Pending Triage` ➔ `Under Inspection` ➔ `Repair Required` ➔ `Completed & Cleared`
- **One-Click Advancement & Rollback**: Move tickets across stages with automatic audit log updates.
- **Confetti Celebration**: Celebrates when critical roads are verified and safely cleared for civilian traffic.
- **Inventory Table & Grid Views**: Search, filter by priority, status, and damage type, with multi-column sorting.

### 6. Affected Area Details (Inspection Dossier)
- Full photo gallery with lightbox.
- Direct external GIS link (Google Maps / Apple Maps).
- Inspector reassignment and field note activity timeline.
- Heavy machinery and equipment requisition checklist (excavators, shoring, cranes).
- Printable Official Road Clearance Certificate and Dossier.

### 7. Search, Audio Alerts & Integrations
- **Global Search**: Press `/` anywhere to instantly search across roads, sectors, and notes.
- **Emergency Broadcast Marquee & Audio Chime**: Acoustic alert synthesizer via Web Audio API for incoming high-priority reports.
- **Backend & Cloud Storage Integration**: Client-side offline-first architecture with pre-configured settings for **Supabase** (Postgres + Storage) and **Firebase** (Firestore + Storage).
- **Data Export**: One-click export to CSV spreadsheet and raw JSON backup.

---

## 🛠 Technology Stack

- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + React-Leaflet (OpenStreetMap, CartoDB, Esri)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Preview production build:
```bash
npm run preview
```
