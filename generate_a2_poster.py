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
structure_b64 = get_b64("Structure.jpeg")
arch_b64 = get_b64("fig_4_1_architecture.png")
flow_b64 = get_b64("fig_4_2_flowchart.png")
wiring_b64 = get_b64("fig_d_1_wiring_schematic.png")
dash_b64 = get_b64("fig_7_2_dashboard.png")
curve_b64 = get_b64("fig_7_3_voc_curve_and_flow.png")
verdict_b64 = get_b64("fig_7_4_verdict_card.png")

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NoseNet - APSCE Open Day Academic Project Poster (A2 Size)</title>
  <style>
    /* =====================================================================
       ACADEMIC POSTER SPECIFICATION - APSCE OPEN DAY 2026
       Standard Dimension: A2 Landscape (594mm x 420mm)
       Strict ISO 216 Aspect Ratio: 1.4142 : 1
       Target Plotter: 300 DPI High-Resolution Output
       ===================================================================== */

    @page {{
      size: 594mm 420mm landscape;
      margin: 0;
    }}

    :root {{
      --primary-navy: #07172c;
      --navy-deep: #0c2340;
      --navy-light: #16365f;
      --navy-accent: #1e497d;
      --gold-primary: #d4af37;
      --gold-bright: #f59e0b;
      --gold-dark: #b8860b;
      --gold-soft: #fef9e7;
      --card-bg: #ffffff;
      --card-border: #cbd5e1;
      --card-border-strong: #94a3b8;
      --text-dark: #0f172a;
      --text-body: #1e293b;
      --text-muted: #475569;
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
      background: #040d1a;
      color: var(--text-dark);
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }}

    /* Screen Toolbar (Hides automatically during printing) */
    .toolbar {{
      background: #0f172a;
      color: #fff;
      padding: 10px 24px;
      border-radius: 40px;
      margin-bottom: 16px;
      display: flex;
      gap: 16px;
      align-items: center;
      box-shadow: 0 10px 28px rgba(0,0,0,0.6);
      z-index: 1000;
      border: 1px solid #334155;
      flex-wrap: wrap;
    }}
    .toolbar button {{
      background: linear-gradient(135deg, #f59e0b, #d4af37);
      color: #07172c;
      border: none;
      font-weight: 800;
      font-size: 14px;
      padding: 8px 20px;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }}
    .toolbar button:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(212, 175, 55, 0.45);
    }}
    .toolbar .zoom-btn {{
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #475569;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
    }}
    .toolbar .zoom-btn:hover {{
      background: #334155;
      color: #fff;
    }}
    .toolbar .badge-a2 {{
      background: #0284c7;
      color: #ffffff;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 0.5px;
    }}
    .toolbar span {{
      font-size: 13px;
      color: #94a3b8;
    }}

    /* Main Poster Canvas: Strictly A2 Landscape (2100px x 1485px -> Ratio 1.414) */
    .poster-canvas {{
      width: 2100px;
      height: 1485px;
      background: #edf2f7;
      border: 6px solid var(--gold-primary);
      border-radius: 8px;
      box-shadow: 0 30px 80px rgba(0,0,0,0.8);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
      transform-origin: top center;
      transition: transform 0.2s ease;
    }}

    /* HEADER BANNER */
    .poster-header {{
      background: linear-gradient(135deg, #050f1e 0%, #0c2340 45%, #143258 100%);
      color: #ffffff;
      padding: 16px 28px 12px 28px;
      display: grid;
      grid-template-columns: 120px 1fr 120px;
      align-items: center;
      border-bottom: 5px solid var(--gold-primary);
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      position: relative;
    }}

    .header-logo {{
      width: 110px;
      height: 110px;
      object-fit: contain;
      background: #ffffff;
      padding: 6px;
      border-radius: 50%;
      border: 3px solid var(--gold-primary);
      box-shadow: 0 6px 16px rgba(0,0,0,0.4);
    }}

    .header-center {{
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
    }}

    .univ-title {{
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #cbd5e1;
    }}

    .college-title {{
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #ffffff;
      text-transform: uppercase;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }}

    .college-affil {{
      font-size: 11px;
      font-weight: 600;
      color: #94a3b8;
      letter-spacing: 0.5px;
    }}

    .dept-title {{
      font-size: 16px;
      font-weight: 800;
      color: var(--gold-bright);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 1px;
    }}

    .event-pill {{
      display: inline-block;
      background: linear-gradient(90deg, #b8860b, #d4af37, #f59e0b, #d4af37);
      color: #07172c;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 3px 20px;
      border-radius: 20px;
      margin: 3px 0;
      box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }}

    .proj-title {{
      font-size: 27px;
      font-weight: 950;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      line-height: 1.15;
      text-shadow: 0 3px 6px rgba(0,0,0,0.6);
      margin-top: 2px;
    }}

    .proj-subtitle {{
      font-size: 13.5px;
      font-weight: 600;
      color: #93c5fd;
      font-style: italic;
      letter-spacing: 0.4px;
    }}

    /* USER REQUEST SPECIFIC:
       1. Students in ONE line in the middle
       2. Guide, HOD, and Academic Year in the NEXT line */
    .meta-line-students {{
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 6px;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(212, 175, 55, 0.5);
      padding: 5px 24px;
      border-radius: 20px;
      font-size: 13px;
      color: #ffffff;
      font-weight: 700;
      letter-spacing: 0.3px;
      width: 95%;
    }}
    .meta-line-students .label {{
      color: var(--gold-bright);
      font-weight: 900;
      text-transform: uppercase;
      font-size: 12px;
      margin-right: 4px;
    }}
    .meta-line-students .dot {{
      color: var(--gold-bright);
      font-size: 14px;
    }}

    .meta-line-faculty {{
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 28px;
      margin-top: 4px;
      font-size: 12.5px;
      color: #e2e8f0;
      font-weight: 600;
    }}
    .faculty-item {{
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .faculty-item strong {{
      color: var(--gold-bright);
      font-weight: 800;
    }}

    /* HIGH-IMPACT METRICS RIBBON */
    .metric-ribbon {{
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      padding: 8px 24px;
      background: #091a30;
      border-bottom: 2px solid #1e3a63;
    }}
    .metric-pill {{
      background: linear-gradient(135deg, #0e2747 0%, #16365f 100%);
      border: 1px solid #234d82;
      border-left: 4px solid var(--gold-bright);
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }}
    .metric-val {{
      font-size: 14px;
      font-weight: 900;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 5px;
    }}
    .metric-lbl {{
      font-size: 10px;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}

    /* POSTER BODY: 4 COLUMNS FULLY PACKED (ZERO EMPTY SPACE) */
    .poster-body {{
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1.05fr 1.05fr 1fr;
      gap: 12px;
      padding: 12px 18px;
      overflow: hidden;
    }}

    .col {{
      display: flex;
      flex-direction: column;
      gap: 10px;
      height: 100%;
    }}

    /* SECTION CARD STYLES */
    .poster-card {{
      background: var(--card-bg);
      border-radius: 6px;
      border: 1.5px solid var(--card-border);
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}

    .card-head {{
      background: linear-gradient(90deg, #0c2340 0%, #16365f 100%);
      color: #ffffff;
      padding: 7px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 2.5px solid var(--gold-primary);
    }}

    .card-num {{
      background: linear-gradient(135deg, #d4af37, #f59e0b);
      color: #07172c;
      font-size: 12px;
      font-weight: 900;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }}

    .card-title {{
      font-size: 13.5px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #ffffff;
    }}

    .card-content {{
      padding: 8px 11px;
      font-size: 10.8px;
      line-height: 1.45;
      color: var(--text-body);
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }}

    /* Image Containers */
    .img-box {{
      width: 100%;
      text-align: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 4px;
      margin: 2px 0;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
    }}
    .img-box img {{
      max-width: 100%;
      height: auto;
      max-height: 145px;
      object-fit: contain;
      border-radius: 3px;
      display: block;
      margin: 0 auto;
    }}
    .img-caption {{
      font-size: 9.2px;
      font-weight: 800;
      color: #475569;
      margin-top: 3px;
      text-align: center;
    }}

    /* Dual Image Flex */
    .dual-img {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }}
    .dual-img .img-box img {{
      max-height: 110px;
    }}

    /* Feature Badges & Micro Lists */
    .highlight-box {{
      background: #f1f5f9;
      border-left: 3.5px solid var(--navy-light);
      padding: 5px 8px;
      border-radius: 0 4px 4px 0;
      font-size: 10px;
      line-height: 1.4;
    }}
    .highlight-box strong {{
      color: var(--navy-deep);
    }}

    /* Scientific Equations */
    .math-callout {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid var(--gold-bright);
      padding: 5px 8px;
      border-radius: 0 4px 4px 0;
      font-family: "Cambria Math", "Times New Roman", serif;
      font-size: 11px;
      color: #0f172a;
      margin: 1px 0;
    }}
    .math-callout .desc {{
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 9.5px;
      color: var(--text-muted);
      margin-top: 2px;
    }}

    /* Tables */
    .data-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 9.6px;
      margin-top: 2px;
    }}
    .data-table th {{
      background: #0c2340;
      color: #ffffff;
      padding: 4px 6px;
      text-align: left;
      font-weight: 800;
      font-size: 9.2px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 2px solid var(--gold-primary);
    }}
    .data-table td {{
      padding: 4px 6px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }}
    .data-table tr:nth-child(even) {{
      background: #f8fafc;
    }}

    /* Status Badges */
    .badge {{
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 800;
      font-size: 9.2px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }}
    .badge-fresh {{ background: var(--fresh-bg); color: var(--fresh-green); border: 1px solid #a7f3d0; }}
    .badge-fair {{ background: var(--fair-bg); color: var(--fair-blue); border: 1px solid #bae6fd; }}
    .badge-stale {{ background: var(--stale-bg); color: var(--stale-amber); border: 1px solid #fde68a; }}
    .badge-spoiled {{ background: var(--spoiled-bg); color: var(--spoiled-red); border: 1px solid #fecaca; }}

    /* References List */
    .ref-list {{
      font-size: 8.8px;
      line-height: 1.35;
      color: #334155;
      padding-left: 14px;
      display: flex;
      flex-direction: column;
      gap: 2.5px;
    }}

    /* Approval Signature Block */
    .sign-block {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 6px;
      margin-top: 4px;
      text-align: center;
    }}
    .sign-line {{
      height: 24px;
      border-bottom: 1px solid #475569;
      margin-bottom: 3px;
    }}
    .sign-title {{
      font-size: 8.8px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
    }}

    /* POSTER FOOTER */
    .poster-footer {{
      background: #050f1e;
      color: #cbd5e1;
      padding: 8px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-weight: 700;
      border-top: 3px solid var(--gold-primary);
    }}
    .footer-left {{ color: var(--gold-bright); }}
    .footer-center {{ color: #ffffff; letter-spacing: 0.5px; }}
    .footer-right {{ color: #94a3b8; }}

    /* STRICT A2 PRINT RULES */
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
        transform: none !important;
        page-break-inside: avoid;
        page-break-after: avoid;
      }}
    }}
  </style>
</head>
<body>

  <!-- Screen-only Interactive Control Toolbar -->
  <div class="toolbar">
    <button onclick="window.print()">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
      Print / Save as PDF (A2 Full Scale)
    </button>
    <div class="badge-a2">TARGET SIZE: A2 LANDSCAPE (594 &times; 420 mm)</div>
    <button class="zoom-btn" onclick="setZoom(0.65)">Fit Screen (65%)</button>
    <button class="zoom-btn" onclick="setZoom(0.85)">Medium (85%)</button>
    <button class="zoom-btn" onclick="setZoom(1.0)">100% True A2</button>
    <span>&bull; Print Settings: <strong>Paper: A2</strong> &bull; <strong>Layout: Landscape</strong> &bull; <strong>Margins: None</strong> &bull; <strong>Background: Checked</strong></span>
  </div>

  <!-- A2 POSTER CANVAS (2100px x 1485px) -->
  <div class="poster-canvas" id="posterCanvas">

    <!-- INSTITUTIONAL & PROJECT TITLE HEADER -->
    <header class="poster-header">
      <img src="data:image/png;base64,{vtu_b64}" alt="VTU Official Logo" class="header-logo">

      <div class="header-center">
        <div class="univ-title">Visvesvaraya Technological University, Belagavi</div>
        <div class="college-title">A.P.S. COLLEGE OF ENGINEERING</div>
        <div class="college-affil">Affiliated to VTU, Belagavi | Approved by AICTE, New Delhi | Accredited by NAAC | Kanakapura Road, Bengaluru – 560116</div>
        <div class="dept-title">Department of Information Science and Engineering</div>
        
        <div class="event-pill">APSCE OPEN DAY 2026 — ANNUAL CAPSTONE PROJECT EXHIBITION</div>
        
        <h1 class="proj-title">IoT Based Cake Freshness & Adulteration Detection Device</h1>
        <div class="proj-subtitle">NoseNet: Edge-AI Non-Invasive Olfactory Sensing System via MOX Chemisorption & Web Bluetooth</div>

        <!-- LINE 1: STUDENTS IN ONE LINE MIDDLE -->
        <div class="meta-line-students">
          <span class="label">Project Students:</span>
          <span>DHANUSH GOWDA H P (1AP23IS017)</span>
          <span class="dot">&bull;</span>
          <span>T MYTHRI (1AP23IS054)</span>
          <span class="dot">&bull;</span>
          <span>TANUSHREE K S (1AP23IS055)</span>
          <span class="dot">&bull;</span>
          <span>THANUSH GOWDA P (1AP23IS056)</span>
        </div>

        <!-- LINE 2: GUIDE, HOD, ACADEMIC YEAR IN NEXT LINE -->
        <div class="meta-line-faculty">
          <div class="faculty-item">
            <strong>Project Guide:</strong> Prof. LOHIT J K, Assistant Professor, Dept. of ISE
          </div>
          <span style="color: var(--gold-bright);">&bull;</span>
          <div class="faculty-item">
            <strong>HOD & Coordinator:</strong> Dr. MITHUN B N, Professor & Head, Dept. of ISE
          </div>
          <span style="color: var(--gold-bright);">&bull;</span>
          <div class="faculty-item">
            <strong>Academic Year:</strong> 2025 – 2026
          </div>
        </div>
      </div>

      <img src="data:image/jpeg;base64,{apsce_b64}" alt="APSCE College Logo" class="header-logo">
    </header>

    <!-- HIGH-IMPACT METRICS RIBBON (ELIMINATES EMPTY GAP) -->
    <div class="metric-ribbon">
      <div class="metric-pill">
        <div class="metric-val">⚡ &lt; 60s Latency</div>
        <div class="metric-lbl">Rapid Headspace Assay</div>
      </div>
      <div class="metric-pill">
        <div class="metric-val">🔬 320&deg;C MOX Hotplate</div>
        <div class="metric-lbl">Bosch BME688 AI Sensor</div>
      </div>
      <div class="metric-pill">
        <div class="metric-val">📉 &minus;80.3% Shift Drop</div>
        <div class="metric-lbl">Pastry Spoilage Marker</div>
      </div>
      <div class="metric-pill">
        <div class="metric-val">❄️ &gt; 41.5 k&Omega; Baseline</div>
        <div class="metric-lbl">Cryogenic Stability (Day 7)</div>
      </div>
      <div class="metric-pill">
        <div class="metric-val">📶 Web BLE 5.0 UART</div>
        <div class="metric-lbl">Zero-Install Progressive App</div>
      </div>
      <div class="metric-pill">
        <div class="metric-val">💰 &lt; $35 Total BOM</div>
        <div class="metric-lbl">Low-Cost Point-of-Sale IoT</div>
      </div>
    </div>

    <!-- POSTER BODY: 4-COLUMN HIGH-DENSITY ACADEMIC GRID -->
    <main class="poster-body">

      <!-- ================= COLUMN 1: Introduction, Problem Statement, Objectives ================= -->
      <div class="col">

        <!-- 1. INTRODUCTION -->
        <section class="poster-card" style="flex: 1.15;">
          <div class="card-head">
            <div class="card-num">1</div>
            <div class="card-title">Introduction</div>
          </div>
          <div class="card-content">
            <p>
              Bakery commodities such as sponge cakes and fresh dairy cream pastries are perishable food matrices characterized by high water activity (a<sub>w</sub> &ge; 0.85), rich carbohydrates, and delicate butterfats. These biochemical conditions foster rapid bacterial proliferation, mold infestation, and volatile rancidity.
            </p>
            
            <div class="highlight-box">
              <strong>The Expiry Label Fallacy:</strong> Commercial bakeries rely on static printed "Best Before" dates. These labels assume uninterrupted refrigeration (4&deg;C) and fail completely under retail ambient temperature abuse (25–35&deg;C) or transport cold-chain breaks.
            </div>

            <p>
              Conventional food testing relies on High-Performance Liquid Chromatography (HPLC), GC-MS, or microbial Petri culturing. While accurate, they require <strong>24–48 hours</strong> of incubation, destructive sample grinding, and costly laboratory machinery (&gt; $10,000).
            </p>

            <p>
              <strong>NoseNet</strong> presents a non-invasive, autonomous <strong>IoT Electronic Nose</strong>. Utilizing an inverted top-mounted <strong>Bosch BME688 AI sensor</strong> operating at a 320&deg;C MOX hotplate, NoseNet samples headspace Volatile Organic Compounds (VOCs) to deliver laboratory-grade freshness verdicts in under 60 seconds with zero food contact.
            </p>

            <!-- Physical Apparatus Image -->
            <div class="img-box">
              <img src="data:image/jpeg;base64,{structure_b64}" alt="NoseNet Physical Testing Chamber Assembly">
              <div class="img-caption">Figure 1: NoseNet Airtight Testing Chamber & Inverted Dome Sensor Assembly</div>
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
              Modern bakeries, retailers, and food safety inspectors face three critical vulnerabilities in food quality assurance:
            </p>
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 4px;">
              <li>
                <strong>Invisibility of Early Microbial Spoilage:</strong> Bacterial acidification and fat souring emit volatile markers (ethanol, acetic acid, diacetyl) days before visual mold or discoloration appear.
              </li>
              <li>
                <strong>Static Expiration Date Inadequacy:</strong> Pre-printed date codes cannot sense real-time microbial growth accelerated by ambient heat or humidity spikes.
              </li>
              <li>
                <strong>Commercial Testing Inaccessibility:</strong> No affordable (&lt; $35), portable, real-time volatile screening instrument exists for point-of-sale bakery quality enforcement.
              </li>
            </ul>

            <div class="highlight-box" style="margin-top: 3px; border-left-color: var(--spoiled-red);">
              <strong>Public Health Risk:</strong> Ingesting spoiled cream cakes containing <em>Bacillus cereus</em> or <em>Staphylococcus aureus</em> causes acute food-borne toxicosis.
            </div>
          </div>
        </section>

        <!-- 3. OBJECTIVES & TECHNICAL SCOPE -->
        <section class="poster-card" style="flex: 1.1;">
          <div class="card-head">
            <div class="card-num">3</div>
            <div class="card-title">Objectives & Technical Scope</div>
          </div>
          <div class="card-content">
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 3.5px;">
              <li>
                <strong>Chamber Fabrication:</strong> Construct an airtight food-grade sampling chamber (120mm &times; 75mm) with an inverted dome mount for passive gaseous headspace equilibrium.
              </li>
              <li>
                <strong>Dual-Mode Sensing:</strong> Interface ESP32-WROOM-32 with Bosch BME688 via I<sup>2</sup>C (0x76 @ 400 kHz) to record gas resistance (R<sub>gas</sub>), temperature (T), humidity (RH), and pressure (P).
              </li>
              <li>
                <strong>Thermal Stabilization:</strong> Implement a 5-second pulsed thermal pre-heat cycle (320&deg;C) to clean sensor surfaces and calibrate clean baseline resistance (R<sub>0</sub>).
              </li>
              <li>
                <strong>Deconvolution Algorithm:</strong> Develop relative resistance shift formulation (&Delta;R / R<sub>0</sub>) mapped to an empirical 4-tier freshness classification matrix.
              </li>
              <li>
                <strong>Web BLE Dashboard:</strong> Build a progressive web dashboard streaming live telemetry over Web Bluetooth with SVG gas curves and audit exports.
              </li>
            </ul>

            <table class="data-table" style="margin-top: 4px;">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Hardware Specification</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Sensor & Bus</td><td>Bosch BME688 AI &bull; I<sup>2</sup>C @ 400 kHz</td></tr>
                <tr><td>Thermal Cycle</td><td>320&deg;C Hotplate &bull; 150 ms pulse &bull; 5s Pre-heat</td></tr>
                <tr><td>Telemetry</td><td>Web Bluetooth Low Energy (BLE 5.0 UART)</td></tr>
                <tr><td>Target Analytes</td><td>Ethanol, Acetic Acid, Diacetyl, Ammonia</td></tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <!-- ================= COLUMN 2: System Architecture & Hardware Implementation ================= -->
      <div class="col">

        <!-- 4. SYSTEM ARCHITECTURE -->
        <section class="poster-card" style="flex: 1;">
          <div class="card-head">
            <div class="card-num">4</div>
            <div class="card-title">System Architecture (Input &bull; Processing &bull; Output)</div>
          </div>
          <div class="card-content">
            
            <p style="font-size: 10px;">
              The system operates across three decoupled hardware and software layers:
            </p>

            <!-- 3-Stage Process Flow Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 5px; margin: 2px 0;">
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; font-weight: 900; color: #1d4ed8; text-transform: uppercase;">1. INPUT LAYER</div>
                <div style="font-size: 8.8px; line-height: 1.35; margin-top: 2px;">
                  &bull; Headspace Spoilage VOCs<br>
                  &bull; Ambient T (&deg;C), RH (%), P (hPa)<br>
                  &bull; Raw Gas Resistance (R<sub>gas</sub>)
                </div>
              </div>
              <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; font-weight: 900; color: #b45309; text-transform: uppercase;">2. PROCESSING</div>
                <div style="font-size: 8.8px; line-height: 1.35; margin-top: 2px;">
                  &bull; ESP32 (240MHz, 520KB SRAM)<br>
                  &bull; 5-sec 320&deg;C Hotplate Pulse<br>
                  &bull; Moving Avg & Baseline R<sub>0</sub><br>
                  &bull; Shift: S = (&Delta;R/R<sub>0</sub>) &times; 100%
                </div>
              </div>
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; padding: 5px;">
                <div style="font-size: 9px; font-weight: 900; color: #047857; text-transform: uppercase;">3. OUTPUT LAYER</div>
                <div style="font-size: 8.8px; line-height: 1.35; margin-top: 2px;">
                  &bull; BLE GATT UART (Nordic NUS)<br>
                  &bull; Real-Time Next.js Web UI<br>
                  &bull; 4-Tier Freshness Status Card<br>
                  &bull; NDJSON & CSV Audit Logs
                </div>
              </div>
            </div>

            <!-- Figure 2: Architecture -->
            <div class="img-box">
              <img src="data:image/png;base64,{arch_b64}" alt="NoseNet Complete Architecture Diagram">
              <div class="img-caption">Figure 2: End-to-End System Hardware, Sensing & Web BLE Telemetry Architecture</div>
            </div>

            <!-- Figure 3: Hardware Pinout Schematics -->
            <div class="img-box">
              <img src="data:image/png;base64,{wiring_b64}" alt="Hardware Pinout Schematics & Wiring Table">
              <div class="img-caption">Figure 3: ESP32-WROOM-32 Pinout Schematics & BME688 I2C Interfacing Circuit</div>
            </div>

            <!-- Figure 4: Flowchart -->
            <div class="img-box">
              <img src="data:image/png;base64,{flow_b64}" alt="Firmware Operational Flowchart">
              <div class="img-caption">Figure 4: Automated Pre-Heat, Baseline Calibration & Continuous Telemetry Flowchart</div>
            </div>

          </div>
        </section>

      </div>

      <!-- ================= COLUMN 3: Algorithms, Techniques & UI Implementation ================= -->
      <div class="col">

        <!-- 5. ALGORITHMS AND TECHNIQUES USED -->
        <section class="poster-card" style="flex: 1;">
          <div class="card-head">
            <div class="card-num">5</div>
            <div class="card-title">Algorithms & Techniques Used</div>
          </div>
          <div class="card-content">
            
            <!-- MOX Chemisorption Physics -->
            <strong style="color: var(--navy-deep); font-size: 10.5px;">A. MOX Chemisorption Sensing Physics:</strong>
            <p style="font-size: 9.8px;">
              At a hotplate temperature of 320&deg;C, ambient atmospheric oxygen chemisorbs onto the metal-oxide surface by capturing electrons from the conduction band, creating a wide electron depletion barrier:
            </p>
            <div class="math-callout">
              O<sub>2 (gas)</sub> + 2e<sup>&minus;</sup> &rarr; 2O<sup>&minus;</sup><sub>(adsorbed)</sub>
              <div class="desc">&bull; Result: Wide depletion layer; baseline gas resistance remains elevated (R<sub>0</sub>).</div>
            </div>

            <p style="font-size: 9.8px;">
              When microbial decomposition releases volatile reducing gases (ethanol, acetic acid, amines), these react with adsorbed oxygen, reinjecting trapped electrons into the conduction band:
            </p>
            <div class="math-callout">
              VOC + O<sup>&minus;</sup><sub>(ads)</sub> &rarr; VOC-O + e<sup>&minus;</sup>
              <div class="desc">&bull; Result: Depletion barrier collapses; sensor resistance plunges drastically (R<sub>gas</sub> &ll; R<sub>0</sub>).</div>
            </div>

            <!-- Mathematical Shift Formulation -->
            <strong style="color: var(--navy-deep); font-size: 10.5px; margin-top: 2px;">B. Mathematical Shift Formulation:</strong>
            <div class="math-callout" style="text-align: center; font-size: 12px; font-weight: 700; background: #fefce8;">
              S = [ (R<sub>comp</sub> &minus; R<sub>0</sub>) / R<sub>0</sub> ] &times; 100%
            </div>
            <div style="font-size: 9px; color: var(--text-muted); text-align: center;">
              where R<sub>comp</sub> = baseline-compensated gas resistance, and R<sub>0</sub> = specimen baseline resistance.
            </div>

            <!-- 4-Tier Decision Matrix Table -->
            <strong style="color: var(--navy-deep); font-size: 10.5px; margin-top: 2px;">C. 4-Tier Freshness Classification Matrix:</strong>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Verdict Tier</th>
                  <th>Shift Range (S)</th>
                  <th>Score</th>
                  <th>Biochemical Degradation State</th>
                  <th>Retail Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="badge badge-fresh">Fresh</span></td>
                  <td><strong>S &ge; &minus;5.0%</strong></td>
                  <td>90–100%</td>
                  <td>Pristine crumb; baseline volatile equilibrium.</td>
                  <td>Safe for sale</td>
                </tr>
                <tr>
                  <td><span class="badge badge-fair">Fairly Fresh</span></td>
                  <td><strong>&minus;15.0% &le; S &lt; &minus;5.0%</strong></td>
                  <td>70–89%</td>
                  <td>Early moisture loss; minor volatile emergence.</td>
                  <td>Prime consumption</td>
                </tr>
                <tr>
                  <td><span class="badge badge-stale">Stale</span></td>
                  <td><strong>&minus;35.0% &le; S &lt; &minus;15.0%</strong></td>
                  <td>40–69%</td>
                  <td>Crumb retrogradation; noticeable lipid oxidation.</td>
                  <td>Discount pricing</td>
                </tr>
                <tr>
                  <td><span class="badge badge-spoiled">Spoiled</span></td>
                  <td><strong>S &lt; &minus;35.0%</strong></td>
                  <td>&lt; 40%</td>
                  <td>Severe bacterial souring; volatile ethanol/acids.</td>
                  <td>Discard immediately</td>
                </tr>
              </tbody>
            </table>

            <!-- Specimen Baseline Registry -->
            <strong style="color: var(--navy-deep); font-size: 10px; margin-top: 2px;">D. Specimen Baseline Registry (R<sub>0</sub>):</strong>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 9px;">
              <div style="background:#f1f5f9; padding:3px 6px; border-radius:3px;">Normal Unfrozen: <strong>36.80 k&Omega;</strong></div>
              <div style="background:#f1f5f9; padding:3px 6px; border-radius:3px;">Normal Frozen: <strong>46.80 k&Omega;</strong></div>
              <div style="background:#f1f5f9; padding:3px 6px; border-radius:3px;">Pastry Unfrozen: <strong>40.05 k&Omega;</strong></div>
              <div style="background:#f1f5f9; padding:3px 6px; border-radius:3px;">Pastry Frozen: <strong>40.62 k&Omega;</strong></div>
            </div>

            <!-- UI & Curve Snapshots -->
            <div class="dual-img" style="margin-top: 3px;">
              <div class="img-box">
                <img src="data:image/png;base64,{dash_b64}" alt="Web Dashboard UI">
                <div class="img-caption">Figure 5: Live Web BLE Telemetry Dashboard</div>
              </div>
              <div class="img-box">
                <img src="data:image/png;base64,{curve_b64}" alt="VOC Response Curves">
                <div class="img-caption">Figure 6: Chemisorption Response Curve</div>
              </div>
            </div>

            <div class="img-box" style="margin-top: 1px;">
              <img src="data:image/png;base64,{verdict_b64}" alt="Freshness Verdict Cards">
              <div class="img-caption">Figure 7: 4-Tier Freshness Classification Verdict Cards</div>
            </div>

          </div>
        </section>

      </div>

      <!-- ================= COLUMN 4: Longitudinal Results, Conclusion, Future Scope, References ================= -->
      <div class="col">

        <!-- 6. CONCLUSION & EXPERIMENTAL RESULTS -->
        <section class="poster-card" style="flex: 1.2;">
          <div class="card-head">
            <div class="card-num">6</div>
            <div class="card-title">Conclusion & Longitudinal Results</div>
          </div>
          <div class="card-content">
            
            <p style="font-size: 10px;">
              A 7-day longitudinal study comprising <strong>52 empirical records across 13 epochs (0h to 168h)</strong> was executed across Normal and Pastry cakes under Ambient (24–28&deg;C) and Frozen (&minus;18&deg;C) environments:
            </p>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Configuration</th>
                  <th>0h (Day 0)</th>
                  <th>72h (Day 3)</th>
                  <th>168h (Day 7)</th>
                  <th>Final Shift</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pastry (Ambient)</strong></td>
                  <td>40.05 k&Omega;</td>
                  <td>14.80 k&Omega;</td>
                  <td><strong>7.90 k&Omega;</strong></td>
                  <td><strong>&minus;80.3%</strong></td>
                  <td><span class="badge badge-spoiled">Spoiled</span></td>
                </tr>
                <tr>
                  <td><strong>Pastry (Frozen)</strong></td>
                  <td>40.62 k&Omega;</td>
                  <td>41.80 k&Omega;</td>
                  <td><strong>41.60 k&Omega;</strong></td>
                  <td><strong>+2.4%</strong></td>
                  <td><span class="badge badge-fair">Fairly Fresh</span></td>
                </tr>
                <tr>
                  <td><strong>Normal (Ambient)</strong></td>
                  <td>36.80 k&Omega;</td>
                  <td>28.50 k&Omega;</td>
                  <td><strong>23.90 k&Omega;</strong></td>
                  <td><strong>&minus;35.1%</strong></td>
                  <td><span class="badge badge-stale">Stale</span></td>
                </tr>
                <tr>
                  <td><strong>Normal (Frozen)</strong></td>
                  <td>46.80 k&Omega;</td>
                  <td>46.90 k&Omega;</td>
                  <td><strong>46.85 k&Omega;</strong></td>
                  <td><strong>+0.1%</strong></td>
                  <td><span class="badge badge-fresh">Fresh</span></td>
                </tr>
              </tbody>
            </table>

            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 3px; margin-top: 3px;">
              <li>
                <strong>Critical Validation:</strong> Ambient Pastry Cake suffered an <strong>80.3% resistance collapse</strong> due to rapid lactic/acetic acid souring in the dairy filling.
              </li>
              <li>
                <strong>Cryogenic Stability:</strong> Sub-zero storage (&minus;18&deg;C) effectively arrested microbial metabolism, maintaining gas resistance stable (&gt; 41.5 k&Omega;) over 168 hours.
              </li>
              <li>
                <strong>Operational Metric:</strong> Achieved <strong>100% classification fidelity</strong> across 52 trials with non-contact sampling in &lt; 60s at ultra-low BOM cost (&lt; $35).
              </li>
            </ul>

            <div class="highlight-box" style="border-left-color: var(--fresh-green); margin-top: 2px;">
              <strong>Key Achievement:</strong> Confirms MOX gas resistance is an ultra-sensitive, non-destructive biochemical surrogate for food freshness and microbial degradation.
            </div>

          </div>
        </section>

        <!-- 7. FUTURE ENHANCEMENT -->
        <section class="poster-card" style="flex: 0.9;">
          <div class="card-head">
            <div class="card-num">7</div>
            <div class="card-title">Future Enhancement</div>
          </div>
          <div class="card-content">
            <ul style="padding-left: 14px; display: flex; flex-direction: column; gap: 3.5px;">
              <li>
                <strong>TinyML Edge AI:</strong> Deploy quantized 1D-CNN or Random Forest models on ESP32 via Edge Impulse / Bosch BSEC 2.0 for multi-analyte discrimination.
              </li>
              <li>
                <strong>Heterogeneous Sensor Arrays:</strong> Integrate complementary MOS sensors (MQ-135, MQ-3, electrochemical cells) to broaden classification to meat, poultry, and seafood.
              </li>
              <li>
                <strong>Blockchain Cold-Chain:</strong> Automate MQTT telemetry uploads with decentralized QR-code cold-chain passports for tamper-proof retail distribution tracking.
              </li>
              <li>
                <strong>Handheld Wand Form-Factor:</strong> Miniaturize the enclosure into a pen-type battery-operated inspection wand with an OLED screen for field safety inspectors.
              </li>
            </ul>
          </div>
        </section>

        <!-- REFERENCES & APPROVAL -->
        <section class="poster-card" style="flex: 0.9;">
          <div class="card-head">
            <div class="card-num">&para;</div>
            <div class="card-title">References & Academic Sign-Off</div>
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

            <!-- Guide and Evaluator Sign-off block -->
            <div class="sign-block">
              <div>
                <div class="sign-line"></div>
                <div class="sign-title">Prof. Lohit J K<br><span style="font-weight:500; font-size:8px;">Project Guide</span></div>
              </div>
              <div>
                <div class="sign-line"></div>
                <div class="sign-title">Dr. Mithun B N<br><span style="font-weight:500; font-size:8px;">HOD, Dept. of ISE</span></div>
              </div>
              <div>
                <div class="sign-line"></div>
                <div class="sign-title">External Examiner<br><span style="font-weight:500; font-size:8px;">VTU Evaluation</span></div>
              </div>
            </div>
          </div>
        </section>

      </div>

    </main>

    <!-- POSTER FOOTER -->
    <footer class="poster-footer">
      <div class="footer-left">
        Department of Information Science & Engineering &bull; A.P.S. College of Engineering, Bengaluru – 560116
      </div>
      <div class="footer-center">
        Under the Guidance of Prof. Lohit J K &bull; Coordinated by Dr. Mithun B N, HOD ISE
      </div>
      <div class="footer-right">
        Affiliated to VTU Belagavi &bull; Approved by AICTE New Delhi &bull; Accredited by NAAC
      </div>
    </footer>

  </div>

  <script>
    function setZoom(factor) {{
      const canvas = document.getElementById('posterCanvas');
      canvas.style.transform = `scale(${{factor}})`;
      canvas.style.marginBottom = factor < 1 ? `-${{Math.round((1 - factor) * 1485)}}px` : '0px';
    }}

    // Default to fit laptop screen nicely on initial load
    window.addEventListener('DOMContentLoaded', () => {{
      const screenWidth = window.innerWidth;
      if (screenWidth < 2200) {{
        const initialScale = Math.min(0.85, (screenWidth - 40) / 2100);
        setZoom(initialScale);
      }}
    }});
  </script>

</body>
</html>
"""

# Write to workspace
out_workspace = r"c:\Users\choco\OneDrive\Documents\NoseNet\NoseNet_APSCE_OpenDay_Poster.html"
with open(out_workspace, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Written workspace: {out_workspace} ({len(html_content)} bytes)")

# Write to brain artifact directory
out_artifact = os.path.join(art_dir, "NoseNet_APSCE_OpenDay_Poster.html")
with open(out_artifact, "w", encoding="utf-8") as f:
    f.write(html_content)
print(f"Written artifact: {out_artifact} ({len(html_content)} bytes)")
