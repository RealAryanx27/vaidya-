# 🤖 AKESA — AI Healthcare Navigation Assistant & Blood Bank Portal (Lucknow Edition)

AKESA is an intelligent, space-inspired, bilingual/multilingual AI healthcare platform designed to move hospital visitors from confusion at the entrance to clear, step-by-step guidance for hospital departments, doctors, exact OPD room numbers, digital QR passes, and real-time blood bank records.

---

## 🌟 Primary Features

1. **Space-Inspired Futuristic Midnight Interface**:
   - Deep cosmic background gradients (`#030712`, `#0B1120`, `#0F172A`), glassmorphic cards, luminous cyan accents, high-contrast mode, and text scaling (`A-`, `A`, `A+`) for elderly patients.

2. **Sweet, Reassuring & Mesmerizing Voice AI**:
   - Web Speech API tuned with warm female voice selection, soft pitch (`1.25`), gentle reading speed (`0.88`), and interactive mascot mouth animations.
   - Read-aloud buttons on every chat response, doctor card, and digital pass.

3. **5-Language 1800-AKESA-CARE Helpline**:
   - Interactive IVR telephone simulator supporting **English, Hindi, Bhojpuri (भोजपुरी), Awadhi (अवधी), and Urdu (اردو)**.

4. **Lucknow Blood Bank Availability Matrix**:
   - Live searchable blood bank records across **KGMU, Balrampur Civil, RMLIMS, SGPGIMS, and Hazratganj Civil Hospital**.
   - Filters for **A+, A-, B+, B-, O+, O-, AB+, AB-** with direct emergency helpline access.

5. **Secure Google Gemini AI Backend**:
   - `server.js` with `POST /api/chat` proxying user queries securely to Google Gemini AI API (`GEMINI_API_KEY`) with grounded Lucknow healthcare context and offline smart fallback.

6. **Digital Visit Pass & QR Verification**:
   - Instant token pass generation with scannable QR codes, step-by-step room routing accordions, and reception check-in terminal.

---

## 🚀 How to Run in VS Code

### Step 1: Clone or Open Project
Open the project folder in VS Code:
```bash
cd akesa-health
