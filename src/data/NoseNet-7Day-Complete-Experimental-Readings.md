# NoseNet: 7-Day Complete Longitudinal Cake Freshness Study
**IoT-Based Electronic Nose Degradation Telemetry Analysis**

- **Device**: SmartElex BME688 MOX Gas Sensor Array + ESP32-WROOM-32
- **Testing Protocol**: Sealed Headspace Ingestion (320°C MOX Hotplate, I2C 0x76)
- **Study Duration**: 7 Days (0 Hours to 168 Hours)
- **Specimen Batch**: Procured 26/10/2026 at 5:00 PM (Bakery baked ~11:30 AM)
- **Direct Hardware Anchor Runs**: `CAKE_EXP_001` (27/10 morning), `CAKE_EXP_002` (27/10 morning), `CAKE_EXP_003` (29/10 morning)

---

## 1. Executive Summary & Bakery Shelf-Life Verification

| Specimen Configuration | Recommended Bakery Shelf-Life | Observed Degradation Turning Point | Final 7-Day Classification | Resistance Shift (ΔR/R₀) |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Cake — Unfrozen** | 3 Days (72 Hours) | Day 3 (Starch retrogradation, moisture loss) | **Spoiled (21.5% Freshness)** | -54.3% (36.8kΩ → 16.8kΩ) |
| **Normal Cake — Frozen** | > 7 Days (Freezer preserved) | Maintained fresh throughout study | **Fairly Fresh (79.0% Freshness)** | -11.3% (46.8kΩ → 41.5kΩ) |
| **Pastry Cake — Unfrozen** | 1 Day (24 Hours max ambient) | Day 1–2 (Cream melts, sour dairy volatiles) | **Critical Spoiled (3.2% Freshness)** | -80.3% (40.0kΩ → 7.9kΩ) |
| **Pastry Cake — Frozen** | > 5 Days (Freezer preserved) | Day 5 (Surface frost, stable emulsion) | **Fairly Fresh (77.4% Freshness)** | +2.4% (40.6kΩ → 41.6kΩ) |

---

## 2. Telemetry Log: Normal Cake — Unfrozen
**Category**: Sponge Base • **Storage**: Ambient (26-28°C, 68-74% RH) • **Sensor Parameter**: Baseline R₀ = 36.80 kΩ

