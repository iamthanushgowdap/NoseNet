# NoseNet: IoT-Based Cake Freshness and Adulteration Detection Device

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Web Bluetooth](https://img.shields.io/badge/Web_Bluetooth-W3C_Standard-0052cc?style=flat&logo=bluetooth)](https://web.dev/bluetooth/)
[![Tests](https://img.shields.io/badge/Vitest-31%20Passed-emerald?style=flat&logo=vitest)](https://vitest.dev/)

> **Visvesvaraya Technological University (VTU), Belagavi**  
> **Department of Information Science and Engineering**  
> **A.P.S. College of Engineering, Bengaluru – 560116**  
> *Academic Year: 2026 – 2027*

---

## 👤 Project Author & Mentorship

- **Thanush Gowda P** (1AP23IS056)

- **Project Guide**: **Prof. Lohit J K**, Assistant Professor, Dept. of ISE, APSCE
- **Coordinator & HOD**: **Dr. Mithun B N**, Professor & Head, Dept. of ISE, APSCE
- **Principal**: **Dr. D. G. Anand**, Principal, APSCE

---

## 📌 Executive Summary

Food safety and perishable food quality monitoring are critical to public health and retail integrity. Commercial bakeries commonly rely on printed expiry dates; however, these static dates cannot account for broken cold chains, ambient humidity spikes, or micro-bacterial proliferation in retail display counters. Furthermore, early-stage spoilage and lipid souring are visually indistinguishable to consumers, while conventional detection techniques (HPLC, microbiological culturing) require destructive sampling, expensive reagents, and 24 to 72 hours of turnaround time.

**NoseNet** is an autonomous, non-destructive, Internet-of-Things (IoT) electronic nose platform engineered for rapid cake freshness classification and volatile spoilage deconvolution. By pairing an **ESP32-WROOM-32** microcontroller with a **SmartElex Bosch BME688** metal-oxide semiconductor (MOX) gas sensor in an airtight food-grade testing chamber, NoseNet captures distinct gas resistance signatures that correlate directly with freshness decay. Telemetry is streamed in real time to an architectural web dashboard via native **Web Bluetooth Low Energy (BLE)**, delivering an objective diagnostic verdict in under 15 seconds.

---

## 🔬 Scientific Principle: Metal-Oxide Chemisorption

NoseNet operates on the physics of metal-oxide semiconductor (MOX) chemisorption on a Tin Dioxide ($\text{SnO}_2$) sensing layer at $320^\circ\text{C}$:

1. **Clean Air Baseline**: Atmospheric oxygen adsorbs onto the heated $\text{SnO}_2$ crystalline grain boundaries, extracting conduction electrons:
   $$\text{O}_{2\text{ (gas)}} + 2e^- \longrightarrow 2\text{O}^-_{\text{(adsorbed)}}$$
   This creates a wide depletion barrier, resulting in a **high baseline electrical resistance** ($R_0 \approx 36\text{ to }47\text{ k}\Omega$).

2. **Volatile Spoilage Release**: As bakery specimens degrade, bacterial metabolism and lipid oxidation release reducing volatile organic compounds (VOCs) including **ethanol**, **acetic acid**, **ethyl acetate**, **diacetyl**, and **ammonia**.

3. **Catalytic Reaction & Resistance Drop**: The reducing volatiles react catalytically with the adsorbed oxygen ions, releasing trapped electrons back into the semiconductor conduction band:
   $$\text{VOC} + \text{O}^-_{\text{(adsorbed)}} \longrightarrow \text{VOC-O} + e^-$$
   This causes the electrical resistance ($R_{\text{gas}}$) to drop proportionally to volatile concentration. The relative volatile shift is computed as:
   $$\frac{\Delta R}{R_0}\text{ (\%)} = \left[ \frac{R_{\text{gas}} - R_0}{R_0} \right] \times 100$$

4. **Automated Thermal Calibration (5s Pre-Heater Cycle)**: Prior to active data capture, the ESP32 initiates a 5-second $320^\circ\text{C}$ hotplate burn-off countdown to desorb residual condensates from previous trials and establish a stable baseline resistance $R_0$.

---

## 📊 4-Tier Freshness Classification Matrix

| Freshness Level | Freshness Index Range | Resistance Shift ($\Delta R/R_0$) | Organoleptic & Biochemical Characteristics |
| :--- | :--- | :--- | :--- |
| **Fresh** | **88.0% – 100.0%** | $-5.0\%\text{ to }+10.0\%$ | Peak quality. Springy crumb, sweet vanilla/butter aroma, zero souring. Safe. |
| **Fairly Fresh** | **70.0% – 87.9%** | $-15.0\%\text{ to }-5.1\%$ | Acceptable quality. Slight moisture loss, aroma muted. Safe for 24–48 hours. |
| **Stale** | **40.0% – 69.9%** | $-35.0\%\text{ to }-15.1\%$ | Starch retrogradation (crystallization). Crumb dry and crumbly, oxidation notes. |
| **Spoiled** | **0.0% – 39.9%** | $< -35.0\%$ | Critical microbial hazard. Strong sour/acidic volatile emissions. Unsafe! |

---

## 📈 7-Day Empirical Longitudinal Validation (52 Records)

We conducted an exhaustive 7-day longitudinal degradation study on 4 distinct cake configurations purchased from a commercial bakery on 26/10/2026 at 5:00 PM (baked approximately 11:30 AM), tracking 52 empirical data points across 13 time intervals ($0\text{h}$ to $168\text{h}$):

| Specimen Configuration | 0h (Purchase) | 24h (Day 1) | 72h (Day 3) | 168h (Day 7) | Net Volatile Shift | Final Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Normal Cake — Unfrozen** | $36.80\text{ k}\Omega$ (98.5%) | $38.50\text{ k}\Omega$ (90.2%) | $36.50\text{ k}\Omega$ (72.0%) | $16.80\text{ k}\Omega$ (21.5%) | **-54.3%** | **SPOILED** (Day 7) |
| **Normal Cake — Frozen** | $46.50\text{ k}\Omega$ (98.8%) | $47.50\text{ k}\Omega$ (94.2%) | $44.80\text{ k}\Omega$ (89.5%) | $41.50\text{ k}\Omega$ (79.0%) | **-11.3%** | **FAIRLY FRESH** (Day 7) |
| **Pastry Cake — Unfrozen** | $40.80\text{ k}\Omega$ (98.0%) | $40.05\text{ k}\Omega$ (89.4%) | $22.40\text{ k}\Omega$ (26.5%) | $7.90\text{ k}\Omega$ (3.2%) | **-80.3%** | **CRITICAL SPOILED** (Day 7) |
| **Pastry Cake — Frozen** | $40.20\text{ k}\Omega$ (98.4%) | $40.62\text{ k}\Omega$ (93.5%) | $47.80\text{ k}\Omega$ (90.5%) | $41.60\text{ k}\Omega$ (77.4%) | **+2.4%** | **FAIRLY FRESH** (Day 7) |

### Key Experimental Discoveries:
1. **Pastry Cream Souring**: Room-temperature pastry cake cream underwent rapid lactic acid and bacterial souring, causing an **80.3% resistance collapse** ($40.05\text{ k}\Omega \rightarrow 7.90\text{ k}\Omega$). This validates the bakery recommendation that unpackaged pastry cakes expire within 24–48 hours.
2. **Sponge Staling vs. Mold**: Normal sponge cake exhibited starch retrogradation during Days 1 to 3 ($36.5\text{ k}\Omega$), followed by aggressive fungal mold proliferation between Days 4 and 7 ($-54.3\%$), aligning with the 3-day freshness window.
3. **Freezing Arrests Volatile Decay**: Freezer preservation ($-18^\circ\text{C}$) successfully arrested enzymatic volatile emission for both cake matrices, maintaining gas resistance above $41.5\text{ k}\Omega$ throughout the 168-hour study.

---

## 🛠️ Hardware Specification & Pinout

- **Microcontroller**: ESP32-WROOM-32 (Tensilica Xtensa Dual-Core 32-bit LX6 @ 240MHz, BLE 4.2)
- **Sensor**: SmartElex Bosch BME688 AI Multi-Gas Environmental Sensor
- **Chamber**: Cylindrical Food-Grade Polypropylene Enclosure (120mm base × 75mm height, 650mL)
- **Mounting**: Inverted 48mm ABS protective dome mounted through the clear lid
- **Bus Interface**: 400 kHz Fast-Mode I²C (Address `0x76`)

### Hardware Pin Mapping:
| ESP32 Dev Board Pin | Pin Function | BME688 Sensor Pin | Wire Color & Signal Description |
| :--- | :--- | :--- | :--- |
| **3V3 (Pin 1)** | Power Out | **VCC / 3V3** | Red Wire: Clean Regulated +3.3V DC Power Rail |
| **GND (Pin 2)** | System Ground | **GND** | Black Wire: Common Reference Return Ground |
| **GPIO 21 (Pin 23)** | I²C Data | **SDA** | Yellow Wire: Bidirectional Serial Data (4.7kΩ pull-up) |
| **GPIO 22 (Pin 26)** | I²C Clock | **SCL** | Green Wire: Synchronous Serial Clock @ 400 kHz |
| **GPIO 2 (Pin 24)** | Telemetry Indicator | — | Onboard Blue LED (pulses during active broadcast) |

---

## 💻 Software Architecture & Tech Stack

- **Microcontroller Firmware**: C++ / ESP-IDF Core with Bosch BME68x sensor library in forced heating mode.
- **Wireless Layer**: W3C Web Bluetooth Low Energy (BLE 4.2) using Nordic UART Service (NUS) UUID `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`. Direct browser-to-hardware connectivity without mobile apps.
- **Frontend Architecture**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **Design System**: Pitch Black (`#000000`) high-contrast theme, Vercel Geist typography, responsive bento grid.
- **Visualization**: Custom SVG Bézier curve scrubber with cubic polynomial smoothing and pointer-tracking crosshair.
- **Audit Ledger**: In-app 52-record experimental ledger modal with instant CSV export (`/api/dataset`).
- **Failover Security**: Hardware link lock prevents test execution when Bluetooth connection is inactive.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18.x or newer
- npm or pnpm
- Google Chrome or Microsoft Edge (with Web Bluetooth support)
- ESP32 Development Board + SmartElex BME688 sensor module

### 2. Installation
```bash
git clone https://github.com/iamthanushgowdap/NoseNet.git
cd NoseNet
npm install
```

### 3. Running the Web Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Unit Tests
```bash
npm test
```
*Current test suite: 31/31 unit tests passing (Vitest + React Testing Library).*

---

## 📜 Academic License

This project is developed for the Bachelor of Engineering (B.E.) degree in Information Science & Engineering at A.P.S. College of Engineering, affiliated with Visvesvaraya Technological University (VTU), Belagavi.
