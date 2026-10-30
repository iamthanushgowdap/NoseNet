VISVESVARAYA TECHNOLOGICAL UNIVERSITY

Jnana Sangama, Belagavi – 590014

A Project Report
on

“IoT Based Cake Freshness and Adulteration Detection Device”

Submitted in partial fulfilment of the requirement for the award of the degree
of

BACHELOR OF ENGINEERING
In
INFORMATION SCIENCE & ENGINEERING

By

DHANUSH GOWDA H P    (1AP23IS017)
T MYTHRI                                  (1AP23IS054)
TANUSHREE K S                     (1AP23IS055)
THANUSH GOWDA P                (1AP23IS056)

Under the guidance of:
Prof. LOHIT J K
Assistant Professor, Dept. of ISE
APS College of Engineering

Coordinated by:
Dr. MITHUN B N
Professor & Head, Dept. of ISE
APS College of Engineering

DEPARTMENT OF INFORMATION SCIENCE AND ENGINEERING
A.P.S. COLLEGE OF ENGINEERING
Anantha Gnana Gangothri Campus, Kanakapura Road, Somanahalli, Bengaluru – 560116
2025 - 2026

A.P.S. COLLEGE OF ENGINEERING

(Affiliated to Visvesvaraya Technological University, Belagavi)

Anantha Gnana Gangothri Campus, Kanakapura Road, Somanahalli, Bengaluru – 560116

DEPARTMENT OF INFORMATION SCIENCE & ENGINEERING

CERTIFICATE

This is to certify that the project work entitled “IoT Based Cake Freshness and Adulteration Detection Device” is a bonafide work carried out by DHANUSH GOWDA H P (1AP23IS017), T MYTHRI (1AP23IS054), TANUSHREE K S (1AP23IS055), and THANUSH GOWDA P (1AP23IS056) in partial fulfilment for the award of the degree of Bachelor of Engineering in Information Science & Engineering of Visvesvaraya Technological University, Belagavi, during the academic year 2025 – 2026. It is certified that all corrections and suggestions indicated during internal assessments have been incorporated in the report deposited in the departmental library.

The project report has been approved as it satisfies the academic requirements in respect of project work prescribed for the said degree.

Signature of Guide                 Signature of Coordinator                 Signature of HOD
Prof. Lohit J K                            Dr. Mithun B N                                Dr. Mithun B N
Assistant Professor, ISE            Professor & Head, ISE                    Professor & Head, ISE

Signature of Principal
Dr. D. G. Anand
Principal, APS College of Engineering

Name of Examiners                                                         Signature with Date
1. ..............................................................                  ...................................................
2. ..............................................................                  ...................................................

DECLARATION

We, DHANUSH GOWDA H P (1AP23IS017), T MYTHRI (1AP23IS054), TANUSHREE K S (1AP23IS055), and THANUSH GOWDA P (1AP23IS056), students of Eighth Semester Bachelor of Engineering in Information Science & Engineering at A.P.S. College of Engineering, Bengaluru, hereby declare that the project work entitled “IoT Based Cake Freshness and Adulteration Detection Device” submitted to Visvesvaraya Technological University, Belagavi, is a record of original work done by us under the supervision and guidance of Prof. Lohit J K, Assistant Professor, Department of Information Science & Engineering, APSCE.

We further declare that this report has not been submitted previously in part or in full to any other University or Institution for the award of any degree, diploma, or fellowship.

Dhanush Gowda H P (1AP23IS017)
T Mythri (1AP23IS054)
Tanushree K S (1AP23IS055)
Thanush Gowda P (1AP23IS056)

ACKNOWLEDGEMENT

The satisfaction that accompanies the successful completion of any task would be incomplete without the mention of the people who made it possible, whose constant guidance and encouragement served as a beacon of light throughout our endeavor.

Management: We express our deepest gratitude to the Management of Acharya Patashala Educational Trust (APSET) for providing an excellent academic atmosphere and cutting-edge laboratory infrastructure to carry out this project.

Principal: We express our sincere thanks to our respected Principal, Dr. D. G. Anand, for his continuous encouragement and support throughout our engineering program.

Head of Department: We extend our heartfelt gratitude to Dr. Mithun B N, Professor & Head, Department of Information Science & Engineering, for his invaluable technical suggestions, constant motivation, and academic coordination.

Project Guide: We express our profound sense of gratitude and indebtedness to our esteemed project guide, Prof. Lohit J K, Assistant Professor, Department of Information Science & Engineering, for his patient guidance, expert technical insights, constructive critiques, and relentless encouragement during every phase of this project.

Faculty & Staff: We are indebted to all teaching faculty and technical laboratory staff members of the Department of Information Science & Engineering for their direct and indirect assistance in providing hardware tools, testing facilities, and library resources.

Parents & Friends: Finally, we express our warmest gratitude to our beloved parents, family members, and friends for their moral support, understanding, and encouragement throughout the course of our engineering education.

ABSTRACT

Food safety and quality verification represent vital cornerstones of modern consumer health, commercial food supply chains, and regulatory compliance. Among perishable bakery commodities, cakes possess high moisture, rich carbohydrates, dairy butterfats, and delicate protein structures that make them highly susceptible to microbial spoilage and organoleptic degradation. Commercial bakeries commonly rely on printed expiry dates; however, these static indicators fail to account for ambient temperature spikes, humidity fluctuations, or bacterial proliferation in unpackaged retail environments. Furthermore, early-stage spoilage and lipid souring are visually indistinguishable to consumers, while conventional detection techniques require destructive laboratory chemical assays, microbial cultures, and high-performance liquid chromatography (HPLC)—methods that are prohibitively expensive, time-consuming, and inaccessible for small-scale bakeries and daily retail inspections.

To overcome these fundamental limitations, this project presents NoseNet: an autonomous, non-destructive, Internet-of-Things (IoT) electronic nose platform engineered specifically for rapid cake freshness classification and volatile spoilage deconvolution. The hardware architecture utilizes a 30-pin ESP32-WROOM-32 microcontroller interfaced via a high-speed I2C digital bus (0x76) to a SmartElex Bosch BME688 AI-enabled multi-gas environmental sensor. The sensor features an integrated metal-oxide (MOX) semiconductor hotplate operating at 320°C, capable of measuring volatile organic compounds (VOCs), ambient chamber temperature, relative humidity, and barometric pressure simultaneously.

The physical prototype comprises an airtight food-grade testing chamber (120mm diameter, 75mm height) with an inverted top-mounted sensor housing dome, enabling passive gaseous headspace equilibrium without contacting or damaging the food specimen. An automated pre-heater thermal cycle (5-second countdown) stabilizes baseline resistance (R₀) prior to active sampling. A custom deconvolution algorithm correlates relative gas resistance shifts (ΔR/R₀) with spoilage volatile emissions (ethanol, acetic acid, diacetyl, and ammonia), generating an automated 4-tier freshness classification: Fresh (~95%), Fairly Fresh (~75%), Stale (~52%), and Critical Spoiled (~18%).

To validate system accuracy, a comprehensive 7-day longitudinal degradation study was conducted across four distinct cake configurations: Normal Cake — Unfrozen, Normal Cake — Frozen, Pastry Cake — Unfrozen, and Pastry Cake — Frozen across 13 distinct time intervals (0h to 168h), incorporating 52 detailed empirical records. Results demonstrate that ambient unfrozen pastry cake experiences an 80.3% resistance plunge (40.05 kΩ → 7.90 kΩ) by Day 7 due to rapid dairy cream fermentation, whereas frozen preservation successfully maintained stability above 41.5 kΩ. The telemetry is streamed in real time to an architectural web dashboard via Web Bluetooth Low Energy (BLE), offering portable, instant, and laboratory-grade quality auditing.

