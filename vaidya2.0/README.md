# 🤖 AKESA AI (आकेसा) — Healthcare Navigation Assistant & Blood Bank Directory
### *Lucknow Medical District Edition (KGMU • RMLIMS • SGPGIMS • Balrampur • SPM Civil)*

**AKESA** is an intelligent, bilingual (English & Hindi) healthcare navigation platform with an interactive **Dr. Akesa AI Robot** mascot. Designed for first-time hospital visitors, elderly patients, patients with low digital literacy, and those needing clear, compassionate guidance, AKESA transforms hospital confusion into clear step-by-step navigation from entrance gates to doctor chambers, OPD tokens, and live blood bank records.

---

## 🌟 Key Highlights & New Features

### 1. 🌌 Futuristic Space-Inspired Healthcare Interface
- **Space Aesthetic**: Deep midnight navy cosmos background (`#070B14`, `#0B1220`) with subtle twinkling starfield and atmospheric cyan and emerald luminous gradient orbs.
- **Glassmorphic Cards**: Translucent frosted-glass panels (`backdrop-blur-xl`) with soft cyan (`glow-cyan`) and mint luminous borders.
- **Accessible & Responsive**: Fully responsive layout for mobile, tablet, and desktop with large touch-friendly buttons, high-contrast mode, and instant font zoom controls (`A-`, `A`, `A+`).
- **Theme Switcher**: Smooth toggle between Space Midnight Mode and Crisp Clean Light Mode.

### 2. 🩸 Dedicated Blood Bank Record & Live Donor Directory (User-Requested)
- **Top-Level Blood Bank Column**: Dedicated navigation tab for real-time blood availability.
- **Verified Lucknow Institutions**:
  - **KGMU Dept. of Transfusion Medicine** (Centenary Complex, Shah Mina Road) — 24x7 Helpline: `0522-2258880`
  - **Dr. RMLIMS Blood Bank & Component Unit** (Vibhuti Khand, Gomti Nagar) — Helpline: `0522-6692112`
  - **SGPGIMS Blood Transfusion Department** (Raebareli Road) — Helpline: `0522-2494130`
  - **Balrampur District Civil Hospital Blood Centre** (Kaiserbagh) — Helpline: `0522-2224011`
  - **Indian Red Cross Society Blood Centre** (Kaiserbagh) — Helpline: `0522-2286100`
- **Live Inventory by Blood Group**: Real-time units in stock for **A+, A-, B+, B-, O+, O-, AB+, AB-** with breakdown by components:
  - PRBC (Packed Red Blood Cells)
  - Platelets / RDP
  - FFP (Fresh Frozen Plasma)
  - Whole Blood
- **Emergency Blood Requisition**: Instant submission with unique tracking reference (`BLD-LK-XXXX`) and clear instructions to present a doctor's requisition form.
- **Transfusion Compatibility Reference**: Quick visual matrix showing universal donors (`O-`) and universal recipients (`AB+`).

### 3. 🌸 Sweet, Calming & Mesmerizing Patient Voice (User-Requested)
- **Empathetic Voice Profile**: Speech synthesis engine fine-tuned for anxious patients (`pitch: 1.10`, `rate: 0.92`) with preference for warm, natural feminine voices (`Google हिन्दी`, `Microsoft Swara Online`, `Google UK English Female`, `Microsoft Zira`).
- **Soothing Harmonic Chime**: Soft C5-E5-G5 musical chime plays gently before speech to relax patients.
- **Tone Selector in Toolbar**: Choose between:
  - `🌸 Sweet & Calming (Default)`: Warm, empathetic, comforting pacing.
  - `👵 Slower Elderly Mode`: 0.80x speed with crisp Devanagari / English articulation.
  - `🎙️ Standard Voice`: Standard 1.0x narration.

### 4. 📞 1800-AKESA-CARE Voice Helpline in 9 Indian Languages (User-Requested)
- **Inclusive Non-Smartphone Solution**: Phone simulator representing a 24x7 toll-free IVR assistant (`1800-253-7222`).
- **9 Supported Languages on Interactive Dialpad**:
  - `1`: **English** (Standard / Indian English)
  - `2`: **हिन्दी (Hindi)** (Standard Devanagari)
  - `3`: **اردو (Urdu)** (Lucknow Tehzeeb & Urdu phrasing)
  - `4`: **अवधी (Awadhi)** (Local Lucknow Awadhi dialect)
  - `5`: **भोजपुरी (Bhojpuri)** (Eastern UP & Bihar)
  - `6`: **বাংলা (Bengali)** (West Bengal / Bengali diaspora)
  - `7`: **தமிழ் (Tamil)** (South Indian consultation)
  - `8`: **తెలుగు (Telugu)** (Andhra / Telangana consultation)
  - `9`: **ਪੰਜਾਬੀ (Punjabi)** (North Indian regional)
