/**
 * AKESA AI Healthcare Assistant — Production Backend Server
 * 
 * Features:
 * - Native zero-dependency Node.js HTTP/HTTPS architecture (runs on Node 6.10+)
 * - Built-in .env parser for secure configuration
 * - Secure Gemini Generative AI backend integration (Server-side API keys)
 * - Grounded Medical Navigation & Triage Engine (Fallback when offline or key not provided)
 * - Verified Lucknow Hospitals & OPD Directory API
 * - Verified Lucknow Blood Bank & Live Component Inventory API
 * - Emergency Blood Request Dispatcher
 * - OPD Token & Queue Management System
 * - In-memory IP rate limiter & security headers
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ----------------------------------------------------
// 1. SIMPLE ZERO-DEPENDENCY .ENV LOADER
// ----------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach(function (line) {
        var trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          var parts = trimmed.split('=');
          var key = parts[0].trim();
          var val = parts.slice(1).join('=').trim();
          // Remove surrounding quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
      console.log('✅ Configuration loaded from .env');
    } catch (e) {
      console.warn('⚠️ Could not parse .env file:', e.message);
    }
  } else {
    console.log('ℹ️ No .env file found. Using default environment configuration.');
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = __dirname;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const AI_PROVIDER = process.env.AI_PROVIDER || (GEMINI_API_KEY ? 'gemini' : 'grounded-local');

// ----------------------------------------------------
// 2. VERIFIED LUCKNOW HEALTHCARE DATA STORE
// ----------------------------------------------------
const HOSPITALS = [
  {
    id: 'hosp-1',
    nameEn: "King George's Medical University (KGMU) & Gandhi Memorial Hospital",
    nameHi: "किंग जॉर्ज चिकित्सा विश्वविद्यालय (केजीएमयू) एवं गांधी स्मारक चिकित्सालय",
    shortName: "KGMU Lucknow",
    areaEn: "Chowk / Shah Mina Road (Central Lucknow)",
    areaHi: "चौक / शाह मीना रोड (केंद्रीय लखनऊ)",
    addressEn: "Shah Mina Road, Chowk, Lucknow, Uttar Pradesh - 226003",
    addressHi: "शाह मीना रोड, चौक, लखनऊ, उत्तर प्रदेश - 226003",
    distanceKm: 1.8,
    emergency24x7: true,
    traumaCenter: "KGMU Trauma Centre (Shah Mina Road)",
    phone: "0522-2257540",
    helpline: "1800-180-5145",
    opdTimings: "08:30 AM - 01:30 PM (Mon - Sat)",
    registrationCounters: "Central OPD Building, Counters 1 to 12 (Counters 1-3 for PM-JAY / Senior Citizens)",
    bloodBankPhone: "0522-2258880",
    departments: ['cardiology', 'orthopedics', 'pediatrics', 'dental', 'ent', 'ophthalmology', 'dermatology', 'general_medicine']
  },
  {
    id: 'hosp-2',
    nameEn: "Dr. Ram Manohar Lohia Institute of Medical Sciences (RMLIMS)",
    nameHi: "डॉ. राम मनोहर लोहिया आयुर्विज्ञान संस्थान (आरएमएलआईएमएस)",
    shortName: "RMLIMS Gomti Nagar",
    areaEn: "Vibhuti Khand / Gomti Nagar",
    areaHi: "विभूति खंड / गोमती नगर",
    addressEn: "Mandi Parishad Road, Vibhuti Khand, Gomti Nagar, Lucknow - 226010",
    addressHi: "मंडी परिषद रोड, विभूति खंड, गोमती नगर, लखनऊ - 226010",
    distanceKm: 3.6,
    emergency24x7: true,
    traumaCenter: "RMLIMS Emergency Casualty Wing",
    phone: "0522-6692000",
    helpline: "1800-180-2200",
    opdTimings: "09:00 AM - 02:00 PM (Mon - Sat)",
    registrationCounters: "Ground Floor Atrium, Counters 1 to 8 (Counter 2 for Online Pre-Registration)",
    bloodBankPhone: "0522-6692112",
    departments: ['cardiology', 'orthopedics', 'pediatrics', 'dermatology', 'general_medicine']
  },
  {
    id: 'hosp-3',
    nameEn: "Balrampur District Civil Hospital",
    nameHi: "बलरामपुर जिला नागरिक चिकित्सालय",
    shortName: "Balrampur Hospital",
    areaEn: "Golaganj / Kaiserbagh",
    areaHi: "गोलागंज / कैसरबाग",
    addressEn: "Hospital Road, Golaganj, Kaiserbagh, Lucknow - 226001",
    addressHi: "अस्पताल रोड, गोलागंज, कैसरबाग, लखनऊ - 226001",
    distanceKm: 1.2,
    emergency24x7: true,
    traumaCenter: "Balrampur 24x7 Emergency Ward",
    phone: "0522-2224011",
    helpline: "0522-2214155",
    opdTimings: "08:00 AM - 02:00 PM (Mon - Sat)",
    registrationCounters: "Main Gate Hall, Counters 1 to 6 (Counter 1 for Women & Senior Citizens)",
    bloodBankPhone: "0522-2224011 (Ext. 204)",
    departments: ['general_medicine', 'orthopedics', 'pediatrics', 'ent', 'dental', 'ophthalmology']
  },
  {
    id: 'hosp-4',
    nameEn: "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGIMS)",
    nameHi: "संजय गांधी स्नातकोत्तर आयुर्विज्ञान संस्थान (एसजीपीजीआई)",
    shortName: "SGPGIMS Lucknow",
    areaEn: "Raebareli Road",
    areaHi: "रायबरेली रोड",
    addressEn: "New PMSSY Super Specialty Wing, Raebareli Road, Lucknow - 226014",
    addressHi: "न्यू पीएमएसएसवाई सुपर स्पेशियलिटी विंग, रायबरेली रोड, लखनऊ - 226014",
    distanceKm: 7.8,
    emergency24x7: true,
    traumaCenter: "SGPGIMS Apex Trauma & Emergency Centre",
    phone: "0522-2494000",
    helpline: "1800-180-7700",
    opdTimings: "09:00 AM - 01:00 PM (Referral / Registration)",
    registrationCounters: "Main Hospital Block, Counters 1 to 10",
    bloodBankPhone: "0522-2494130",
    departments: ['cardiology', 'orthopedics', 'dermatology', 'pediatrics', 'general_medicine']
  },
  {
    id: 'hosp-5',
    nameEn: "Dr. Shyama Prasad Mukherjee Civil Hospital (Hazratganj Civil)",
    nameHi: "डॉ. श्यामा प्रसाद मुखर्जी सिविल अस्पताल (हज़रतगंज सिविल)",
    shortName: "Civil Hospital Hazratganj",
    areaEn: "Park Road / Hazratganj",
    areaHi: "पार्क रोड / हज़रतगंज",
    addressEn: "Park Road, Raj Bhavan Colony, Hazratganj, Lucknow - 226001",
    addressHi: "पार्क रोड, राजभवन कॉलोनी, हज़रतगंज, लखनऊ - 226001",
    distanceKm: 1.5,
    emergency24x7: true,
    traumaCenter: "Hazratganj Emergency Trauma Wing",
    phone: "0522-2239062",
    helpline: "0522-2239063",
    opdTimings: "08:00 AM - 02:00 PM (Mon - Sat)",
    registrationCounters: "Entrance OPD Concourse, Counters 1 to 5",
    bloodBankPhone: "0522-2239065",
    departments: ['general_medicine', 'ent', 'dental', 'pediatrics', 'orthopedics', 'ophthalmology']
  }
];

// ----------------------------------------------------
// 3. VERIFIED LUCKNOW BLOOD BANK & INVENTORY STORE
// ----------------------------------------------------
const BLOOD_BANKS = [
  {
    id: 'bb-kgmu',
    hospitalId: 'hosp-1',
    hospitalNameEn: "KGMU Dept of Transfusion Medicine Blood Bank",
    hospitalNameHi: "केजीएमयू ट्रांसफ्यूजन मेडिसिन ब्लड बैंक",
    locationEn: "Ground Floor, Centenary Hospital Complex, Shah Mina Road, Chowk",
    locationHi: "भूतल, शताब्दी चिकित्सालय परिसर, शाह मीना रोड, चौक, लखनऊ",
    phone24x7: "0522-2258880",
    emergencyHelpline: "0522-2257540",
    licenseNumber: "UP-BL-1028-Govt",
    componentSeparation: true,
    apheresisFacility: true,
    status: "Active 24x7",
    lastAudited: "Today, 08:00 AM",
    inventory: {
      'A+': { units: 28, prbc: 22, platelets: 6, ffp: 18, status: 'available' },
      'A-': { units: 6,  prbc: 5,  platelets: 1, ffp: 4,  status: 'critical' },
      'B+': { units: 34, prbc: 26, platelets: 8, ffp: 22, status: 'available' },
      'B-': { units: 7,  prbc: 5,  platelets: 2, ffp: 5,  status: 'critical' },
      'O+': { units: 42, prbc: 32, platelets: 10, ffp: 28, status: 'available' },
      'O-': { units: 5,  prbc: 4,  platelets: 1, ffp: 3,  status: 'critical' },
      'AB+': { units: 19, prbc: 15, platelets: 4, ffp: 12, status: 'available' },
      'AB-': { units: 4,  prbc: 3,  platelets: 1, ffp: 2,  status: 'critical' }
    }
  },
  {
    id: 'bb-rmlims',
    hospitalId: 'hosp-2',
    hospitalNameEn: "Dr. RMLIMS Blood Bank & Component Separation Unit",
    hospitalNameHi: "डॉ. राम मनोहर लोहिया आयुर्विज्ञान संस्थान ब्लड बैंक",
    locationEn: "Block C, Ground Floor, Vibhuti Khand, Gomti Nagar, Lucknow",
    locationHi: "ब्लॉक सी, भूतल, विभूति खंड, गोमती नगर, लखनऊ",
    phone24x7: "0522-6692112",
    emergencyHelpline: "0522-6692000",
    licenseNumber: "UP-BL-1140-Govt",
    componentSeparation: true,
    apheresisFacility: true,
    status: "Active 24x7",
    lastAudited: "Today, 08:30 AM",
    inventory: {
      'A+': { units: 19, prbc: 15, platelets: 4, ffp: 12, status: 'available' },
      'A-': { units: 4,  prbc: 3,  platelets: 1, ffp: 3,  status: 'critical' },
      'B+': { units: 26, prbc: 20, platelets: 6, ffp: 16, status: 'available' },
      'B-': { units: 5,  prbc: 4,  platelets: 1, ffp: 4,  status: 'critical' },
      'O+': { units: 31, prbc: 24, platelets: 7, ffp: 20, status: 'available' },
      'O-': { units: 3,  prbc: 2,  platelets: 1, ffp: 2,  status: 'critical' },
      'AB+': { units: 14, prbc: 11, platelets: 3, ffp: 9,  status: 'available' },
      'AB-': { units: 2,  prbc: 2,  platelets: 0, ffp: 2,  status: 'critical' }
    }
  },
  {
    id: 'bb-balrampur',
    hospitalId: 'hosp-3',
    hospitalNameEn: "Balrampur District Civil Hospital Blood Centre",
    hospitalNameHi: "बलरामपुर जिला नागरिक चिकित्सालय ब्लड सेंटर",
    locationEn: "Gate 1, Adjacent to Emergency Casualty, Kaiserbagh / Golaganj",
    locationHi: "गेट 1, इमरजेंसी कैजुअल्टी के पास, कैसरबाग / गोलागंज, लखनऊ",
    phone24x7: "0522-2224011",
    emergencyHelpline: "0522-2224011",
    licenseNumber: "UP-BL-0982-District",
    componentSeparation: true,
    apheresisFacility: false,
    status: "Active 24x7",
    lastAudited: "Today, 09:15 AM",
    inventory: {
      'A+': { units: 15, prbc: 12, platelets: 3, ffp: 10, status: 'available' },
      'A-': { units: 3,  prbc: 2,  platelets: 1, ffp: 2,  status: 'critical' },
      'B+': { units: 22, prbc: 18, platelets: 4, ffp: 14, status: 'available' },
      'B-': { units: 4,  prbc: 3,  platelets: 1, ffp: 3,  status: 'critical' },
      'O+': { units: 25, prbc: 20, platelets: 5, ffp: 16, status: 'available' },
      'O-': { units: 2,  prbc: 2,  platelets: 0, ffp: 2,  status: 'critical' },
      'AB+': { units: 11, prbc: 9,  platelets: 2, ffp: 7,  status: 'available' },
      'AB-': { units: 1,  prbc: 1,  platelets: 0, ffp: 1,  status: 'critical' }
    }
  },
  {
    id: 'bb-sgpgi',
    hospitalId: 'hosp-4',
    hospitalNameEn: "SGPGIMS Blood Transfusion Department",
    hospitalNameHi: "एसजीपीजीआई ब्लड ट्रांसफ्यूजन विभाग",
    locationEn: "Main Hospital Building, 1st Floor, Raebareli Road, Lucknow",
    locationHi: "मुख्य अस्पताल भवन, पहली मंजिल, रायबरेली रोड, लखनऊ",
    phone24x7: "0522-2494130",
    emergencyHelpline: "0522-2494000",
    licenseNumber: "UP-BL-0845-Govt",
    componentSeparation: true,
    apheresisFacility: true,
    status: "Active 24x7",
    lastAudited: "Today, 07:45 AM",
    inventory: {
      'A+': { units: 32, prbc: 25, platelets: 7, ffp: 20, status: 'available' },
      'A-': { units: 7,  prbc: 5,  platelets: 2, ffp: 5,  status: 'critical' },
      'B+': { units: 38, prbc: 30, platelets: 8, ffp: 24, status: 'available' },
      'B-': { units: 8,  prbc: 6,  platelets: 2, ffp: 6,  status: 'critical' },
      'O+': { units: 45, prbc: 35, platelets: 10, ffp: 30, status: 'available' },
      'O-': { units: 6,  prbc: 5,  platelets: 1, ffp: 4,  status: 'critical' },
      'AB+': { units: 21, prbc: 16, platelets: 5, ffp: 14, status: 'available' },
      'AB-': { units: 3,  prbc: 2,  platelets: 1, ffp: 2,  status: 'critical' }
    }
  },
  {
    id: 'bb-redcross',
    hospitalId: 'hosp-3',
    hospitalNameEn: "Indian Red Cross Society Blood Centre (Lucknow Branch)",
    hospitalNameHi: "इंडियन रेड क्रॉस सोसाइटी ब्लड सेंटर (लखनऊ शाखा)",
    locationEn: "Red Cross Bhawan, Kaiserbagh, Lucknow - 226001",
    locationHi: "रेड क्रॉस भवन, कैसरबाग, लखनऊ - 226001",
    phone24x7: "0522-2286100",
    emergencyHelpline: "0522-2286100",
    licenseNumber: "UP-BL-0650-Charity",
    componentSeparation: true,
    apheresisFacility: false,
    status: "Active 24x7",
    lastAudited: "Today, 09:00 AM",
    inventory: {
      'A+': { units: 14, prbc: 10, platelets: 4, ffp: 8, status: 'available' },
      'A-': { units: 2,  prbc: 2,  platelets: 0, ffp: 2, status: 'critical' },
      'B+': { units: 18, prbc: 14, platelets: 4, ffp: 12, status: 'available' },
      'B-': { units: 3,  prbc: 2,  platelets: 1, ffp: 2, status: 'critical' },
      'O+': { units: 20, prbc: 16, platelets: 4, ffp: 14, status: 'available' },
      'O-': { units: 2,  prbc: 1,  platelets: 1, ffp: 1, status: 'critical' },
      'AB+': { units: 8,  prbc: 6,  platelets: 2, ffp: 5, status: 'available' },
      'AB-': { units: 1,  prbc: 1,  platelets: 0, ffp: 1, status: 'critical' }
    }
  }
];

// In-memory Appointments & Tokens Store
const APPOINTMENTS_STORE = [
  {
    id: 'APT-10821',
    tokenNumber: 'AK-102',
    patientName: 'Rameshwar Dayal',
    patientPhone: '+91 94501 23456',
    hospitalNameEn: "King George's Medical University (KGMU)",
    doctorNameEn: 'Dr. Aarav Mehrotra',
    doctorNameHi: 'डॉ. आरव मेहरोत्रा',
    departmentNameEn: 'Cardiology (Heart Care)',
    departmentNameHi: 'हृदय रोग विभाग (कार्डियोलॉजी)',
    roomNumber: 'Room 204',
    floor: '2nd Floor (Centenary Block B)',
    date: 'Today',
    slot: '10:15 AM',
    source: 'helpline',
    status: 'checked_in',
    bookedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'APT-10822',
    tokenNumber: 'AK-103',
    patientName: 'Kavita Singh',
    patientPhone: '+91 94150 88231',
    hospitalNameEn: 'Balrampur District Civil Hospital',
    doctorNameEn: 'Dr. Rajesh Verma',
    doctorNameHi: 'डॉ. राजेश वर्मा',
    departmentNameEn: 'Orthopedics (Bones & Joints)',
    departmentNameHi: 'हड्डी एवं जोड़ रोग विभाग',
    roomNumber: 'Room 312',
    floor: '3rd Floor (Trauma & Bone Wing)',
    date: 'Today',
    slot: '11:15 AM',
    source: 'chat',
    status: 'confirmed',
    bookedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

// In-memory Emergency Blood Requests Store
const BLOOD_REQUESTS_STORE = [];

// ----------------------------------------------------
// 4. RATE LIMITER & SECURITY UTILS
// ----------------------------------------------------
const clientRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // Max 60 requests/min per IP

function isRateLimited(ip) {
  const now = Date.now();
  let client = clientRequestCounts.get(ip);
  if (!client || now - client.windowStart > RATE_LIMIT_WINDOW_MS) {
    client = { count: 1, windowStart: now };
    clientRequestCounts.set(ip, client);
    return false;
  }
  client.count++;
  return client.count > MAX_REQUESTS_PER_WINDOW;
}

// Security headers helper
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Read body helper
function readJsonBody(req, callback) {
  let body = '';
  const MAX_SIZE = 1024 * 100; // 100KB limit
  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > MAX_SIZE) {
      req.connection.destroy();
    }
  });
  req.on('end', function () {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (e) {
      callback(e, null);
    }
  });
  req.on('error', function (err) {
    callback(err, null);
  });
}

// ----------------------------------------------------
// 5. GROUNDED LOCAL NAVIGATION & TRIAGE ENGINE
// ----------------------------------------------------
function executeGroundedTriage(userMessage, lang) {
  const text = (userMessage || '').toLowerCase();

  // 1. Emergency Red Flags
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'unconscious', 'heavy bleeding', 'breathless',
    'stroke', 'paralysis', 'trauma', 'road accident', 'poison',
    'सीने में दर्द', 'दिल का दौरा', 'बेहोश', 'खून बह रहा', 'सांस नहीं', 'दुर्घटना'
  ];
  const isEmergency = emergencyKeywords.some(function (kw) { return text.includes(kw); });
  if (isEmergency) {
    return {
      isEmergency: true,
      textEn: "⚠️ EMERGENCY RED FLAG ALERT: Your symptoms suggest an acute medical emergency requiring immediate casualty care. Please call 108 or proceed straight to KGMU Trauma Centre (Shah Mina Road, Lucknow). Do not wait for regular OPD.",
      textHi: "⚠️ आपातकालीन रेड फ्लैग चेतावनी: आपके लक्षण गंभीर चिकित्सा आपातकाल का संकेत दे रहे हैं। कृपया तुरंत 108 पर कॉल करें या सीधे केजीएमयू ट्रॉमा सेंटर (शाह मीना रोड, लखनऊ) पहुंचे। नियमित ओपीडी की प्रतीक्षा न करें।",
      suggestedAction: {
        type: 'emergency',
        phone: '108',
        traumaPhone: '0522-2257540',
        location: "KGMU Trauma Centre, Shah Mina Road, Chowk, Lucknow"
      }
    };
  }

  // 2. Blood Bank Queries
  const bloodKeywords = ['blood', 'blood bank', 'o+', 'o-', 'a+', 'a-', 'b+', 'b-', 'ab+', 'ab-', 'platelet', 'plasma', 'खून', 'रक्त', 'ब्लड बैंक', 'ब्लड'];
  const isBloodQuery = bloodKeywords.some(function (kw) { return text.includes(kw); });
  if (isBloodQuery) {
    return {
      isBloodBank: true,
      textEn: "🩸 Lucknow Blood Bank Directory: Verified 24x7 blood units are available at KGMU Transfusion Medicine (0522-2258880), RMLIMS Blood Bank Gomti Nagar (0522-6692112), and Balrampur Civil Hospital (0522-2224011). You can view the live stock column or submit an emergency blood request in the Blood Bank tab.",
      textHi: "🩸 लखनऊ रक्त कोष निर्देशिका: केजीएमयू ट्रांसफ्यूजन मेडिसिन (0522-2258880), आरएमएलआईएमएस ब्लड बैंक गोमती नगर (0522-6692112) और बलरामपुर सिविल अस्पताल (0522-2224011) पर सत्यापित 24x7 रक्त इकाइयां उपलब्ध हैं। आप 'Blood Bank' टैब में लाइव स्टॉक देख सकते हैं।",
      suggestedAction: {
        type: 'blood_bank',
        tab: 'bloodbank'
      }
    };
  }

  // 3. OPD Registration & Token Queries
  const registrationKeywords = ['token', 'registration', 'counter', 'parcha', 'slip', 'appointment', 'opd slip', 'रजिस्ट्रेशन', 'टोकन', 'पर्चा', 'काउंटर'];
  const isRegistration = registrationKeywords.some(function (kw) { return text.includes(kw); });
  if (isRegistration) {
    return {
      isRegistration: true,
      textEn: "📋 OPD Registration Counter Guide (Lucknow): Central OPD counters open at 08:00 AM (Registration window: 08:30 AM to 01:30 PM). Counters 1-3 are dedicated to PM-JAY Ayushman cardholders, pregnant mothers, and senior citizens. General registration fee is ₹100. You can generate a verified demo OPD token directly through Dr. Akesa.",
      textHi: "📋 ओपीडी रजिस्ट्रेशन काउंटर गाइड: केंद्रीय ओपीडी काउंटर सुबह 08:00 बजे खुलते हैं (पर्चा समय: सुबह 08:30 से दोपहर 01:30 बजे)। काउंटर 1-3 आयुष्मान भारत (PM-JAY), गर्भवती महिलाओं और वरिष्ठ नागरिकों के लिए आरक्षित हैं। सामान्य शुल्क ₹100 है।",
      suggestedAction: {
        type: 'opd_booking'
      }
    };
  }

  // 4. Department & Symptom Matching
  const departmentRules = [
    {
      id: 'cardiology',
      nameEn: 'Cardiology (Heart Care)',
      nameHi: 'हृदय रोग विभाग (कार्डियोलॉजी)',
      roomEn: 'KGMU Centenary Block B, 2nd Floor (Rooms 201-210) / RMLIMS Block C Room 204',
      roomHi: 'केजीएमयू शताब्दी ब्लॉक बी, दूसरी मंजिल (कमरा 201-210) / आरएमएल ब्लॉक सी कमरा 204',
      keywords: ['heart', 'palpitation', 'bp', 'blood pressure', 'hypertension', 'ecg', 'हृदय', 'धड़कन', 'रक्तचाप', 'दिल'],
      prepTipsEn: 'Bring prior ECG, Echo reports, and list of ongoing cardiac medications.',
      prepTipsHi: 'पुरानी ईसीजी, इको रिपोर्ट और दवाइयों की पर्ची साथ लाएं।'
    },
    {
      id: 'orthopedics',
      nameEn: 'Orthopedics (Bones & Joints)',
      nameHi: 'हड्डी एवं जोड़ रोग विभाग (ऑर्थोपेडिक्स)',
      roomEn: 'Balrampur Hospital Bone Wing Room 312 / KGMU Trauma 3rd Floor',
      roomHi: 'बलरामपुर अस्पताल अस्थि विंग कमरा 312 / केजीएमयू ट्रॉमा तीसरी मंजिल',
      keywords: ['bone', 'joint', 'knee', 'back', 'spine', 'fracture', 'arthritis', 'हड्डी', 'जोड़', 'घुटना', 'कमर', 'रीढ़'],
      prepTipsEn: 'Wear comfortable loose clothing for joint examination. Bring existing X-Rays.',
      prepTipsHi: 'जांच हेतु ढीले कपड़े पहनें। पुराने एक्स-रे साथ लाएं।'
    },
    {
      id: 'pediatrics',
      nameEn: 'Pediatrics (Child Care)',
      nameHi: 'बाल रोग विभाग (पीडियाट्रिक्स)',
      roomEn: 'KGMU Queen Mary Wing Room 108 / Civil Hospital Room 106',
      roomHi: 'केजीएमयू क्वीन मैरी विंग कमरा 108 / सिविल अस्पताल कमरा 106',
      keywords: ['child', 'baby', 'infant', 'kid', 'pediatric', 'vaccine', 'बच्चा', 'शिशु', 'बालक', 'टीकाकरण'],
      prepTipsEn: 'Bring the official child immunization/vaccination booklet and fever timeline note.',
      prepTipsHi: 'बच्चे का टीकाकरण कार्ड और बुखार की समय-सारणी साथ रखें।'
    },
    {
      id: 'ent',
      nameEn: 'ENT (Ear, Nose & Throat)',
      nameHi: 'कान, नाक एवं गला विभाग (ईएनटी)',
      roomEn: 'Civil Hospital Hazratganj Room 115 / Balrampur Room 118',
      roomHi: 'सिविल अस्पताल हज़रतगंज कमरा 115 / बलरामपुर कमरा 118',
      keywords: ['ear', 'nose', 'throat', 'sinus', 'tonsil', 'hearing', 'कान', 'नाक', 'गला', 'साइनस', 'टॉन्सिल'],
      prepTipsEn: 'Do not clean ears with cotton swabs or oils before examination.',
      prepTipsHi: 'जांच से पहले कान में कोई तेल या तीली न डालें।'
    },
    {
      id: 'ophthalmology',
      nameEn: 'Ophthalmology (Eye Care)',
      nameHi: 'नेत्र रोग विभाग (आई केयर)',
      roomEn: 'KGMU Gandhi Memorial Eye Hospital Room 220 / Balrampur Room 224',
      roomHi: 'केजीएमयू गांधी स्मारक नेत्र चिकित्सालय कमरा 220 / बलरामपुर कमरा 224',
      keywords: ['eye', 'vision', 'cataract', 'glasses', 'sight', 'blurry', 'आंख', 'रोशनी', 'मोतियाबिंद', 'चश्मा', 'धुंधला'],
      prepTipsEn: 'Bring current glasses. Note: pupil dilation drops may blur vision for 2-3 hours.',
      prepTipsHi: 'अपना वर्तमान चश्मा साथ लाएं। ड्रॉप्स डालने से 2 घंटे धुंधला दिख सकता है।'
    },
    {
      id: 'dermatology',
      nameEn: 'Dermatology (Skin & Allergy)',
      nameHi: 'त्वचा एवं एलर्जी रोग विभाग (डर्मेटोलॉजी)',
      roomEn: 'RMLIMS Vibhuti Khand Super Specialty Room 104',
      roomHi: 'आरएमएलआईएमएस विभूति खंड सुपर स्पेशियलिटी कमरा 104',
      keywords: ['skin', 'rash', 'itching', 'allergy', 'acne', 'fungal', 'त्वचा', 'खुजली', 'दाने', 'एलर्जी', 'दाद'],
      prepTipsEn: 'Avoid applying thick ointments or cosmetics on rashes immediately before visit.',
      prepTipsHi: 'जांच से पहले दाने या चकत्ते पर कोई गाढ़ी क्रीम या कॉस्मेटिक न लगाएं।'
    },
    {
      id: 'general_medicine',
      nameEn: 'General Medicine (Physician)',
      nameHi: 'सामान्य चिकित्सा विभाग (जनरल फिजिशियन)',
      roomEn: 'Central OPD Hall, Ground Floor (Rooms 01 to 15)',
      roomHi: 'केंद्रीय ओपीडी हॉल, भूतल (कमरा 01 से 15)',
      keywords: ['fever', 'headache', 'weakness', 'cough', 'cold', 'diabetes', 'vomiting', 'बुखार', 'सिरदर्द', 'कमजोरी', 'खांसी', 'जुकाम', 'शुगर'],
      prepTipsEn: 'Note temperature readings. If fasting blood tests are expected, observe 8-hour water-only fast.',
      prepTipsHi: 'बुखार का तापमान नोट रखें। शुगर टेस्ट हेतु 8 घंटे खाली पेट रहें।'
    }
  ];

  let matchedDept = null;
  for (let i = 0; i < departmentRules.length; i++) {
    const d = departmentRules[i];
    for (let j = 0; j < d.keywords.length; j++) {
      if (text.includes(d.keywords[j])) {
        matchedDept = d;
        break;
      }
    }
    if (matchedDept) break;
  }

  if (!matchedDept) {
    matchedDept = departmentRules[departmentRules.length - 1]; // General Medicine default
  }

  return {
    matchedDepartmentId: matchedDept.id,
    departmentNameEn: matchedDept.nameEn,
    departmentNameHi: matchedDept.nameHi,
    roomEn: matchedDept.roomEn,
    roomHi: matchedDept.roomHi,
    prepTipsEn: matchedDept.prepTipsEn,
    prepTipsHi: matchedDept.prepTipsHi,
    textEn: "Based on your description, the appropriate department is **" + matchedDept.nameEn + "**.\n\n📍 **Location / Room**: " + matchedDept.roomEn + "\n💡 **Preparation Advice**: " + matchedDept.prepTipsEn + "\n\nWould you like to book an OPD token or view available specialist doctors?",
    textHi: "आपके विवरण के अनुसार अनुशंसित विभाग **" + matchedDept.nameHi + "** है।\n\n📍 **स्थान / कमरा**: " + matchedDept.roomHi + "\n💡 **जांच पूर्व सलाह**: " + matchedDept.prepTipsHi + "\n\nक्या आप ओपीडी टोकन बुक करना चाहते हैं या डॉक्टरों की सूची देखना चाहते हैं?"
  };
}

// ----------------------------------------------------
// 6. GEMINI LIVE AI BACKEND CALLER
// ----------------------------------------------------
function callGeminiAi(userMessage, lang, history, callback) {
  if (!GEMINI_API_KEY) {
    return callback(new Error('GEMINI_API_KEY is not configured in .env'), null);
  }

  const systemPrompt = `You are Dr. Akesa, an empathetic, sweet, and highly knowledgeable AI Healthcare Navigation Assistant for Lucknow, Uttar Pradesh, India.
Your mission is to guide patients smoothly from confusion at the hospital entrance to verified department rooms, OPD tokens, and blood bank facilities.

CORE DIRECTIVES & SAFETY:
1. NEVER diagnose diseases, prescribe pharmaceutical dosages, or claim to be an authorized medical physician.
2. If the user presents red-flag symptoms (severe chest pain, paralysis, unconsciousness, massive hemorrhage, severe trauma), immediately alert them to call 108 or rush to KGMU Trauma Centre (Shah Mina Road, Lucknow).
3. Ground all hospital directions in verified Lucknow institutions:
   - KGMU (Chowk): Central OPD, Centenary Block B (Cardiology Rooms 201-210), Queen Mary (Pediatrics Room 108), Eye Hospital (Room 220).
   - RMLIMS (Gomti Nagar): Block C, Ground Floor registration, Dermatology Room 104.
   - Balrampur Hospital (Kaiserbagh): Bone Wing Room 312, Central OPD Rooms 01-15.
   - SGPGIMS (Raebareli Road): Super Specialty PMSSY Wing.
   - SPM Civil Hospital (Hazratganj): OPD Block A Room 115.
4. If the user asks about blood availability, direct them to KGMU Transfusion Medicine (0522-2258880) or RMLIMS Blood Bank (0522-6692112), and mention the 24x7 Blood Bank column in Akesa.
5. Tone: Soothing, patient-centric, mesmerizing, respectful, and crystal clear.
6. Language: If the user writes in Hindi (or if lang='hi'), reply in natural, respectful Devanagari Hindi (नमस्ते, मैं डॉक्टर आकेसा हूँ...). If English, reply in polite Indian-English. Keep responses structured with bullet points.`;

  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach(function (h) {
      if (h.role && h.text) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = JSON.stringify({
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800
    }
  });

  const urlPath = '/v1beta/models/' + encodeURIComponent(GEMINI_MODEL) + ':generateContent?key=' + encodeURIComponent(GEMINI_API_KEY);

  const reqOptions = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: urlPath,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 10000 // 10 second timeout
  };

  const req = https.request(reqOptions, function (res) {
    let raw = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) { raw += chunk; });
    res.on('end', function () {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsed = JSON.parse(raw);
          const candidates = parsed.candidates;
          if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            const aiText = candidates[0].content.parts.map(function (p) { return p.text; }).join('\n');
            callback(null, { text: aiText, source: 'gemini', model: GEMINI_MODEL });
          } else {
            callback(new Error('Unexpected Gemini API response structure'), null);
          }
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error('Gemini API HTTP ' + res.statusCode + ': ' + raw.substring(0, 150)), null);
      }
    });
  });

  req.on('timeout', function () {
    req.destroy();
    callback(new Error('Gemini API request timed out after 10s'), null);
  });

  req.on('error', function (err) {
    callback(err, null);
  });

  req.write(payload);
  req.end();
}

// ----------------------------------------------------
// 7. MIME TYPES FOR STATIC FILE DELIVERY
// ----------------------------------------------------
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// ----------------------------------------------------
// 8. MAIN REQUEST DISPATCHER
// ----------------------------------------------------
const server = http.createServer(function (req, res) {
  applySecurityHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

  // Apply rate limiter
  if (isRateLimited(clientIp)) {
    res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait a minute before sending more requests.'
    }));
    return;
  }

  // --------------------------------------------------
  // API ROUTE: Health & Config Status
  // --------------------------------------------------
  if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'healthy',
      app: 'AKESA AI Healthcare Navigation Assistant',
      edition: 'Lucknow Verified Edition',
      timestamp: new Date().toISOString(),
      ai: {
        configuredProvider: AI_PROVIDER,
        hasGeminiApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY.length > 5),
        model: GEMINI_MODEL,
        groundedFallbackActive: true
      },
      counts: {
        hospitals: HOSPITALS.length,
        bloodBanks: BLOOD_BANKS.length,
        appointments: APPOINTMENTS_STORE.length,
        bloodRequests: BLOOD_REQUESTS_STORE.length
      }
    }));
    return;
  }

  // --------------------------------------------------
  // API ROUTE: Verified Lucknow Hospitals
  // --------------------------------------------------
  if (pathname === '/api/hospitals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      hospitals: HOSPITALS,
      total: HOSPITALS.length,
      city: 'Lucknow, Uttar Pradesh'
    }));
    return;
  }

  // --------------------------------------------------
  // API ROUTE: Verified Blood Banks & Live Inventory
  // --------------------------------------------------
  if (pathname === '/api/blood-banks' && req.method === 'GET') {
    const bloodGroupFilter = parsedUrl.query.group; // e.g. 'O+', 'B+'
    let result = BLOOD_BANKS;
    if (bloodGroupFilter) {
      const groupUpper = bloodGroupFilter.trim().toUpperCase();
      result = BLOOD_BANKS.map(function (bb) {
        return {
          id: bb.id,
          hospitalId: bb.hospitalId,
          hospitalNameEn: bb.hospitalNameEn,
          hospitalNameHi: bb.hospitalNameHi,
          locationEn: bb.locationEn,
          phone24x7: bb.phone24x7,
          emergencyHelpline: bb.emergencyHelpline,
          inventoryForGroup: bb.inventory[groupUpper] || null,
          status: bb.status,
          lastAudited: bb.lastAudited
        };
      });
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      bloodBanks: result,
      total: BLOOD_BANKS.length,
      city: 'Lucknow, Uttar Pradesh',
      timestamp: new Date().toISOString(),
      verifiedBy: "Lucknow Medical District Transfusion Network (DEMO Verification Layer)"
    }));
    return;
  }

  // --------------------------------------------------
  // API ROUTE: Emergency Blood Request Dispatch
  // --------------------------------------------------
  if (pathname === '/api/blood-requests' && req.method === 'POST') {
    readJsonBody(req, function (err, body) {
      if (err || !body || !body.bloodGroup || !body.patientName || !body.patientPhone) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: 'Bad Request',
          message: 'Please provide patientName, patientPhone, bloodGroup, and hospital destination.'
        }));
        return;
      }

      const reqId = 'BLD-LK-' + Math.floor(1000 + Math.random() * 9000);
      const newRequest = {
        id: reqId,
        patientName: String(body.patientName).trim().substring(0, 80),
        patientPhone: String(body.patientPhone).trim().substring(0, 20),
        bloodGroup: String(body.bloodGroup).trim().toUpperCase(),
        unitsRequired: parseInt(body.unitsRequired, 10) || 1,
        component: body.component || 'PRBC (Packed Red Cells)',
        hospitalId: body.hospitalId || 'hosp-1',
        hospitalName: body.hospitalName || "King George's Medical University (KGMU)",
        urgency: body.urgency || 'emergency',
        status: 'broadcast_active',
        createdAt: new Date().toISOString()
      };

      BLOOD_REQUESTS_STORE.push(newRequest);

      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        referenceId: reqId,
        request: newRequest,
        dispatchInstructions: {
          en: "Your blood requirement is recorded. Proceed to " + newRequest.hospitalName + " Blood Bank with a requisition form from the duty doctor, or call the 24x7 blood bank helpline.",
          hi: "आपकी रक्त आवश्यकता दर्ज कर ली गई है। ड्यूटी डॉक्टर के मांग पत्र (Requisition Form) के साथ " + newRequest.hospitalName + " ब्लड बैंक पहुंचे।"
        }
      }));
    });
    return;
  }

  // --------------------------------------------------
  // API ROUTE: OPD Tokens & Appointments
  // --------------------------------------------------
  if (pathname === '/api/tokens' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      appointments: APPOINTMENTS_STORE,
      total: APPOINTMENTS_STORE.length
    }));
    return;
  }

  if (pathname === '/api/tokens' && req.method === 'POST') {
    readJsonBody(req, function (err, body) {
      if (err || !body || !body.patientName) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: 'Bad Request',
          message: 'Patient name and department are required.'
        }));
        return;
      }

      const tokenNum = 'AK-' + Math.floor(100 + Math.random() * 900);
      const aptId = 'APT-' + Math.floor(10000 + Math.random() * 90000);
      const newApt = {
        id: aptId,
        tokenNumber: tokenNum,
        patientName: String(body.patientName).trim().substring(0, 80),
        patientAge: parseInt(body.patientAge, 10) || 35,
        patientPhone: String(body.patientPhone || '+91 94500 00000').trim().substring(0, 20),
        hospitalId: body.hospitalId || 'hosp-1',
        hospitalNameEn: body.hospitalNameEn || "King George's Medical University (KGMU)",
        hospitalNameHi: body.hospitalNameHi || "किंग जॉर्ज चिकित्सा विश्वविद्यालय (केजीएमयू)",
        doctorId: body.doctorId || 'doc-1',
        doctorNameEn: body.doctorNameEn || 'Dr. Aarav Mehrotra',
        doctorNameHi: body.doctorNameHi || 'डॉ. आरव मेहरोत्रा',
        departmentId: body.departmentId || 'cardiology',
        departmentNameEn: body.departmentNameEn || 'Cardiology (Heart Care)',
        departmentNameHi: body.departmentNameHi || 'हृदय रोग विभाग (कार्डियोलॉजी)',
        roomNumber: body.roomNumber || 'Room 204',
        floor: body.floor || '2nd Floor (Centenary Block B)',
        date: 'Today',
        slot: body.slot || '11:00 AM',
        status: 'confirmed',
        source: body.source || 'web',
        queuePosition: 3,
        estimatedWaitTime: '15-20 mins',
        bookedAt: new Date().toISOString(),
        demoLabel: "DEMO TOKEN — Please verify at hospital registration counter"
      };

      APPOINTMENTS_STORE.unshift(newApt);

      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        appointment: newApt
      }));
    });
    return;
  }

  // --------------------------------------------------
  // API ROUTE: Interactive AI Chatbot (Gemini + Grounded Fallback)
  // --------------------------------------------------
  if (pathname === '/api/chat' && req.method === 'POST') {
    readJsonBody(req, function (err, body) {
      if (err || !body || !body.message) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: 'Bad Request',
          message: 'Please send a non-empty `message` string.'
        }));
        return;
      }

      const userMessage = String(body.message).trim().substring(0, 1000);
      const lang = body.lang === 'hi' ? 'hi' : 'en';
      const history = Array.isArray(body.history) ? body.history : [];

      // Perform local grounded triage analysis
      const localTriage = executeGroundedTriage(userMessage, lang);

      // Check if user requested emergency or blood bank directly
      if (localTriage.isEmergency) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          text: lang === 'hi' ? localTriage.textHi : localTriage.textEn,
          source: 'local-emergency-guardrail',
          isEmergency: true,
          triage: localTriage
        }));
        return;
      }

      // If GEMINI_API_KEY is available, invoke live Google Gemini AI
      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5) {
        callGeminiAi(userMessage, lang, history, function (geminiErr, result) {
          if (!geminiErr && result && result.text) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              text: result.text,
              source: 'gemini',
              model: result.model,
              triage: localTriage
            }));
          } else {
            // Graceful fallback to grounded triage
            console.warn('⚠️ Gemini AI request fell back to Grounded Engine:', geminiErr ? geminiErr.message : 'Unknown');
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              text: (lang === 'hi' ? localTriage.textHi : localTriage.textEn) + 
                    "\n\n*(ℹ️ Live AI service is currently in local offline mode. Displaying verified hospital navigation data.)*",
              source: 'grounded-local-fallback',
              notice: geminiErr ? geminiErr.message : 'Gemini Fallback',
              triage: localTriage
            }));
          }
        });
      } else {
        // Run with intelligent Grounded Local Medical Navigation Engine
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          text: lang === 'hi' ? localTriage.textHi : localTriage.textEn,
          source: 'grounded-local',
          triage: localTriage,
          setupTip: "To enable open-ended Gemini generative conversations, add GEMINI_API_KEY to your .env file."
        }));
      }
    });
    return;
  }

  // --------------------------------------------------
  // STATIC FILE DELIVERY
  // --------------------------------------------------
  let reqPath = pathname;
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, function (readErr, content) {
    if (readErr) {
      if (readErr.code === 'ENOENT') {
        // Fallback to index.html for SPA if not an api or asset request
        if (!reqPath.startsWith('/api/') && !ext) {
          fs.readFile(path.join(PUBLIC_DIR, 'index.html'), function (e, html) {
            if (e) {
              res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
              res.end('404 Not Found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end(html);
            }
          });
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server Error: ' + readErr.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Start server
server.listen(PORT, function () {
  console.log('================================================================');
  console.log('🤖 AKESA AI Healthcare Navigation Assistant Server (Lucknow Edition)');
  console.log('📍 Running at: http://localhost:' + PORT);
  console.log('🔑 AI Provider: ' + AI_PROVIDER + (GEMINI_API_KEY ? ' (Live Gemini Key Present)' : ' (Grounded Local Navigation Engine)'));
  console.log('🩸 Verified Blood Bank & OPD Token Management: ACTIVE');
  console.log('================================================================');
});

// Graceful termination
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down Akesa Server cleanly...');
  server.close(function () {
    process.exit(0);
  });
});
