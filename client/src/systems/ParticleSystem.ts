export class ParticleSystem {
  constructor(private limit: number) {}
  emit(x: number, y: number, color: string) { /* emit */ }
  update(dt: number) { /* update */ }
  render(ctx: CanvasRenderingContext2D) { /* render */ }
}