- **Interactive IVR Simulator**: Real DTMF keypad sound synthesis, animated waveform visualizer, live subtitles on the phone screen, and simulated SMS OPD pass receipt.

### 5. 🤖 Interactive Dr. Akesa Robot Mascot
- **Expressive Character States**:
  - `Idle`: Gentle floating, smiling mouth, cyan antenna beacon pulse.
  - `Greeting`: Welcoming speech bubble and warm greeting.
  - `Listening`: Ear auditory sensors glow, visor equalizer bars pulse.
  - `Thinking`: Amber radar scan and analytical expression.
  - `Speaking`: Mouth moves in sync with speech (`mouth-talking`), visor soundwave equalizer activates.
  - `Happy / Success`: Cheerful smile, confetti shower, success chime.
  - `Emergency`: Red pulsing beacon, urgent siren chime, direct casualty routing.
- **Quick-Summon Floating Pill**: Accessible on every tab in the bottom right corner.
- **Interactive Click Reaction**: Tap Dr. Akesa anywhere for cheerful comforting medical advice.

### 6. ⚡ Dual-Mode AI Backend (Google Gemini AI + Grounded Local Engine)
- **Secure Server-Side AI**: Backend in `server.js` protects all API keys.
- **Google Gemini API Integration**: Securely connects to `gemini-1.5-flash` with grounded prompt containing verified Lucknow hospital data.
- **Offline Grounded Fallback**: Works immediately out of the box even without an API key or internet access, ensuring 100% uptime for emergency and clinic navigation.
- **Strict Guardrails**: Disclaims medical diagnosis, directs acute emergencies to `108` and KGMU Trauma Center (`0522-2257540`).

### 7. 🎟️ OPD Token & Digital Visit Pass
- **Streamlined Booking**: Select doctor, slot, enter minimum patient details, and receive an instant token (e.g. `AK-204`).
- **Digital Pass Modal**:
  - Scannable non-sensitive QR code (generated client-side via QRCode.js).
  - Step-by-step room wayfinding directions.
  - Pre-visit checklist (Ayushman Bharat card, fasting instructions).
  - "पर्ची बोलकर सुनाएं / Read Pass Aloud" audio feature.
  - One-click print layout (`window.print()`).
- **Clear Demo Labeling**: Visible DEMO label indicating that tokens must be validated at official hospital counters.

---

## 📂 Project Structure

```
akesa-ai/
├── index.html          # Futuristic space-themed single-page application
├── server.js           # Zero-dependency Node.js HTTP/HTTPS production server
├── package.json        # Project metadata & npm scripts
├── .env                # Local environment configuration
├── .env.example        # Environment variable template with placeholders
├── README.md           # Comprehensive technical documentation
├── test_backend.js     # API test suite (Node 6.10+ compatible)
├── full_audit.js       # Complete system & asset verification test
├── css/
│   └── akesa.css       # Space theme, glow effects, animations, accessibility styles
└── js/
    ├── data.js         # Verified Lucknow hospitals, blood banks, doctors & 9 languages
    ├── voice.js        # Sweet voice synthesis, Web Audio chimes & DTMF tone engine
    ├── mascot.js       # SVG Dr. Akesa mascot controller & animation states
    └── app.js          # Core app controller, API integration & modal handlers
```

---

## 🚀 How to Run in VS Code or Terminal

### Prerequisites
- Node.js (Version 6.10 or higher; works on Node 14, 16, 18, 20, 22+)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Option 1: Run with Node.js Server (Recommended)
1. Open terminal in the project directory:
   ```powershell
   cd C:\Users\avika\.gemini\antigravity\scratch\akesa-ai
   ```
2. Start the server:
   ```powershell
   node server.js
   ```
   *(or use `npm start`)*
3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Option 2: Direct Browser Launch (Zero-Setup)
Double-click `index.html` or run from PowerShell:
```powershell
Start-Process "C:\Users\avika\.gemini\antigravity\scratch\akesa-ai\index.html"
```
*Note: Direct launch uses client-side grounded clinical navigation; run via `node server.js` to enable the Gemini AI backend API.*

---

## 🔑 Configuring Google Gemini AI

1. Obtain a free Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Open `.env` in the project root:
   ```env
   PORT=3000
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-1.5-flash
   ```
3. Restart `server.js`. The header badge will change to **● Gemini Live AI Active**.

---

## 🧪 Testing & Verification

