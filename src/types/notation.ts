export type PlayableType = 'snare' | 'kick' | 'footHH'

export interface NoteEvent {
  readonly type: PlayableType | 'rest'
  readonly accent: boolean
  readonly ghost: boolean
  readonly flam: boolean
  readonly index: number
}

export interface NoteGroup {
  readonly notes: readonly NoteEvent[]
  readonly tuplet?: { readonly actual: number; readonly normal: number }
  readonly duration?: '1' | '2' | '4' | '8' | '16'
}

export interface VoiceData {
  readonly groups: readonly NoteGroup[]
  readonly stem: 'up' | 'down'
}

export interface NotationData {
  readonly timeSignature: { readonly top: number; readonly bottom: number }
  readonly baseDuration: '4' | '8' | '16'
  readonly voices: readonly VoiceData[]
  readonly repeat: boolean
}
