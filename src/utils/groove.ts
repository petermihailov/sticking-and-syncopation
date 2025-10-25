import type { Bar, Instrument, Group, Hand, StickingMapping } from '../types/instrument';
import { DEFAULT_STICKING_MAPPING } from '../types/instrument';
import type { Sticking } from '../types';

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
 * - 'R' (uppercase) = Regular right hand (configurable, no pitch shift)
 * - 'L' (uppercase) = Regular left hand (configurable, no pitch shift)
 * - 'r' (lowercase) = Ghost notes with right hand (configurable, slightly higher pitch)
 * - 'l' (lowercase) = Ghost notes with left hand (configurable, slightly lower pitch)
 * - 'k' = Kick drum (configurable, no pitch shift)
 * - ' ' (space) = Pause (no sound)
 *
 * @param stickings - Array of Sticking symbols
 * @param mapping - Optional instrument mapping (uses default if not provided)
 * @returns Bar object ready for Player with hand information for pitch shifting
 */
export function stickingToBar(stickings: Sticking[], mapping: StickingMapping = DEFAULT_STICKING_MAPPING): Bar {
  const rhythm: Instrument[][] = [];
  const stickingSymbols: Sticking[] = [];
  const hands: Hand[] = [];

  stickings.forEach((char) => {
    const instruments: Instrument[] = [];
    let hand: Hand = null;

    // Save the sticking symbol for rotation
    stickingSymbols.push(char);

    // Map sticking to instrument and hand based on mapping
    // For rhythm, use the first instrument in the array (for display/fallback)
    if (char === 'R') {
      // Uppercase R = regular right hand (no pitch shift)
      instruments.push(mapping.uppercaseR[0] || 'snSnareRegular');
      // Add optional kick
      if (mapping.uppercaseRKick) {
        instruments.push(mapping.kick[0] || 'kiKickRegular');
      }
      hand = null;
    } else if (char === 'L') {
      // Uppercase L = regular left hand (no pitch shift)
      instruments.push(mapping.uppercaseL[0] || 'snSnareRegular');
      // Add optional kick
      if (mapping.uppercaseLKick) {
        instruments.push(mapping.kick[0] || 'kiKickRegular');
      }
      hand = null;
    } else if (char === 'r') {
      // Lowercase r = ghost with right hand
      instruments.push(mapping.lowercaseR[0] || 'snSnareGhost');
      hand = 'r';
    } else if (char === 'l') {
      // Lowercase l = ghost with left hand
      instruments.push(mapping.lowercaseL[0] || 'snSnareGhost');
      hand = 'l';
    } else if (char === 'k') {
      // Kick (no pitch shift)
      instruments.push(mapping.kick[0] || 'kiKickRegular');
      hand = null;
    } else if (char === ' ') {
      // Space = pause (no instruments, no hand)
      // instruments array stays empty
      hand = null;
    }

    rhythm.push(instruments);
    hands.push(hand);
  });

  // Calculate timeDivision based on pattern length
  // This allows different rudiments to play at correct speeds:
  // - 12 notes = 8th triplets (3 notes per beat)
  // - 16 notes = 16th notes (4 notes per beat)
  // - 24 notes = 16th triplets (6 notes per beat)
  const noteCount = stickings.length;
  const timeDivision = noteCount / 4; // 4 beats in 4/4 time

  return {
    rhythm,
    stickings: stickingSymbols,
    hands,
    beatsPerBar: 4, // 4/4 time
    noteValue: 4, // Quarter notes
    timeDivision, // Dynamically calculated based on note count
  };
}

/**
 * Convert multiple sticking patterns to multiple bars
 * @param stickingPatterns - Array of sticking arrays
 * @param mapping - Optional instrument mapping (uses default if not provided)
 * @returns Array of Bar objects
 */
export function stickingsToBars(stickingPatterns: Sticking[][], mapping?: StickingMapping): Bar[] {
  return stickingPatterns.map((pattern) => stickingToBar(pattern, mapping));
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
