'use client';

import React from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10 bg-black text-white">
      {/* Top Header */}
      <div className="pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-white" />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            NoseNet System Architecture & Engineering Guide
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Comprehensive technical documentation for the college project: “IoT-Based Cake Freshness and Adulteration Detection Device”.
        </p>
      </div>

      {/* 1. Academic Abstract */}
      <section className="bg-black border border-neutral-800 rounded-lg p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span>1. Project Abstract & Objective</span>
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Commercial bakery products, particularly cream-filled pastries and sponge cakes, are susceptible to rapid microbial
          spoilage, moisture migration, and lipid oxidation. Standard laboratory evaluation requires destructive, time-consuming
          assays (microbial plate counts, free fatty acid titrations).
        </p>
        <p className="text-xs text-neutral-300 leading-relaxed">
          <strong className="text-white">NoseNet</strong> is an IoT-based non-destructive electronic nose platform combining metal oxide semiconductor
          (MOX) gas sensors with environmental compensation (temperature, relative humidity, barometric pressure). This web
          dashboard serves as the central scientific interface for experiment protocoling, ESP32 telemetry ingestion,
          sensor time-series analytics, human sensory panel logging, and dataset collection.
        </p>
      </section>

      {/* 2. What Works Locally vs Production */}
      <section className="bg-black border border-neutral-800 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-white" />
          <span>2. Operational Status: Local-First vs. Future Backend</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Fully Functional Locally (Current Build)</span>
            </h3>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>Local-first architecture without cloud dependencies or paid APIs.</li>
              <li>Experiment protocol creation, editing, archiving, and control verification.</li>
              <li>Cake specimen registration: Normal Cake & Pastry Cake, Frozen & Unfrozen combinations.</li>
              <li>ESP32 CSV ingestion, Zod schema validation, duplicate prevention.</li>
              <li>Interactive Recharts graphs: Gas Resistance, Temp, RH, Pressure vs Elapsed Time.</li>
              <li>5-point Simple Moving Average (SMA-5) trend calculation with raw data preservation.</li>
              <li>Touch-optimized Assessor terminal for Fresh / Average / Not Good scoring.</li>
              <li>Disagreement detection when multiple assessors evaluate the same sample.</li>
              <li>Full JSON backup snapshots and verified restoration.</li>
              <li>CSV export of readings, assessments, samples, and experiments.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Requires Backend Server (Future Phase 2)</span>
            </h3>
            <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-white">Cross-Device Multi-Phone Sync:</strong> Browser LocalStorage is isolated to a single physical device and browser profile.
                Live synchronization between the researcher laptop and assessor phone requires a WebSocket or MQTT server.
              </li>
              <li>
                <strong className="text-white">Real Authentication:</strong> Current build uses local demonstration authentication. Production requires JWT/session tokens with bcrypt password hashing.
              </li>
              <li>
                <strong className="text-white">Direct Wireless ESP32 Ingestion:</strong> Local build imports CSV files from SD card or serial monitor. Future firmware will publish via MQTT/HTTP POST directly to an ingestion API.
              </li>
              <li>
                <strong className="text-white">Trained Machine Learning Model:</strong> Automated inference remains strictly disabled until an evaluated classifier (ONNX / Scikit-Learn) is trained on 200+ paired batches.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. ESP32 CSV Format Specification */}
      <section className="bg-black border border-neutral-800 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-white" />
          <span>3. ESP32 Telemetry & CSV Header Specification</span>
        </h2>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The ESP32 firmware should format SD card logs or serial prints with the following comma-separated header line:
        </p>

        <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-white overflow-x-auto">
          experiment_id,sample_id,stage,sample_no,elapsed_seconds,temperature_C,humidity_percent,pressure_hPa,gas_resistance_ohm,gas_resistance_kohm,status
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-950 text-neutral-300 border-b border-neutral-800 text-[11px] font-bold">
              <tr>
                <th className="py-2 px-3">Field</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Description / Accepted Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-white">
              <tr>
                <td className="py-2 px-3 text-white font-bold">experiment_id</td>
                <td className="py-2 px-3 text-neutral-400">string</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Experiment identifier (e.g. EXP-2026-001)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">sample_id</td>
                <td className="py-2 px-3 text-neutral-400">string</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Specimen identifier (e.g. SMP-NC-UF-01)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">stage</td>
                <td className="py-2 px-3 text-neutral-400">enum</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Must be ROOM, EMPTY_CONTAINER, or CAKE</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">sample_no</td>
                <td className="py-2 px-3 text-neutral-400">integer</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Replicate index (1, 2, 3...)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">elapsed_seconds</td>
                <td className="py-2 px-3 text-neutral-400">float</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Continuous running time since start of protocol run</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">temperature_C</td>
                <td className="py-2 px-3 text-neutral-400">float</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Ambient chamber temperature in Celsius</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">humidity_percent</td>
                <td className="py-2 px-3 text-neutral-400">float</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Relative humidity (0.0 to 100.0%)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">pressure_hPa</td>
                <td className="py-2 px-3 text-neutral-400">float</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Atmospheric pressure (hPa or mbar)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">gas_resistance_ohm</td>
                <td className="py-2 px-3 text-neutral-400">integer</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Sensor heater layer resistance in Ohms</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">gas_resistance_kohm</td>
                <td className="py-2 px-3 text-neutral-400">float</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Resistance in kilo-Ohms (kΩ = Ω / 1000)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-white font-bold">status</td>
                <td className="py-2 px-3 text-neutral-400">string</td>
                <td className="py-2 px-3 font-sans text-neutral-300">Sensor stabilization flag (OK, HEATING, STABLE)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Sensor Stages Explanation */}
      <section className="bg-black border border-neutral-800 rounded-lg p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-white" />
          <span>4. Scientific Protocol: The 3 Evaluation Stages</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 1: ROOM</span>
            <p className="text-neutral-200 leading-relaxed">
              <strong className="text-white">Objective:</strong> Ambient background baseline.
            </p>
            <p className="text-neutral-400">
              Measures the laboratory environment before sampling. Establishes base resistance (R0) and ambient relative
              humidity to detect environmental drifts.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 2: EMPTY_CONTAINER</span>
            <p className="text-neutral-200 leading-relaxed">
              <strong className="text-white">Objective:</strong> Chamber cleanliness check.
            </p>
            <p className="text-neutral-400">
              Measures the sealed test vessel before specimen insertion. Verifies that no residual alcohol vapors, cleaning
              agents, or volatile contaminants remain from preceding runs.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-700 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 3: CAKE</span>
            <p className="text-neutral-200 leading-relaxed">
              <strong className="text-white">Objective:</strong> Headspace volatile capture.
            </p>
            <p className="text-neutral-400">
              The cake specimen is placed inside the chamber. VOCs emitted by bakery ingredients, yeast, or spoilage
              microflora alter the conductivity of the sensing film, generating dynamic response curves.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Production Transition Architecture */}
      <section className="bg-black border border-neutral-800 rounded-lg p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-white" />
          <span>5. Code Architecture & Extensibility</span>
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          NoseNet is strictly designed around a decoupled <strong className="text-white">Storage Adapter</strong> pattern (`IStorageAdapter`).
          All services (`ExperimentService`, `SampleService`, `SensorService`, `AssessmentService`, `AuthService`) interact
          exclusively through this interface.
        </p>
        <p className="text-xs text-neutral-300 leading-relaxed">
          To transition from `LocalStorageAdapter` to a production PostgreSQL database or WebSocket server, no UI components
          need to be rewritten. A new `HttpStorageAdapter` implementing the exact same `IStorageAdapter` contract can be swapped
          in `src/services/index.ts` seamlessly.
        </p>
      </section>
    </div>
  );
}