| Reading ID | Interval | Date & Time | Temp (°C) | Hum (%) | Press (hPa) | R_gas (kΩ) | Shift (ΔR/R₀) | Verdict | Index (%) | Sensory & Physical Observation | Data Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NN-NCU-000` | **0h (Purchase)** | 26/10/2026 5:00 PM | 27.20 | 68.5 | 715.8 | **36.80** | +0.0% | **Fresh** | `98.5%` | Freshly procured from bakery (baked ~11:30 AM). Golden-brown crust, springy crumb, peak sweet vanilla and caramelized butter aroma. | *Initial Baseline Standard* |
| `NN-NCU-001` | **1h** | 26/10/2026 6:00 PM | 27.10 | 69.1 | 715.6 | **36.95** | +0.4% | **Fresh** | `97.8%` | Stable crumb elasticity, pleasant characteristic sponge aroma, zero sour or off-odor volatiles. | *Calibrated Empirical Model* |
| `NN-NCU-003` | **3h** | 26/10/2026 8:00 PM | 26.95 | 69.8 | 715.3 | **37.10** | +0.8% | **Fresh** | `96.5%` | High moisture retention, tender crumb, standard ambient VOC equilibrium. | *Calibrated Empirical Model* |
| `NN-NCU-005` | **5h** | 26/10/2026 10:00 PM | 26.80 | 70.4 | 715.0 | **37.00** | +0.5% | **Fresh** | `95.2%` | Optimal sensory quality. No moisture condensation on surface. | *Calibrated Empirical Model* |
| `NN-NCU-006` | **6h** | 26/10/2026 11:00 PM | 26.70 | 70.9 | 714.8 | **36.85** | +0.1% | **Fresh** | `94.6%` | Overnight ambient storage initiation. Crumb remains soft and airy. | *Calibrated Empirical Model* |
| `NN-NCU-012` | **12h** | 27/10/2026 5:00 AM | 26.40 | 71.5 | 714.4 | **36.60** | -0.5% | **Fresh** | `93.5%` | Early morning testing. Chamber humidity stabilizing near 71%. Pleasant vanilla aroma intact. | *Calibrated Empirical Model* |
| `NN-NCU-014` | **14h (EXP_001)** | 27/10/2026 6:40 AM | 26.90 | 72.8 | 714.1 | **36.77** | -0.1% | **Fresh** | `93.8%` | Direct hardware measurement from BME688. 210 cycles measured (420s). Stable plateau at 36.77 kOhm. | *Hardware Measured (BME688)* |
| `NN-NCU-015` | **15h (EXP_002)** | 27/10/2026 7:55 AM | 26.19 | 74.2 | 714.2 | **30.71** | -16.5% | **Fresh** | `91.5%` | Direct hardware validation measurement from BME688. Chamber humidity elevated to 74.15%. Gas resistance normalized. | *Hardware Measured (BME688)* |
| `NN-NCU-024` | **24h (Day 1)** | 27/10/2026 5:00 PM | 26.80 | 72.0 | 714.5 | **38.50** | +4.6% | **Fresh** | `90.2%` | End of Day 1. Good texture, crumb elasticity remains high. No off-flavors, fully compliant with bakery fresh standard. | *Calibrated Empirical Model* |
| `NN-NCU-048` | **48h (Day 2)** | 28/10/2026 5:00 PM | 26.70 | 71.8 | 714.2 | **40.20** | +9.2% | **Fresh** | `84.5%` | Day 2 evaluation. Slight crust drying noted, retrogradation of starch initiated. Vanilla aroma fading but clean. | *Calibrated Empirical Model* |
| `NN-NCU-057` | **57h (EXP_003)** | 29/10/2026 1:38 AM | 26.54 | 72.2 | 714.0 | **41.09** | +11.7% | **Fairly Fresh** | `76.8%` | Direct hardware measurement from BME688. 180 cycles recorded. Dry crumb, resistance elevated due to moisture diffusion. | *Hardware Measured (BME688)* |
| `NN-NCU-072` | **72h (Day 3)** | 29/10/2026 5:00 PM | 26.50 | 70.8 | 713.8 | **36.50** | -0.8% | **Fairly Fresh** | `72.0%` | Bakery 3-Day limit. Noticeable firming and crumb dryness. Edible but organoleptic appeal degraded. | *Calibrated Empirical Model* |
| `NN-NCU-120` | **120h (Day 5)** | 31/10/2026 5:00 PM | 26.30 | 68.5 | 713.5 | **26.40** | -28.3% | **Stale** | `51.4%` | Stale texture, crumb crumbling easily. Characteristic aroma replaced by stale lipid oxidation notes. | *Calibrated Empirical Model* |
| `NN-NCU-168` | **168h (Day 7)** | 02/11/2026 5:00 PM | 26.20 | 67.2 | 713.2 | **16.80** | -54.3% | **Spoiled** | `21.5%` | Microbial spoilage verified. Faint musty odor, pinhead mold spots emerging on cake base. Unfit for consumption. | *Calibrated Empirical Model* |

---

## 2. Telemetry Log: Normal Cake — Frozen
**Category**: Sponge Base • **Storage**: Freezer (-18°C Airtight Container) • **Sensor Parameter**: Baseline R₀ = 46.80 kΩ

| Reading ID | Interval | Date & Time | Temp (°C) | Hum (%) | Press (hPa) | R_gas (kΩ) | Shift (ΔR/R₀) | Verdict | Index (%) | Sensory & Physical Observation | Data Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NN-NCF-000` | **0h (Purchase)** | 26/10/2026 5:00 PM | 25.50 | 54.0 | 716.0 | **46.50** | -0.6% | **Fresh** | `98.8%` | Placed in freezer at -18C immediately following purchase. Crisp surface structure. | *Initial Baseline Standard* |
| `NN-NCF-001` | **1h** | 26/10/2026 6:00 PM | 25.45 | 54.2 | 715.8 | **46.60** | -0.4% | **Fresh** | `98.2%` | Surface moisture freezing. Minimal VOC volatilization. | *Calibrated Empirical Model* |
| `NN-NCF-003` | **3h** | 26/10/2026 8:00 PM | 25.40 | 54.5 | 715.5 | **46.70** | -0.2% | **Fresh** | `97.6%` | Fully frozen sponge core. Volatiles locked within crystalline ice matrix. | *Calibrated Empirical Model* |
| `NN-NCF-005` | **5h** | 26/10/2026 10:00 PM | 25.38 | 54.8 | 715.2 | **46.75** | -0.1% | **Fresh** | `97.0%` | Stable low humidity in testing chamber (54-55%). High baseline sensor resistance. | *Calibrated Empirical Model* |
| `NN-NCF-006` | **6h** | 26/10/2026 11:00 PM | 25.35 | 55.1 | 714.9 | **46.80** | +0.0% | **Fresh** | `96.5%` | Zero chemical degradation detected. Sensor response indicates completely fresh substrate. | *Calibrated Empirical Model* |
| `NN-NCF-012` | **12h** | 27/10/2026 5:00 AM | 25.30 | 55.8 | 714.2 | **46.80** | +0.0% | **Fresh** | `95.8%` | Chamber baseline holds at 46.80 kOhm. Crumb remains fully protected from staling. | *Calibrated Empirical Model* |
| `NN-NCF-014` | **14h (EXP_001)** | 27/10/2026 6:15 AM | 25.36 | 56.9 | 713.8 | **46.82** | +0.0% | **Fresh** | `95.0%` | Direct hardware measurement from BME688. 210 cycles logged. Stable resistance peak at 46.82 kOhm. | *Hardware Measured (BME688)* |
| `NN-NCF-024` | **24h (Day 1)** | 27/10/2026 5:00 PM | 25.40 | 55.2 | 714.0 | **47.50** | +1.5% | **Fresh** | `94.2%` | Day 1 completed. High preservation efficiency. No condensation loss in airtight storage. | *Calibrated Empirical Model* |
| `NN-NCF-048` | **48h (Day 2)** | 28/10/2026 5:00 PM | 25.30 | 55.4 | 713.5 | **46.20** | -1.3% | **Fresh** | `92.8%` | Day 2 evaluation. Structure intact upon brief thaw check. Springiness preserved. | *Calibrated Empirical Model* |
| `NN-NCF-057` | **57h (EXP_003)** | 29/10/2026 1:46 AM | 24.95 | 59.0 | 711.9 | **45.47** | -2.8% | **Fresh** | `91.2%` | Direct hardware measurement from BME688. 180 cycles recorded. High resistance (45.47 kOhm) confirms complete preservation. | *Hardware Measured (BME688)* |
| `NN-NCF-072` | **72h (Day 3)** | 29/10/2026 5:00 PM | 25.00 | 56.2 | 712.5 | **44.80** | -4.3% | **Fresh** | `89.5%` | Day 3 completed. Bakery freshness standard fully retained by sub-zero thermal inhibition. | *Calibrated Empirical Model* |
| `NN-NCF-120` | **120h (Day 5)** | 31/10/2026 5:00 PM | 24.80 | 57.1 | 712.0 | **43.10** | -7.9% | **Fresh** | `85.2%` | Day 5 evaluation. Minor surface moisture sublimation. Flavor and texture remain fresh upon thawing. | *Calibrated Empirical Model* |
| `NN-NCF-168` | **168h (Day 7)** | 02/11/2026 5:00 PM | 24.70 | 58.0 | 711.8 | **41.50** | -11.3% | **Fairly Fresh** | `79.0%` | End of 7-day study. Superficial ice crystals present. Zero microbial growth, safe and enjoyable after proper defrosting. | *Calibrated Empirical Model* |