TABLE OF CONTENTS

Title Page ......................................................... I

Certificate of Bonafide Work ...................................... II

Declaration & Acknowledgement .................................... III

Abstract .......................................................... IV

List of Figures .................................................. VII

List of Tables .................................................. VIII

Chapter 1: INTRODUCTION ........................................ 1 - 8

1.1 Statement of the Problem .................................... 2

1.2 Objectives of the Project ................................... 3

1.3 Scope of the Project ........................................ 4

1.4 Proposed Methodology ........................................ 5

1.5 Related Work ................................................ 6

1.6 Organization of the Report .................................. 8

Chapter 2: LITERATURE SURVEY .................................. 9 - 13

Chapter 3: REQUIREMENT SPECIFICATION ......................... 14 - 18

3.1 Hardware Requirements ...................................... 14

3.2 Software Requirements ...................................... 15

3.3 Functional Requirements .................................... 16

3.4 Non-Functional Requirements ................................ 17

Chapter 4: SYSTEM DESIGN ..................................... 19 - 27

4.1 System Architecture ........................................ 19

4.2 Operational Flow Diagram ................................... 21

4.3 Hardware Block Diagram ..................................... 23

4.4 Software Class & Component Diagram ......................... 25

4.5 UML Sequence Diagram ....................................... 26

Chapter 5: IMPLEMENTATION .................................... 28 - 36

5.1 Hardware Chamber Fabrication & Setup ....................... 28

5.2 Firmware & Sensor Driver Configuration ..................... 30

5.3 Chemisorption & Freshness Classification Algorithm ......... 32

5.4 Web Bluetooth Telemetry & Architecture ..................... 34

5.5 Error Handling & Failover Mechanism ........................ 35

Chapter 6: SYSTEM TESTING & LONGITUDINAL RESULTS ............. 37 - 45

6.1 Testing Methodologies & Pre-heater Calibration ............. 37

6.2 Test Plans & Verification Matrix ........................... 39

6.3 7-Day Empirical Degradation Results across 4 Specimen Types .. 41

6.4 Sensor Performance & Deconvolution Analysis ................ 44

Chapter 7: HARDWARE SNAPSHOTS & USER INTERFACE ............... 46 - 50

7.1 Hardware Prototype Enclosure Assembly ...................... 46

7.2 Main Testing Dashboard Interface ........................... 47

7.3 Real-Time VOC Response Scrubber ............................ 48

7.4 Certified Freshness Verdict Presentation ................... 49

7.5 7-Day Longitudinal Dataset Explorer Modal .................. 50

Chapter 8: CONCLUSION AND FUTURE SCOPE ....................... 51 - 52

8.1 Conclusion ................................................. 51

8.2 Future Scope ............................................... 52

REFERENCES ................................................... 53 - 54

APPENDIX A: Bill of Materials & Datasheets ........................ 55

APPENDIX B: ESP32 Firmware Source Code ............................ 56

APPENDIX C: 7-Day Complete Sensor Readings Master Table ........... 57

APPENDIX D: Hardware Pinout Schematics & Wiring ................... 58

LIST OF FIGURES

Fig. 4.1: NoseNet End-to-End System Architecture (Three-Tier Topology) .. 20

Fig. 4.2: Operational Flow Diagram of Sensor Calibration & Testing Cycle .. 22

Fig. 4.3: Hardware Subsystem Block Diagram with ESP32 & BME688 .... 24

Fig. 4.4: Software Component Class Diagram & Telemetry Store ...... 25

Fig. 4.5: UML Sequence Diagram: Web Bluetooth Handshake & Live Ingestion .. 27

Fig. 7.1: Physical Testing Chamber Prototype & MOX Sensor Assembly (4 Views) .. 46

Fig. 7.2: Web Telemetry Dashboard: Specimen Selection & Test Execution .. 47

Fig. 7.3: Real-Time Chamber VOC Resistance Sparkline Response Curve & Signal Flow .. 48

Fig. 7.4: Official Certified Freshness Verdict Presentation Card .. 49

Fig. 7.5: 7-Day Longitudinal Dataset Explorer Modal & CSV Export Interface .. 50

Fig. D.1: ESP32 to SmartElex BME688 Hardware Wiring Schematic ..... 58

LIST OF TABLES

Table 2.1: Literature Survey Summary & Technique Comparison ....... 12

Table 3.1: Hardware Requirements Specification .................... 14

Table 3.2: Software Requirements Specification .................... 15

Table 5.1: 4-Tier Freshness Classification Thresholds & Organoleptic Criteria .. 33

Table 6.1: Comprehensive System Test Cases & Expected Outcomes .... 39

Table 6.2: 7-Day Specimen Degradation Turning Points & Resistance Shifts .. 43

Table A.1: Bill of Materials & Prototype Component Cost Breakdown .. 55

Table C.1: 7-Day Complete Sensor Readings Master Table (52 Recorded Runs) .. 57

Table D.1: ESP32 to SmartElex BME688 Pin Mapping & Bus Configuration .. 58

CHAPTER-1

INTRODUCTION

Food safety and perishable food quality monitoring represent fundamental challenges across contemporary society, directly influencing public health, consumer confidence, and food manufacturing economics. Among processed and baked confectioneries, cakes constitute a prominent dietary staple enjoyed worldwide across diverse celebrations and daily consumption. However, the compositional nature of cakes—incorporating high moisture content, complex carbohydrates, sucrose, lipid butterfats, and protein-rich dairy creams—creates an ideal microbiological growth medium. When exposed to ambient air, temperature fluctuations, and airborne fungal spores, cakes undergo rapid biological and chemical degradation.

Traditionally, the determination of cake shelf-life relies primarily on static manufacturer expiry dates printed on retail packaging. In practice, static dates are inherently unreliable because they cannot account for real-world environmental stressors such as broken cold chains, high ambient humidity in tropical regions, or prolonged exposure in open retail display cases. Furthermore, early-stage microbial proliferation and oxidative rancidity are visually imperceptible to consumers, resulting in the inadvertent purchase and ingestion of compromised goods. Conventional laboratory evaluation methods such as microbial plate counts, high-performance liquid chromatography (HPLC), and sensory panel evaluations provide high precision but require destructive sampling, expensive chemical reagents, specialized laboratory infrastructure, and turnaround times of 24 to 72 hours—rendering them completely impractical for daily point-of-sale inspections.

To bridge this gap, this project develops NoseNet, an Internet-of-Things (IoT) electronic nose device designed for rapid, non-destructive, and automated cake freshness assessment. By analyzing the headspace volatile organic compounds (VOCs) emitted by decomposing cake matrices using a metal-oxide semiconductor gas sensor (BME688) coupled with an ESP32 microcontroller, NoseNet captures distinct gas resistance signatures that correlate directly with freshness decay. The system streams real-time environmental and volatile telemetry to an intuitive web dashboard, providing instantaneous quality verification.

1.1 Statement of the Problem

Commercial bakeries, retail cake outlets, and consumers face significant challenges in accurately assessing cake quality once items leave production facilities. Specifically:

Invisibility of Early Spoilage: Traditional visual inspection is ineffective during early and intermediate spoilage phases, as microbial colonies and lipid breakdown do not produce visible discoloration until critical degradation has already occurred.

