/**
 * AKESA AI Healthcare Assistant — Core Application Controller
 */

class AkesaApp {
  constructor() {
    this.lang = 'en';
    this.activeTab = 'chat';
    this.activeLocality = 'hazratganj';
    this.selectedHospFilter = 'all';
    this.selectedDeptFilter = 'all';
    this.selectedBloodGroupFilter = 'all';
    this.currentTheme = 'space';
    this.highContrast = false;
    this.currentFontSize = 'base';
    this.chatHistory = [];
    this.lastResponseText = '';
    this.recognition = null;
    this.isListening = false;
    this.selectedDoctorForBooking = null;

    // Helpline Call State
    this.isCallActive = false;
    this.callTimerInterval = null;
    this.callSeconds = 0;
    this.helplineLang = 'en';
    this.userCoordinates = null;

    // Initialize Subsystems
    this.sound = new VoiceAndSoundEngine();
    this.mascot = new RobotMascotController(this.sound);

    // Initialize Datasets from AKESA_DATA
    this.localities = window.AKESA_DATA.localities;
    this.hospitals = JSON.parse(JSON.stringify(window.AKESA_DATA.hospitals));
    this.bloodBanks = JSON.parse(JSON.stringify(window.AKESA_DATA.bloodBanks));
    this.doctors = JSON.parse(JSON.stringify(window.AKESA_DATA.doctors));
    this.departments = JSON.parse(JSON.stringify(window.AKESA_DATA.departments));
    this.helplineLanguages = window.AKESA_DATA.helplineLanguages;
    this.symptomChips = window.AKESA_DATA.symptomChips;
    this.appointments = [
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
        status: 'checked_in'
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
        status: 'confirmed'
      }
    ];