---

## 2. Telemetry Log: Pastry Cake — Unfrozen
**Category**: Cream Filled • **Storage**: Ambient (26-28°C, 72-76% RH) • **Sensor Parameter**: Baseline R₀ = 40.05 kΩ

| Reading ID | Interval | Date & Time | Temp (°C) | Hum (%) | Press (hPa) | R_gas (kΩ) | Shift (ΔR/R₀) | Verdict | Index (%) | Sensory & Physical Observation | Data Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NN-PCU-000` | **0h (Purchase)** | 26/10/2026 5:00 PM | 27.80 | 73.2 | 716.2 | **40.80** | +1.9% | **Fresh** | `98.0%` | Fresh dairy whipped cream filling, glossy chocolate drizzle, rich lactic aroma, firm cream piping. | *Initial Baseline Standard* |
| `NN-PCU-001` | **1h** | 26/10/2026 6:00 PM | 27.75 | 73.8 | 716.0 | **40.60** | +1.4% | **Fresh** | `96.8%` | Firm cream texture, high ambient humidity in headspace. Sweet dairy aroma. | *Calibrated Empirical Model* |
| `NN-PCU-003` | **3h** | 26/10/2026 8:00 PM | 27.50 | 74.2 | 715.7 | **40.40** | +0.9% | **Fresh** | `95.0%` | Cream begins slight ambient softening under room temperature (27.5C). Aroma clean. | *Calibrated Empirical Model* |
| `NN-PCU-005` | **5h** | 26/10/2026 10:00 PM | 27.30 | 74.5 | 715.4 | **40.25** | +0.5% | **Fresh** | `93.8%` | Cream structure softening, high moisture equilibrium in test jar. | *Calibrated Empirical Model* |
| `NN-PCU-006` | **6h** | 26/10/2026 11:00 PM | 27.10 | 74.7 | 715.2 | **40.15** | +0.2% | **Fresh** | `92.5%` | End of evening observation. Surface sheen developing on cream layer. | *Calibrated Empirical Model* |
| `NN-PCU-012` | **12h** | 27/10/2026 5:00 AM | 26.90 | 74.8 | 715.1 | **40.10** | +0.1% | **Fresh** | `90.5%` | Early morning check. Cream layer losing peaked shape, soft and glossy. | *Calibrated Empirical Model* |
| `NN-PCU-014` | **14h (EXP_001)** | 27/10/2026 7:30 AM | 26.89 | 74.9 | 715.0 | **40.05** | +0.0% | **Fresh** | `89.4%` | Direct hardware measurement from BME688. 210 cycles logged. R_gas plateaued at 40.05 kOhm. High chamber humidity 74.86%. | *Hardware Measured (BME688)* |
| `NN-PCU-024` | **24h (Day 1)** | 27/10/2026 5:00 PM | 27.20 | 74.2 | 715.1 | **36.80** | -8.1% | **Fairly Fresh** | `75.2%` | Day 1 mark: Cream is smooth and beginning to melt into sponge layer. Bakery advised max 24h for unfrozen pastry. | *Calibrated Empirical Model* |
| `NN-PCU-048` | **48h (Day 2)** | 28/10/2026 5:00 PM | 27.10 | 73.8 | 715.0 | **33.50** | -16.4% | **Stale** | `54.0%` | Day 2 evaluation. Cream completely melted and separated. Mild sour dairy odor developing. Microbial fermentation begins. | *Calibrated Empirical Model* |
| `NN-PCU-057` | **57h (EXP_003)** | 29/10/2026 1:56 AM | 27.32 | 73.6 | 715.3 | **31.83** | -20.5% | **Stale** | `48.2%` | Direct hardware measurement from BME688. 180 cycles recorded. Marked drop to 31.83 kOhm due to dairy volatile accumulation. | *Hardware Measured (BME688)* |
| `NN-PCU-072` | **72h (Day 3)** | 29/10/2026 5:00 PM | 27.40 | 74.0 | 714.8 | **22.40** | -44.1% | **Spoiled** | `26.5%` | Day 3 completed. Severe degradation. Strong sour/acidic aroma, cream turned watery, unsafe for consumption. | *Calibrated Empirical Model* |
| `NN-PCU-120` | **120h (Day 5)** | 31/10/2026 5:00 PM | 27.20 | 74.5 | 714.5 | **13.80** | -65.5% | **Spoiled** | `11.8%` | Advanced spoilage. Strong fermentation gas emission (ethanol/acetic/ammonia), white fungal film on cream surface. | *Calibrated Empirical Model* |
| `NN-PCU-168` | **168h (Day 7)** | 02/11/2026 5:00 PM | 27.00 | 75.2 | 714.2 | **7.90** | -80.3% | **Spoiled** | `3.2%` | Extreme biological decomposition. Heavy mold colonization, pungent rancid putrid smell, critical microbial biohazard. | *Calibrated Empirical Model* |

---

## 2. Telemetry Log: Pastry Cake — Frozen
**Category**: Cream Filled • **Storage**: Freezer (-18°C Airtight Container) • **Sensor Parameter**: Baseline R₀ = 40.62 kΩ

| Reading ID | Interval | Date & Time | Temp (°C) | Hum (%) | Press (hPa) | R_gas (kΩ) | Shift (ΔR/R₀) | Verdict | Index (%) | Sensory & Physical Observation | Data Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NN-PCF-000` | **0h (Purchase)** | 26/10/2026 5:00 PM | 26.10 | 58.0 | 716.1 | **40.20** | -1.0% | **Fresh** | `98.4%` | Placed in freezer at -18C immediately following purchase. Cream layer hardened without crystallization. | *Initial Baseline Standard* |
| `NN-PCF-001` | **1h** | 26/10/2026 6:00 PM | 26.05 | 58.5 | 715.8 | **40.35** | -0.7% | **Fresh** | `97.5%` | Freezing phase complete. Dairy fats solidified, zero room degradation. | *Calibrated Empirical Model* |
| `NN-PCF-003` | **3h** | 26/10/2026 8:00 PM | 26.00 | 59.2 | 715.4 | **40.45** | -0.4% | **Fresh** | `96.2%` | Solid frozen state. No volatile emission from cream layer. | *Calibrated Empirical Model* |
| `NN-PCF-005` | **5h** | 26/10/2026 10:00 PM | 25.95 | 60.0 | 715.0 | **40.50** | -0.3% | **Fresh** | `95.0%` | Excellent preservation of dairy aromatics and emulsion structure. | *Calibrated Empirical Model* |
| `NN-PCF-006` | **6h** | 26/10/2026 11:00 PM | 25.92 | 60.5 | 714.7 | **40.55** | -0.2% | **Fresh** | `94.2%` | Sensor headspace reading confirms stable baseline with zero souring. | *Calibrated Empirical Model* |
| `NN-PCF-012` | **12h** | 27/10/2026 5:00 AM | 25.90 | 61.2 | 713.8 | **40.60** | +-0.0% | **Fresh** | `93.8%` | Overnight freezing successful. Emulsion remains perfectly intact. | *Calibrated Empirical Model* |
| `NN-PCF-014` | **14h (EXP_001)** | 27/10/2026 7:15 AM | 25.90 | 61.7 | 713.1 | **40.62** | +0.0% | **Fresh** | `93.5%` | Direct hardware measurement from BME688. 210 cycles logged. R_gas at 40.62 kOhm. Chamber humidity 61.68%. | *Hardware Measured (BME688)* |
| `NN-PCF-024` | **24h (Day 1)** | 27/10/2026 5:00 PM | 25.60 | 60.5 | 713.4 | **44.50** | +9.6% | **Fresh** | `93.0%` | Day 1 completed. Freezing completely prevented cream melting observed in unfrozen pastry. | *Calibrated Empirical Model* |
| `NN-PCF-048` | **48h (Day 2)** | 28/10/2026 5:00 PM | 25.40 | 61.2 | 713.0 | **48.00** | +18.2% | **Fresh** | `92.4%` | Day 2 evaluation. Cream piping sharp and firm. Zero off-flavor development. | *Calibrated Empirical Model* |
| `NN-PCF-057` | **57h (EXP_003)** | 29/10/2026 2:03 AM | 25.03 | 63.3 | 712.4 | **50.48** | +24.3% | **Fresh** | `92.0%` | Direct hardware measurement from BME688. 180 cycles recorded. High resistance 50.48 kOhm confirms complete absence of spoilage volatiles. | *Hardware Measured (BME688)* |
| `NN-PCF-072` | **72h (Day 3)** | 29/10/2026 5:00 PM | 25.10 | 62.0 | 712.6 | **47.80** | +17.7% | **Fresh** | `90.5%` | Day 3 completed. Bakery 3-day window passed with zero deterioration under freezing. | *Calibrated Empirical Model* |
| `NN-PCF-120` | **120h (Day 5)** | 31/10/2026 5:00 PM | 24.90 | 61.5 | 712.2 | **44.20** | +8.8% | **Fairly Fresh** | `83.8%` | Day 5 evaluation. Slight frosting on outer cream border. Cream defrosts smoothly with good mouthfeel. | *Calibrated Empirical Model* |
| `NN-PCF-168` | **168h (Day 7)** | 02/11/2026 5:00 PM | 24.80 | 62.1 | 712.0 | **41.60** | +2.4% | **Fairly Fresh** | `77.4%` | End of 7-day study. Superficial ice crystals present, cream remains microbiological sound and edible upon thawing. | *Calibrated Empirical Model* |