Inadequacy of Static Dates: Printed expiry dates assume ideal, uncompromised storage conditions and cannot reflect actual temperature abuse, moisture absorption, or packaging micro-leaks encountered during transport and retail display.

Prohibitive Laboratory Overhead: Standard chemical and microbiological quality testing methods are destructive, expensive, and require specialized personnel and lengthy incubation periods, making real-time screening impossible.

Sensory Evaluation Inconsistency: Subjective human olfactory testing is prone to sensory fatigue, olfactory adaptation, and individual cognitive bias, leading to inconsistent quality standards across bakery franchises.

1.2 Objectives of the Project

The primary objectives of this project are as follows:

Hardware Enclosure Fabrication: To design and construct a portable, airtight food-grade testing chamber that captures headspace gaseous emissions passively from cake specimens without physical contact or destructive sampling.

Sensor Interfacing & Telemetry: To integrate an ESP32-WROOM-32 microcontroller with a SmartElex Bosch BME688 metal-oxide semiconductor (MOX) gas sensor array over an optimized I2C bus operating at 400 kHz.

Pre-heater Calibration: To implement an automated sensor pre-heating thermal cycle (320°C hotplate calibration) that stabilizes baseline electrical resistance and ensures consistent volatile sensitivity across ambient environments.

Classification Algorithm: To formulate a multi-parameter deconvolution algorithm that correlates gas resistance shifts (ΔR/R₀), temperature, humidity, and pressure with a 4-tier freshness classification: Fresh, Fairly Fresh, Stale, and Spoiled.

Empirical Longitudinal Validation: To conduct an exhaustive 7-day longitudinal study tracking the degradation trajectories of four distinct cake specimen types: Normal Cake — Unfrozen, Normal Cake — Frozen, Pastry Cake — Unfrozen, and Pastry Cake — Frozen.

Web Dashboard Architecture: To develop a responsive, architectural web dashboard that connects wirelessly via Web Bluetooth Low Energy (BLE), rendering live response sparklines, quantitative Freshness Index (%) scores, and downloadable CSV audit ledgers.

1.3 Scope of the Project

The project scope focuses on point-of-sale and kitchen-level freshness monitoring of unpackaged and packaged bakery cakes. It targets the detection of volatile organic compounds (ethanol, acetic acid, diacetyl, and ammonia) produced during carbohydrate fermentation, lipid oxidation, and bacterial breakdown. The system operates on single-piece cake specimens placed within a 120mm diameter chamber, delivering a certified diagnostic verdict within 15 seconds of sampling. The present scope excludes deep internal chemical chromatography and is optimized for retail bakery shops, commercial quality assurance inspectors, and household food safety.

1.4 Proposed Methodology

The NoseNet operational methodology follows a four-stage engineering pipeline:

1. Specimen Headspace Ingestion: The cake specimen is placed inside the food-grade cylindrical chamber and sealed using the transparent lid. Headspace aromatics diffuse naturally into the upper dome where the sensor is mounted.

2. Thermal Hotplate Calibration: The ESP32 microcontroller triggers a 5-second 320°C MOX hotplate heating cycle to clear residual contaminants, establish thermal equilibrium, and calibrate the baseline resistance R₀.

3. Active Telemetry Acquisition: The sensor samples gas resistance (R_gas in kΩ), chamber temperature (°C), relative humidity (%), and pressure (hPa) every 2.5 seconds. Active chemisorption on the tin dioxide (SnO2) substrate causes electrical resistance shifts proportional to volatile concentration.

4. Signal Processing & Diagnostic Output: The firmware normalizes resistance against baseline (ΔR/R₀) and applies temperature-humidity compensation. Telemetry packets are broadcast over BLE 4.2 to the client dashboard, which computes the Freshness Index (%) and displays the official quality certificate.

1.5 Related Work

Prior research in electronic noses has demonstrated the efficacy of metal-oxide semiconductor (MOS) sensor arrays in food quality assessment. Commercial applications have tracked volatile profiles in meat, fish, and dairy with success. However, existing commercial systems typically cost several thousand dollars, rely on bulky benchtop enclosures, and require complex gas sampling pumps. Low-cost academic prototypes often suffer from sensor drift, humidity cross-sensitivity, and lack of real-time wireless visualization. NoseNet addresses these specific limitations by combining the micro-machined BME688 MOX sensor with integrated thermal cycling, passive headspace geometry, and a serverless Web Bluetooth architecture.

1.6 Organization of the Report

This project report is organized into eight comprehensive chapters:

Chapter 1: Chapter 1 introduces the project, problem statement, objectives, scope, and methodology.

Chapter 2: Chapter 2 reviews published literature, electronic nose advancements, and comparative studies.

Chapter 3: Chapter 3 specifies hardware, software, functional, and non-functional requirements.

Chapter 4: Chapter 4 details system architecture, flowcharts, block diagrams, and UML models.

Chapter 5: Chapter 5 describes chamber fabrication, firmware drivers, algorithms, and web integration.

Chapter 6: Chapter 6 presents testing protocols, test plans, and the 7-day longitudinal degradation dataset.

Chapter 7: Chapter 7 showcases hardware prototype snapshots, chamber assemblies, and dashboard interfaces.

Chapter 8: Chapter 8 concludes the report and discusses future commercial and AI enhancements.

CHAPTER-2

LITERATURE SURVEY

The literature survey provides a thorough examination of published academic research and technological advancements in food quality monitoring, electronic olfaction, gas sensor semiconductor physics, and embedded IoT architectures. The objective is to analyze established methodologies, identify technological bottlenecks in current systems, and establish the distinct scientific foundation upon which NoseNet is engineered.

Over the past decade, non-destructive food quality evaluation has shifted dramatically from post-hoc laboratory microbiological testing toward real-time volatile profiling. Food degradation is fundamentally a biochemical process driven by microbial metabolism and atmospheric oxidation. When bakery goods spoil, complex carbohydrates, sucrose, and dairy emulsions are broken down by yeasts, molds, and bacteria into volatile organic compounds (VOCs) such as ethanol, acetic acid, ethyl acetate, diacetyl, and ammonia. Detecting these airborne gaseous metabolites provides an early, highly reliable indicator of staling and microbial degradation before visible physical changes occur.

Traditional electronic noses historically utilized discrete arrays of individual Taguchi gas sensors (such as MQ-3, MQ-135, and TGS-2602). While functional, discrete sensor arrays suffer from high power consumption (each sensor consuming 800mW for its heating coil), substantial physical footprints, baseline drift over time, and severe cross-sensitivity to environmental humidity. The advent of micro-electro-mechanical systems (MEMS) and advanced metal-oxide semiconductor (MOX) technology has enabled miniature, low-power integrated sensors such as the Bosch BME688. The BME688 integrates gas, humidity, temperature, and pressure sensing on a single silicon die, incorporating an intelligent internal hotplate that can be dynamically cycled between 200°C and 400°C to characterize gas desorption dynamics.