    this.initSpeechRecognition();
  }

  // ----------------------------------------------------
  // INITIALIZATION & EVENT HOOKS
  // ----------------------------------------------------
  init() {
    this.renderSymptomChips();
    this.renderHospitalsList();
    this.renderBloodBanksList();
    this.renderAdminAppointments();
    this.renderLocalityOptions();
    this.renderHelplineKeypad();
    this.checkBackendHealth();
    this.updateLanguageUI();

    // Check system preference for dark/light or contrast
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      // Keep space mode as default futuristic aesthetic, but allow toggle
    }
  }

  checkBackendHealth() {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        const badge = document.getElementById('ai-backend-badge');
        if (badge) {
          if (data.ai && data.ai.hasGeminiApiKey) {
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span><span>Gemini Live AI Active</span>`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30";
          } else {
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-cyan-400"></span><span>Grounded Clinical Engine</span>`;
            badge.className = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30";
          }
        }
      })
      .catch(() => {
        const badge = document.getElementById('ai-backend-badge');
        if (badge) {
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span><span>Local Standalone Mode</span>`;
        }
      });
  }

  // ----------------------------------------------------
  // TAB NAVIGATION
  // ----------------------------------------------------
  switchTab(tabId) {
    this.activeTab = tabId;
    const tabs = ['chat', 'helpline', 'hospitals', 'bloodbank', 'admin'];

    tabs.forEach(t => {
      const panel = document.getElementById(`view-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      const mobBtn = document.getElementById(`mob-tab-${t}`);

      if (panel) {
        if (t === tabId) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      }

      if (btn) {
        if (t === tabId) {
          btn.className = "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/25";
        } else {
          btn.className = "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800/60";
        }
      }

      if (mobBtn) {
        if (t === tabId) {
          mobBtn.className = "flex-1 py-2 text-center text-[10px] font-bold text-cyan-400 border-b-2 border-cyan-400 flex flex-col items-center gap-1";
        } else {
          mobBtn.className = "flex-1 py-2 text-center text-[10px] font-medium text-slate-400 hover:text-slate-200 flex flex-col items-center gap-1";
        }
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // CHAT & REAL AI INTEGRATION
  // ----------------------------------------------------
  renderSymptomChips() {
    const container = document.getElementById('symptom-chips-container');
    if (!container) return;
    container.innerHTML = '';

    this.symptomChips.forEach(chip => {
      const btn = document.createElement('button');
      btn.className = "text-left text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/80 text-cyan-200 hover:text-cyan-100 border border-cyan-500/20 hover:border-cyan-400/50 transition-all flex items-center gap-1.5 active:scale-95";
      btn.innerHTML = `<span class="text-cyan-400">✦</span> <span>${this.lang === 'hi' ? chip.hi : chip.en}</span>`;
      btn.onclick = () => {
        const text = this.lang === 'hi' ? chip.hi : chip.en;
        this.sendUserMessage(text);
      };
      container.appendChild(btn);
    });
  }

  handleChatSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('chat-user-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    this.sendUserMessage(text);
  }

  sendUserMessage(text) {
    this.appendMessage('user', text);
    this.mascot.setState('thinking');

    const typingId = 'typing-indicator-' + Date.now();
    this.showTypingIndicator(typingId);

    // Call backend /api/chat
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        lang: this.lang,
        history: this.chatHistory.slice(-4)
      })
    })
      .then(res => res.json())
      .then(data => {
        this.removeTypingIndicator(typingId);

        // Update chat history
        this.chatHistory.push({ role: 'user', text: text });
        this.chatHistory.push({ role: 'model', text: data.text });

        // Check if emergency
        if (data.isEmergency || (data.triage && data.triage.isEmergency)) {
          this.mascot.setState('emergency');
          this.sound.playEmergencyAlarm();
          const alertHtml = `
            <div class="p-4 rounded-2xl bg-rose-950/90 border-2 border-rose-500/80 text-rose-100 text-xs shadow-xl glow-rose space-y-3">
              <div class="flex items-center gap-2 font-bold text-rose-300">
                <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span>${this.lang === 'hi' ? 'आपातकालीन कैजुअल्टी सहायता' : 'Emergency Casualty Required (Lucknow)'}</span>
              </div>
              <p class="leading-relaxed">${this.lang === 'hi' ? 'केजीएमयू ट्रॉमा सेंटर (शाह मीना रोड, लखनऊ) 24 घंटे खुला है। तुरंत संपर्क करें:' : 'Proceed immediately to KGMU Trauma Centre (Shah Mina Road, Chowk) or dial emergency:'}</p>
              <div class="flex gap-2 flex-wrap pt-1">
                <a href="tel:108" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors">
                  📞 ${this.lang === 'hi' ? 'एम्बुलेंस 108' : 'Dial Ambulance 108'}
                </a>
                <a href="tel:05222257540" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-colors">
                  🏥 KGMU Trauma: 0522-2257540
                </a>
              </div>
            </div>
          `;
          this.appendMessage('akesa', data.text, alertHtml, data.source);
          return;
        }

        // Check if blood bank query
        if (data.triage && data.triage.isBloodBank) {
          this.mascot.setState('happy');
          const bloodHtml = `
            <div class="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs space-y-3 shadow-lg">
              <div class="flex items-center justify-between">
                <span class="font-bold text-cyan-300 flex items-center gap-1.5">🩸 Verified Lucknow Blood Banks</span>
                <button onclick="app.switchTab('bloodbank')" class="px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all">
                  Open Blood Bank Column →
                </button>
              </div>
              <p class="text-slate-300">Live units available at KGMU (0522-2258880), RMLIMS (0522-6692112), and Balrampur Hospital.</p>
            </div>
          `;
          this.appendMessage('akesa', data.text, bloodHtml, data.source);
          return;
        }

        // Department Matching & Doctor recommendations
        let extraHtml = '';
        if (data.triage && data.triage.matchedDepartmentId) {
          const dept = this.departments.find(d => d.id === data.triage.matchedDepartmentId);
          const matchingDoctors = this.doctors.filter(d => d.departmentId === data.triage.matchedDepartmentId);
          extraHtml = this.generateDoctorCardsHtml(matchingDoctors, dept, data.triage.prepTipsEn);
        }

        this.mascot.setState('happy');
        this.appendMessage('akesa', data.text, extraHtml, data.source);
      })
      .catch(err => {
        this.removeTypingIndicator(typingId);
        console.warn("Backend chat error, using local engine:", err);
        // Fallback to local grounded triage directly
        this.runLocalGroundedChat(text);
      });
  }

  runLocalGroundedChat(text) {
    const lower = text.toLowerCase();
    let matchedDept = this.departments.find(d => d.keywords.some(k => lower.includes(k))) || this.departments[this.departments.length - 1];

    const deptName = this.lang === 'hi' ? matchedDept.nameHi : matchedDept.nameEn;
    const roomHint = this.lang === 'hi' ? matchedDept.roomHintHi : matchedDept.roomHintEn;
    const prepTip = this.lang === 'hi' ? matchedDept.prepTipsHi[0] : matchedDept.prepTipsEn[0];

    const responseText = this.lang === 'hi'
      ? `आपके लक्षणों के आधार पर आपको **${deptName}** में परामर्श लेना चाहिए।\n\n📍 **स्थान**: ${roomHint}\n💡 **तैयारी**: ${prepTip}\n\nनीचे लखनऊ के अस्पतालों में उपलब्ध विशेषज्ञ डॉक्टर व कमरे दिए गए हैं:`
      : `Based on your symptoms, please consult **${deptName}**.\n\n📍 **Location**: ${roomHint}\n💡 **Pre-visit Tip**: ${prepTip}\n\nHere are the verified doctors and rooms in Lucknow:`;

    const matchingDoctors = this.doctors.filter(d => d.departmentId === matchedDept.id);
    const doctorCardsHtml = this.generateDoctorCardsHtml(matchingDoctors, matchedDept, prepTip);

    this.mascot.setState('happy');
    this.appendMessage('akesa', responseText, doctorCardsHtml, 'grounded-local');
  }

  showTypingIndicator(id) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.id = id;
    div.className = "flex gap-3 justify-start animate-in fade-in duration-200";
    div.innerHTML = `
      <div class="w-8 h-8 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 flex items-center justify-center text-sm shadow-sm flex-shrink-0 mt-1">
        🤖
      </div>
      <div class="glass-panel rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        <span>${this.lang === 'hi' ? 'डॉक्टर आकेसा सोच रही हैं...' : 'Dr. Akesa is analyzing clinical directions...'}</span>
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  appendMessage(sender, text, extraHtml = '', source = 'gemini') {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`;

    if (sender === 'user') {
      msgDiv.innerHTML = `
        <div class="max-w-md bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-2xl rounded-tr-xs p-4 shadow-md text-xs sm:text-sm">
          <p class="leading-relaxed">${text}</p>
          <span class="text-[10px] text-cyan-200 block text-right mt-1 font-mono">Just now</span>
        </div>
      `;
    } else {
      this.lastResponseText = text;
      const msgId = 'msg-' + Math.floor(Math.random() * 100000);
      const isGemini = source === 'gemini';

      msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white flex items-center justify-center text-sm shadow-md flex-shrink-0 mt-1">
          🤖
        </div>
        <div class="max-w-xl space-y-3">
          <div class="glass-panel-elevated rounded-2xl rounded-tl-xs p-4 text-xs sm:text-sm text-slate-100 relative group">
            <div class="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20">
              <div class="flex items-center gap-1.5 text-[11px] font-bold text-cyan-300">
                <span>Dr. Akesa M.D. (AI)</span>
                <span class="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[9px] border border-cyan-800">
                  ${isGemini ? '⚡ Gemini AI' : '🔒 Grounded Engine'}
                </span>
              </div>
              <button onclick="app.speakMessageText('${msgId}')" class="px-2.5 py-1 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/70 text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-cyan-500/30" title="Listen with sweet voice">
                <span>🔊</span>
                <span>${this.lang === 'hi' ? 'सुनें' : 'Listen'}</span>
              </button>
            </div>
            <p id="${msgId}" class="leading-relaxed whitespace-pre-line">${text}</p>
          </div>
          ${extraHtml}
        </div>
      `;

      if (this.sound.voiceEnabled) {
        this.sound.speak(text, this.lang);
      }
    }

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }

  speakMessageText(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      this.sound.speak(el.innerText, this.lang);
    }
  }

  // Generate doctor cards HTML with room number and step-by-step wayfinding
  generateDoctorCardsHtml(doctorsList, dept, prepTip) {
    if (!doctorsList || doctorsList.length === 0) return '';

    let cardsHtml = `
      <div class="space-y-3 mt-2">
        <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider pt-1 flex items-center justify-between">
          <span>Available Doctors & Room Numbers (Lucknow):</span>
          <span class="text-emerald-400 font-mono text-[11px]">● Live OPD Active</span>
        </div>
        <div class="space-y-3">
    `;

    doctorsList.forEach(doc => {
      const docName = this.lang === 'hi' ? doc.nameHi : doc.nameEn;
      const specialty = this.lang === 'hi' ? doc.specialtyHi : doc.specialtyEn;
      const timings = this.lang === 'hi' ? doc.timingsHi : doc.timingsEn;
      const hospName = this.lang === 'hi' ? doc.hospitalNameHi : doc.hospitalNameEn;
      const wayfinding = this.lang === 'hi' ? doc.wayfindingHi : doc.wayfindingEn;
      const navId = 'nav-way-' + doc.id;

      cardsHtml += `
        <div class="glass-panel rounded-2xl p-4 border border-cyan-500/25 shadow-lg hover:border-cyan-400/60 transition-all space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                ${doc.avatar}
              </div>
              <div>
                <h4 class="font-extrabold text-white text-sm">${docName}</h4>
                <p class="text-[11px] text-cyan-300 font-semibold">${specialty}</p>
                <div class="text-[10px] text-slate-400 mt-0.5">
                  <span class="font-semibold text-slate-300">${hospName}</span>
                  <span>•</span>
                  <span>${doc.qualification}</span>
                </div>
              </div>
            </div>

            <div class="text-right flex flex-col items-end gap-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-900/60 text-cyan-200 border border-cyan-500/30">
                OPD: ₹${doc.fee}
              </span>
              <button onclick="app.speakDoctorDetails('${doc.id}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-200 text-[10px] font-semibold flex items-center gap-1 transition-colors border border-slate-700">
                <span>🔊</span>
                <span>${this.lang === 'hi' ? 'सुनें' : 'Audio'}</span>
              </button>
            </div>
          </div>

          <!-- Room Number & Floor Location Banner -->
          <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white flex items-center justify-between text-xs flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="font-mono text-cyan-300 font-bold">${doc.roomNumber}</span>
              <span class="text-slate-500">|</span>
              <span class="text-slate-300">${doc.floor} (${doc.block})</span>
            </div>
            <div class="flex items-center gap-2 text-[11px]">
              <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold border border-emerald-800/40">${doc.estimatedWait}</span>
              <span class="text-slate-400 font-mono">${timings}</span>
            </div>
          </div>

          <!-- Step-by-Step Wayfinding Accordion -->
          <div class="rounded-xl bg-slate-950/60 border border-slate-800 p-2 text-xs">
            <button onclick="app.toggleCardWayfinding('${navId}')" class="w-full flex items-center justify-between font-bold text-slate-300 text-[11px]">
              <span class="flex items-center gap-1">
                <span>🗺️</span>
                <span>${this.lang === 'hi' ? 'कमरे तक पहुँचने का रास्ता (मार्गदर्शन)' : 'How to Reach Room (Step-by-Step)'}</span>
              </span>
              <span id="arrow-${navId}">▼</span>
            </button>
            <div id="${navId}" class="hidden mt-2 pt-2 border-t border-slate-800 text-[11px] text-cyan-200 leading-relaxed font-mono">
              ${wayfinding}
            </div>
          </div>

          <!-- Booking Button -->
          <div class="pt-1">
            <button onclick="app.openBookingModal('${doc.id}')" class="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5">
              <span>🎟️</span>
              <span>${this.lang === 'hi' ? 'ओपीडी टोकन प्राप्त करें' : 'Get OPD Token & Visit Pass'}</span>
            </button>
          </div>
        </div>
      `;
    });

    cardsHtml += `</div></div>`;
    return cardsHtml;
  }

  toggleCardWayfinding(elementId) {
    const el = document.getElementById(elementId);
    const arrow = document.getElementById(`arrow-${elementId}`);
    if (el) {
      el.classList.toggle('hidden');
      if (arrow) {
        arrow.innerText = el.classList.contains('hidden') ? '▼' : '▲';
      }
    }
  }

  speakDoctorDetails(doctorId) {
    const doc = this.doctors.find(d => d.id === doctorId);
    if (!doc) return;
    const docName = this.lang === 'hi' ? doc.nameHi : doc.nameEn;
    const specialty = this.lang === 'hi' ? doc.specialtyHi : doc.specialtyEn;
    const room = doc.roomNumber;
    const floor = doc.floor;
    const hosp = this.lang === 'hi' ? doc.hospitalNameHi : doc.hospitalNameEn;

    const speech = this.lang === 'hi'
      ? `${docName}, ${specialty}। ${hosp} के ${floor}, ${room} में बैठते हैं। ओपीडी समय सुबह 9 से 1 बजे तक है।`
      : `${docName}, ${specialty} at ${hosp}. Room location is ${room}, ${floor}. OPD timings 9 AM to 1 PM.`;

    this.sound.speak(speech, this.lang);
  }

  // ----------------------------------------------------
  // SPEECH RECOGNITION (VOICE INPUT)
  // ----------------------------------------------------
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.mascot.setState('listening');
        const micBtn = document.getElementById('chat-mic-btn');
        if (micBtn) micBtn.classList.add('bg-rose-600', 'text-white', 'animate-pulse');
      };

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join('');
        if (this.isCallActive) {
          const detected = /[\u0B80-\u0BFF]/.test(transcript) ? 'ta' :
            /[\u0C00-\u0C7F]/.test(transcript) ? 'te' :
            /[\u0980-\u09FF]/.test(transcript) ? 'bn' :
            /[\u0A00-\u0A7F]/.test(transcript) ? 'pa' :
            /[\u0600-\u06FF]/.test(transcript) ? 'ur' :
            /[\u0900-\u097F]/.test(transcript) ? 'hi' : this.helplineLang;
          this.helplineLang = detected;
          const subs = document.getElementById('call-subtitles');
          if (subs) subs.textContent = transcript;
          const replies = {
            en: 'I heard your concern. For emergencies, contact local emergency services. For a demo appointment, choose a hospital and doctor in the directory.',
            hi: 'मैंने आपकी बात सुनी। आपात स्थिति में स्थानीय आपातकालीन सेवा से संपर्क करें। डेमो अपॉइंटमेंट के लिए अस्पताल और डॉक्टर चुनें।',
            ur: 'میں نے آپ کی بات سن لی۔ ہنگامی صورت میں مقامی ایمرجنسی سروس سے رابطہ کریں۔',
            awa: 'आपकी बात सुनि गइ। आपातकाल मा स्थानीय आपात सेवा का फोन करैं।',
            bho: 'हम राउर बात सुननी। आपात स्थिति में स्थानीय आपात सेवा से संपर्क करीं।',
            bn: 'আপনার কথা শুনেছি। জরুরি অবস্থায় স্থানীয় জরুরি পরিষেবায় যোগাযোগ করুন।',
            ta: 'உங்கள் பிரச்சினையை கேட்டேன். அவசரநிலையில் உள்ளூர் அவசர சேவையை தொடர்பு கொள்ளுங்கள்.',
            te: 'మీ సమస్య విన్నాను. అత్యవసర పరిస్థితిలో స్థానిక అత్యవసర సేవలను సంప్రదించండి.',
            pa: 'ਤੁਹਾਡੀ ਗੱਲ ਸੁਣ ਲਈ ਹੈ। ਐਮਰਜੈਂਸੀ ਵਿੱਚ ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।'
          };
          const reply = replies[detected] || replies.en;
          if (subs) subs.textContent = reply;
          this.sound.speak(reply, detected);
          return;
        }
        const input = document.getElementById('chat-user-input');
        if (input) input.value = transcript;
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.mascot.setState('idle');
        const micBtn = document.getElementById('chat-mic-btn');
        if (micBtn) micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');

        if (this.isCallActive) return;
        const input = document.getElementById('chat-user-input');
        if (input && input.value.trim().length > 3) {
          this.sendUserMessage(input.value.trim());
          input.value = '';
        }
      };

      this.recognition.onerror = (e) => {
        this.isListening = false;
        this.mascot.setState('idle');
        const micBtn = document.getElementById('chat-mic-btn');
        if (micBtn) micBtn.classList.remove('bg-rose-600', 'text-white', 'animate-pulse');
        console.warn("Speech recognition error:", e);
      };
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      alert(this.lang === 'hi' ? 'आपके ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है।' : 'Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.lang = this.isCallActive ? (({en:'en-IN',hi:'hi-IN',ur:'ur-IN',awa:'hi-IN',bho:'hi-IN',bn:'bn-IN',ta:'ta-IN',te:'te-IN',pa:'pa-IN'})[this.helplineLang] || 'hi-IN') : (this.lang === 'hi' ? 'hi-IN' : 'en-IN');
      try {
        this.recognition.start();
      } catch (e) {
        console.warn(e);
      }
    }
  }

  // ----------------------------------------------------
  // BLOOD BANK SECTION (NEW FEATURE!)
  // ----------------------------------------------------
  renderBloodBanksList() {
    const container = document.getElementById('blood-banks-grid');
    if (!container) return;
    container.innerHTML = '';

    const filterGroup = this.selectedBloodGroupFilter; // 'all' or 'O+', 'A+' etc.

    this.bloodBanks.forEach(bb => {
      const hosp = this.hospitals.find(h => h.id === bb.hospitalId) || {};
      const card = document.createElement('div');
      card.className = "glass-panel rounded-2xl p-5 border border-rose-500/25 shadow-xl hover:border-rose-400/50 transition-all space-y-4";

      // Build Blood group stock pills
      let stockPills = '';
      const groups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

      groups.forEach(grp => {
        const item = bb.inventory[grp];
        if (!item) return;

        const isHighlighted = filterGroup === grp;
        const isCritical = item.status === 'critical';
        const badgeColor = isCritical ? 'bg-rose-950/80 text-rose-300 border-rose-700/60' : 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';

        stockPills += `
          <div class="p-2 rounded-xl ${badgeColor} border text-center ${isHighlighted ? 'ring-2 ring-cyan-400' : ''}">
            <span class="block font-black text-sm">${grp}</span>
            <span class="block text-[11px] font-mono font-bold">${item.units} units</span>
            <span class="block text-[9px] text-slate-400">PRBC: ${item.prbc}</span>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/40">24x7 BLOOD BANK</span>
              <span class="text-[10px] text-slate-400 font-mono">${bb.licenseNumber}</span>
            </div>
            <h3 class="font-extrabold text-white text-base mt-1">${this.lang === 'hi' ? bb.hospitalNameHi : bb.hospitalNameEn}</h3>
            <p class="text-xs text-slate-300 mt-0.5">${this.lang === 'hi' ? bb.locationHi : bb.locationEn}</p>
          </div>
          <a href="tel:${bb.phone24x7}" class="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md flex-shrink-0 transition-colors">
            <span>📞</span>
            <span>Call</span>
          </a>
        </div>

        <div>
          <div class="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>Verified Stock Status:</span>
            <span class="text-emerald-400 font-mono text-[10px]">● Audited: ${bb.lastAudited}</span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            ${stockPills}
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <div class="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Component Separation: ${bb.componentSeparation ? '✅ Yes' : '❌ No'}</span>
            <span>Apheresis: ${bb.apheresisFacility ? '✅ Yes' : '❌ No'}</span>
          </div>
          <button onclick="app.openBloodRequestModal('${bb.id}')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-bold text-xs hover:from-rose-500 hover:to-amber-500 transition-all">
            🚨 Urgent Request
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterBloodGroup(group) {
    this.selectedBloodGroupFilter = group;
    const btns = document.querySelectorAll('.blood-filter-btn');
    btns.forEach(b => {
      if (b.dataset.group === group) {
        b.className = "blood-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md";
      } else {
        b.className = "blood-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800";
      }
    });
    this.renderBloodBanksList();
  }

  openBloodRequestModal(bloodBankId) {
    const modal = document.getElementById('blood-request-modal');
    if (modal) modal.classList.remove('hidden');
  }

  closeBloodRequestModal() {
    const modal = document.getElementById('blood-request-modal');
    if (modal) modal.classList.add('hidden');
  }

  handleBloodRequestSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('bld-req-name').value.trim();
    const phone = document.getElementById('bld-req-phone').value.trim();
    const group = document.getElementById('bld-req-group').value;
    const hospital = document.getElementById('bld-req-hospital').value;
    const units = document.getElementById('bld-req-units').value;

    if (!name || !phone) {
      alert("Please provide patient name and contact phone number.");
      return;
    }

    fetch('/api/blood-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: name,
        patientPhone: phone,
        bloodGroup: group,
        unitsRequired: units,
        hospitalName: hospital
      })
    })
      .then(res => res.json())
      .then(data => {
        this.closeBloodRequestModal();
        this.sound.playSuccessChime();
        alert(`✅ Blood Request Logged!\nReference ID: ${data.referenceId}\nPlease carry hospital duty doctor requisition form to ${hospital} Blood Bank.`);
      })
      .catch(() => {
        const ref = 'BLD-LK-' + Math.floor(1000 + Math.random() * 9000);
        this.closeBloodRequestModal();
        this.sound.playSuccessChime();
        alert(`✅ Emergency Blood Requirement Logged (Local Ref: ${ref})\nPlease proceed with doctor requisition slip.`);
      });
  }

  // ----------------------------------------------------
  // 1800 HELPLINE SIMULATOR (EXPANDED TO 9 LANGUAGES!)
  // ----------------------------------------------------
  renderHelplineKeypad() {
    const keypadContainer = document.getElementById('helpline-keypad');
    if (!keypadContainer) return;
    keypadContainer.innerHTML = '';

    this.helplineLanguages.forEach(hl => {
      const btn = document.createElement('button');
      btn.className = "h-11 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 active:scale-95 transition-all flex flex-col items-center justify-center";
      btn.innerHTML = `<span>${hl.key}</span><span class="text-[9px] text-cyan-300 font-normal">${hl.nativeName}</span>`;
      btn.onclick = () => this.dialHelplineKey(hl.key);
      keypadContainer.appendChild(btn);
    });
  }

  toggleHelplineCall() {
    this.isCallActive = !this.isCallActive;
    const btn = document.getElementById('main-call-btn');
    const timer = document.getElementById('call-timer');
    const subtitles = document.getElementById('call-subtitles');

    if (this.isCallActive) {
      this.sound.initAudio();
      this.sound.playSoothingChime();
      if (btn) btn.className = "w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-transform active:scale-90";
      this.callSeconds = 0;
      this.callTimerInterval = setInterval(() => {
        this.callSeconds++;
        const mins = String(Math.floor(this.callSeconds / 60)).padStart(2, '0');
        const secs = String(this.callSeconds % 60).padStart(2, '0');
        if (timer) timer.innerText = `${mins}:${secs}`;
      }, 1000);

      const welcomeByLang = {
        en: 'Welcome to Akesa Health Lucknow helpline. Select your language using keys one to nine.',
        hi: 'आकेसा हेल्थ लखनऊ हेल्पलाइन में आपका स्वागत है। अपनी भाषा चुनने के लिए एक से नौ तक का बटन दबाएँ।',
        ur: 'آکیسا ہیلتھ لکھنؤ ہیلپ لائن میں خوش آمدید۔ اپنی زبان منتخب کرنے کے لیے ایک سے نو تک بٹن دبائیں۔',
        awa: 'आकेसा हेल्थ हेल्पलाइन मा आप सबका स्वागत है। अपनी भाषा चुने खातिर बटन दबावा।',
        bho: 'आकेसा हेल्थ हेल्पलाइन में राउर स्वागत बा। आपन भाषा चुने खातिर बटन दबाईं।',
        bn: 'আকেসা হেলথ লখনউ হেল্পলাইনে আপনাকে স্বাগতম। ভাষা বেছে নিতে এক থেকে নয় চাপুন।',
        ta: 'ஆகேசா ஹெல்த் உதவி எண்ணுக்கு வரவேற்கிறோம். மொழியைத் தேர்ந்தெடுக்க ஒன்று முதல் ஒன்பது வரை அழுத்தவும்.',
        te: 'ఆకేసా హెల్త్ హెల్ప్‌లైన్‌కు స్వాగతం. భాషను ఎంచుకోవడానికి ఒకటి నుంచి తొమ్మిది వరకు నొక్కండి.',
        pa: 'ਆਕੇਸਾ ਹੈਲਥ ਹੈਲਪਲਾਈਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਭਾਸ਼ਾ ਚੁਣਨ ਲਈ ਇੱਕ ਤੋਂ ਨੌਂ ਤੱਕ ਦਬਾਓ।'
      };
      const welcome = welcomeByLang[this.helplineLang] || welcomeByLang.en;
      if (subtitles) subtitles.innerText = welcome;
      this.sound.speak(welcome, this.helplineLang);
    } else {
      if (btn) btn.className = "w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform active:scale-90";
      clearInterval(this.callTimerInterval);
      if (timer) timer.innerText = "00:00";
      if (subtitles) subtitles.innerText = '"Call ended. Dial again anytime for voice OPD guidance."';
      this.sound.stopSpeaking();
    }
  }

  dialHelplineKey(key) {
    this.sound.playDtmfTone(key);
    const subtitles = document.getElementById('call-subtitles');
    const langObj = this.helplineLanguages.find(hl => hl.key === key);

    if (langObj) {
      this.helplineLang = langObj.code;
      if (subtitles) subtitles.innerText = `"${langObj.subtitles}"`;
      this.sound.speak(langObj.ivrWelcome, langObj.code, () => {
        // Simulate patient booking
        setTimeout(() => {
          if (subtitles) subtitles.innerText = `"${langObj.sampleResponse}"`;
          this.sound.speak(langObj.sampleResponse, langObj.code);
          this.showSmsNotification(langObj.sampleResponse);
        }, 800);
      });
    }
  }

  showSmsNotification(msg) {
    const smsBar = document.getElementById('sms-notification-bar');
    const smsContent = document.getElementById('sms-text-content');
    if (smsBar && smsContent) {
      smsContent.innerText = msg;
      smsBar.classList.remove('hidden');
      setTimeout(() => {
        smsBar.classList.add('hidden');
      }, 9000);
    }
  }

  // ----------------------------------------------------
  // HOSPITAL DIRECTORY & FILTERS
  // ----------------------------------------------------
  renderHospitalsList() {
    const container = document.getElementById('hospitals-list-grid');
    if (!container) return;
    container.innerHTML = '';

    const multiplier = (this.localities.find(l => l.id === this.activeLocality) || {}).distMultiplier || 1.0;

    this.hospitals.forEach(hosp => {
      const dist = (hosp.calculatedDistanceKm != null ? hosp.calculatedDistanceKm : hosp.distanceKm * multiplier).toFixed(1);
      const card = document.createElement('div');
      card.className = "glass-panel rounded-2xl p-5 border border-cyan-500/25 shadow-xl space-y-4 hover:border-cyan-400/50 transition-all";

      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                ⭐ ${hosp.rating}
              </span>
              <span class="text-[10px] text-emerald-400 font-mono font-bold">● 24x7 Emergency Casualty</span>
            </div>
            <h3 class="font-extrabold text-white text-base mt-1">${this.lang === 'hi' ? hosp.nameHi : hosp.nameEn}</h3>
            <p class="text-xs text-slate-300 mt-0.5">${this.lang === 'hi' ? hosp.addressHi : hosp.addressEn}</p>
          </div>
          <span class="px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold flex-shrink-0">
            📍 ${dist} km
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div>
            <span class="text-slate-400 block text-[10px]">OPD Timings</span>
            <span class="text-white font-mono font-bold">${this.lang === 'hi' ? hosp.opdTimingsHi : hosp.opdTimingsEn}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px]">Helpline</span>
            <a href="tel:${hosp.phone}" class="text-cyan-300 font-mono font-bold hover:underline">${hosp.phone}</a>
          </div>
        </div>

        <div class="text-xs text-slate-300 leading-relaxed">
          <strong class="text-cyan-300">Registration:</strong> ${this.lang === 'hi' ? hosp.registrationHintHi : hosp.registrationHintEn}
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
          <a href="tel:${hosp.phone}" class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-center font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
            <span>📞 Call</span>
          </a>
          <button onclick="app.filterHospitalDoctors('${hosp.id}')" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5">
            <span>👨‍⚕️ View Doctors</span>
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterHospitalDoctors(hospId) {
    const hosp = this.hospitals.find(h => h.id === hospId);
    if (!hosp) { alert('Hospital details are unavailable.'); return; }
    const docs = this.doctors.filter(d =>
      (d.hospitalId && d.hospitalId === hospId) ||
      (d.hospitalNameEn && (d.hospitalNameEn.includes(hosp.shortName) || hosp.nameEn.includes(d.hospitalNameEn)))
    );
    const list = docs.length ? docs : this.doctors.filter(d =>
      (hosp.departments || []).some(dept => dept === d.departmentId)
    );
    const container = document.getElementById('chat-messages');
    this.switchTab('chat');
    if (!container) return;
    const section = document.createElement('div');
    section.className = 'glass-panel rounded-2xl p-4 border border-cyan-500/30 space-y-3';
    const title = document.createElement('h3');
    title.className = 'font-bold text-cyan-300';
    title.textContent = `Doctors and departments — ${hosp.shortName}`;
    section.appendChild(title);
    if (!list.length) {
      const msg = document.createElement('p');
      msg.className = 'text-sm text-slate-200';
      msg.textContent = 'No individual doctor records are available for this hospital in the demo dataset. Please contact the hospital to confirm the current OPD roster.';
      section.appendChild(msg);
    } else {
      list.forEach(doc => {
        const row = document.createElement('div');
        row.className = 'flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-3';
        const info = document.createElement('div');
        info.className = 'text-sm text-white';
        info.textContent = `${this.lang === 'hi' ? (doc.nameHi || doc.nameEn) : doc.nameEn} — ${this.lang === 'hi' ? (doc.specialtyHi || doc.specialtyEn) : doc.specialtyEn} · ${doc.roomNumber || 'Room details at reception'}`;
        row.appendChild(info);
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold';
        btn.textContent = 'Book / Get Slip';
        btn.onclick = () => this.openBookingModal(doc.id);
        row.appendChild(btn); section.appendChild(row);
      });
    }
    container.appendChild(section);
    container.scrollTop = container.scrollHeight;
  }

  // ----------------------------------------------------
  // OPD BOOKING & DIGITAL PASS MODALS
  // ----------------------------------------------------
  openBookingModal(doctorId) {
    const doc = this.doctors.find(d => d.id === doctorId);
    if (!doc) return;
    this.selectedDoctorForBooking = doc;

    const modal = document.getElementById('booking-modal');
    const docName = document.getElementById('book-modal-doctor-name');
    const docSub = document.getElementById('book-modal-sub');

    if (docName) docName.innerText = this.lang === 'hi' ? doc.nameHi : doc.nameEn;
    if (docSub) docSub.innerText = `${doc.specialtyEn} • ${doc.roomNumber} (${doc.hospitalNameEn})`;

    // Slots
    const slotsCont = document.getElementById('book-slots-container');
    if (slotsCont) {
      slotsCont.innerHTML = '';
      doc.slots.forEach((s, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `p-2 rounded-xl border text-xs font-mono font-bold ${idx === 0 ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-400'}`;
        btn.innerText = s;
        btn.onclick = () => {
          document.querySelectorAll('#book-slots-container button').forEach(b => {
            b.className = 'p-2 rounded-xl border text-xs font-mono font-bold bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-400';
          });
          btn.className = 'p-2 rounded-xl border text-xs font-mono font-bold bg-cyan-500 text-slate-950 border-cyan-400';
          this.selectedSlot = s;
        };
        slotsCont.appendChild(btn);
      });
      this.selectedSlot = doc.slots[0];
    }

    if (modal) modal.classList.remove('hidden');
  }

  closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.add('hidden');
  }

  handleBookingSubmit(e) {
    if (e) e.preventDefault();
    const doc = this.selectedDoctorForBooking || this.doctors[0];
    const name = document.getElementById('book-input-name').value.trim();
    const age = document.getElementById('book-input-age').value.trim();
    const phone = document.getElementById('book-input-phone').value.trim();

    if (!name) {
      alert("Please enter patient name.");
      return;
    }

    const tokenNum = `AK-${Math.floor(100 + Math.random() * 900)}`;
    const aptId = `APT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApt = {
      id: aptId,
      tokenNumber: tokenNum,
      patientName: name,
      patientPhone: phone || '+91 94500 00000',
      patientAge: age || '35',
      hospitalNameEn: doc.hospitalNameEn,
      hospitalNameHi: doc.hospitalNameHi,
      doctorNameEn: doc.nameEn,
      doctorNameHi: doc.nameHi,
      departmentNameEn: doc.specialtyEn,
      departmentNameHi: doc.specialtyHi,
      roomNumber: doc.roomNumber,
      floor: doc.floor,
      block: doc.block,
      date: 'Today',
      slot: this.selectedSlot || '10:30 AM',
      wayfindingEn: doc.wayfindingEn,
      wayfindingHi: doc.wayfindingHi,
      status: 'confirmed',
      source: 'web'
    };

    // Save to appointments
    this.appointments.unshift(newApt);
    this.renderAdminAppointments();
    this.closeBookingModal();

    // Trigger celebration & pass modal
    this.sound.playSuccessChime();
    this.openPassModal(newApt);
  }

  openPassModal(apt) {
    const modal = document.getElementById('pass-modal');
    if (!modal) return;

    this.currentViewingPass = apt;

    document.getElementById('pass-token-badge').innerText = apt.tokenNumber;
    document.getElementById('pass-patient-name').innerText = apt.patientName;
    document.getElementById('pass-doctor-name').innerText = this.lang === 'hi' ? apt.doctorNameHi : apt.doctorNameEn;
    document.getElementById('pass-hospital-name').innerText = this.lang === 'hi' ? apt.hospitalNameHi : apt.hospitalNameEn;
    document.getElementById('pass-room-number').innerText = apt.roomNumber;
    document.getElementById('pass-floor').innerText = apt.floor;
    document.getElementById('pass-slot').innerText = apt.slot;
    document.getElementById('pass-wayfinding-text').innerText = this.lang === 'hi' ? (apt.wayfindingHi || '') : (apt.wayfindingEn || '');

    // Scannable non-sensitive QR generation
    const qrCont = document.getElementById('qrcode-container');
    if (qrCont && window.QRCode) {
      qrCont.innerHTML = '';
      new window.QRCode(qrCont, {
        text: `AKESA|${apt.id}|${apt.tokenNumber}|${apt.roomNumber}`,
        width: 120,
        height: 120,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    }

    modal.classList.remove('hidden');
  }

  closePassModal() {
    const modal = document.getElementById('pass-modal');
    if (modal) modal.classList.add('hidden');
  }

  speakPassDetails() {
    if (!this.currentViewingPass) return;
    const p = this.currentViewingPass;
    const doc = this.lang === 'hi' ? p.doctorNameHi : p.doctorNameEn;
    const hosp = this.lang === 'hi' ? p.hospitalNameHi : p.hospitalNameEn;
    const speech = this.lang === 'hi'
      ? `आपका टोकन नंबर ${p.tokenNumber} है। मरीज: ${p.patientName}। डॉक्टर: ${doc}। अस्पताल: ${hosp}। कमरा नंबर: ${p.roomNumber}, ${p.floor}। कृपया समय पर पहुंचे।`
      : `Your token number is ${p.tokenNumber}. Patient: ${p.patientName}. Doctor: ${doc}. Hospital: ${hosp}. Room number ${p.roomNumber}, ${p.floor}.`;
    this.sound.speak(speech, this.lang);
  }

  printPass() {
    window.print();
  }

  // ----------------------------------------------------
  // RECEPTION / ADMIN DESK
  // ----------------------------------------------------
  renderAdminAppointments() {
    const tbody = document.getElementById('admin-appointments-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.appointments.forEach(apt => {
      const tr = document.createElement('tr');
      tr.className = "border-b border-slate-800 text-xs hover:bg-slate-900/40 transition-colors";

      const isCheckedIn = apt.status === 'checked_in';
      const statusBadge = isCheckedIn
        ? '<span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/40">Checked In</span>'
        : '<span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800/40">Confirmed</span>';

      tr.innerHTML = `
        <td class="p-3 font-mono font-bold text-cyan-300">${apt.tokenNumber}</td>
        <td class="p-3 font-bold text-white">${apt.patientName}</td>
        <td class="p-3 text-slate-300">${this.lang === 'hi' ? apt.doctorNameHi : apt.doctorNameEn}</td>
        <td class="p-3 font-mono text-cyan-300">${apt.roomNumber}</td>
        <td class="p-3 font-mono text-slate-400">${apt.slot}</td>
        <td class="p-3">${statusBadge}</td>
        <td class="p-3 text-right">
          ${!isCheckedIn ? `
            <button onclick="app.checkInAppointment('${apt.id}')" class="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all">
              Check-In
            </button>
          ` : '<span class="text-emerald-400 font-bold text-[11px]">✓ Ready in Queue</span>'}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  checkInAppointment(aptId) {
    const apt = this.appointments.find(a => a.id === aptId);
    if (apt) {
      apt.status = 'checked_in';
      this.sound.playSuccessChime();
      this.renderAdminAppointments();
    }
  }

  searchAdminAppointment() {
    const input = document.getElementById('admin-qr-input');
    const val = (input ? input.value : '').trim().toUpperCase();
    if (!val) return;

    const apt = this.appointments.find(a => a.tokenNumber.toUpperCase() === val || a.id.toUpperCase() === val);
    if (apt) {
      this.openPassModal(apt);
    } else {
      alert("No appointment found matching token: " + val);
    }
  }

  // ----------------------------------------------------
  // LOCALITY SWITCHER
  // ----------------------------------------------------
  renderLocalityOptions() {
    const container = document.getElementById('locality-options-list');
    if (!container) return;
    container.innerHTML = '';

    this.localities.forEach(loc => {
      const btn = document.createElement('button');
      btn.className = `w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${this.activeLocality === loc.id ? 'bg-cyan-950 border-cyan-400 text-cyan-200' : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'}`;
      btn.innerHTML = `
        <span class="font-bold text-xs">${this.lang === 'hi' ? loc.nameHi : loc.nameEn}</span>
        ${this.activeLocality === loc.id ? '<span class="text-cyan-400">✓ Active</span>' : ''}
      `;
      btn.onclick = () => {
        this.activeLocality = loc.id;
        const disp = document.getElementById('current-locality-display');
        if (disp) disp.innerText = this.lang === 'hi' ? loc.nameHi : loc.nameEn;
        this.renderHospitalsList();
        this.closeLocalityModal();
      };
      container.appendChild(btn);
    });
  }

  openLocalityModal() {
    // Try precise browser location first; if denied/unavailable, retain manual locality selection.
    if (navigator.geolocation) {
      const btn = document.querySelector('button[onclick="app.openLocalityModal()"]');
      if (btn) btn.disabled = true;
      navigator.geolocation.getCurrentPosition(position => {
        this.userCoordinates = { lat: position.coords.latitude, lon: position.coords.longitude };
        this.hospitals.forEach(h => {
          const coords = {
            'hosp-1': [26.8700, 80.9120], 'hosp-2': [26.8660, 81.0150],
            'hosp-3': [26.8500, 80.9300], 'hosp-4': [26.7400, 81.0000],
            'hosp-5': [26.8500, 80.9400]
          }[h.id];
          if (coords) {
            const rad = n => n * Math.PI / 180;
            const dLat = rad(coords[0] - position.coords.latitude);
            const dLon = rad(coords[1] - position.coords.longitude);
            const a = Math.sin(dLat/2)**2 + Math.cos(rad(position.coords.latitude))*Math.cos(rad(coords[0]))*Math.sin(dLon/2)**2;
            h.calculatedDistanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          }
        });
        this.renderHospitalsList();
        if (btn) btn.disabled = false;
        this.closeLocalityModal();
        alert('Distances refreshed using your device location (approximate straight-line distances).');
      }, error => {
        if (btn) btn.disabled = false;
        const m = document.getElementById('locality-modal');
        if (m) m.classList.remove('hidden');
        if (error.code === 1) console.info('Location permission denied; choose a locality manually.');
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else {
      const m = document.getElementById('locality-modal');
      if (m) m.classList.remove('hidden');
    }
  }

  closeLocalityModal() {
    const m = document.getElementById('locality-modal');
    if (m) m.classList.add('hidden');
  }

  // ----------------------------------------------------
  // ACCESSIBILITY TOOLBAR & INTERNATIONALIZATION
  // ----------------------------------------------------
  setLanguage(lang) {
    this.lang = lang;
    this.updateLanguageUI();
    this.renderSymptomChips();
    this.renderHospitalsList();
    this.renderBloodBanksList();
    this.renderAdminAppointments();
    this.renderLocalityOptions();
  }

  updateLanguageUI() {
    const btnEn = document.getElementById('lang-btn-en');
    const btnHi = document.getElementById('lang-btn-hi');

    if (btnEn && btnHi) {
      if (this.lang === 'hi') {
        btnHi.className = "px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 shadow-sm";
        btnEn.className = "px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white";
      } else {
        btnEn.className = "px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 shadow-sm";
        btnHi.className = "px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-white";
      }
    }

    // Static text translations
    const elements = document.querySelectorAll('[data-en][data-hi]');
    elements.forEach(el => {
      el.innerText = this.lang === 'hi' ? el.getAttribute('data-hi') : el.getAttribute('data-en');
    });
  }

  setFontSize(size) {
    this.currentFontSize = size;
    document.body.classList.remove('patient-text-sm', 'patient-text-base', 'patient-text-lg', 'patient-text-xl');
    document.body.classList.add(`patient-text-${size}`);

    ['sm', 'base', 'lg'].forEach(s => {
      const btn = document.getElementById(`font-btn-${s}`);
      if (btn) {
        if (s === size) {
          btn.classList.add('bg-cyan-500', 'text-slate-950', 'font-bold');
        } else {
          btn.classList.remove('bg-cyan-500', 'text-slate-950', 'font-bold');
        }
      }
    });
  }

  toggleHighContrast() {
    this.highContrast = !this.highContrast;
    document.body.classList.toggle('high-contrast-mode', this.highContrast);
    const btn = document.getElementById('contrast-toggle-btn');
    if (btn) {
      btn.classList.toggle('bg-amber-400', this.highContrast);
      btn.classList.toggle('text-black', this.highContrast);
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'space' ? 'light' : 'space';
    document.body.classList.toggle('theme-light', this.currentTheme === 'light');
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.innerText = this.currentTheme === 'space' ? '🌌' : '☀️';
    }
  }

  toggleVoiceNarration() {
    this.sound.voiceEnabled = !this.sound.voiceEnabled;
    const btn = document.getElementById('voice-narration-btn');
    const label = document.getElementById('voice-narration-text');
    if (btn && label) {
      if (this.sound.voiceEnabled) {
        btn.classList.add('text-cyan-300');
        label.innerText = this.lang === 'hi' ? 'आवाज़: चालू' : 'Voice: ON';
      } else {
        btn.classList.remove('text-cyan-300');
        label.innerText = this.lang === 'hi' ? 'आवाज़: बंद' : 'Voice: OFF';
        this.sound.stopSpeaking();
      }
    }
  }

  setVoiceTone(tone) {
    this.sound.setTone(tone);
    const label = document.getElementById('voice-tone-text');
    if (label) {
      if (tone === 'sweet') label.innerText = "🌸 Sweet";
      else if (tone === 'slow') label.innerText = "👵 Slow";
      else label.innerText = "🎙️ Standard";
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  const app = new AkesaApp();
  window.app = app;
  app.init();
});
