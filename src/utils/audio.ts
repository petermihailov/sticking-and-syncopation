import type { DrumKit, Instrument } from '../types/instrument';

// Singleton AudioContext instance
let audioContext: AudioContext | null = null;

/**
 * Get or create the singleton AudioContext instance
 * This ensures we only have one AudioContext throughout the application
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Load a single sound file and decode it into an AudioBuffer
 * @param url - Path to the sound file (e.g., '/sounds/hhCloseRegular.mp3')
 * @returns Promise<AudioBuffer>
 */
export async function loadSound(url: string): Promise<AudioBuffer> {
  const ctx = getAudioContext();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sound: ${url} (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    return audioBuffer;
  } catch (error) {
    console.error(`Error loading sound ${url}:`, error);
    throw error;
  }
}

/**
 * Load all drum sounds and create a DrumKit
 * Sounds are expected to be in the public/sounds/ directory
 * @param basePath - Base path for sound files (default: '/sticking-and-syncopation/sounds/')
 * @param extension - File extension (default: 'mp3', can use 'wav' for development)
 * @returns Promise<DrumKit> - Dictionary of instrument names to AudioBuffers
 */
export async function createDrumKit(
  basePath: string = '/sticking-and-syncopation/sounds/',
  extension: string = 'mp3'
): Promise<DrumKit> {
  // List of all instrument sound files
  const instruments: Instrument[] = [
    // Cymbals
    'cyBellRegular',
    'cyChinaRegular',
    'cyCowbellRegular',
    'cyCrashRegular',
    'cyEdgeRegular',
    'cyRideRegular',
    'cySplashRegular',
    'cyTrashRegular',
    // Hi-hat
    'hhCloseGhost',
    'hhCloseRegular',
    'hhOpenRegular',
    // Kick
    'kiHhFootRegular',
    'kiKickRegular',
    // Snare
    'snRimRegular',
    'snSnareGhost',
    'snSnareRegular',
    // Toms
    't1HighRegular',
    't2MidRegular',
    't3LowRegular',
    // Metronome
    'fxMetronomeAccent',
    'fxMetronomeRegular',
  ];

  const kit: DrumKit = {};

  // Load all sounds in parallel
  const loadPromises = instruments.map(async (instrument) => {
    const url = `${basePath}${instrument}.${extension}`;
    try {
      const buffer = await loadSound(url);
      kit[instrument] = buffer;
    } catch (error) {
      console.warn(`Failed to load ${instrument}.${extension}:`, error);
      // Don't throw, just skip this instrument
    }
  });

  await Promise.all(loadPromises);

  const loadedCount = Object.keys(kit).length;
  console.log(`DrumKit loaded: ${loadedCount}/${instruments.length} sounds`);

  return kit;
}

/**
 * Resume AudioContext if it's suspended (browser autoplay policy)
 * Call this in response to user interaction (click, touch, etc.)
 */
export function resumeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}
