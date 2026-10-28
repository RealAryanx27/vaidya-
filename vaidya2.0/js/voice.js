/**
 * AKESA AI Healthcare Assistant — Voice & Audio Synthesis Engine
 * 
 * Special features:
 * - Sweet, calming & mesmerizing patient voice profile
 * - Bilingual (Hindi / English) + Multi-language 1800 Helpline IVR playback
 * - Web Audio API procedural synthesizer for medical chimes & DTMF phone tones
 * - Audio-to-mascot visualizer synchronization
 */

class VoiceAndSoundEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.voiceEnabled = true;
    this.voiceTone = 'sweet'; // 'sweet' (default mesmerizing) | 'standard' | 'slow'
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.voices = [];
    this.onSpeechStart = null;
    this.onSpeechEnd = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  // Find the sweetest, most natural, reassuring voice available on the patient's device
  getBestVoice(lang = 'en') {
    if (!this.voices || this.voices.length === 0) {
      this.loadVoices();
    }
    const voices = this.voices;
    const l = (lang || 'en').toLowerCase();

    if (l === 'hi' || l.startsWith('hi')) {
      // 1. Prioritize sweet, natural Hindi feminine voices
      const sweetHi = voices.find(v => {
        const n = v.name.toLowerCase();
        return (v.lang.startsWith('hi') || n.includes('hindi')) &&
               (n.includes('natural') || n.includes('swara') || n.includes('kalpana') || n.includes('heera') || n.includes('female'));
      });
      if (sweetHi) return sweetHi;

      // 2. Any Hindi voice
      const anyHi = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (anyHi) return anyHi;

      // 3. Indian English fallback with natural accent
      const enIn = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
      if (enIn) return enIn;
    } else if (l === 'ur') {
      const ur = voices.find(v => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu'));
      if (ur) return ur;
      const hi = voices.find(v => v.lang.startsWith('hi'));
      if (hi) return hi;
    } else if (l === 'bn') {
      const bn = voices.find(v => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla'));
      if (bn) return bn;
    } else if (l === 'ta') {
      const ta = voices.find(v => v.lang.startsWith('ta') || v.name.toLowerCase().includes('tamil'));
      if (ta) return ta;
    } else if (l === 'te') {
      const te = voices.find(v => v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu'));
      if (te) return te;
    } else if (l === 'pa') {
      const pa = voices.find(v => v.lang.startsWith('pa') || v.name.toLowerCase().includes('punjabi'));
      if (pa) return pa;
    } else {
      // English: search for soothing, clear, sweet English female voices
      const sweetEn = voices.find(v => {
        const n = v.name.toLowerCase();
        return (n.includes('natural') || n.includes('uk english female') || n.includes('zira') || n.includes('jenny') || n.includes('samantha') || n.includes('aria')) &&
               (v.lang.startsWith('en'));
      });
      if (sweetEn) return sweetEn;

      const enIn = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'));
      if (enIn) return enIn;

      const anyEn = voices.find(v => v.lang.startsWith('en'));
      if (anyEn) return anyEn;
    }

    return null;
  }

  // Clean Markdown & format text so synthesized speech sounds natural & pleasant
  cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      .replace(/[*#_~`]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/₹\s*(\d+)/g, '$1 rupees')
      .replace(/([0-9]+)\s*km/gi, '$1 kilometers')
      .replace(/OPD/gi, 'O P D')
      .replace(/KGMU/gi, 'K G M U')
      .replace(/RMLIMS|RML/gi, 'R M L Hospital')
      .replace(/SGPGIMS|SGPGI/gi, 'S G P G I')
      .replace(/PM-JAY|PMJAY/gi, 'Pradhan Mantri Jan Arogya Yojana')
      .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();
  }

  // Play soothing harmonic introductory chime
  playSoothingChime() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Soft, gentle C5 + G5 harmonic chord
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + (idx * 0.04));
        gain.gain.setValueAtTime(0.001, now + (idx * 0.04));
        gain.gain.exponentialRampToValueAtTime(0.04, now + (idx * 0.04) + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx * 0.04) + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + (idx * 0.04));
        osc.stop(now + (idx * 0.04) + 0.5);
      });
    } catch (e) {
      console.warn("Audio chime error:", e);
    }
  }

  // Play Dialpad DTMF tone for phone simulator
  playDtmfTone(key) {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.ctx) return;

    const dtmfFreqs = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
    };

    const pair = dtmfFreqs[key] || [440, 440];
    const now = this.ctx.currentTime;

    pair.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    });
  }

  // Play Success Confirmation Chime
  playSuccessChime() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startT = now + (idx * 0.09);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);
      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.exponentialRampToValueAtTime(0.06, startT + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.38);
    });
  }

  // Play Emergency Alert Tone
  playEmergencyAlarm() {
    if (!this.soundEnabled) return;
    this.initAudio();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  // Speak aloud with sweet, patient-centric voice
  speak(text, lang = 'en', onComplete = null) {
    if (!this.synth || !this.voiceEnabled) return;
    const clean = this.cleanTextForSpeech(text);
    if (!clean) return;

    this.stopSpeaking();
    this.playSoothingChime();

    const utterance = new SpeechSynthesisUtterance(clean);
    
    // Set appropriate language tag
    if (lang === 'hi' || lang === 'awa' || lang === 'bho') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'ur') {
      utterance.lang = 'ur-IN';
    } else if (lang === 'awa' || lang === 'bho') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'bn') {
      utterance.lang = 'bn-IN';
    } else if (lang === 'ta') {
      utterance.lang = 'ta-IN';
    } else if (lang === 'te') {
      utterance.lang = 'te-IN';
    } else if (lang === 'pa') {
      utterance.lang = 'pa-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    const voice = this.getBestVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    // Voice tuning based on selected tone
    if (this.voiceTone === 'sweet') {
      utterance.pitch = 1.10; // Melodious & warm
      utterance.rate = (lang === 'hi' || lang === 'awa' || lang === 'bho') ? 0.90 : 0.94; // Calm, gentle pacing
    } else if (this.voiceTone === 'slow') {
      utterance.pitch = 1.02;
      utterance.rate = 0.80; // Slower for elderly patients
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onSpeechStart) this.onSpeechStart(clean);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onSpeechEnd) this.onSpeechEnd();
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onSpeechEnd) this.onSpeechEnd();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (this.onSpeechEnd) this.onSpeechEnd();
  }

  setTone(tone) {
    this.voiceTone = tone;
  }
}

window.VoiceAndSoundEngine = VoiceAndSoundEngine;