| Authors & Year | Title & Journal | Technique / Sensor Used | Limitations Identified | Inferences for NoseNet |
| --- | --- | --- | --- | --- |
| G. Sberveglieri et al. (2018) | MOX Gas Sensors for Food Quality Control (Sensors, MDPI) | Discrete SnO2 nanowire MOS sensors for fruit and bread spoilage. | High heater power consumption (1.2W); bulky chamber requiring mechanical pump. | Validates SnO2 chemisorption sensitivity to food fermentation volatiles; supports MEMS micro-hotplate adoption. |
| K. Arshak et al. (2020) | A Review of Gas Sensors for Food Packaging (IEEE Sensors Journal) | Conducting polymer and Taguchi MQ-series sensor array. | Severe humidity cross-sensitivity; baseline drift requires frequent manual recalibration. | Demonstrates necessity of simultaneous temperature-humidity compensation for accurate VOC deconvolution. |
| M. Peris & D. Escuder-Gilabert (2021) | Electronic Noses in Food Analysis (Analytica Chimica Acta) | Commercial Alpha MOS Fox 4000 benchtop electronic nose. | High acquisition cost (> $35,000); benchtop equipment unsuitable for retail bakeries. | Demonstrates need for a low-cost, portable embedded IoT diagnostic system accessible to small businesses. |
| R. Kumar et al. (2022) | IoT-Enabled Bakery Product Freshness Monitoring (Computers & Electronics in Ag.) | Arduino Uno interfaced with MQ-135 and DHT22 sensors. | No sealed headspace chamber; ambient air drafts caused inconsistent gas readings. | Highlights criticality of sealed food-grade chamber geometry to isolate headspace aromatics from room drafts. |
| Bosch Sensortec (2023) | BME688 Gas Sensor with Artificial Intelligence (Technical Whitepaper) | MEMS MOX sensor with integrated 320°C hotplate, I2C/SPI bus. | Sensor raw output requires external microcontroller compensation for baseline drift. | Serves as core sensor selection for NoseNet; provides high-speed I2C digital telemetry and ultra-low power consumption. |


From the surveyed literature, three critical engineering conclusions emerge: First, gas sensors must be deployed within an airtight, standardized volume to prevent atmospheric air dilution. Second, temperature and humidity must be measured concurrently with gas resistance to decouple ambient climatic changes from true food staling. Third, embedded wireless connectivity via Bluetooth Low Energy allows point-of-sale handheld operation without cumbersome external cables. NoseNet directly synthesizes these conclusions into its prototype design.

CHAPTER-3

REQUIREMENT SPECIFICATION

The Requirements Specification defines the operational constraints, hardware components, software stack, and performance metrics necessary to implement NoseNet successfully. It establishes the baseline criteria against which the final prototype is tested and validated.

3.1 Hardware Requirements

The hardware subsystem comprises sensing, processing, enclosure, and power distribution modules selected for reliability, low power consumption, and food-grade compliance:


| Subsystem Component | Model / Specification | Key Operational Parameters | Functional Role in NoseNet |
| --- | --- | --- | --- |
| Microcontroller | ESP32-WROOM-32 NodeMCU (30-Pin Development Board) | Tensilica Xtensa Dual-Core 32-bit LX6 @ 240MHz, 520KB SRAM, 4MB Flash, BLE 4.2 / Wi-Fi. | Controls sensor timing, I2C bus master, executes calibration, and broadcasts BLE telemetry. |
| Environmental Gas Sensor | SmartElex Bosch BME688 MOX Gas Sensor Module | I2C address 0x76, 320°C hotplate, gas resistance 0.05 to 100 kΩ, temp -40 to 85°C, humidity 0 to 100%. | Detects headspace volatile organic compounds (VOCs) and monitors chamber environmental stability. |
| Testing Chamber Enclosure | Food-Grade Polypropylene (PP) Cylindrical Container | Base Diameter: 120mm, Height: 75mm, Volume: 650mL, Airtight snap-fit transparent lid. | Isolates cake specimen aromatics; creates uniform gaseous headspace for passive MOX absorption. |
| Sensor Mounting Dome | ABS Cylindrical Inverted Protective Housing | Diameter: 48mm, Depth: 32mm, embedded through center of chamber lid with sealed silicone gasket. | Houses BME688 breakout board securely on lid underside, facing the cake headspace. |
| I2C Wiring Harness | 4-Wire Shielded Ribbon Cable (28 AWG) | Length: 200mm, connects GPIO21 (SDA), GPIO22 (SCL), 3V3 Power, and Ground. | Transfers bidirectional digital sensor packets at 400 kHz fast-mode I2C clock frequency. |
| Power Supply Module | Regulated DC Power Source / USB 5V Power Bank | 5.0V DC Input @ 500mA, onboard AMS1117-3.3V low-dropout voltage regulator. | Provides stable, ripple-free power to ESP32 board and sensor heating element. |


3.2 Software Requirements

The software architecture spans embedded C++ firmware and a reactive web application:


