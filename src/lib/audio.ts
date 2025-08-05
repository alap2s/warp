// src/lib/audio.ts
import type * as Tone from 'tone';

// --- State ---
let isInitialized = false;
let ToneJs: typeof Tone | null = null;

// --- Synths and Effects (initially null) ---
let chimeSynth: Tone.PolySynth | null = null;
let powerUpSynth: Tone.Synth | null = null;
let notificationSynth: Tone.MembraneSynth | null = null;
let dialogSynth: Tone.Synth | null = null;
let joinSynth: Tone.DuoSynth | null = null;

/**
 * Dynamically imports Tone.js and creates all synthesizers and effects.
 * This MUST be called after the first user gesture.
 */
export const initAudio = async () => {
  // Ensure this function only runs once.
  if (isInitialized) return;

  // Dynamically import the Tone.js library
  const ToneModule = await import('tone');
  ToneJs = ToneModule;

  await ToneJs.start();
  if (ToneJs.context.state !== 'running') {
    console.error('Audio context failed to start.');
    return;
  }

  // --- Effects Setup ---
  const reverb = new ToneJs.Reverb({ decay: 1.5, wet: 0.4 }).toDestination();
  const chorus = new ToneJs.Chorus(4, 2.5, 0.5).connect(reverb);
  const pingPongDelay = new ToneJs.PingPongDelay("8n", 0.4).connect(reverb);
  const vibrato = new ToneJs.Vibrato(8, 0.2).connect(reverb);

  // --- Synthesis Setup ---
  chimeSynth = new ToneJs.PolySynth(ToneJs.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.4 },
  }).connect(chorus);

  powerUpSynth = new ToneJs.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
  }).connect(reverb);

  dialogSynth = new ToneJs.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.2 },
  }).connect(reverb);

  notificationSynth = new ToneJs.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 10,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
  }).connect(pingPongDelay);
  
  joinSynth = new ToneJs.DuoSynth({
      vibratoAmount: 0.1,
      vibratoRate: 5,
      harmonicity: 1.5,
      voice0: {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1 },
          filterEnvelope: { attack: 0.01, decay: 0.02, sustain: 0, release: 0.1, baseFrequency: 200, octaves: 7 }
      },
      voice1: {
          oscillator: { type: 'sine' },
          envelope: { attack: 0.01, decay: 0.05, sustain: 0.2, release: 0.1 },
          filterEnvelope: { attack: 0.01, decay: 0.02, sustain: 0, release: 0.1, baseFrequency: 200, octaves: 7 }
      }
  }).connect(vibrato);

  isInitialized = true;
  console.log('Audio system initialized successfully.');
};


// --- Sound Functions ---

export const playAppOpen = () => {
  if (!isInitialized || !chimeSynth || !ToneJs) return;
  chimeSynth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
};

export const playCreateWarp = () => {
  if (!isInitialized || !powerUpSynth || !ToneJs) return;
  const now = ToneJs.now();
  powerUpSynth.triggerAttackRelease('C5', '16n', now);
  powerUpSynth.triggerAttackRelease('E5', '16n', now + 0.05);
  powerUpSynth.triggerAttackRelease('G5', '16n', now + 0.1);
  powerUpSynth.triggerAttackRelease('C6', '16n', now + 0.15);
};

export const playDeleteWarp = () => {
	if (!isInitialized || !powerUpSynth || !ToneJs) return;
	const now = ToneJs.now();
	powerUpSynth.triggerAttackRelease('C6', '8n', now);
	powerUpSynth.triggerAttackRelease('G5', '8n', now + 0.15);
	powerUpSynth.triggerAttackRelease('E5', '8n', now + 0.3);
	powerUpSynth.triggerAttackRelease('C5', '8n', now + 0.45);
  };

export const playDialogSound = (action: 'open' | 'close') => {
  if (!isInitialized || !dialogSynth || !ToneJs) return;
  const note = action === 'open' ? 'C4' : 'G3';
  dialogSynth.triggerAttackRelease(note, '8n');
};

export const playNotification = () => {
  if (!isInitialized || !notificationSynth) return;
  notificationSynth.triggerAttackRelease("A5", "16n");
};

export const playJoinWarp = () => {
    if (!isInitialized || !joinSynth || !ToneJs) return;
    const now = ToneJs.now();
    joinSynth.triggerAttackRelease('C4', '16n', now);
    joinSynth.triggerAttackRelease('E4', '16n', now + 0.1);
    joinSynth.triggerAttackRelease('A4', '8n', now + 0.2);
};

export const playUnjoinWarp = () => {
    if (!isInitialized || !joinSynth || !ToneJs) return;
    const now = ToneJs.now();
    joinSynth.triggerAttackRelease('A4', '16n', now);
    joinSynth.triggerAttackRelease('E4', '16n', now + 0.1);
    joinSynth.triggerAttackRelease('C4', '8n', now + 0.2);
};
