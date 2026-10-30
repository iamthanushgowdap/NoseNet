'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Terminal,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Layers,
  Flame,
  Code2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { ExportService } from '@/services/export-service';

const ARDUINO_FIRMWARE_SKETCH = `/*
 * NoseNet — ESP32 + SmartElex BME688 Serial Firmware
 * ----------------------------------------------------
 * Project: IoT-Based Cake Freshness and Adulteration Testing System
 * Hardware:
 *   - Microcontroller: ESP32-WROOM-32 Development Board
 *   - Sensor: SmartElex BME688 Environmental & Gas Sensor
 *   - Communication: USB Serial @ 115200 baud
 *   - I2C Address: 0x76
 *   - Wiring:
 *       BME688 VCC  --> ESP32 3.3V
 *       BME688 GND  --> ESP32 GND
 *       BME688 SDA  --> ESP32 GPIO 21
 *       BME688 SCL  --> ESP32 GPIO 22
 *
 * Dependencies (install via Arduino Library Manager):
 *   - "Adafruit BME680 Library" by Adafruit
 *   - "Adafruit Unified Sensor" by Adafruit
 *
 * Output Protocol:
 *   Newline-delimited JSON (JSON-lines) format.
 *   One self-contained JSON object per line terminated with \\n.
 */

#include <Wire.h>
#include <Adafruit_Sensor.h>
#include "Adafruit_BME680.h"

// Hardware Pin Configuration
#define I2C_SDA_PIN 21
#define I2C_SCL_PIN 22
#define BME688_I2C_ADDR 0x76

// Sampling Interval (milliseconds)
#define SAMPLING_INTERVAL_MS 1000

// Initialize BME680/BME688 sensor object over I2C
Adafruit_BME680 bme;

// State tracking
unsigned long lastSampleTime = 0;
unsigned long sequenceNumber = 0;
bool sensorInitialized = false;

void setup() {
  // Initialize USB Serial communication at 115200 baud
  Serial.begin(115200);
  
  // Wait up to 2 seconds for serial port to open (helpful on native USB)
  unsigned long startWait = millis();
  while (!Serial && (millis() - startWait < 2000)) {
    delay(10);
  }

  // 1. Send Boot Event Message
  Serial.println("{\\"type\\":\\"boot\\",\\"board\\":\\"ESP32-WROOM-32\\",\\"sensor\\":\\"BME688\\",\\"version\\":\\"1.0.0\\",\\"i2c_sda\\":21,\\"i2c_scl\\":22,\\"baud\\":115200}");

  // 2. Initialize I2C with specified GPIO pins
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  // 3. Initialize BME688 Sensor
  if (!bme.begin(BME688_I2C_ADDR)) {
    sensorInitialized = false;
    Serial.println("{\\"type\\":\\"status\\",\\"sensor\\":\\"BME688\\",\\"initialized\\":false,\\"i2c_addr\\":\\"0x76\\",\\"message\\":\\"Failed to find BME688 sensor at I2C 0x76. Check wiring: SDA=21, SCL=22, 3.3V.\\"}");
  } else {
    sensorInitialized = true;
    
    // Set oversampling and filter configuration
    bme.setTemperatureOversampling(BME680_OS_8X);
    bme.setHumidityOversampling(BME680_OS_2X);
    bme.setPressureOversampling(BME680_OS_4X);
    bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
    
    // Gas heater settings: 320 degrees Celsius for 150 milliseconds
    bme.setGasHeater(320, 150);

    Serial.println("{\\"type\\":\\"status\\",\\"sensor\\":\\"BME688\\",\\"initialized\\":true,\\"i2c_addr\\":\\"0x76\\",\\"heater_temp_C\\":320,\\"heater_time_ms\\":150,\\"message\\":\\"BME688 sensor initialized and calibrated successfully.\\"}");
  }
}

void loop() {
  unsigned long currentTime = millis();

  // Retry sensor initialization if it was not detected on boot
  if (!sensorInitialized) {
    if (currentTime - lastSampleTime >= 3000) {
      lastSampleTime = currentTime;
      if (bme.begin(BME688_I2C_ADDR)) {
        sensorInitialized = true;
        bme.setTemperatureOversampling(BME680_OS_8X);
        bme.setHumidityOversampling(BME680_OS_2X);
        bme.setPressureOversampling(BME680_OS_4X);
        bme.setIIRFilterSize(BME680_FILTER_SIZE_3);
        bme.setGasHeater(320, 150);
        Serial.println("{\\"type\\":\\"status\\",\\"sensor\\":\\"BME688\\",\\"initialized\\":true,\\"i2c_addr\\":\\"0x76\\",\\"message\\":\\"BME688 sensor reconnected and initialized.\\"}");
      } else {
        Serial.println("{\\"type\\":\\"error\\",\\"sensor\\":\\"BME688\\",\\"initialized\\":false,\\"message\\":\\"Sensor not detected. Verify connections to SDA (21) and SCL (22).\\"}");
      }
    }
    return;
  }

  // Periodic sampling every SAMPLING_INTERVAL_MS
  if (currentTime - lastSampleTime >= SAMPLING_INTERVAL_MS) {
    lastSampleTime = currentTime;
    sequenceNumber++;

    // Trigger BME688 asynchronous measurement
    if (!bme.performReading()) {
      Serial.print("{\\"type\\":\\"error\\",\\"seq\\":");
      Serial.print(sequenceNumber);
      Serial.print(",\\"elapsed_ms\\":");
      Serial.print(currentTime);
      Serial.println(",\\"message\\":\\"Failed to perform reading from BME688\\"}");
      return;
    }

    // Extract sensor readings
    float temperature_C = bme.temperature;
    float humidity_percent = bme.humidity;
    float pressure_hPa = bme.pressure / 100.0F; // Pa to hPa
    uint32_t gas_resistance_ohm = bme.gas_resistance;
    float gas_resistance_kohm = gas_resistance_ohm / 1000.0F;

    // Output formatted JSON-line to USB Serial
    Serial.print("{\\"type\\":\\"reading\\",\\"seq\\":");
    Serial.print(sequenceNumber);
    Serial.print(",\\"elapsed_ms\\":");
    Serial.print(currentTime);
    Serial.print(",\\"temperature_C\\":");
    Serial.print(temperature_C, 2);
    Serial.print(",\\"humidity_percent\\":");
    Serial.print(humidity_percent, 2);
    Serial.print(",\\"pressure_hPa\\":");
    Serial.print(pressure_hPa, 2);
    Serial.print(",\\"gas_resistance_ohm\\":");
    Serial.print(gas_resistance_ohm);
    Serial.print(",\\"gas_resistance_kohm\\":");
    Serial.print(gas_resistance_kohm, 3);
    Serial.println(",\\"status\\":\\"OK\\"}");
  }
}
`;