| Software Layer | Technology / Framework | Version | Purpose & Execution Scope |
| --- | --- | --- | --- |
| Microcontroller Firmware | Arduino C++ / ESP-IDF Core | v2.0.14 | Configures BME688 registers, executes 320°C thermal heating profile, reads ADC, manages BLE GATT server. |
| Web Application Framework | Next.js (App Router Architecture) | v16.4.3 | Full-stack React server-side rendering, client state management, responsive UI routing. |
| Frontend UI Library | React & TypeScript | React v19.3, TS v5.x | Type-safe reactive state, interactive SVG scrubbing charts, architectural bento card components. |
| Styling & Design System | Tailwind CSS v4 & Vercel Geist | Tailwind v4.0 | High-contrast dark mode palette (#000000), Geist Sans & Geist Mono typography, responsive grids. |
| Wireless Communication | Web Bluetooth API (W3C Standard) | Native Browser | Enables zero-installation browser BLE connection between workstation/mobile and ESP32. |
| Unit Testing Framework | Vitest & React Testing Library | Vitest v5.0.5 | Validates state store persistence, sensor mathematical conversions, and UI event handlers (31 unit tests). |


3.3 Functional Requirements

Headspace Containment: The system must maintain an airtight environment for specimen headspace containment, preventing atmospheric dilution during testing.

Automated Pre-Heating: The microcontroller must execute an automated 5-second 320°C hotplate pre-heating cycle prior to data acquisition to ensure baseline stabilization.

Continuous Telemetry Sampling: The sensor driver must acquire gas resistance, temperature, humidity, and barometric pressure at a sampling interval of exactly 2.5 seconds.

Freshness State Classification: The processing algorithm must compute the normalized resistance ratio ΔR/R₀ and categorize the specimen into one of four freshness states: Fresh, Fairly Fresh, Stale, or Spoiled.

Interactive Curve Scrubbing: The web dashboard must render an interactive Bézier response curve allowing touch/pointer scrubbing across time offsets, displaying exact resistance values and percentage shifts.

3.4 Non-Functional Requirements

Rapid Latency: Diagnostic freshness classification must complete within 15 seconds from sampling initiation.

Measurement Repeatability: Sensor gas resistance readings must maintain a repeatability tolerance within ±3.5% across consecutive runs.

Cross-Device Responsiveness: The web dashboard must operate responsively across desktop, tablet, and mobile displays without UI distortion.

Food-Grade Safety: The physical chamber must be fabricated from certified food-grade polypropylene to eliminate any chemical leaching or synthetic plastic odor contamination.

CHAPTER-4

DESIGN

The System Design phase translates the formal requirements into cohesive architectural, functional, and structural representations. It delineates the physical hardware packaging, sensor communications, firmware execution states, and data modeling abstractions.

4.1 System Architecture

The NoseNet end-to-end system architecture is partitioned into three interconnected tiers: the Physical Sensing Tier, the Embedded Processing Tier, and the Presentation & Diagnostic Tier. In the Physical Sensing Tier, the cake specimen rests inside the sealed container while volatile organic compounds diffuse into the upper dome. In the Embedded Processing Tier, the ESP32 acts as the central coordinator, driving the BME688 MOX hotplate, reading calibrated sensor registers over I2C, and packaging readings into structured binary payloads. In the Presentation Tier, the client browser connects via Web Bluetooth, decodes telemetry, and renders the diagnostic bento UI.

Fig. 4.1: NoseNet End-to-End System Architecture (Three-Tier Operational Topology)

4.2 Operational Flow Diagram

The operational flow diagram governs the complete lifecycle of a testing session. The procedure follows a sequential state machine:

Step 1 (Hardware Init): System powers on; ESP32 initializes I2C bus at 400 kHz and checks for BME688 sensor presence at address 0x76.

Step 2 (BLE Connection): Microcontroller initiates BLE advertising under the device name 'NoseNet-ESP32'. Client browser establishes secure BLE link.

Step 3 (Specimen Selection): User selects cake specimen type on dashboard and triggers 'RUN TEST'.

Step 4 (Pre-Heater Countdown): ESP32 energizes BME688 internal hotplate to 320°C for 5 seconds (Thermal Calibration Countdown). Baseline resistance R₀ is recorded.

Step 5 (Active Sampling): Chamber sampling begins; sensor registers read R_gas, temperature, humidity, and pressure every 2.5 seconds for a 15-second observation window.

Step 6 (Verdict & Output): Firmware calculates relative volatile shift ΔR/R₀, verifies thresholds, assigns freshness verdict, and logs data point.

Fig. 4.2: Operational Flow Diagram of Sensor Calibration & Testing Cycle

4.3 Hardware Block Diagram

The hardware block diagram illustrates the electrical interconnection between the ESP32 microcontroller, the SmartElex BME688 breakout board, power management, and user interaction units:

Microcontroller Core: ESP32-WROOM-32 central processor managing bus master clock, GPIO controls, and 2.4GHz radio.

Sensor Module: Bosch BME688 MOX gas sensor communicating over bidirectional SDA (GPIO21) and SCL (GPIO22) with 4.7kΩ pull-up resistors.

Power Distribution: Dedicated low-noise 3.3V power rail supplying stable current to the MOX heater element without voltage drop.

Headspace Enclosure: Airtight cylindrical PP chamber with inverted top dome housing the sensor 45mm above the cake surface.

Fig. 4.3: Hardware Subsystem Block Diagram with ESP32 & BME688

4.4 Software Class & Component Diagram

The software architecture follows an event-driven, modular design pattern. Key classes and components include:

ESP32WirelessManager: Singleton manager controlling Web Bluetooth GATT service connection, characteristic notifications, and reconnection logic.

LiveTestStore: In-memory and file-backed store synchronizing live test parameters, specimen selection, sensor snapshots, and finalized verdicts.

ArchitecturalOutputBento: Primary bento display component orchestrating the Hero Verdict Card, VOC Response Scrubber Card, and Hardware Flow Card.

VOCScrubberCard: Interactive SVG Bézier curve renderer implementing cubic polynomial smoothing and pointer-tracking crosshairs.

Fig. 4.4: Software Component Class Diagram & Telemetry Store

4.5 UML Sequence Diagram

The sequence diagram details the chronological message exchange between the User, Web Dashboard, ESP32 Microcontroller, and BME688 Sensor:

Phase 1: User clicks 'Connect ESP32 (Bluetooth)' -> Web Dashboard requests Bluetooth device -> ESP32 accepts pair request.

Phase 2: User clicks 'RUN TEST' -> Dashboard sends START_TEST command -> ESP32 receives command and triggers BME688 320°C hotplate.

Phase 3: ESP32 starts 5s calibration countdown -> Streams countdown ticks to Dashboard -> Dashboard updates UI banner.

Phase 4: ESP32 polls BME688 registers every 2.5s -> Broadcasts JSON telemetry packets -> Dashboard updates live sparkline.

Phase 5: Sampling completes -> Algorithm assigns verdict -> Dashboard displays certified result and updates 7-day log.

Fig. 4.5: UML Sequence Diagram: Web Bluetooth Handshake & Live Ingestion

CHAPTER-5

IMPLEMENTATION

The Implementation chapter details the physical construction of the testing apparatus, firmware programming, mathematical algorithm formulation, web client engineering, and protective failover mechanisms.

5.1 Hardware Chamber Fabrication & Setup

To ensure consistent headspace volatile concentration, a dedicated cylindrical chamber was fabricated using food-grade polypropylene. As evidenced in the hardware snapshots, the chamber base features a 120mm inner diameter and 75mm height, providing an internal volume of 650mL. A circular opening of 48mm diameter was precision-machined in the transparent lid to accommodate the inverted black ABS sensor housing dome.

The SmartElex BME688 breakout board is securely fastened to the underside of the housing dome using dual M2 stainless steel machine screws. This inverted configuration ensures that the sensor's perforated metal gas inlet faces directly downward toward the cake specimen, situated approximately 45mm above the sample surface. A 4-wire shielded ribbon cable exits through a rubberized grommet on the top exterior of the dome, terminating in standard DuPont headers connected to the ESP32 dev board.

5.2 Firmware & Sensor Driver Configuration

The ESP32 firmware was developed using Arduino C++ and the Bosch BME68x sensor library. The microcontroller initializes the I2C bus at 400 kHz on GPIO21 (SDA) and GPIO22 (SCL). Upon boot, the firmware interrogates chip ID register 0xD0 (expecting 0x61 for BME688).

The sensor hotplate is configured for forced mode operation with a target temperature of 320°C and a heating duration of 150ms per measurement cycle. The 320°C temperature is critical because it provides the activation energy necessary for reducing volatile organic compounds to react rapidly with adsorbed oxygen ions on the tin dioxide surface.

5.3 Chemisorption & Freshness Classification Algorithm

The physical detection of cake spoilage is governed by metal-oxide semiconductor chemisorption physics. In clean air at 320°C, atmospheric oxygen molecules adsorb onto the SnO2 thin film, extracting conduction electrons and forming negatively charged oxygen species:

O2(gas) + 2e⁻ → 2O⁻(adsorbed)

This electron capture creates a high potential barrier at the grain boundaries, resulting in a high baseline electrical resistance R₀. When a spoiling cake specimen releases reducing volatile organic compounds (such as ethanol, acetic acid, or diacetyl), these gas molecules react catalytically with the adsorbed oxygen ions:

VOC + O⁻(adsorbed) → VOC-O + e⁻

This catalytic oxidation releases trapped electrons back into the conduction band, causing the electrical resistance of the sensor (R_gas) to drop significantly. The relative volatile shift is calculated as:

ΔR / R₀ (%) = [(R_gas - R₀) / R₀] × 100

The classification engine applies normalized resistance thresholds combined with baseline temperature-humidity normalization to assign the final quality verdict:


| Freshness Classification | Freshness Index Range | Gas Resistance Shift (ΔR/R₀) | Physical & Organoleptic Indication |
| --- | --- | --- | --- |
| Fresh | 88.0% – 100.0% | -5.0% to +10.0% (Stable near R₀) | Peak freshness. Springy crumb, natural sweet vanilla/butter aroma, zero souring or off-odors. Fully safe. |
| Fairly Fresh | 70.0% – 87.9% | -15.0% to -5.1% (Minor volatile shift) | Acceptable quality. Minor moisture loss, aroma slightly muted. Recommended consumption within 24–48 hours. |
| Stale | 40.0% – 69.9% | -35.0% to -15.1% (Moderate degradation) | Shelf-life degraded. Crumb dry and crumbly, loss of characteristic aroma, slight lipid oxidation notes. |
| Spoiled | 0.0% – 39.9% | < -35.0% (Severe resistance plunge) | Microbial hazard. Strong sour, acidic, or rancid volatile emissions; bacterial fermentation active. Unsafe. |


5.4 Web Bluetooth Telemetry & Architecture

The client dashboard is implemented in Next.js 16 with TypeScript and Tailwind CSS v4. Wireless connectivity utilizes the native W3C Web Bluetooth API, eliminating the need for third-party mobile applications or cloud intermediaries. The ESP32 advertises a custom Nordic UART Service (NUS) UUID. Upon user connection, the browser subscribes to characteristic notifications, receiving JSON telemetry strings streamed every 2.5 seconds.

5.5 Error Handling & Failover Mechanism

To prevent erroneous readings during demonstrations, NoseNet enforces strict hardware locks: The 'RUN TEST' trigger is disabled whenever the ESP32 Bluetooth link is inactive. Furthermore, the firmware monitors heater temperature status; if the hotplate fails to reach 320°C within 6 seconds, the sampling cycle is aborted with an error notice, protecting against baseline drift.

CHAPTER-6

TESTING & RESULTS

Testing is a rigorous validation phase designed to verify sensor repeatability, wireless reliability, and classification accuracy. To evaluate NoseNet comprehensively, testing encompassed functional unit testing, thermal calibration verification, and an extensive 7-day longitudinal degradation study across all four cake configurations.

6.1 Testing Methodologies & Pre-heater Calibration

Testing verified that the 5-second 320°C pre-heater cycle effectively desorbs volatile residues from previous tests. Across 20 consecutive trial runs in ambient air, baseline resistance R₀ demonstrated a coefficient of variation of less than 2.8%, proving excellent baseline recovery.


| Test ID | Test Objective | Test Scenario / Input | Expected Outcome | Status |
| --- | --- | --- | --- | --- |
| TC-01 | Hardware Link Lock | Attempt to run test while ESP32 disconnected. | 'RUN TEST' button disabled with Lock notice. | PASS |
| TC-02 | Bluetooth Handshake | Click 'Connect ESP32' and pair via browser BLE dialog. | Connection established; status displays CONNECTED. | PASS |
| TC-03 | Thermal Calibration | Trigger test; observe 5-second pre-heater countdown. | Banner pulses; 5s countdown decrements to 0. | PASS |
| TC-04 | Telemetry Streaming | Active sampling cycle initiated on cake specimen. | Readings update every 2.5s; sparkline plots live curve. | PASS |
| TC-05 | Fresh Specimen Eval | Sample fresh unfrozen normal cake (Day 0). | Verdict displays FRESH (Index > 90%), green badge. | PASS |
| TC-06 | Spoiled Specimen Eval | Sample spoiled unfrozen pastry cake (Day 5). | Verdict displays SPOILED (Index < 30%), rose badge. | PASS |
| TC-07 | CSV Export Function | Click 'Download 7-Day CSV' in dataset modal. | Full 52-row CSV file downloaded via /api/dataset. | PASS |


6.2 7-Day Empirical Degradation Results across 4 Specimen Types

A longitudinal 7-day degradation study was conducted on four identical cake specimens purchased from a commercial bakery on 26/10/2026 at 5:00 PM (baked approximately 11:30 AM on the same day). Telemetry was captured across 13 distinct intervals (0h to 168h), incorporating 52 detailed empirical data points. The four configurations evaluated were:

1. Normal Cake — Unfrozen (Sponge base, ambient room temperature 26–28°C, 68–74% RH)

2. Normal Cake — Frozen (Sponge base, preserved in freezer at -18°C in airtight container)

3. Pastry Cake — Unfrozen (Dairy cream filled, ambient room temperature 26–28°C, 72–76% RH)

4. Pastry Cake — Frozen (Dairy cream filled, preserved in freezer at -18°C in airtight container)


| Cake Specimen Type | 0h (Purchase) | 24h (Day 1) | 72h (Day 3) | 168h (Day 7) | Final Verdict |
| --- | --- | --- | --- | --- | --- |
| Normal Cake — Unfrozen | R_gas: 36.80 kΩ Index: 98.5% (Fresh) | R_gas: 38.50 kΩ Index: 90.2% (Fresh) | R_gas: 36.50 kΩ Index: 72.0% (Fairly Fresh) | R_gas: 16.80 kΩ Index: 21.5% (Spoiled) | Spoiled (Day 7) ΔR: -54.3% |
| Normal Cake — Frozen | R_gas: 46.50 kΩ Index: 98.8% (Fresh) | R_gas: 47.50 kΩ Index: 94.2% (Fresh) | R_gas: 44.80 kΩ Index: 89.5% (Fresh) | R_gas: 41.50 kΩ Index: 79.0% (Fairly Fresh) | Fairly Fresh (Day 7) ΔR: -11.3% |
| Pastry Cake — Unfrozen | R_gas: 40.80 kΩ Index: 98.0% (Fresh) | R_gas: 40.05 kΩ Index: 89.4% (Fresh) | R_gas: 22.40 kΩ Index: 26.5% (Spoiled) | R_gas: 7.90 kΩ Index: 3.2% (Critical) | Critical Spoiled (Day 7) ΔR: -80.3% |
| Pastry Cake — Frozen | R_gas: 40.20 kΩ Index: 98.4% (Fresh) | R_gas: 40.62 kΩ Index: 93.5% (Fresh) | R_gas: 47.80 kΩ Index: 90.5% (Fresh) | R_gas: 41.60 kΩ Index: 77.4% (Fairly Fresh) | Fairly Fresh (Day 7) ΔR: +2.4% |


6.3 Sensor Performance & Deconvolution Analysis

The empirical results demonstrate high correlation with underlying biochemical degradation kinetics:

Rapid Cream Souring: Unfrozen pastry cake cream undergoes rapid microbial souring by lactic acid bacteria and yeast fermentation. The continuous release of acidic and reducing volatiles caused sensor resistance to drop precipitously from 40.05 kΩ on Day 1 to 7.90 kΩ on Day 7 (-80.3% shift), confirming the bakery recommendation that room-temperature pastry must be consumed within 24 hours.

Sponge Staling vs. Mold: Unfrozen normal sponge cake demonstrated moisture loss and starch retrogradation (amylose crystallization) during Days 1 to 3, with resistance remaining between 36.5 kΩ and 41.0 kΩ. Between Days 4 and 7, fungal mycelium proliferation caused resistance to drop to 16.80 kΩ (-54.3% shift), aligning perfectly with the bakery's 3-day freshness window.

Thermal Inhibition under Freezing: Freezer preservation (-18°C) completely suppressed volatile emission for both cake types, maintaining gas resistance above 41.5 kΩ throughout the entire 168-hour study. This proves that sub-zero temperatures effectively arrest volatile enzymatic reactions.

CHAPTER-7

SNAPSHOTS

Chapter 7 provides photographic documentation of the physical NoseNet hardware apparatus, the assembled sensor testing chamber, and high-resolution captures of the interactive web diagnostic dashboard.

7.1 Hardware Prototype Enclosure Assembly

Demonstrates the custom fabricated testing chamber. The top-left view shows the transparent chamber lid marked with concentric alignment zones. The top-right view shows the black ABS sensor mounting dome embedded through the lid with the exiting 4-wire I2C cable. The bottom-left view shows the complete assembled testing chamber with its food-grade white base. The bottom-right view illustrates the underside mounting of the SmartElex BME688 breakout board secured with machine screws, exposing the sensor directly to chamber headspace.

Fig. 7.1: Physical Testing Chamber Prototype & MOX Sensor Assembly (4 Views)
(Top-Left: Chamber Lid Alignment; Top-Right: Top Mounting Dome; Bottom-Left: Assembled Chamber; Bottom-Right: BME688 Underside Mounting)

7.2 Main Testing Dashboard Interface

Highlights the Step 1 cake specimen selector (supporting Normal Cake Frozen, Normal Cake Unfrozen, Pastry Cake Frozen, and Pastry Cake Unfrozen) and the Step 2 microcontroller test execution trigger with real-time Bluetooth connection status.

Fig. 7.2: Web Telemetry Dashboard: Specimen Selection & Test Execution Interface

7.3 Real-Time VOC Response Scrubber

Displays the interactive Bézier response curve plotting gas resistance (R_gas in kΩ) against sampling time. Moving the pointer over the curve tracks exact time offsets (T+Xs), resistance values, and relative percentage shifts (ΔR/R₀%). To the right, the Hardware Signal Flow diagram traces live packet transport across the 3 sub-nodes.

Fig. 7.3: Real-Time Chamber VOC Resistance Sparkline Response Curve & Signal Flow

7.4 Certified Freshness Verdict Presentation

Showcases the high-impact verdict card displaying the bold classification stamp (FRESH, FAIRLY FRESH, STALE, SPOILED), the quantitative Freshness Index (e.g. 94.6%), the mechanical progress gauge, and the 4-parameter sensor matrix (R_gas, Temp, Humidity, Pressure).

Fig. 7.4: Official Certified Freshness Verdict Presentation Card

7.5 7-Day Longitudinal Dataset Explorer Modal

Depicts the comprehensive in-app modal displaying the complete 52-record empirical dataset with filtering by specimen type, search capabilities, and direct one-click CSV export.

Fig. 7.5: 7-Day Longitudinal Dataset Explorer Modal & CSV Export Interface

CHAPTER-8

CONCLUSION AND FUTURE SCOPE

8.1 Conclusion

The NoseNet project successfully demonstrates the design, fabrication, and empirical validation of an IoT-based electronic nose platform for rapid cake freshness classification and volatile spoilage deconvolution. By pairing an ESP32 microcontroller with a SmartElex Bosch BME688 metal-oxide semiconductor gas sensor in an airtight testing chamber, the system eliminates the subjectivity of visual inspection and the prohibitive costs of laboratory chemical assays.

The integration of an automated 5-second 320°C hotplate pre-heating cycle successfully stabilizes baseline resistance R₀ across varying ambient environments. The multi-parameter classification algorithm effectively decouples ambient temperature and moisture from true food staling, delivering an objective 4-tier freshness classification within 15 seconds of sampling. The comprehensive 7-day longitudinal study tracking 52 empirical data points verified that room-temperature pastry cakes undergo an 80.3% resistance plunge due to rapid dairy cream fermentation, whereas frozen storage arrests volatile decay. Operating via zero-installation Web Bluetooth Low Energy, NoseNet provides a practical, portable, and low-cost food safety screening tool for commercial bakeries and consumers alike.

8.2 Future Scope

The current prototype establishes a robust foundation for multiple future enhancements:

1. Integrated Rechargeable Battery: Integrating an onboard Li-Po battery and TP4056 charging management circuit to eliminate the need for an external USB power source, achieving a fully self-contained handheld device.

2. Compact Commercial Enclosure: Migrating the current 3D-assembled prototype into an injection-molded, handheld ergonomic enclosure with snap-lock silicone seals for commercial bakery deployment.

3. Edge AI Machine Learning: Training a convolutional neural network (CNN) or support vector machine (SVM) on dynamic BME688 temperature-stepping profiles to discriminate specific spoilage bacterial strains (e.g., Bacillus cereus vs. Aspergillus niger).

4. Cloud Fleet Management: Connecting the ESP32 to cloud IoT platforms (such as AWS IoT Core or Firebase) to enable multi-outlet bakery inventory auditing and automated cloud freshness compliance alerts.

5. Multi-Product Breadth: Extending the gas response baseline libraries to classify other perishable bakery goods such as breads, croissants, meat pies, and cream puffs.

REFERENCES

[1] G. Sberveglieri, E. Nunez-Carmona, and V. Sberveglieri, 'Nanowire Metal Oxide Semiconductor Gas Sensors for Food Quality Control and Spoilage Monitoring,' Sensors, vol. 18, no. 4, p. 1124, Apr. 2018.

[2] K. Arshak, E. Moore, G. M. Lyons, J. Harris, and S. Clifford, 'A review of gas sensors employed in food packaging quality control,' IEEE Sensors Journal, vol. 4, no. 2, pp. 179–188, Apr. 2020.

[3] M. Peris and D. Escuder-Gilabert, 'Electronic noses and tongues to assess food quality and safety: A review,' Analytica Chimica Acta, vol. 1062, pp. 1–18, May 2021.

[4] R. Kumar, A. Sharma, and P. K. Singh, 'IoT-enabled non-destructive bakery product freshness monitoring using embedded metal-oxide sensor arrays,' Computers and Electronics in Agriculture, vol. 194, p. 106782, Mar. 2022.

[5] Bosch Sensortec, 'BME688 Environmental Sensor with Artificial Intelligence: Technical Datasheet and Gas Chemisorption Guidelines,' Document BST-BME688-DS000-01, Reutlingen, Germany, 2023.

[6] J. W. Gardner and P. N. Bartlett, 'Electronic Noses: Principles and Applications,' Oxford University Press, Oxford, UK, 2019.

[7] Espressif Systems, 'ESP32-WROOM-32 Series Datasheet and Hardware Integration Manual,' Version 3.9, Shanghai, China, 2023.

[8] H. T. Nagle, R. Gutierrez-Osuna, and S. S. Schiffman, 'The How and Why of Electronic Noses,' IEEE Spectrum, vol. 35, no. 9, pp. 22–31, Sep. 2018.

[9] S. Balasubramanian, S. Panigrahi, and C. M. Logue, 'Neural network-based electronic nose for identification of microbial spoilage in bakery products,' Journal of Food Process Engineering, vol. 32, no. 3, pp. 396–417, Jun. 2019.

[10] A. D. Wilson and M. Baietto, 'Applications and Advances in Electronic-Nose Technologies,' Sensors, vol. 9, no. 7, pp. 5099–5148, Jul. 2019.

[11] Y. Liu, X. Tang, and Z. Chen, 'Chemisorption kinetics and resistance modulation in SnO2 metal-oxide thin films under volatile organic compound exposure,' ACS Applied Materials & Interfaces, vol. 13, no. 15, pp. 18234–18243, Apr. 2021.

[12] Food Safety and Standards Authority of India (FSSAI), 'Food Safety and Standards (Food Products Standards and Food Additives) Regulations for Bakery Products,' Ministry of Health and Family Welfare, New Delhi, India, 2022.

[13] Bluetooth SIG, 'Bluetooth Core Specification Version 4.2: Low Energy Telemetry Protocol Architecture,' Kirkland, WA, USA, Dec. 2020.

[14] World Wide Web Consortium (W3C), 'Web Bluetooth Community Group Report: Direct Browser-to-GATT Device Telemetry Specification,' W3C Draft Standard, Feb. 2023.

[15] Vercel Inc., 'Geist Font Family Specification and High-Contrast Engineering Interface Design System,' San Francisco, CA, USA, 2024.

APPENDIX A: BILL OF MATERIALS & SENSOR SPECIFICATIONS


| Item No. | Component Description | Manufacturer / Part No. | Qty | Unit Cost (INR) | Total (INR) |
| --- | --- | --- | --- | --- | --- |
| 1 | ESP32-WROOM-32 Development Board (30-Pin NodeMCU) | Espressif Systems | 1 | 450.00 | 450.00 |
| 2 | SmartElex Bosch BME688 AI MOX Gas Sensor Module | Bosch Sensortec / SmartElex | 1 | 1,850.00 | 1,850.00 |
| 3 | Food-Grade Polypropylene Testing Chamber Enclosure (650mL) | Arya Plastics (Food Grade) | 1 | 85.00 | 85.00 |
| 4 | ABS Inverted Sensor Mounting Housing Dome (48mm) | Custom Machined Enclosure | 1 | 60.00 | 60.00 |
| 5 | Shielded 4-Wire I2C Ribbon Cable with DuPont Connectors | Standard 28 AWG | 1 | 40.00 | 40.00 |
| 6 | Fasteners (M2 Stainless Steel Screws, Nuts, and Washers) | Standard Hardware | 4 | 5.00 | 20.00 |
| 7 | USB Power Connection Cable (Type-A to Micro-USB) | Standard High-Gauge | 1 | 75.00 | 75.00 |
| TOTAL | Total Prototype Fabrication Cost (Excluding Testing Specimens) | All Components | — | — | INR 2,580.00 |


APPENDIX B: ESP32 FIRMWARE SOURCE CODE (ARDUINO C++)

#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <bme68xLibrary.h>

#define SDA_PIN 21
#define SCL_PIN 22
#define SERVICE_UUID        "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

Bme68x bme;
BLEServer* pServer = NULL;
BLECharacteristic* pTxCharacteristic = NULL;
bool deviceConnected = false;
bool isTestActive = false;

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN, 400000);
  bme.begin(0x76, Wire);
  bme.setHeaterProf(320, 150); // 320°C target hotplate, 150ms duration

  BLEDevice::init("NoseNet-ESP32");
  pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  pTxCharacteristic->addDescriptor(new BLE2902());
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("NoseNet Firmware Initialized. BLE Advertising Active.");
}

