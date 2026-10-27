# NoseNet — IoT-Based Cake Freshness and Adulteration Detection Platform

**Project Title**: *“IoT-Based Cake Freshness and Adulteration Detection Device”*  
**Core Architecture**: Local-First • Zero Cloud Database Dependency • Pure Black & Pure White High-Contrast Interface • Decoupled Storage Adapter Pattern (`IStorageAdapter`)  
**Target Environment**: Academic & Laboratory Monitoring, College Capstone Demonstration, Multi-Panel Sensory Analysis, ESP32 Telemetry Ingestion.

---

## Table of Contents
1. [Project Overview & Core Mandates](#1-project-overview--core-mandates)
2. [Visual Design & Theme System (Pure Black & Pure White)](#2-visual-design--theme-system-pure-black--pure-white)
3. [Page Directories & Route Map (Start-to-End Structure)](#3-page-directories--route-map-start-to-end-structure)
4. [Complete Feature Breakdown & Step-by-Step Working Procedures](#4-complete-feature-breakdown--step-by-step-working-procedures)
   - [Feature 1: Local Demo Authentication & Role Switching](#feature-1-local-demo-authentication--role-switching)
   - [Feature 2: Experiment Protocol Management & Control Verification](#feature-2-experiment-protocol-management--control-verification)
   - [Feature 3: Cake Specimen Matrix Management](#feature-3-cake-specimen-matrix-management)
   - [Feature 4: ESP32 Sensor CSV Ingestion Engine](#feature-4-esp32-sensor-csv-ingestion-engine)
   - [Feature 5: Sensor Graphs & Analytical Visualizations](#feature-5-sensor-graphs--analytical-visualizations)
   - [Feature 6: Manual Sensory Assessment Terminal](#feature-6-manual-sensory-assessment-terminal)
   - [Feature 7: Sensory Disagreement Detection & Panel History](#feature-7-sensory-disagreement-detection--panel-history)
   - [Feature 8: Responsible Machine Learning & AI Pipeline Status](#feature-8-responsible-machine-learning--ai-pipeline-status)
   - [Feature 9: Research Data Exports, JSON Backup & Schema Restoration](#feature-9-research-data-exports-json-backup--schema-restoration)
   - [Feature 10: Second-Phone Assessment Architecture](#feature-10-second-phone-assessment-architecture)
5. [Complete Application Codebase Architecture](#5-complete-application-codebase-architecture)
6. [Step-by-Step End-to-End Laboratory Workflow](#6-step-by-step-end-to-end-laboratory-workflow)
7. [Local Setup, Development & Production Commands](#7-local-setup-development--production-commands)
8. [Testing & Quality Verification Matrix](#8-testing--quality-verification-matrix)
9. [Pre-Production Roadmap & Backend Integration](#9-pre-production-roadmap--backend-integration)

---

## 1. Project Overview & Core Mandates

NoseNet is a scientific monitoring platform and sensory assessment terminal engineered for laboratory testing of bakery products. It monitors Normal Sponge Cake and Cream-Filled Pastry Cake across Frozen (-18°C) and Unfrozen (ambient / chilled) storage conditions using an IoT electronic nose built around an ESP32 microcontroller, metal oxide semiconductor (MOX) gas sensors (BME680 / MQ series), and environmental compensation sensors (temperature, relative humidity, barometric pressure).

### Core Architectural Mandates:
1. **Local-First & Zero Cloud Dependencies**: Operates completely inside the user's browser without requiring Supabase, Firebase, cloud databases, paid external APIs, or mock network endpoints.
2. **Academic & Engineering Integrity**: Never fabricates missing readings, never interpolates data gaps silently, never simulates artificial AI accuracy, and never claims cross-device synchronization works when local storage is device-isolated.
3. **Decoupled Storage Architecture**: All application operations interact through an abstract domain service layer backed by `IStorageAdapter`. The current `LocalStorageAdapter` persists in browser storage and can be replaced with an `HttpStorageAdapter` in Phase 2 without rewriting any frontend components.
4. **Rigorous Validation**: Uses Zod schemas to validate every uploaded CSV row, form input, manual assessment, and imported JSON backup file.

---

## 2. Visual Design & Theme System (Pure Black & Pure White)

Following strict laboratory UI requirements, NoseNet eliminates chaotic color gradients, neon pastels, and slate/navy tints in favor of an **ultra-clean, high-contrast, pure black and white theme**:
- **Background**: Pure Pitch Black (`#000000`, Tailwind `bg-black`).
- **Foreground / Text**: Pure High-Contrast White (`#ffffff`, Tailwind `text-white`).
- **Surface Elevation**: Deep black neutral surfaces (`#0a0a0a` / `#121212`, Tailwind `bg-neutral-950`).
- **Borders & Dividers**: Crisp, subtle structural lines (`#262626`, Tailwind `border-neutral-800`).
- **Controls & Buttons**:
  - *Primary Button*: Pure white background (`#ffffff`), pitch black bold text (`#000000`).
  - *Secondary Button*: Neutral black background (`#171717`), crisp border (`#262626`), pure white text (`#ffffff`).
  - *Outline Button*: Transparent pitch black, neutral border, pure white text.
  - *Form Inputs & Dropdowns*: Pitch black background (`#000000`), white text, crisp borders (`#262626`), white focus highlight.
- **Charts (Recharts)**: Pure black canvas (`#000000`), dark gridlines (`#262626`), high-contrast white text for axes labels, tick marks, legends, and tooltip cards.

---

## 3. Page Directories & Route Map (Start-to-End Structure)

The website is structured using the **Next.js 16 App Router**. Below is the exhaustive route map showing file paths, URLs, page beginning, internal components, and page end:

| Route URL | Source File Path | Starting Element | Key Internal Sections / Workflows | Ending Element |
|---|---|---|---|---|
| **`/`** | `src/app/page.tsx` | Top Welcome Banner & "College Capstone" badge | • AI Model Status Banner<br>• 5 Stat Cards (Experiments, Samples, Readings, Assessments, Awaiting)<br>• Recent Experiments Grid (left 7 cols)<br>• Latest Sensory Evaluation Logs with Disagreement Tags (right 5 cols) | Mobile Assessor Terminal CTA button & Global Footer |
| **`/login`** | `src/app/login/page.tsx` | Centered Dialog with Shield Icon | • Local Browser Session notice<br>• Display Name text input<br>• Role Picker Cards (Researcher vs. Assessor with feature list)<br>• Remember Session toggle | "Sign In to NoseNet" button & Demo Disclaimer |
| **`/experiments`** | `src/app/experiments/page.tsx` | Page Header with Flask Icon & "New Experiment" button | • Keyword Search bar & Status filter dropdown<br>• Responsive 3-Column Experiment Card Grid<br>• Control Run Badges (`ROOM` / `EMPTY_CONTAINER`)<br>• Quick Actions: View Details, Edit, Archive, Delete<br>• Empty State with College Dataset seeder | Create/Edit Experiment Modal & Confirmation Dialogs |
| **`/experiments/[id]`** | `src/app/experiments/[id]/page.tsx` | "Back to All Experiments" navigation link | • Main Experiment Header (ID, Name, Status, Creation Date)<br>• 4-Tile Metadata Grid (Test Date, Planned Duration, Actual Duration, Samples)<br>• Description & Protocol Notes code block<br>• Control Runs Baseline Verification (ROOM & EMPTY_CONTAINER kΩ values)<br>• Registered Samples Table for this experiment with direct "Assess →" links | Register Sample Button & Edit Protocol Modal |
| **`/samples`** | `src/app/samples/page.tsx` | Page Header with Layers Icon & "Export CSV" / "Register Sample" buttons | • 5-Column Filter Bar (Search, Experiment, Category, Storage, Status)<br>• Full Data Table with Replicate indices, Mass (g), and Test Timestamps<br>• In-line Status State Machine Cycle Dropdown<br>• Direct "Assess" action button per row | Delete Confirmation Dialog & Sample Form Modal |
| **`/sensor`** | `src/app/sensor/page.tsx` | Header with LineChart Icon & "Refresh Data" button | • Drag-and-drop ESP32 CSV Upload Dropzone<br>• Interactive Filter Toolbar (Experiment, Sample, Stage)<br>• Recharts Timeseries Visualization Card with SMA-5 Overlay toggle<br>• Raw Sensor Readings Data Table with pagination (15 rows/page)<br>• Filtered CSV Export button | Clear Stored Readings Confirmation Dialog |
| **`/assess`** | `src/app/assess/page.tsx` | Second-Phone Architecture Disclosure Notice | • Assessor Display Name input & Specimen Selector dropdown<br>• Specimen Information Card (Category, Storage, Replicate, Notes)<br>• **Step 1: Three Touch Targets (Fresh, Average, Not Good)**<br>• **Step 2: 1-5 Star Confidence Rating & Olfactory Notes**<br>• Scientific Disclaimer<br>• Disagreement Detection Alert Banner<br>• Chronological Assessment History list for this specimen | Confirmation Dialog ("Confirm & Log Verdict") & Export CSV |
| **`/ai`** | `src/app/ai/page.tsx` | Header with BrainCircuit Icon | • Main Pipeline Status Banner (Explicit "Unavailable" message)<br>• Reviewer Demo State Override Dropdown (Inspect 5 lifecycle states)<br>• Academic Transparency & Confounding Factors disclosure<br>• Training Dataset Readiness Counters (Paired Samples Progress Bar)<br>• Scientific Grounding & Sensor Principles (MOX, Baseline Ratio, Cross-Sensitivity) | 3 Principles Grid Cards & Global Footer |
| **`/backup`** | `src/app/backup/page.tsx` | Header with Database Icon & "Load College Dataset" button | • Current Local Storage Persistence summary (4 stat tiles)<br>• 4 Research CSV Download Cards (Readings, Assessments, Samples, Experiments)<br>• Full Project JSON Backup Snapshot Download button<br>• JSON File Upload & Zod Schema Validation Dropzone<br>• Danger Zone: Wipe Local Storage button | Restore Confirmation Modal (Merge vs. Overwrite) & Global Footer |
| **`/guide`** | `src/app/guide/page.tsx` | Header with BookOpen Icon | • 1. Academic Abstract & Spoilage Mechanisms<br>• 2. Local-First vs. Phase 2 Backend Matrix<br>• 3. ESP32 Telemetry & CSV Header Schema Reference Table<br>• 4. The 3 Evaluation Stages (`ROOM`, `EMPTY_CONTAINER`, `CAKE`)<br>• 5. Storage Adapter Pattern Code Architecture | Implementation Checklist & Global Footer |
| **Global Layout** | `src/app/layout.tsx` | `<!DOCTYPE html>` with `class="dark"` & `bg-black` | • `RoleBanner`: Displays active demo session and role switch buttons<br>• `Navbar`: Desktop horizontal navigation, mobile drawer menu, Assessor terminal shortcut<br>• `<main>`: Injects active page content<br>• `Footer`: Technical college project credits and architecture badges | End of `</body>` and `</html>` |

---

## 4. Complete Feature Breakdown & Step-by-Step Working Procedures

### Feature 1: Local Demo Authentication & Role Switching
- **Location**: `src/app/login/page.tsx`, `src/components/layout/role-banner.tsx`, `src/services/auth-service.ts`.
- **Purpose**: Provides a zero-friction authentication flow for college demonstrations without pretending to be a production security layer.
- **Working Procedure**:
  1. User navigates to `/login`.
  2. User enters a **Display Name** (e.g., *“Lead Researcher”* or *“Panelist 1”*).
  3. User selects one of two roles:
     - **Researcher**: Unlocks experiment creation, sample registration, CSV ingestion, sensor graphs, and database backups.
     - **Assessor**: Optimized for sensory evaluation, sample selection, and rating submission.
  4. User clicks **“Sign In to NoseNet”**. `AuthService.login()` persists the user object to browser `localStorage` under `nosenet_session`.
  5. The global `RoleBanner` immediately reflects the active user and provides a 1-click **“Switch Role”** button to change roles without logging out.

---

### Feature 2: Experiment Protocol Management & Control Verification
- **Location**: `src/app/experiments/page.tsx`, `src/app/experiments/[id]/page.tsx`, `src/components/experiments/experiment-form-modal.tsx`.
- **Purpose**: Creates, edits, tracks, and archives electronic nose experiment protocols with strict baseline control run verification.
- **Data Model**: Unique ID (`EXP-YYYY-XXX`), title, hypothesis description, test date, planned duration (mins), actual duration (mins), status (`Draft`, `Active`, `Completed`, `Archived`), and control run metadata (`ROOM` and `EMPTY_CONTAINER`).
- **Working Procedure**:
  1. On `/experiments`, click **“New Experiment”** to open the modal.
  2. Input an optional ID or leave blank for automatic generation (`EXP-2026-00X`).
  3. Enter title, test date, planned duration, protocol notes (e.g., sensor heater temperature, chamber purge time).
  4. Record **Control Runs**:
     - Check **`ROOM Baseline Completed`** and enter the baseline gas resistance in kΩ (e.g., `54.2`).
     - Check **`EMPTY_CONTAINER Completed`** and enter container baseline resistance in kΩ (e.g., `52.8`).
  5. Click **“Create Experiment”**. Form inputs are validated via `ExperimentSchema` in Zod and saved to `localStorage`.
  6. Opening an experiment (`/experiments/[id]`) presents full protocol details, control verification statuses, and a table of all registered samples linked to this experiment.

---

### Feature 3: Cake Specimen Matrix Management
- **Location**: `src/app/samples/page.tsx`, `src/components/samples/sample-form-modal.tsx`, `src/services/sample-service.ts`.
- **Purpose**: Manages cake test specimens across all required matrix and storage combinations with independent status lifecycles.
- **Supported Combinations**:
  1. `Normal Cake — Unfrozen`
  2. `Normal Cake — Frozen` (-18°C)
  3. `Pastry Cake — Unfrozen` (Cream-filled, high moisture)
  4. `Pastry Cake — Frozen`
- **Statuses**: `Planned` $\rightarrow$ `Testing` $\rightarrow$ `Completed` (or `Invalid`). Statuses are never automatically changed; researchers maintain manual control.
- **Working Procedure**:
  1. On `/samples`, click **“Register Sample”**.
  2. Select the parent experiment.
  3. Choose **Cake Category** (`Normal Cake` or `Pastry Cake`) and **Storage Condition** (`Unfrozen` or `Frozen`).
  4. Enter replicate number (e.g., `Sample 1`, `Sample 2`), specimen mass in grams (e.g., `45.0 g`), test date/time, and physical notes (e.g., *“Crumb moisture intact, mild vanilla scent”*).
  5. Click **“Register Sample”**. `SampleSchema` validates the input and persists the record.
  6. The specimen list displays quick-filter dropdowns and an in-line status selector to progress samples from `Planned` to `Testing` and `Completed`.

---

### Feature 4: ESP32 Sensor CSV Ingestion Engine
- **Location**: `src/app/sensor/page.tsx`, `src/components/sensor/csv-upload-dropzone.tsx`, `src/services/sensor-service.ts`.
- **Purpose**: Ingests real telemetry logs produced by ESP32 microcontrollers with Zod row-level schema validation and duplicate deduplication.
- **Expected CSV Header**:
  ```csv
  experiment_id,sample_id,stage,sample_no,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
  ```
- **Working Procedure**:
  1. User drags a `.csv` file onto the upload dropzone or clicks **“Browse Computer”**. (A template CSV can be downloaded by clicking **“Download ESP32 CSV Template”**).
  2. `SensorService.previewCsv()` parses the file via PapaParse and runs every row through `SensorCsvRowSchema` in Zod.
  3. An import preview modal pops up displaying:
     - Total rows parsed.
     - Number of valid readings.
     - Number of duplicate rows detected (based on composite key: `experimentId + sampleId + stage + elapsedSeconds`).
     - Number of invalid rows (with exact row numbers and error descriptions).
     - Detected experiments and sample IDs.
     - First 3 valid rows table.
  4. User reviews the preview and clicks **“Confirm & Import Readings”**.
  5. Valid non-duplicate readings are saved to `localStorage` under `nosenet_readings`. Existing readings are never duplicated.

---

### Feature 5: Sensor Graphs & Analytical Visualizations
- **Location**: `src/app/sensor/page.tsx`, `src/components/charts/sensor-timeseries-chart.tsx`, `src/components/sensor/sensor-data-table.tsx`.
- **Purpose**: Renders interactive time-series charts using Recharts for actual imported ESP32 data with trend overlays and raw data preservation.
- **Visualized Metrics**:
  - **Gas Resistance** ($k\Omega$) vs Elapsed Time ($s$).
  - **Temperature** ($^\circ C$) vs Elapsed Time ($s$).
  - **Relative Humidity** ($\%$) vs Elapsed Time ($s$).
  - **Barometric Pressure** ($hPa$) vs Elapsed Time ($s$).
- **Working Procedure**:
  1. On `/sensor`, user uses the **Graph Filters** toolbar to filter by specific Experiment, Sample ID, or Protocol Stage (`ROOM`, `EMPTY_CONTAINER`, `CAKE`, or `ALL`).
  2. The Recharts canvas dynamically renders the filtered time series. Hovering over data points opens a custom high-contrast tooltip displaying elapsed time, protocol stage badge, raw measurement value, sample ID, and experiment ID.
  3. Clicking the **“SMA-5 Overlay: ON/OFF”** button toggles a 5-point Simple Moving Average trendline calculated on the fly without modifying or interpolating raw values.
  4. Below the chart, the **Raw Sensor Readings Data Table** displays the actual data with pagination (15 rows/page) and an **“Export Filtered CSV”** button.

---

### Feature 6: Manual Sensory Assessment Terminal
- **Location**: `src/app/assess/page.tsx`, `src/services/assessment-service.ts`.
- **Purpose**: Provides a touch-friendly mobile interface for sensory panel evaluations to act as ground truth for spoilage detection.
- **Labels**: Exactly one of **`Fresh`** (Grade A), **`Average`** (Grade B), or **`Not Good`** (Grade C).
- **Working Procedure**:
  1. Assessor opens `/assess` (directly accessible via desktop navbar or mobile drawer).
  2. Assessor selects the cake specimen to evaluate. The card displays the cake category, storage condition, replicate index, and experiment ID.
  3. **Step 1**: Assessor taps one of the three large Grade buttons:
     - **Fresh**: *Natural pleasant bakery aroma, no off-flavor, optimal crumb moisture.*
     - **Average**: *Marginal staling, muted aroma, dryness at edges.*
     - **Not Good**: *Off-odor, rancidity, sour cream notes, microbial breakdown.*
  4. **Step 2 (Optional)**: Assessor selects confidence rating (1 to 5 stars) and enters olfactory notes.
  5. A confirmation dialog opens: *“Are you sure you want to log [Verdict] for sample [Sample ID]?”*
  6. Upon confirmation, the evaluation is stored in `localStorage` under `nosenet_assessments` with timestamp, assessor ID, assessor display name, rating, and notes.

---

### Feature 7: Sensory Disagreement Detection & Panel History
- **Location**: `src/app/assess/page.tsx`, `src/services/assessment-service.ts`.
- **Purpose**: Preserves full assessment history when multiple panelists evaluate the same sample and highlights panel disagreements instead of silently overwriting earlier evaluations.
- **Working Procedure**:
  1. When Assessor 1 votes `Fresh` and Assessor 2 votes `Average` for the same specimen, `AssessmentService.getSummaryForSample()` detects multiple distinct labels.
  2. A prominent **Panel Disagreement Detected** banner appears on the specimen's evaluation page and the dashboard.
  3. The chronological history log lists every individual assessment with assessor name, timestamp, confidence stars, and comments intact.

---

### Feature 8: Responsible Machine Learning & AI Pipeline Status
- **Location**: `src/app/ai/page.tsx`, `src/components/dashboard/ai-status-banner.tsx`, `src/services/ai-service.ts`.
- **Purpose**: Enforces scientific integrity by keeping AI freshness inference explicitly disabled until sufficient validated data is collected.
- **States**: `Not Configured`, `Not Validated`, `Ready for Validation`, `Validated and Enabled`, `Unavailable`.
- **Working Procedure**:
  1. `/ai` displays: **“AI prediction unavailable — insufficient validated data.”**
  2. The page monitors the **Training Dataset Readiness**:
     - Total registered samples.
     - Total labeled samples (samples with manual sensory verdicts).
     - Total sensor readings recorded.
     - **Paired Training Specimens**: Count of samples that possess *both* valid sensor time-series and confirmed manual sensory ratings (minimum required: 50 paired batches for pilot validation).
     - A progress bar shows data collection progress toward the minimum threshold.
  3. College reviewers can use the **“Inspect Status State”** dropdown to preview how the UI behaves across all 5 lifecycle states.
  4. Explains core physical principles: MOX sensors cross-react with humidity and temperature; raw resistance alone ($R_g$) cannot predict food safety without baseline ratio normalization ($R_{cake} / R_{0}$).

---

### Feature 9: Research Data Exports, JSON Backup & Schema Restoration
- **Location**: `src/app/backup/page.tsx`, `src/services/backup-service.ts`.
- **Purpose**: Ensures complete laboratory data portability, CSV downloads for statistical packages (Pandas, R, SPSS), and verified JSON backups.
- **Working Procedure**:
  1. **CSV Exports**: One-click downloads for:
     - `nosenet_sensor_readings.csv` (Complete ESP32 telemetry).
     - `nosenet_manual_assessments.csv` (Sensory ratings with confidence and notes).
     - `nosenet_samples.csv` (Cake metadata and storage combinations).
     - `nosenet_experiments.csv` (Experiment protocols and baseline control values).
  2. **JSON Project Backup**:
     - Clicking **“Download Full Project JSON Backup”** bundles the entire local database into a single file with application metadata, version (`1.0.0`), and export timestamp.
  3. **JSON Restore**:
     - User uploads a `.json` backup file.
     - `BackupService.validateBackupFile()` runs the payload through `ProjectBackupSchema` in Zod.
     - If schema validation fails, specific issue paths and error messages are displayed.
     - If valid, a restore preview modal displays counts of experiments, samples, readings, and assessments.
     - User selects **Merge Mode** (keeps existing records and adds new ones) or checks **Replace all existing data** (wipes and overwrites).
  4. **Demo Seeder**: Clicking **“Load College Dataset”** instantly populates realistic sample data across Normal Cake, Pastry Cake, Frozen, and Unfrozen runs with ESP32 readings and sensory logs.

---

### Feature 10: Second-Phone Assessment Architecture
- **Location**: `src/app/assess/page.tsx`, `src/components/layout/role-banner.tsx`.
- **Purpose**: Prepares the mobile-friendly assessment page for future multi-device operation while remaining completely transparent about current localStorage limitations.
- **Working Procedure**:
  1. The page layout is fully responsive and touch-optimized for smartphone screens.
  2. An architecture notice explicitly explains:
     > *“Browser localStorage is isolated per device and browser profile. In this local development version, assessments saved on this device persist in this browser. True real-time synchronization between separate physical phones will be enabled in Phase 2 via a shared WebSocket / REST backend.”*
  3. All evaluation operations are isolated inside `AssessmentService`, meaning swapping local storage for a REST endpoint requires zero UI changes.

---

## 5. Complete Application Codebase Architecture

```
NoseNet/
├── src/
│   ├── app/                                    # Next.js 16 App Router Routes
│   │   ├── globals.css                         # Pure Black (#000000) & White (#ffffff) Tailwind tokens
│   │   ├── layout.tsx                          # Root Layout with ThemeProvider & AppProvider
│   │   ├── page.tsx                            # Route: / (Overview Dashboard)
│   │   ├── ai/page.tsx                         # Route: /ai (AI Pipeline & Readiness)
│   │   ├── assess/page.tsx                     # Route: /assess (Mobile Assessor Terminal)
│   │   ├── backup/page.tsx                     # Route: /backup (CSV Exports & JSON Backup/Restore)
│   │   ├── experiments/page.tsx                # Route: /experiments (Experiment Protocols)
│   │   ├── experiments/[id]/page.tsx           # Route: /experiments/[id] (Single Experiment Details)
│   │   ├── guide/page.tsx                      # Route: /guide (Technical Engineering Documentation)
│   │   ├── login/page.tsx                      # Route: /login (Demo Sign-In & Role Selector)
│   │   ├── samples/page.tsx                    # Route: /samples (Cake Matrix Management)
│   │   └── sensor/page.tsx                     # Route: /sensor (ESP32 Ingestion & Recharts Graphs)
│   │
│   ├── components/                             # Modular Pure Black/White UI Components
│   │   ├── charts/
│   │   │   └── sensor-timeseries-chart.tsx     # Recharts multi-metric chart with SMA-5 overlay
│   │   ├── common/
│   │   │   ├── badge.tsx                       # Status and categorical badges
│   │   │   ├── button.tsx                      # Accessible high-contrast button variants
│   │   │   ├── confirm-dialog.tsx              # Confirmation modal with loading state
│   │   │   ├── empty-state.tsx                 # Zero-data prompt with action buttons
│   │   │   └── modal.tsx                       # Accessible dialog wrapper with Escape & backdrop dismiss
│   │   ├── dashboard/
│   │   │   ├── ai-status-banner.tsx            # Prominent ML readiness banner on overview
│   │   │   └── stat-card.tsx                   # High-contrast metric tile
│   │   ├── experiments/
│   │   │   └── experiment-form-modal.tsx       # Experiment creation & edit form with control baselines
│   │   ├── layout/
│   │   │   ├── footer.tsx                      # Technical footer with architecture badges
│   │   │   ├── navbar.tsx                      # Desktop and mobile responsive navigation bar
│   │   │   └── role-banner.tsx                 # Active demo session identity banner & role switch
│   │   ├── samples/
│   │   │   └── sample-form-modal.tsx           # Sample registration form with combination preview
│   │   └── sensor/
│   │       ├── csv-upload-dropzone.tsx         # Drag & drop CSV uploader with preview modal
│   │       └── sensor-data-table.tsx           # Paginated raw readings table with CSV download
│   │
│   ├── context/                                # React Context Providers
│   │   ├── app-context.tsx                     # Global reactive data context & refresh dispatch
│   │   └── theme-context.tsx                   # High-contrast theme manager
│   │
│   ├── lib/                                    # Utilities & Zod Schemas
│   │   ├── utils.ts                            # Class merge (clsx + twMerge), formatters, ID generators
│   │   ├── storage/                            # Decoupled Storage Adapter Layer
│   │   │   ├── storage-adapter.interface.ts    # IStorageAdapter contract
│   │   │   ├── local-storage-adapter.ts        # Browser localStorage implementation
│   │   │   └── memory-storage-adapter.ts       # In-memory storage for SSR & Vitest tests
│   │   └── validation/                         # Zod Validation Schemas
│   │       ├── ai.schema.ts
│   │       ├── assessment.schema.ts
│   │       ├── auth.schema.ts
│   │       ├── backup.schema.ts
│   │       ├── experiment.schema.ts
│   │       ├── sample.schema.ts
│   │       └── sensor.schema.ts
│   │
│   ├── services/                               # Domain Service Business Logic
│   │   ├── ai-service.ts
│   │   ├── assessment-service.ts
│   │   ├── auth-service.ts
│   │   ├── backup-service.ts
│   │   ├── experiment-service.ts
│   │   ├── sample-service.ts
│   │   ├── sensor-service.ts
│   │   └── index.ts                            # Service factory registering active IStorageAdapter
│   │
│   ├── test/                                   # Vitest Unit & Integration Test Suites
│   │   ├── setup.ts                            # JSDOM & Testing Library initialization
│   │   ├── ai-disabled.test.ts
│   │   ├── assessment.test.ts
│   │   ├── backup-restore.test.ts
│   │   ├── experiment-sample.test.ts
│   │   ├── persistence.test.ts
│   │   ├── sensor-csv.test.ts
│   │   ├── sensor-graph-filter.test.ts
│   │   └── ui-components.test.tsx
│   │
│   └── types/                                  # TypeScript Domain Types & Interfaces
│       ├── ai.ts
│       ├── assessment.ts
│       ├── auth.ts
│       ├── backup.ts
│       ├── experiment.ts
│       ├── index.ts
│       ├── sample.ts
│       └── sensor.ts
│
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.mjs
└── README.md
```

---

## 6. Step-by-Step End-to-End Laboratory Workflow

Follow this standard procedure to test or demonstrate the NoseNet platform:

```
┌────────────────────────────────────────────────────────────────────────┐
│  Step 1: Sign in as "Lead Researcher" at /login                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 2: Create Experiment Protocol at /experiments                    │
│          Record ROOM & EMPTY_CONTAINER reference baselines             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 3: Register Cake Specimens at /samples                           │
│          Normal vs Pastry Cake × Frozen vs Unfrozen + Replicate IDs    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 4: Ingest ESP32 Telemetry CSV at /sensor                         │
│          Upload SD card log, inspect row preview, confirm import       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 5: Analyze Sensor Time-Series at /sensor                         │
│          Filter by sample & stage; inspect Gas Resistance curve & SMA-5│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 6: Conduct Sensory Evaluations at /assess                        │
│          Log "Fresh", "Average", or "Not Good" with confidence & notes │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 7: Check Disagreement Alerts on Dashboard (/)                    │
│          Review multi-assessor consensus and conflict tracking         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 8: Monitor ML Dataset Readiness at /ai                           │
│          Verify paired sensor + sensory records progress bar           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│  Step 9: Export Research Tables & Full JSON Snapshot at /backup        │
│          Download CSVs for statistical modeling or archive JSON backup │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Local Setup, Development & Production Commands

### Prerequisites
- **Node.js**: v18.x, v20.x, or v22.x+ (Tested on Node.js v24)
- **npm**: v10.x or higher

### 1. Installation
```bash
# Clone the repository and navigate to folder
cd NoseNet

# Install dependencies
npm install
```

### 2. Start Development Server
```bash
npm run dev -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Run Automated Vitest Test Suite
```bash
npm test
```
Executes all 25 unit and integration tests covering persistence, CSV parsing, duplicate prevention, sensor filtering, assessment history, disagreement detection, backup restore, and AI disabled states.

### 4. Run TypeScript Type Check
```bash
npx tsc --noEmit
```

### 5. Run ESLint
```bash
npm run lint
```

### 6. Compile Production Build
```bash
npm run build
npm start -- -p 3000
```

---

## 8. Testing & Quality Verification Matrix

| Test Suite File | Tests Passed | Validated Behavior |
|---|---|---|
| `src/test/persistence.test.ts` | 2/2 | LocalStorage persistence, serialization, reload recovery, and empty-state initialization. |
| `src/test/experiment-sample.test.ts` | 4/4 | Experiment creation, editing, sample replicate generation, and distinct status transitions (`Planned` $\rightarrow$ `Testing` $\rightarrow$ `Completed`). |
| `src/test/sensor-csv.test.ts` | 4/4 | ESP32 CSV parsing, field mapping, Zod schema row validation, and duplicate rejection on re-import. |
| `src/test/sensor-graph-filter.test.ts` | 3/3 | Filtering sensor readings by Experiment, Sample, and Stage; calculation of 5-point Simple Moving Average (SMA-5). |
| `src/test/assessment.test.ts` | 3/3 | Sensory assessment logging, multi-evaluation preservation without overwrite, and panelist disagreement detection. |
| `src/test/ai-disabled.test.ts` | 2/2 | AI inference disabled status, absence of fabricated confidence/accuracy, and paired dataset count calculation. |
| `src/test/backup-restore.test.ts` | 4/4 | Full JSON backup export, Zod schema verification on restore, and merge vs. overwrite options. |
| `src/test/ui-components.test.tsx` | 3/3 | High-contrast button rendering, modal escape key dismissal, and status badge variant styling. |
| **Total** | **25 / 25 Passed** | **100% Green across all domain and UI layers** |

---

## 9. Pre-Production Roadmap & Backend Integration

To transition NoseNet from local development into university-wide production:

1. **Deploy Ingestion Microservice**:
   - Create an Express / FastAPI ingestion service connected to an MQTT broker (Eclipse Mosquitto).
   - Configure the ESP32 firmware to publish telemetry payloads directly via Wi-Fi over MQTT.
2. **Swap the Storage Adapter**:
   - Create `HttpStorageAdapter` implementing `IStorageAdapter` (`src/lib/storage/`).
   - In `src/services/index.ts`, replace `LocalStorageAdapter` with `HttpStorageAdapter` pointing to PostgreSQL via Prisma ORM. No UI components require modification.
3. **Multi-Phone WebSockets**:
   - Implement WebSocket rooms keyed by `experimentId` and `sampleId`.
   - When an assessor submits an evaluation on a smartphone, the server broadcasts an event to immediately update the researcher's laptop dashboard in real time.
4. **Train and Deploy the ML Model**:
   - Collect at least 200 paired batches across Normal and Pastry Cake specimens.
   - Extract key features: baseline ratio ($R_{cake} / R_0$), area under curve, response rise time, and recovery slope.
   - Train an SVM or Random Forest classifier cross-validated against standard plate count agar assays ($CFU/g$).
   - Export model to ONNX runtime and enable state `Validated and Enabled` on `/ai`.

---

**Developed for the Academic Capstone Project**: *“IoT-Based Cake Freshness and Adulteration Detection Device”*  
*Local-First • Scientific Rigor • Pure Black & Pure White Interface*
