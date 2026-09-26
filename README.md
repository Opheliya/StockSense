# StockSense — Advanced Inventory Management System (IMS)

StockSense is a responsive, full-stack data-driven Inventory Management System designed to track enterprise warehouse logistics, product catalogs, automated stock updates, and live data movements.

[![Production Live Site](https://shields.io)](https://vercel.app)
[![Repository Source](https://shields.io)](https://github.com)

---

## Key System Capabilities

The interface addresses all critical operational inventory flows requested in the system criteria:

### 1. Authentication & Security Gateway
* **Interactive Access Portal:** Includes a responsive login dashboard framework mapping out modern UI elements.
* **Security Redirection Recovery:** Features a simulated OTP token retrieval path for system entry recovery.

### 2. Dynamic KPI Dashboard Engine
* **Real-Time Counters:** Actively loops and summarizes systemic calculations for:
  * Total Distinct Active Products / SKU Catalogs
  * Alert Indicators for Low-Stock Quantities
  * Impending Inbound Receipts & Pending Delivery Orders
* **Granular Data Constraints:** Implements cascading filtering parameters by Document Type, Pipeline Status, Warehouse Origin, and Product Classification.

### 3. Multi-Tier Warehouse Operations
* **Inbound Receipts Processing:** Validating a raw structural receipt directly updates inventory volume state maps.
* **Outbound Deliveries Tracking:** Processing transactional delivery parameters safely reduces systemic stock logs.
* **Internal Stock Corrections:** Direct structural adjustments allow for real-time warehouse counts audit checks.

### 4. Comprehensive Action Ledger & History Storage
* **Audited Move Logging:** Chronologically displays sequential location transfers, item metrics, and timestamp data.
* **Multi-Stage Deletion Queue (Trash Bin):** Moving history items drops logs into a localized storage Trash Bin state container first, shielding operational metrics against accidental permanent deletion data loss.

---

## Architecture & Tech Stack

The software application utilizes a decoupled configuration pipeline for fast compilation and lightweight rendering speeds:

* **Core Interface:** React 18 (TypeScript 5 compiler layer)
* **Development Build Pipeline Server Engine:** Vite 5
* **Styling Framework System:** Tailwind CSS
* **Vector Graphical Elements Component Library:** Lucide React
* **Hosting Pipeline:** Automated Continuous Integration / Continuous Deployment (CI/CD) on Vercel hooked directly into GitHub main production branch tracking triggers.

---

## Codebase File Structure

```text
StockSense/
├── src/
│   ├── components/       # Reusable layout UI components
│   ├── data.ts          # Local mock database schemas and initial dataset state
│   ├── App.tsx           # Core routing controllers, modals, and master logic views
│   ├── main.tsx          # React application entry layer mount point
│   └── index.css         # Global core Tailwind configuration injections
├── index.html            # Main markup entry portal structure
├── vite.config.ts        # Custom server compilation configurations
├── tailwind.config.js    # Utility classes theme configurations
└── package.json          # Main system dependencies listing parameters
```

---

## Quickstart Guide for Judges (Local Installation)

To test the application files inside a local testing computer terminal block pipeline structure:

1. Clone the active project repository files manually:
   ```bash
   git clone https://github.com.git
   cd StockSense
   ```

2. Download and install all requisite package files parameters:
   ```bash
   npm install
   ```

3. Launch the development server engine wrapper pipeline locally:
   ```bash
   npm run dev
   ```
4. Open the active local computer preview loop network address at `http://localhost:5173`.
