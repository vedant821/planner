// Web Audio API ambient generator and alert sound synth
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play pleasant chime on Pomodoro completion
export function playChime(type: 'success' | 'alert' | 'start' = 'success') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // 3-note harmonic arpeggio: C5 -> E5 -> G5
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.15);
      osc.frequency.setValueAtTime(783.99, now + 0.3);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.start(now);
      osc.stop(now + 0.9);
    } else if (type === 'start') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.setValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    console.debug('Audio chime could not play:', e);
  }
}

// Ambient noise generator (White noise / Soft rain generator)
let ambientNode: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function startAmbientSound(mode: 'rain' | 'whitenoise' | 'binaural', volume = 0.15) {
  stopAmbientSound();
  try {
    const ctx = getAudioContext();
    ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(Math.min(0.3, volume), ctx.currentTime);
    ambientGain.connect(ctx.destination);

    if (mode === 'binaural') {
      // Gentle 432Hz alpha wave tone with slight detune
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(216, ctx.currentTime);
      osc2.frequency.setValueAtTime(226, ctx.currentTime); // 10Hz alpha differential

      osc1.connect(ambientGain);
      osc2.connect(ambientGain);
      osc1.start();
      osc2.start();
      ambientNode = osc1;
    } else {
      // Buffer noise generator with low-pass filtering for gentle rain/pink noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink noise filter approximation
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 3.5;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(mode === 'rain' ? 800 : 1200, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(ambientGain);
      whiteNoise.start();
      ambientNode = whiteNoise;
    }
  } catch (err) {
    console.debug('Failed to start ambient sound:', err);
  }
}

export function stopAmbientSound() {
  try {
    if (ambientNode) {
      (ambientNode as any).stop?.();
      ambientNode.disconnect();
      ambientNode = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch (err) {
    // Ignore cleanup error
  }
}
