/**
 * AKESA AI Healthcare Assistant — Cute Interactive Robot Mascot Controller
 */

class RobotMascotController {
  constructor(soundEngine) {
    this.sound = soundEngine;
    this.currentState = 'idle';
    this.container = document.getElementById('robot-mascot-container');
    this.mouth = document.getElementById('robot-mouth');
    this.visorWaves = document.getElementById('visor-speech-waves');
    this.beacon = document.getElementById('antenna-beacon');
    this.eyes = document.getElementById('robot-eyes');
    this.moodText = document.getElementById('mascot-mood-text');
    this.moodIcon = document.getElementById('mascot-mood-icon');
    this.bubbleBar = document.getElementById('bubble-speech-bar');
    this.bubbleText = document.getElementById('mascot-speech-text');

    // Attach speech callbacks
    if (this.sound) {
      this.sound.onSpeechStart = () => this.setState('speaking');
      this.sound.onSpeechEnd = () => this.setState('idle');
    }
  }

  setState(state) {
    this.currentState = state;
    this.mouth = this.mouth || document.getElementById('robot-mouth');
    this.visorWaves = this.visorWaves || document.getElementById('visor-speech-waves');
    this.beacon = this.beacon || document.getElementById('antenna-beacon');
    this.moodText = this.moodText || document.getElementById('mascot-mood-text');
    this.moodIcon = this.moodIcon || document.getElementById('mascot-mood-icon');
    this.bubbleBar = this.bubbleBar || document.getElementById('bubble-speech-bar');

    // Reset base elements
    if (this.mouth) this.mouth.classList.remove('mouth-talking');
    if (this.visorWaves) this.visorWaves.classList.add('opacity-0');
    if (this.bubbleBar) this.bubbleBar.classList.add('hidden');

    switch (state) {
      case 'speaking':
        if (this.mouth) this.mouth.classList.add('mouth-talking');
        if (this.visorWaves) this.visorWaves.classList.remove('opacity-0');
        if (this.bubbleBar) this.bubbleBar.classList.remove('hidden');
        if (this.beacon) this.beacon.setAttribute('fill', '#22d3ee');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'बोल रही हूँ...' : 'Speaking...';
        if (this.moodIcon) this.moodIcon.innerText = '🔊';
        break;

      case 'listening':
        if (this.beacon) this.beacon.setAttribute('fill', '#34d399');
        if (this.visorWaves) this.visorWaves.classList.remove('opacity-0');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'सुन रही हूँ...' : 'Listening to you...';
        if (this.moodIcon) this.moodIcon.innerText = '🎙️';
        break;

      case 'thinking':
        if (this.beacon) this.beacon.setAttribute('fill', '#f59e0b');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'सोच रही हूँ...' : 'Analyzing symptoms...';
        if (this.moodIcon) this.moodIcon.innerText = '⚡';
        break;

      case 'happy':
      case 'success':
        if (this.mouth) this.mouth.setAttribute('d', 'M 110 102 Q 120 116 130 102');
        if (this.beacon) this.beacon.setAttribute('fill', '#10b981');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'सफल मार्गदर्शन!' : 'Guidance Ready!';
        if (this.moodIcon) this.moodIcon.innerText = '✨';
        if (window.confetti) {
          try {
            window.confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
          } catch (e) {}
        }
        setTimeout(() => this.setState('idle'), 3000);
        break;

      case 'emergency':
        if (this.beacon) this.beacon.setAttribute('fill', '#ef4444');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'आपातकाल अलर्ट!' : 'Emergency Alert!';
        if (this.moodIcon) this.moodIcon.innerText = '🚨';
        break;

      case 'idle':
      default:
        if (this.mouth) this.mouth.setAttribute('d', 'M 112 104 Q 120 110 128 104');
        if (this.beacon) this.beacon.setAttribute('fill', '#06b6d4');
        if (this.moodText) this.moodText.innerText = (window.app && window.app.lang === 'hi') ? 'मदद के लिए तैयार' : 'Ready to Guide';
        if (this.moodIcon) this.moodIcon.innerText = '🩺';
        break;
    }
  }

  // Interactive Mascot Tap Reaction
  react() {
    this.sound.initAudio();
    this.sound.playSuccessChime();

    const isHi = window.app && window.app.lang === 'hi';
    const cheersEn = [
      "Hello! I am Dr. Akesa. Click any symptom below or speak to me!",
      "Feeling unwell? Don't worry, you are in safe hands. Let me guide you to the right department.",
      "Need blood urgently or looking for an OPD room? I have all verified Lucknow records ready!",
      "Tip: You can use our 1800 Voice Helpline simulator in 9 different Indian languages!"
    ];

    const cheersHi = [
      "नमस्ते! मैं डॉक्टर आकेसा हूँ। नीचे दिए गए किसी भी लक्षण पर क्लिक करें या मुझसे बोलकर पूछें!",
      "तबीयत ठीक नहीं है? घबराइए मत, मैं आपको सही ओपीडी रूम और डॉक्टर तक पहुँचाऊँगी।",
      "रक्त की आवश्यकता है या ओपीडी पर्चा चाहिए? लखनऊ के सभी सत्यापित अस्पतालों की जानकारी तैयार है।",
      "सुझाव: आप हमारा 1800 हेल्पलाइन सिम्युलेटर 9 अलग-अलग भारतीय भाषाओं में सुन सकते हैं!"
    ];

    const pool = isHi ? cheersHi : cheersEn;
    const msg = pool[Math.floor(Math.random() * pool.length)];

    this.bubbleText = this.bubbleText || document.getElementById('mascot-speech-text');
    if (this.bubbleText) {
      this.bubbleText.innerText = `"${msg}"`;
    }

    if (this.sound && this.sound.voiceEnabled) {
      this.sound.speak(msg, isHi ? 'hi' : 'en');
    }
  }
}

window.RobotMascotController = RobotMascotController;