export default function HardwareGuidePage() {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ARDUINO_FIRMWARE_SKETCH);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadIno = () => {
    ExportService.triggerDownload(
      ARDUINO_FIRMWARE_SKETCH,
      'nosenet_esp32_bme688.ino',
      'text/plain;charset=utf-8;'
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10 bg-black text-white">
      {/* Page Header */}
      <div className="pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-white" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            NoseNet Hardware & Engineering Guide
          </h1>
        </div>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Comprehensive technical guide for connecting the ESP32-WROOM-32 microcontroller, SmartElex BME688 4-in-1 environmental gas sensor, Web Serial communication, and second-phone sensory appraisal.
        </p>
      </div>

      {/* Section 1: System Hardware Pinout & Wiring */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-white" />
            <span>1. ESP32 to SmartElex BME688 Wiring & Pinout</span>
          </h2>
          <span className="text-xs font-mono text-neutral-400">I²C Bus @ 0x76</span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The SmartElex BME688 breakout board integrates a metal oxide semiconductor (MOX) gas sensor with temperature, humidity, and barometric pressure sensors. Connect the breakout to your ESP32-WROOM-32 development board using 4 jumper wires:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-3">BME688 Pin</th>
                <th className="py-2.5 px-3">ESP32 Pin</th>
                <th className="py-2.5 px-3">Function</th>
                <th className="py-2.5 px-3">Operating Voltage / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-neutral-200">
              <tr>
                <td className="py-2.5 px-3 font-bold text-rose-400">VCC</td>
                <td className="py-2.5 px-3 text-white font-bold">3.3V</td>
                <td className="py-2.5 px-3 font-sans text-neutral-300">Power Supply</td>
                <td className="py-2.5 px-3 font-sans text-neutral-400">Regulated 3.3V (do NOT connect to 5V)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-neutral-400">GND</td>
                <td className="py-2.5 px-3 text-white font-bold">GND</td>
                <td className="py-2.5 px-3 font-sans text-neutral-300">Ground</td>
                <td className="py-2.5 px-3 font-sans text-neutral-400">Common circuit reference</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-blue-400">SDA</td>
                <td className="py-2.5 px-3 text-white font-bold">GPIO 21</td>
                <td className="py-2.5 px-3 font-sans text-neutral-300">I²C Serial Data</td>
                <td className="py-2.5 px-3 font-sans text-neutral-400">Default ESP32 Wire SDA pin</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-amber-400">SCL</td>
                <td className="py-2.5 px-3 text-white font-bold">GPIO 22</td>
                <td className="py-2.5 px-3 font-sans text-neutral-300">I²C Serial Clock</td>
                <td className="py-2.5 px-3 font-sans text-neutral-400">Default ESP32 Wire SCL pin</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-800 bg-black text-xs text-neutral-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>
            <strong>I²C Address:</strong> SmartElex BME688 is configured to address <code className="text-white font-mono">0x76</code> by default. If your breakout has an SDO jumper pulled high, it will appear at <code className="text-white font-mono">0x77</code>. The firmware defaults to <code className="text-white font-mono">0x76</code>.
          </span>
        </div>
      </section>

      {/* Section 2: Arduino IDE Setup & Firmware */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-white" />
            <span>2. Arduino IDE Setup & Firmware Flashing</span>
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadIno}
              className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ino Sketch</span>
            </button>
          </div>
        </div>

        <div className="space-y-3 text-xs text-neutral-300">
          <p>
            <strong>Step A — Install ESP32 Board Core:</strong> In Arduino IDE, open <code className="text-white">File &gt; Preferences</code> and add <code className="text-white font-mono">https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json</code> to Additional Board Manager URLs. Then in <code className="text-white">Tools &gt; Board &gt; Boards Manager</code>, install <strong>esp32 by Espressif Systems</strong>.
          </p>
          <p>
            <strong>Step B — Install Required Libraries:</strong> Open <code className="text-white">Sketch &gt; Include Library &gt; Manage Libraries</code> and install:
          </p>
          <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
            <li><strong className="text-white">Adafruit BME680 Library</strong> by Adafruit</li>
            <li><strong className="text-white">Adafruit Unified Sensor</strong> by Adafruit</li>
          </ul>
          <p>
            <strong>Step C — Select Board & Upload:</strong> Under <code className="text-white">Tools &gt; Board</code>, select <strong>ESP32 Dev Module</strong>. Set Upload Speed to <code className="text-white">921600</code> or <code className="text-white">115200</code>. Select your COM Port and click <strong>Upload</strong>.
          </p>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-lg bg-black border border-neutral-900 p-4 font-mono text-xs overflow-x-auto max-h-72">
          <pre className="text-neutral-300">{ARDUINO_FIRMWARE_SKETCH}</pre>
        </div>
      </section>

      {/* Section 3: Web Serial Protocol */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-900 pb-3">
          <Code2 className="w-5 h-5 text-white" />
          <span>3. Web Serial JSON-Lines Protocol</span>
        </h2>

        <p className="text-xs text-neutral-300 leading-relaxed">
          The ESP32 communicates over USB serial at <strong>115200 baud</strong>. The web application directly reads lines using the browser's native <strong>Web Serial API</strong>. Every line is a self-contained, valid JSON object:
        </p>

        <div className="space-y-3">
          {/* Reading Event */}
          <div className="p-3.5 rounded-lg bg-black border border-neutral-900 space-y-1">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold block">
              Live Sensor Reading Event:
            </span>
            <div className="font-mono text-xs text-neutral-300 overflow-x-auto">
              {`{"type":"reading","seq":12,"elapsed_ms":24000,"temperature_C":26.4,"humidity_percent":68.2,"pressure_hPa":714.2,"gas_resistance_ohm":24500,"gas_resistance_kohm":24.500,"status":"OK"}`}
            </div>
          </div>

          {/* Boot Event */}
          <div className="p-3.5 rounded-lg bg-black border border-neutral-900 space-y-1">
            <span className="text-[11px] font-mono uppercase text-blue-400 font-semibold block">
              Microcontroller Boot Message:
            </span>
            <div className="font-mono text-xs text-neutral-300 overflow-x-auto">
              {`{"type":"boot","board":"ESP32-WROOM-32","sensor":"BME688","version":"1.0.0","i2c_sda":21,"i2c_scl":22,"baud":115200}`}
            </div>
          </div>

          {/* Status / Error Event */}
          <div className="p-3.5 rounded-lg bg-black border border-neutral-900 space-y-1">
            <span className="text-[11px] font-mono uppercase text-amber-400 font-semibold block">
              Sensor Initialization & Diagnostic Status:
            </span>
            <div className="font-mono text-xs text-neutral-300 overflow-x-auto">
              {`{"type":"status","sensor":"BME688","initialized":true,"i2c_addr":"0x76","heater_temp_C":320,"heater_time_ms":150,"message":"BME688 sensor initialized and calibrated successfully."}`}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-neutral-800 bg-black text-xs text-neutral-400">
          <strong className="text-white">Watchdog & Stale Data Detection:</strong> If valid readings cease arriving for more than 5 seconds while the serial port remains physically open, the dashboard alerts the operator with a <strong className="text-amber-400">STALE SENSOR</strong> warning to flag loose wires or hardware lockups.
        </div>
      </section>

      {/* Section 4: Dual-Device Independent Assessment Protocol */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-900 pb-3">
          <Smartphone className="w-5 h-5 text-white" />
          <span>4. Dual-Device Independent Sensory Appraisal</span>
        </h2>

        <p className="text-xs text-neutral-300 leading-relaxed">
          To maintain scientific objectivity and eliminate operator bias, human sensory inspection is separated from sensor readings:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Station 1: Operator Computer</span>
            <ul className="text-neutral-400 space-y-1.5 list-disc list-inside">
              <li>Physically connected to ESP32 via USB.</li>
              <li>Runs Guided Test Workflow and logs raw timeseries into IndexedDB.</li>
              <li>Generates cryptographically unique assessment session tokens and QR codes.</li>
              <li>Streams live Recharts graph and computes statistical delta shifts.</li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Station 2: Assessor Smartphone</span>
            <ul className="text-neutral-400 space-y-1.5 list-disc list-inside">
              <li>Connects to same local network / Wi-Fi hotspot.</li>
              <li>Scans QR code displayed on operator screen.</li>
              <li>Evaluates cake specimen: Visual appearance, gentle smell check, verdict, and confidence.</li>
              <li>Submits directly to local Next.js server API (<code className="text-white font-mono">/api/assessments/[token]</code>).</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: The 3 Scientific Test Stages */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-900 pb-3">
          <Layers className="w-5 h-5 text-white" />
          <span>5. Scientific Protocol: The 3 Evaluation Stages</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 1: ROOM</span>
            <p className="text-neutral-300">
              <strong className="text-white">Objective:</strong> Ambient baseline.
            </p>
            <p className="text-neutral-400">
              Measures the open laboratory room environment. Establishes baseline sensor resistance (R0) and ambient relative humidity before any food sample is introduced.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 2: EMPTY_CONTAINER</span>
            <p className="text-neutral-300">
              <strong className="text-white">Objective:</strong> Vessel cleanliness check.
            </p>
            <p className="text-neutral-400">
              Measures the sealed test container before specimen insertion. Verifies that no residual alcohol vapors, cleaning solvents, or contaminants linger from prior runs.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black border border-neutral-800 space-y-2">
            <span className="font-mono text-white font-bold block text-sm">Stage 3: CAKE</span>
            <p className="text-neutral-300">
              <strong className="text-white">Objective:</strong> Volatile headspace capture.
            </p>
            <p className="text-neutral-400">
              The cake specimen is placed inside the sealed chamber. Volatile organic compounds (VOCs) alter MOX film conductivity, generating real dynamic response curves.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Scientific Integrity & No Fake AI */}
      <section className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 space-y-3">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-neutral-900 pb-3">
          <ShieldCheck className="w-5 h-5 text-white" />
          <span>6. Scientific Transparency & Research Integrity</span>
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          This system strictly avoids fabricated artificial intelligence classifications. In chemical and food sensing, small sample sizes and uncalibrated models produce deceptive results.
        </p>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Instead, NoseNet provides researchers with transparent empirical measurements: starting and ending gas resistances, delta shift (ΔR_gas), percent change, temperature and humidity compensation factors, and synchronized human sensory ratings. All reports explicitly carry the scientific disclosure: <span className="text-white font-semibold">“Sensor observations — freshness classification not yet validated.”</span>
        </p>
      </section>
    </div>
  );
}