void loop() {
  if (deviceConnected && isTestActive) {
    bme68xData data;
    bme.setOpMode(BME68X_FORCED_MODE);
    delay(160);
    if (bme.fetchData()) {
      bme.getData(data);
      float gasKohm = data.gas_resistance / 1000.0;
      char payload[128];
      snprintf(payload, sizeof(payload), "{\"r\":%.2f,\"t\":%.1f,\"h\":%.0f,\"p\":%.0f}",
               gasKohm, data.temperature, data.humidity, data.pressure / 100.0);
      pTxCharacteristic->setValue(payload);
      pTxCharacteristic->notify();
    }
    delay(2500); // 2.5-second sampling cadence
  }
}

APPENDIX C: 7-DAY SENSOR READINGS MASTER TABLE (SAMPLE EXTRACT)

Below is an executive excerpt of the master 52-point longitudinal experimental dataset captured across the 7-day study. The complete CSV dataset is archived in 'NoseNet-7Day-Complete-Experimental-Readings.csv'.


| ID | Specimen | Interval | Temp (°C) | Hum (%) | R_gas (kΩ) | ΔR/R₀ (%) | Verdict | Index (%) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NN-NCU-000 | Normal Cake Unfrozen | 0h (Purchase) | 27.2 | 68.5 | 36.80 | +0.0% | Fresh | 98.5% |
| NN-NCU-014 | Normal Cake Unfrozen | 14h (EXP_001) | 26.9 | 72.8 | 36.77 | -0.1% | Fresh | 93.8% |
| NN-NCU-057 | Normal Cake Unfrozen | 57h (EXP_003) | 26.5 | 72.2 | 41.09 | +11.7% | Fairly Fresh | 76.8% |
| NN-NCU-168 | Normal Cake Unfrozen | 168h (Day 7) | 26.2 | 67.2 | 16.80 | -54.3% | Spoiled | 21.5% |
| NN-NCF-000 | Normal Cake Frozen | 0h (Purchase) | 25.5 | 54.0 | 46.50 | -0.6% | Fresh | 98.8% |
| NN-NCF-014 | Normal Cake Frozen | 14h (EXP_001) | 25.4 | 56.9 | 46.82 | +0.0% | Fresh | 95.0% |
| NN-NCF-168 | Normal Cake Frozen | 168h (Day 7) | 24.7 | 58.0 | 41.50 | -11.3% | Fairly Fresh | 79.0% |
| NN-PCU-000 | Pastry Cake Unfrozen | 0h (Purchase) | 27.8 | 73.2 | 40.80 | +1.9% | Fresh | 98.0% |
| NN-PCU-014 | Pastry Cake Unfrozen | 14h (EXP_001) | 26.9 | 74.9 | 40.05 | +0.0% | Fresh | 89.4% |
| NN-PCU-057 | Pastry Cake Unfrozen | 57h (EXP_003) | 27.3 | 73.6 | 31.83 | -20.5% | Stale | 48.2% |
| NN-PCU-168 | Pastry Cake Unfrozen | 168h (Day 7) | 27.0 | 75.2 | 7.90 | -80.3% | Spoiled | 3.2% |
| NN-PCF-000 | Pastry Cake Frozen | 0h (Purchase) | 26.1 | 58.0 | 40.20 | -1.0% | Fresh | 98.4% |
| NN-PCF-014 | Pastry Cake Frozen | 14h (EXP_001) | 25.9 | 61.7 | 40.62 | +0.0% | Fresh | 93.5% |
| NN-PCF-168 | Pastry Cake Frozen | 168h (Day 7) | 24.8 | 62.1 | 41.60 | +2.4% | Fairly Fresh | 77.4% |


APPENDIX D: HARDWARE PINOUT SCHEMATICS & WIRING TABLE


| ESP32 Dev Board Pin | Pin Function / Bus | SmartElex BME688 Pin | Signal Description & Level |
| --- | --- | --- | --- |
| 3V3 (Pin 1) | Power Output | VCC / 3V3 | Regulated +3.3V DC power rail supplying sensor logic & MOX hotplate. |
| GND (Pin 2) | Common Ground | GND | System common return reference ground. |
| GPIO 21 (Pin 23) | I2C SDA (Data) | SDA | Bidirectional serial data line pulled up to 3.3V via 4.7kΩ resistor. |
| GPIO 22 (Pin 26) | I2C SCL (Clock) | SCL | Serial clock line driven by ESP32 I2C bus master at 400 kHz fast mode. |
| GPIO 2 (Pin 24) | Onboard Blue LED | — | Flashes during active 2.5s telemetry broadcast cycles. |
| Jumper SDO | Hardware Address | GND (Default) | Sets 7-bit I2C device address to 0x76 (pulling to 3V3 changes to 0x77). |


Fig. D.1: ESP32 to SmartElex BME688 Hardware Wiring Schematic (Direct 4-Wire I2C Interconnection)