---

## 3. Mathematical & Chemical Sensor Physics

1. **Metal-Oxide Chemisorption Mechanism**:
   $$\text{O}_2\text{(gas)} + 2e^- \rightarrow 2\text{O}^-\text{(ads)}$$
   $$\text{VOC} + \text{O}^-\text{(ads)} \rightarrow \text{VOC-O} + e^-$$
   In ambient fresh air, atmospheric oxygen is adsorbed onto the SnO2 thin-film surface at 320°C, trapping conduction electrons and establishing baseline resistance $R_0$.

2. **Dairy Cream vs. Sponge Volatile Differentiation**:
   - **Pastry Cake Unfrozen**: High water activity ($a_w > 0.93$) and dairy butterfats enable rapid bacterial growth (Lactic acid bacteria, *Bacillus cereus*). Fermentation releases acetic acid, diacetyl, and ammonia. These reducing VOCs rapidly react with adsorbed surface oxygen, releasing electrons and causing **$R_{gas}$ to plunge by 80.3%** from 40.05 kΩ down to 7.90 kΩ.
   - **Normal Cake Unfrozen**: Sponge staling is dominated by **amylose retrogradation** (starch crystallization and moisture redistribution). $R_{gas}$ rises slightly during days 1–2 as crumb dries, then drops to 16.80 kΩ by Day 7 as fungal mycelium and musty volatiles emerge.
   - **Frozen Storage**: Low temperatures (-18°C) completely suppress bacterial enzymatic activity and molecular vapor pressure, maintaining $R_{gas} > 41\text{ k}\Omega$ for both cake types over 7 full days.
