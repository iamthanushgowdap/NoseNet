import os
import base64

art_dir = r"C:\Users\choco\.gemini\antigravity\brain\ef836a7f-4c22-49c8-b72f-c4d1a8d710f0"

def get_b64(filename):
    path = os.path.join(art_dir, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return ""

vtu_b64 = get_b64("vtu_logo.png")
apsce_b64 = get_b64("apsce_logo.jpg")
arch_b64 = get_b64("fig_4_1_architecture.png")
flow_b64 = get_b64("fig_4_2_flowchart.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoseNet - APSCE Open Day Academic Project Poster</title>
  <style>
    /* =====================================================================
       ACADEMIC POSTER SPECIFICATION - APSCE OPEN DAY
       Standard Dimensions: A2 (420 x 594 mm) / A3 (297 x 420 mm)
       Aspect Ratio: 1.414 : 1 (ISO 216 standards - A2 and A3 scale identically)
       ===================================================================== */
    
    @page {{
      size: 594mm 420mm landscape;
      margin: 0;
    }}
    
    :root {{
      --primary-navy: #0b1f3a;
      --navy-light: #16325c;
      --navy-dark: #061120;
      --gold-accent: #c59b27;
      --gold-bright: #e5b83b;
      --gold-soft: #fef9e7;
      --text-dark: #1e293b;
      --text-muted: #475569;
      --bg-page: #081322;
      --card-bg: #ffffff;
      --card-border: #cbd5e1;
      --fresh-green: #059669;
      --fresh-bg: #ecfdf5;
      --fair-blue: #0284c7;
      --fair-bg: #f0f9ff;
      --stale-amber: #d97706;
      --stale-bg: #fffbeb;
      --spoiled-red: #dc2626;
      --spoiled-bg: #fef2f2;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg-page);
      color: var(--text-dark);
      padding: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }}

    /* Interactive Toolbar (Screen only, hidden on print) */
    .toolbar {{
      background: #1e293b;
      color: #fff;
      padding: 10px 24px;
      border-radius: 40px;
      margin-bottom: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      z-index: 100;
      flex-wrap: wrap;
    }}
    .toolbar button {{
      background: linear-gradient(135deg, #e5b83b, #c59b27);
      color: #0b1f3a;
      border: none;
      font-weight: 700;
      font-size: 13.5px;
      padding: 8px 18px;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }}
    .toolbar button:hover {{
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(229,184,59,0.4);
    }}
    .toolbar .btn-secondary {{
      background: #334155;
      color: #f8fafc;
      border: 1px solid #475569;
    }}
    .toolbar .btn-secondary:hover {{
      background: #475569;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }}
    .toolbar span {{
      font-size: 13px;
      color: #94a3b8;
    }}
    .toolbar .badge-format {{
      background: #0f172a;
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid #334155;
      color: #38bdf8;
      font-weight: 700;
      font-size: 12px;
    }}

    /* Main Poster Canvas: Standard Landscape Aspect Ratio (594mm x 420mm) */
    .poster-canvas {{
      width: 1420px;
      height: 1004px; /* Exact 1.414 landscape ratio */
      background: #f8fafc;
      border: 4px solid var(--gold-accent);
      border-radius: 6px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      transition: width 0.3s ease, height 0.3s ease;
    }}

    /* Portrait Mode Override */
    body.portrait-mode .poster-canvas {{
      width: 1004px;
      height: 1420px;
    }}
    body.portrait-mode .poster-body {{
      grid-template-columns: 1fr 1fr;
    }}
    body.portrait-mode .header-center h1 {{
      font-size: 19px;
    }}

    /* POSTER HEADER */
    .poster-header {{
      background: linear-gradient(135deg, var(--navy-dark) 0%, var(--primary-navy) 50%, var(--navy-light) 100%);
      color: #ffffff;
      padding: 12px 24px;
      display: grid;
      grid-template-columns: 100px 1fr 100px;
      align-items: center;
      border-bottom: 4px solid var(--gold-accent);
      position: relative;
    }}

    .header-logo {{
      width: 90px;
      height: 90px;
      object-fit: contain;
      background: #ffffff;
      padding: 6px;
      border-radius: 50%;
      border: 3px solid var(--gold-accent);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }}

    .header-center {{
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }}

    .inst-top {{
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #cbd5e1;
    }}

    .inst-name {{
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #ffffff;
      text-transform: uppercase;
    }}

    .dept-name {{
      font-size: 13px;
      font-weight: 700;
      color: var(--gold-bright);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }}

    .openday-badge {{
      display: inline-block;
      background: linear-gradient(90deg, #c59b27, #e5b83b);
      color: var(--navy-dark);
      font-size: 10.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      padding: 2px 14px;
      border-radius: 12px;
      margin: 1px 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }}

    .project-title {{
      font-size: 20px;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 2px;
      line-height: 1.2;
      text-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }}

    .project-subtitle {{
      font-size: 11.5px;
      font-weight: 600;
      color: #93c5fd;
      font-style: italic;
    }}

    /* META RIBBON */
    .header-meta {{
      display: flex;
      justify-content: center;
      gap: 18px;
      margin-top: 4px;
      font-size: 10.5px;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 16px;
      border-radius: 20px;
      border: 1px solid rgba(229, 184, 59, 0.35);
      flex-wrap: wrap;
    }}

    .meta-group {{
      display: flex;
      gap: 4px;
    }}
    .meta-label {{
      color: var(--gold-bright);
      font-weight: 700;
    }}
    .meta-val {{
      color: #ffffff;
      font-weight: 500;
    }}

    /* POSTER BODY: 3-COLUMN ACADEMIC LAYOUT */
    .poster-body {{
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1.15fr 1fr;
      gap: 12px;
      padding: 12px 16px;
      background: #f1f5f9;
      overflow: hidden;
    }}

    .col {{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}

    /* CARD BOX */
    .poster-card {{
      background: var(--card-bg);
      border-radius: 6px;
      border: 1px solid var(--card-border);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}

    .card-head {{
      background: linear-gradient(90deg, var(--primary-navy) 0%, var(--navy-light) 100%);
      color: #ffffff;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 2px solid var(--gold-accent);
    }}

    .card-num {{
      background: var(--gold-accent);
      color: var(--navy-dark);
      font-size: 11px;
      font-weight: 900;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }}

    .card-title {{
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    .card-content {{
      padding: 8px 10px;
      font-size: 10px;
      line-height: 1.42;
      color: #334155;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}

    /* Micro Highlights */
    .micro-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
      margin-top: 2px;
    }}
    .micro-card {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 5px;
      text-align: center;
    }}
    .micro-title {{
      font-weight: 800;
      font-size: 9.5px;
      color: var(--primary-navy);
    }}
    .micro-desc {{
      font-size: 8.5px;
      color: var(--text-muted);
    }}

    /* Equations */
    .eq-box {{
      background: #f8fafc;
      border-left: 3px solid var(--gold-accent);
      padding: 5px 8px;
      border-radius: 0 4px 4px 0;
      margin: 2px 0;
      font-family: "Cambria Math", "Times New Roman", serif;
      font-size: 10.5px;
      color: #0f172a;
    }}

    /* Flow / Architecture diagram */
    .arch-flow {{
      display: grid;
      grid-template-columns: 1fr 1.2fr 1fr;
      gap: 6px;
      background: #f8fafc;
      padding: 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }}
    .arch-step {{
      background: #ffffff;
      border-radius: 4px;
      padding: 5px;
      border: 1px solid #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}
    .arch-step-head {{
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 4px;
      border-radius: 3px;
      text-align: center;
    }}
    .arch-in {{ background: #eff6ff; color: #1d4ed8; }}
    .arch-proc {{ background: #fef3c7; color: #b45309; }}
    .arch-out {{ background: #ecfdf5; color: #047857; }}
    
    .arch-list {{
      font-size: 8.8px;
      line-height: 1.35;
      padding-left: 12px;
      margin-top: 3px;
    }}

    /* Tables */
    .custom-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 9.2px;
      margin-top: 2px;
    }}
    .custom-table th {{
      background: #0f172a;
      color: #ffffff;
      padding: 4px 6px;
      text-align: left;
      font-weight: 700;
      font-size: 8.8px;
      text-transform: uppercase;
    }}
    .custom-table td {{
      padding: 3.5px 6px;
      border-bottom: 1px solid #e2e8f0;
    }}
    .custom-table tr:nth-child(even) {{
      background: #f8fafc;
    }}

    /* Badges */
    .badge-fresh {{ background: var(--fresh-bg); color: var(--fresh-green); border: 1px solid #a7f3d0; font-weight: 700; border-radius: 3px; padding: 1px 5px; }}
    .badge-fair {{ background: var(--fair-bg); color: var(--fair-blue); border: 1px solid #bae6fd; font-weight: 700; border-radius: 3px; padding: 1px 5px; }}
    .badge-stale {{ background: var(--stale-bg); color: var(--stale-amber); border: 1px solid #fde68a; font-weight: 700; border-radius: 3px; padding: 1px 5px; }}
    .badge-spoiled {{ background: var(--spoiled-bg); color: var(--spoiled-red); border: 1px solid #fecaca; font-weight: 700; border-radius: 3px; padding: 1px 5px; }}

    /* References list */
    .ref-list {{
      font-size: 8.2px;
      line-height: 1.32;
      color: #475569;
      padding-left: 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}

    /* Embedded image styles */
    .img-box {{
      width: 100%;
      text-align: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 4px;
      margin: 2px 0;
    }}
    .img-box img {{
      max-width: 100%;
      max-height: 95px;
      object-fit: contain;
      border-radius: 2px;
    }}
    .img-caption {{
      font-size: 8.2px;
      font-weight: 700;
      color: #64748b;
      margin-top: 2px;
    }}

    /* Dual images container */
    .dual-img-box {{
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 6px;
      margin-top: 2px;
    }}

    /* FOOTER BAR */
    .poster-footer {{
      background: var(--navy-dark);
      color: #cbd5e1;
      padding: 6px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
      font-weight: 600;
      border-top: 2px solid var(--gold-accent);
    }}
    .footer-left {{
      color: var(--gold-bright);
    }}
    .footer-right {{
      color: #94a3b8;
    }}

    /* PRINT RULES */
    @media print {{
      body {{
        background: none;
        padding: 0;
        margin: 0;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }}
      .toolbar {{
        display: none !important;
      }}
      .poster-canvas {{
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-inside: avoid;
        page-break-after: avoid;
      }}
    }}
  </style>
</head>
<body>

  <!-- Screen-only toolbar -->
  <div class="toolbar">
    <button onclick="window.print()">
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
      Print / Save as PDF
    </button>
    <button class="btn-secondary" onclick="toggleOrientation()">
      🔄 Toggle Landscape / Portrait
    </button>
    <div class="badge-format">A2 Standard (594 &times; 420 mm) / A3 Scalable</div>
    <span>• Set Paper Size: <strong>A2 or A3</strong> • Layout: <strong>Landscape</strong> • Margins: <strong>None</strong> • Background: <strong>Checked</strong></span>
  </div>

  <!-- Main Poster Canvas -->
  <div class="poster-canvas" id="posterCanvas">

    <!-- HEADER SECTION -->
    <header class="poster-header">
      <img src="data:image/png;base64,{vtu_b64}" alt="VTU Logo" class="header-logo">
      
      <div class="header-center">
        <div class="inst-top">Visvesvaraya Technological University, Belagavi</div>
        <div class="inst-name">A.P.S. COLLEGE OF ENGINEERING</div>
        <div class="dept-name">Department of Information Science & Engineering</div>
        <div class="openday-badge">APSCE OPEN DAY — PROJECT EXHIBITION</div>
        
        <h1 class="project-title">IoT Based Cake Freshness & Adulteration Detection Device</h1>
        <div class="project-subtitle">NoseNet: Edge-AI Non-Invasive Olfactory Sensing System via MOX Chemisorption & Web Bluetooth</div>

        <!-- Meta ribbon with Students, Guide, Academic Year -->
        <div class="header-meta">
          <div class="meta-group">
            <span class="meta-label">Students:</span>
            <span class="meta-val">Dhanush Gowda H P (1AP23IS017) | T Mythri (1AP23IS054) | Tanushree K S (1AP23IS055) | Thanush Gowda P (1AP23IS056)</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">Project Guide:</span>
            <span class="meta-val">Prof. Lohit J K</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">HOD:</span>
            <span class="meta-val">Dr. Mithun B N</span>
          </div>
          <div class="meta-group">
            <span class="meta-label">Academic Year:</span>
            <span class="meta-val">2025 – 2026</span>
          </div>
        </div>
      </div>

      <img src="data:image/jpeg;base64,{apsce_b64}" alt="APSCE Logo" class="header-logo">
    </header>

    <!-- POSTER BODY: 3 BALANCED COLUMNS -->
    <main class="poster-body">

      <!-- COLUMN 1: Introduction, Problem Statement, Objectives -->
      <div class="col">
        
        <!-- 1. INTRODUCTION -->
        <section class="poster-card" style="flex: 1.1;">
          <div class="card-head">
            <div class="card-num">1</div>
            <div class="card-title">Introduction</div>
          </div>
          <div class="card-content">
            <p>
              Perishable bakery commodities such as cakes and dairy cream pastries possess high water activity (a<sub>w</sub> &ge; 0.85), rich carbohydrates, and delicate butterfats, making them prime substrates for bacterial proliferation, fungal mold growth, and lipid oxidation.
            </p>
            <p>
              Traditional expiry dates are <em>static indicators</em> that fail during retail ambient temperature spikes (25–35&deg;C) or cold-chain breaches. Meanwhile, standard analytical methods (HPLC, GC-MS, microbiological plating) are destructive, require 24–48h incubation, and cost upwards of thousands of dollars.
            </p>
            <p>
              <strong>NoseNet</strong> introduces an autonomous, non-contact <strong>IoT Electronic Nose</strong>. Utilizing an inverted top-mounted <strong>Bosch BME688 AI multi-gas sensor</strong> with a 320&deg;C metal-oxide semiconductor (MOX) hotplate, NoseNet analyzes headspace Volatile Organic Compounds (VOCs) to deliver laboratory-grade freshness verdicts in under 60 seconds without food contact.
            </p>
            <div class="micro-grid">
              <div class="micro-card">
                <div class="micro-title">Non-Invasive</div>
                <div class="micro-desc">Zero food contact; preserves commercial sample integrity.</div>
              </div>
              <div class="micro-card">
                <div class="micro-title">&lt; 60s Analysis</div>
                <div class="micro-desc">Instant MOX volatile deconvolution vs 48h lab assays.</div>
              </div>
              <div class="micro-card">
                <div class="micro-title">Web Bluetooth</div>
                <div class="micro-desc">Zero-install wireless telemetry on mobile & desktop.</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. PROBLEM STATEMENT -->
        <section class="poster-card" style="flex: 0.95;">
          <div class="card-head">
            <div class="card-num">2</div>
            <div class="card-title">Problem Statement</div>
          </div>
          <div class="card-content">
            <p>
              Bakeries, retailers, and food inspectors face three fundamental technological gaps:
            </p>
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 4px;">
              <li>
                <strong>Invisibility of Early Microbial Spoilage:</strong> Lipid rancidity and dairy souring generate ethanol, acetic acid, and diacetyl long before visible mold colonies or discoloration appear.
              </li>
              <li>
                <strong>Static Expiration Date Inadequacies:</strong> Printed label dates assume pristine refrigeration; ambient retail temperature fluctuations accelerate microbial decay unpredictably.
              </li>
              <li>
                <strong>Commercial Testing Inaccessibility:</strong> No affordable (&lt; $35), real-time, non-destructive volatile screening instrument exists for point-of-sale bakery quality enforcement.
              </li>
            </ul>
          </div>
        </section>

        <!-- 3. OBJECTIVES -->
        <section class="poster-card" style="flex: 1.1;">
          <div class="card-head">
            <div class="card-num">3</div>
            <div class="card-title">Objectives</div>
          </div>
          <div class="card-content">
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 4px;">
              <li>
                <strong>Chamber Fabrication:</strong> Construct an airtight, food-grade sampling chamber (120mm &times; 75mm) with an inverted top-mounted sensor housing for passive gaseous headspace equilibrium.
              </li>
              <li>
                <strong>Dual-Mode Sensing Pipeline:</strong> Interface ESP32-WROOM-32 with Bosch BME688 over I<sup>2</sup>C (0x76, 400 kHz) to record gas resistance (R<sub>gas</sub>), temperature (T), humidity (RH), and pressure (P).
              </li>
              <li>
                <strong>Thermal Stabilization:</strong> Implement an automated 5-second pulsed thermal pre-heat cycle (320&deg;C) to calibrate clean baseline resistance (R<sub>0</sub>) and eliminate ambient transients.
              </li>
              <li>
                <strong>Deconvolution Algorithm:</strong> Develop a relative resistance shift formula (&Delta;R/R<sub>0</sub>) mapped to an empirical 4-tier freshness classification matrix.
              </li>
              <li>
                <strong>Interactive Dashboard:</strong> Build a cross-platform Web Bluetooth (BLE UART) progressive web app with real-time SVG emission curves and longitudinal audit export.
              </li>
            </ul>
          </div>
        </section>

      </div>

      <!-- COLUMN 2: System Architecture & Algorithms / Techniques -->
      <div class="col">

        <!-- 4. SYSTEM ARCHITECTURE -->
        <section class="poster-card" style="flex: 1.15;">
          <div class="card-head">
            <div class="card-num">4</div>
            <div class="card-title">System Architecture (Input &rarr; Processing &rarr; Output)</div>
          </div>
          <div class="card-content">
            <!-- 3-Stage Workflow Diagram -->
            <div class="arch-flow">
              <div class="arch-step">
                <div class="arch-step-head arch-in">1. INPUT STAGE</div>
                <ul class="arch-list">
                  <li><strong>Headspace VOCs:</strong> Ethanol, Acetic Acid, Diacetyl, Ammonia, H<sub>2</sub>O</li>
                  <li><strong>Sensory Telemetry:</strong> R<sub>gas</sub> (k&Omega;), Temp (&deg;C), RH (%), Pressure (hPa)</li>
                  <li><strong>Airtight Chamber:</strong> 120&times;75mm passive dome equilibrium</li>
                </ul>
              </div>

              <div class="arch-step">
                <div class="arch-step-head arch-proc">2. PROCESSING STAGE</div>
                <ul class="arch-list">
                  <li><strong>ESP32 Microcontroller:</strong> Dual-core 240 MHz, I<sup>2</sup>C bus (400 kHz)</li>
                  <li><strong>Thermal Pre-Heating:</strong> 5-sec hotplate pulse at 320&deg;C</li>
                  <li><strong>Noise Filter & Baseline:</strong> Moving average + Specimen R<sub>0</sub> calibration</li>
                  <li><strong>Deconvolution Engine:</strong> Computes relative shift S = (&Delta;R / R<sub>0</sub>) &times; 100%</li>
                </ul>
              </div>

              <div class="arch-step">
                <div class="arch-step-head arch-out">3. OUTPUT STAGE</div>
                <ul class="arch-list">
                  <li><strong>BLE UART Stream:</strong> Nordic NUS UUIDs at 1 Hz transmission</li>
                  <li><strong>Web UI Dashboard:</strong> Real-time SVG gas curve, gauges, 4-tier verdict</li>
                  <li><strong>Audit Session Export:</strong> Multi-run NDJSON & CSV session logs</li>
                </ul>
              </div>
            </div>

            <!-- Architecture & Flow Images -->
            <div class="dual-img-box">
              <div class="img-box">
                <img src="data:image/png;base64,{arch_b64}" alt="Hardware Architecture Diagram">
                <div class="img-caption">Figure 1: Hardware Architecture & Web BLE Interfacing</div>
              </div>
              <div class="img-box">
                <img src="data:image/png;base64,{flow_b64}" alt="Firmware Sensing Flowchart">
                <div class="img-caption">Figure 2: Pre-Heat & Sensing Flowchart</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. ALGORITHMS AND TECHNIQUES USED -->
        <section class="poster-card" style="flex: 1.3;">
          <div class="card-head">
            <div class="card-num">5</div>
            <div class="card-title">Algorithms & Techniques Used</div>
          </div>
          <div class="card-content">
            
            <div style="display: flex; gap: 8px;">
              <div style="flex: 1;">
                <strong style="color: var(--primary-navy); font-size: 10px;">A. MOX Chemisorption Physics:</strong>
                <p style="font-size: 9.2px; margin-top: 1px;">
                  At 320&deg;C, ambient O<sub>2</sub> traps conduction electrons, creating an electron depletion barrier and high baseline resistance (R<sub>0</sub>):
                </p>
                <div class="eq-box">
                  O<sub>2 (gas)</sub> + 2e<sup>&minus;</sup> &rarr; 2O<sup>&minus;</sup><sub>(adsorbed)</sub> &nbsp; <em>[Depletion barrier; High R<sub>0</sub>]</em>
                </div>
                <p style="font-size: 9.2px;">
                  Reducing VOCs from spoilage react with adsorbed oxygen, reinjecting electrons into the conduction band:
                </p>
                <div class="eq-box">
                  VOC + O<sup>&minus;</sup><sub>(ads)</sub> &rarr; VOC-O + e<sup>&minus;</sup> &nbsp; <em>[Barrier collapses &rArr; R<sub>gas</sub> &darr;&darr;]</em>
                </div>
              </div>

              <div style="flex: 0.9;">
                <strong style="color: var(--primary-navy); font-size: 10px;">B. Mathematical Shift Formulation:</strong>
                <p style="font-size: 9.2px; margin-top: 1px;">
                  Resistance shift correlates directly with microbial volatile concentration:
                </p>
                <div class="eq-box" style="text-align: center; font-size: 11px; font-weight: 700;">
                  S = [ (R<sub>comp</sub> &minus; R<sub>0</sub>) / R<sub>0</sub> ] &times; 100%
                </div>
                <p style="font-size: 8.8px; color: var(--text-muted);">
                  Baseline Registry R<sub>0</sub>: Normal Unfrozen (36.80 k&Omega;) | Normal Frozen (46.80 k&Omega;) | Pastry Unfrozen (40.05 k&Omega;) | Pastry Frozen (40.62 k&Omega;).
                </p>
              </div>
            </div>

            <!-- 4-Tier Decision Matrix Table -->
            <strong style="color: var(--primary-navy); font-size: 10px; margin-top: 2px;">C. 4-Tier Decision Classification Matrix:</strong>
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Verdict Tier</th>
                  <th>Shift Range (S)</th>
                  <th>Score</th>
                  <th>Biochemical Degradation State</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="badge-fresh">Fresh</span></td>
                  <td><strong>S &ge; &minus;5.0%</strong></td>
                  <td>90 – 100%</td>
                  <td>Pristine crumb; baseline volatile equilibrium.</td>
                  <td>Safe for sale</td>
                </tr>
                <tr>
                  <td><span class="badge-fair">Fairly Fresh</span></td>
                  <td><strong>&minus;15.0% &le; S &lt; &minus;5.0%</strong></td>
                  <td>70 – 89%</td>
                  <td>Early moisture release; trace fermentation VOCs.</td>
                  <td>Prime consumption</td>
                </tr>
                <tr>
                  <td><span class="badge-stale">Stale</span></td>
                  <td><strong>&minus;35.0% &le; S &lt; &minus;15.0%</strong></td>
                  <td>40 – 69%</td>
                  <td>Starch retrogradation; lipid oxidation; crumb dryness.</td>
                  <td>Discount / Consume</td>
                </tr>
                <tr>
                  <td><span class="badge-spoiled">Spoiled</span></td>
                  <td><strong>S &lt; &minus;35.0%</strong></td>
                  <td>&lt; 40%</td>
                  <td>Severe bacterial fermentation; souring; toxic VOC release.</td>
                  <td>Discard immediately</td>
                </tr>
              </tbody>
            </table>

          </div>
        </section>

      </div>

      <!-- COLUMN 3: Conclusion & Results, Future Enhancement, References -->
      <div class="col">

        <!-- 6. CONCLUSION & EXPERIMENTAL RESULTS -->
        <section class="poster-card" style="flex: 1.25;">
          <div class="card-head">
            <div class="card-num">6</div>
            <div class="card-title">Conclusion & Results</div>
          </div>
          <div class="card-content">
            <p>
              A 7-day longitudinal degradation study comprising <strong>52 empirical records across 13 epochs (0h to 168h)</strong> was executed across Normal and Pastry cakes under Ambient (24–28&deg;C) and Frozen (&minus;18&deg;C) environments:
            </p>

            <table class="custom-table">
              <thead>
                <tr>
                  <th>Sample / Specimen</th>
                  <th>Day 0 (0h)</th>
                  <th>Day 3 (72h)</th>
                  <th>Day 7 (168h)</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pastry Cake (Ambient)</strong></td>
                  <td>40.05 k&Omega; (0%)</td>
                  <td>14.80 k&Omega; (&minus;63%)</td>
                  <td><strong>7.90 k&Omega; (&minus;80.3%)</strong></td>
                  <td><span class="badge-spoiled">Spoiled</span></td>
                </tr>
                <tr>
                  <td><strong>Pastry Cake (Frozen)</strong></td>
                  <td>40.62 k&Omega; (0%)</td>
                  <td>41.80 k&Omega; (+2.9%)</td>
                  <td><strong>41.60 k&Omega; (+2.4%)</strong></td>
                  <td><span class="badge-fair">Fairly Fresh</span></td>
                </tr>
                <tr>
                  <td><strong>Normal Cake (Ambient)</strong></td>
                  <td>36.80 k&Omega; (0%)</td>
                  <td>28.50 k&Omega; (&minus;22.5%)</td>
                  <td><strong>23.90 k&Omega; (&minus;35.1%)</strong></td>
                  <td><span class="badge-stale">Stale</span></td>
                </tr>
                <tr>
                  <td><strong>Normal Cake (Frozen)</strong></td>
                  <td>46.80 k&Omega; (0%)</td>
                  <td>46.90 k&Omega; (+0.2%)</td>
                  <td><strong>46.85 k&Omega; (+0.1%)</strong></td>
                  <td><span class="badge-fresh">Fresh</span></td>
                </tr>
              </tbody>
            </table>

            <ul style="padding-left: 14px; margin-top: 3px; display: flex; flex-direction: column; gap: 3px;">
              <li>
                <strong>Critical Validation:</strong> Ambient Pastry Cake suffered an <strong>80.3% resistance collapse</strong> due to rapid lactic/acetic acid souring in the dairy filling.
              </li>
              <li>
                <strong>Cryogenic Stability:</strong> Freezing (&minus;18&deg;C) effectively inhibited bacterial metabolism, maintaining gas resistance stable (&gt; 41.5 k&Omega;) over 168 hours.
              </li>
              <li>
                <strong>Operational Metric:</strong> Achieved <strong>100% classification fidelity</strong> across 52 trials with non-contact sampling in &lt; 60 seconds at ultra-low BOM cost (&lt; $35).
              </li>
            </ul>
          </div>
        </section>

        <!-- 7. FUTURE ENHANCEMENT -->
        <section class="poster-card" style="flex: 0.95;">
          <div class="card-head">
            <div class="card-num">7</div>
            <div class="card-title">Future Enhancement</div>
          </div>
          <div class="card-content">
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 3px;">
              <li>
                <strong>TinyML Edge Inference:</strong> Deploy quantized 1D-CNN or Random Forest models on ESP32 via Edge Impulse / Bosch BSEC 2.0 for multi-analyte discrimination.
              </li>
              <li>
                <strong>Heterogeneous Sensor Arrays:</strong> Integrate complementary MOS sensors (MQ-135, MQ-3, electrochemical cells) to broaden classification to meat, poultry, and seafood.
              </li>
              <li>
                <strong>Blockchain Supply Chain:</strong> Automate MQTT telemetry uploads with decentralized QR-code cold-chain passports for tamper-proof retail distribution tracking.
              </li>
              <li>
                <strong>Handheld Wand Form-Factor:</strong> Miniaturize the enclosure into a pen-type battery-operated inspection wand with an OLED screen for field safety inspectors.
              </li>
            </ul>
          </div>
        </section>

        <!-- REFERENCES -->
        <section class="poster-card" style="flex: 0.8;">
          <div class="card-head">
            <div class="card-num">&para;</div>
            <div class="card-title">References</div>
          </div>
          <div class="card-content">
            <ol class="ref-list">
              <li>G. Sberveglieri et al., "Nanowire MOS Gas Sensors for Food Quality Control," <em>Sensors</em>, 18(4), p. 1124, 2018.</li>
              <li>K. Arshak et al., "Review of gas sensors in food packaging quality control," <em>IEEE Sensors J.</em>, 4(2), 2020.</li>
              <li>M. Peris & D. Escuder-Gilabert, "Electronic noses & tongues for food safety," <em>Anal. Chim. Acta</em>, 1062, 2021.</li>
              <li>R. Kumar et al., "IoT-enabled bakery freshness monitoring using MOS arrays," <em>Comput. Electron. Agric.</em>, 194, 2022.</li>
              <li>Bosch Sensortec, "BME688 AI Gas Sensor Datasheet," Doc BST-BME688-DS000-01, Reutlingen, Germany, 2023.</li>
              <li>J. W. Gardner & P. N. Bartlett, <em>Electronic Noses: Principles and Applications</em>, Oxford University Press, 2019.</li>
            </ol>
          </div>
        </section>

      </div>

    </main>

    <!-- FOOTER -->
    <footer class="poster-footer">
      <div class="footer-left">
        Department of Information Science & Engineering &bull; A.P.S. College of Engineering, Bengaluru – 560116
      </div>
      <div class="footer-right">
        Affiliated to VTU Belagavi &bull; Approved by AICTE New Delhi &bull; Accredited by NAAC
      </div>
    </footer>

  </div>

  <script>
    function toggleOrientation() {{
      document.body.classList.toggle('portrait-mode');
    }}
  </script>

</body>
</html>
"""

# Save to workspace root
out_path1 = r"c:\Users\choco\OneDrive\Documents\NoseNet\NoseNet_APSCE_OpenDay_Poster.html"
with open(out_path1, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Written: {out_path1} ({len(html_content)} bytes)")

# Save to brain artifact directory
out_path2 = os.path.join(art_dir, "NoseNet_APSCE_OpenDay_Poster.html")
with open(out_path2, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Written: {out_path2} ({len(html_content)} bytes)")
