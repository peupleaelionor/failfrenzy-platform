export class ComboSystem {
  private combo: number = 0;
  add() { this.combo++; }
  reset() { this.combo = 0; }
  get() { return this.combo; }
}
