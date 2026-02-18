/**
 * NeonRenderer - Utilitaires de rendu néon
 */
export class NeonRenderer {
  static COLORS = {
    CYAN: '#00f0ff',
    MAGENTA: '#ff00ff',
    YELLOW: '#ffff00',
    GREEN: '#00ff88',
    RED: '#ff2d7b'
  };

  constructor(private ctx: CanvasRenderingContext2D, private width: number, private height: number) {}

  drawGlowRect(x: number, y: number, w: number, h: number, color: string, blur: number = 10) {
    this.ctx.save();
    this.ctx.shadowBlur = blur;
    this.ctx.shadowColor = color;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  }
}
