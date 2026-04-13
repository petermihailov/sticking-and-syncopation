export interface NoteEvent {
  readonly type: 'snare' | 'kick' | 'footHH' | 'rest'
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

export interface Voice {
  readonly groups: readonly NoteGroup[]
  readonly stem: 'up' | 'down'
  readonly duration?: '4' | '8' | '16'
}

export interface NotationData {
  readonly timeSignature: { readonly top: number; readonly bottom: number }
  readonly baseDuration: '4' | '8' | '16'
  readonly voices: readonly Voice[]
  readonly repeat: boolean
}
