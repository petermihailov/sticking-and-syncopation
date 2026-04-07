/**
 * Отслеживает активные open-hat source-ноды, чтобы оборвать их
 * при следующем close hi-hat ударе.
 *
 * Для остановки всего плеера использовать AudioEngine.silence().
 */
export class BufferManager {
  private hiHatBuffers: AudioBufferSourceNode[] = []

  addHiHatBuffer(buffer: AudioBufferSourceNode): void {
    this.hiHatBuffers.push(buffer)
  }

  /**
   * Остановить все открытые hi-hat в заданное время (close-удар).
   */
  stopHiHatBuffers(time: number): void {
    this.hiHatBuffers.forEach(buffer => {
      try {
        buffer.stop(time)
      } catch {
        // уже остановлен — игнор
      }
    })
    this.hiHatBuffers = []
  }

  clearAll(): void {
    this.hiHatBuffers = []
  }
}