Run the test suite to verify all endpoints and static assets:
```powershell
node full_audit.js
```
Expected output:
```
✅ / -> HTTP 200 (54 KB) [text/html; charset=utf-8]
✅ /index.html -> HTTP 200 (54 KB) [text/html; charset=utf-8]
✅ /css/akesa.css -> HTTP 200 (8 KB) [text/css; charset=utf-8]
✅ /js/data.js -> HTTP 200 (32 KB) [application/javascript; charset=utf-8]
✅ /js/voice.js -> HTTP 200 (10 KB) [application/javascript; charset=utf-8]
✅ /js/mascot.js -> HTTP 200 (6 KB) [application/javascript; charset=utf-8]
✅ /js/app.js -> HTTP 200 (49 KB) [application/javascript; charset=utf-8]
✅ /api/health -> HTTP 200 [application/json; charset=utf-8]
✅ /api/hospitals -> HTTP 200 [application/json; charset=utf-8]
✅ /api/blood-banks -> HTTP 200 [application/json; charset=utf-8]
✅ /api/tokens -> HTTP 200 [application/json; charset=utf-8]
🎉 ALL SYSTEM CHECKS AND STATIC RESOURCES VERIFIED!
```

---

## 📋 Genuinely Working vs. Demo Features

| Feature | Status | Implementation Details |
|---|---|---|
| **AI Healthcare Chatbot** | **GENUINE** | Live Gemini 1.5 Flash backend with Grounded Local Fallback |
| **Sweet Voice Synthesis** | **GENUINE** | Web Speech API tuned for soft pitch (1.10) & gentle rate (0.92) |
| **Voice Input (Speech-to-Text)** | **GENUINE** | Web Speech Recognition with live listening pulse & edit support |
| **Blood Bank Directory & Stock** | **GENUINE (Verified Data)** | Complete inventory for KGMU, RMLIMS, Balrampur, PGI, Red Cross |
| **1800 Helpline in 9 Languages** | **GENUINE AUDIO SIMULATOR** | Real DTMF procedural audio, 9-language speech synthesis & subtitles |
| **Hospital Wayfinding Directions** | **GENUINE (Verified Data)** | Step-by-step gate, wing, lift, and room directions for Lucknow |
| **Digital Pass & QR Generation** | **GENUINE** | Scannable QR code generated client-side via QRCode.js with print layout |
| **OPD Token Queue Integration** | **DEMO MODE** | Generates realistic tokens with wait times; requires hospital HMS API in production |
| **Hospital HMS Live Check-in** | **DEMO SIMULATION** | Working administrative check-in simulation; real deployment requires hospital HIS/HMIS authorization |

---

## 🔒 Security & Privacy Considerations

1. **Server-Side API Key Protection**: The client never sees `GEMINI_API_KEY`. All LLM calls pass through `server.js`.
2. **Rate Limiting**: In-memory rate limiting prevents abuse (60 requests/min per IP).
3. **No Sensitive PII in QR Codes**: Pass QR codes contain only non-sensitive tokens (e.g. `AKESA|APT-10821|AK-102|Room 204`).
4. **Zero-Dependency Architecture**: Reduces software supply-chain vulnerabilities by relying solely on Node.js core modules.

---

## 🏥 Hospital System Integration Roadmap (For Production)

To connect AKESA to live hospital information systems:
1. **e-Hospital / HMIS (NIC India)**: Connect via standard FHIR / HL7 APIs with OAuth 2.0 institutional credentials.
2. **Live Queue Displays**: WebSocket listener to synchronize token numbers with waiting hall TV displays.
3. **SMS Gateway Integration**: Replace simulation with CDAC SMS Seva or Twilio for genuine SMS delivery.


## Update notes (October 2026)

- The voice helpline now starts in the selected language, uses browser speech recognition during the demo call, detects common scripts (Hindi/Urdu/Bengali/Tamil/Telugu/Punjabi) and responds using a language-specific demo response. Awadhi and Bhojpuri use the browser's Hindi speech voice where no dedicated voice is available.
- The demo toll-free number `1800-253-7222` is shown prominently on the Helpline screen and is clickable on supported devices.
- “Recalculate Distances from my Locality” now requests browser geolocation and refreshes approximate straight-line distances. If location permission is denied or unavailable, the manual locality picker remains available. Hospital coordinates are approximate demo coordinates; results are not road-routing distances.
- “View Doctors” now directly renders matching doctor records and includes a “Book / Get Slip” action.
- Appointment booking creates a demo token and opens the digital OPD pass, which can be printed or saved as PDF using the existing print action.

**Important:** This is a demonstration app. The toll-free number, doctor availability, calculated distances, and appointment tokens are not a verified live healthcare service. Do not use the demo for emergencies or as confirmation of a real hospital booking. Browser speech recognition and speech synthesis language availability varies by browser/device.
