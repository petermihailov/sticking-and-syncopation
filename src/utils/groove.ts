import type { Bar, Instrument, Group, Hand } from '../types/instrument';

/**
 * Get instruments to play at a specific rhythm index in a bar
 * @param bar - The bar containing rhythm data
 * @param rhythmIndex - Index of the subdivision to get (0-based)
 * @param muted - Array of instrument groups that should be muted
 * @returns Array of instruments to play at this subdivision
 */
export function getInstrumentsByIndex(
  bar: Bar,
  rhythmIndex: number,
  muted: Group[] = []
): Instrument[] {
  // Safety check: return empty array if bar is undefined or invalid
  if (!bar || !bar.rhythm || !Array.isArray(bar.rhythm)) {
    console.warn('Invalid bar provided to getInstrumentsByIndex');
    return [];
  }

  const instruments = bar.rhythm[rhythmIndex] || [];

  // Filter out muted instruments
  return instruments.filter((instrument) => {
    // Extract group prefix (first 2 characters, e.g., 'hh' from 'hhCloseRegular')
    const group = instrument.substring(0, 2) as Group;
    return !muted.includes(group);
  });
}

/**
 * Convert sticking pattern to Bar format for Player
 * Maps sticking notation to drum instruments:
 * - 'R', 'L' (uppercase) = Regular hits on snare (no pitch shift)
 * - 'r' (lowercase) = Ghost notes with right hand (slightly higher pitch)
 * - 'l' (lowercase) = Ghost notes with left hand (slightly lower pitch)
 * - 'k' = Kick drum (no pitch shift)
 *
 * @param stickings - String of stickings (e.g., 'RlrrLrll')
 * @returns Bar object ready for Player with hand information for pitch shifting
 */
export function stickingToBar(stickings: string): Bar {
  const rhythm: Instrument[][] = [];
  const hands: Hand[] = [];

  // Split sticking string into individual characters, filtering out spaces
  const chars = stickings.split('').filter(char => char !== ' ');

  chars.forEach((char) => {
    const instruments: Instrument[] = [];
    let hand: Hand = null;

    // Map sticking to instrument and hand
    if (char === 'R' || char === 'L') {
      // Uppercase = regular (no pitch shift)
      instruments.push('snSnareRegular');
      hand = null;
    } else if (char === 'r') {
      // Lowercase r = ghost with right hand
      instruments.push('snSnareGhost');
      hand = 'r';
    } else if (char === 'l') {
      // Lowercase l = ghost with left hand
      instruments.push('snSnareGhost');
      hand = 'l';
    } else if (char === 'k') {
      // Kick (no pitch shift)
      instruments.push('kiKickRegular');
      hand = null;
    }

    rhythm.push(instruments);
    hands.push(hand);
  });

  // Create bar with 4/4 time signature, 16th note subdivisions
  return {
    rhythm,
    hands,
    beatsPerBar: 4, // 4/4 time
    noteValue: 4, // Quarter notes
    timeDivision: 4, // 4 subdivisions per beat = 16th notes
  };
}

/**
 * Convert multiple sticking patterns to multiple bars
 * @param stickingPatterns - Array of sticking strings
 * @returns Array of Bar objects
 */
export function stickingsToBars(stickingPatterns: string[]): Bar[] {
  return stickingPatterns.map((pattern) => stickingToBar(pattern));
}

/**
 * Helper to check if an instrument belongs to a specific group
 * @param instrument - Instrument name
 * @param group - Group to check
 * @returns true if instrument belongs to the group
 */
export function instrumentBelongsToGroup(instrument: Instrument, group: Group): boolean {
  return instrument.startsWith(group);
}
