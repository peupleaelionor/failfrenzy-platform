/**
 * FAIL FRENZY – Renderer Abstraction
 * Provides a unified IRenderer interface backed by either WebGPU or Canvas 2D.
 *
 * Architecture (inspired by wgpu / Bevy renderer):
 *  • IRenderer – draw calls only; no game logic
 *  • Canvas2DRenderer – full implementation using CanvasRenderingContext2D
 *  • WebGPURenderer – real WebGPU pipeline for browsers that support it;
 *    falls back gracefully to Canvas2D at construction time
 *  • createRenderer() – auto-selects the best available backend
 *
 * NOTE: The WebGPU path renders circles as instanced quads via a compute-friendly
 * pipeline. For production, the shader source lives inline as WGSL strings so
 * no additional bundler plugin is required.
 */

// ─── Shared interface ──────────────────────────────────────────────────────────

export interface DrawCircleOptions {
  x: number;
  y: number;
  radius: number;
  color: string;
  /** Optional bloom / glow radius in pixels (0 = no glow). */
  glow?: number;
  glowColor?: string;
  alpha?: number;
}

export interface DrawRectOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  rotation?: number;
  alpha?: number;
}

export interface DrawTextOptions {
  x: number;
  y: number;
  text: string;
  color: string;
  font?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  glow?: number;
  glowColor?: string;
}

export interface IRenderer {
  readonly width: number;
  readonly height: number;
  readonly backendName: string;
  clear(color?: string): void;
  drawCircle(opts: DrawCircleOptions): void;
  drawRect(opts: DrawRectOptions): void;
  drawText(opts: DrawTextOptions): void;
  /** Submit all queued draw calls (no-op for Canvas2D; present for WebGPU). */
  present(): void;
  /** Release GPU resources. */
  destroy(): void;
}

// ─── Canvas 2D Renderer ───────────────────────────────────────────────────────

export class Canvas2DRenderer implements IRenderer {
  readonly backendName = "Canvas2D";
  readonly width: number;
  readonly height: number;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear(color = "#050818"): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawCircle({ x, y, radius, color, glow = 0, glowColor, alpha = 1 }: DrawCircleOptions): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    if (glow > 0) {
      this.ctx.shadowBlur = glow;
      this.ctx.shadowColor = glowColor ?? color;
    }
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawRect({ x, y, width, height, color, rotation = 0, alpha = 1 }: DrawRectOptions): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    if (rotation !== 0) {
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate(rotation);
      this.ctx.fillRect(-width / 2, -height / 2, width, height);
    } else {
      this.ctx.fillRect(x, y, width, height);
    }
    this.ctx.restore();
  }

  drawText({ x, y, text, color, font = "16px monospace", align = "center", baseline = "middle", glow = 0, glowColor }: DrawTextOptions): void {
    this.ctx.save();
    this.ctx.font = font;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    if (glow > 0) {
      this.ctx.shadowBlur = glow;
      this.ctx.shadowColor = glowColor ?? color;
    }
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  }

  present(): void {
    /* Canvas 2D draws immediately – nothing to submit */
  }

  destroy(): void {
    /* No GPU resources to release */
  }
}

// ─── WebGPU Renderer ──────────────────────────────────────────────────────────

/** Minimal WGSL vertex+fragment shader for drawing solid-color circles as quads. */
const CIRCLE_SHADER_WGSL = /* wgsl */ `
struct Uniforms {
  resolution: vec2f,
};

struct Instance {
  @location(0) pos: vec2f,
  @location(1) radius: f32,
  @location(2) color: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
  @location(1) color: vec4f,
};

@vertex
fn vs_main(
  @builtin(vertex_index) vi: u32,
  instance: Instance,
) -> VertexOut {
  // Unit quad [-1,1]
  var quad = array<vec2f, 6>(
    vec2f(-1.0, -1.0), vec2f( 1.0, -1.0), vec2f(-1.0,  1.0),
    vec2f(-1.0,  1.0), vec2f( 1.0, -1.0), vec2f( 1.0,  1.0),
  );
  let q = quad[vi];
  let worldPos = instance.pos + q * instance.radius;
  // NDC
  let ndc = (worldPos / uniforms.resolution) * 2.0 - 1.0;
  var out: VertexOut;
  out.position = vec4f(ndc.x, -ndc.y, 0.0, 1.0);
  out.uv = q;
  out.color = instance.color;
  return out;
}

@fragment
fn fs_main(in: VertexOut) -> @location(0) vec4f {
  let dist = length(in.uv);
  if dist > 1.0 { discard; }
  let aa = 1.0 - smoothstep(0.9, 1.0, dist);
  return vec4f(in.color.rgb, in.color.a * aa);
}
`;

/**
 * WebGPU-backed renderer.
 * Batches circle draw calls into a single instanced draw per frame.
 * Falls back to Canvas2DRenderer if WebGPU is unavailable.
 */
export class WebGPURenderer implements IRenderer {
  readonly backendName = "WebGPU";
  readonly width: number;
  readonly height: number;

  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private bindGroup: GPUBindGroup | null = null;
  private instanceData: Float32Array;
  private instanceBuffer: GPUBuffer | null = null;
  private instanceCount = 0;
  private readonly MAX_INSTANCES = 4096;

  /** Fallback used until the async init completes. */
  private fallback: Canvas2DRenderer;
  private ready = false;

  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.fallback = new Canvas2DRenderer(canvas);
    // Instance buffer layout (8 floats × 4 bytes = 32 bytes per instance):
    //   offset  0: pos.x  (float32)
    //   offset  4: pos.y  (float32)
    //   offset  8: radius (float32)
    //   offset 12: pad    (float32) – required for vec4 alignment in WGSL structs
    //   offset 16: color.r (float32)
    //   offset 20: color.g (float32)
    //   offset 24: color.b (float32)
    //   offset 28: color.a (float32)
    this.instanceData = new Float32Array(this.MAX_INSTANCES * 8);
    this.initAsync(canvas).catch((err) => {
      console.warn("[WebGPURenderer] Init failed, using Canvas2D fallback:", err);
    });
  }

  private async initAsync(canvas: HTMLCanvasElement): Promise<void> {
    const gpu = navigator.gpu;
    if (!gpu) throw new Error("WebGPU not supported");

    const adapter = await gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) throw new Error("No WebGPU adapter found");

    this.device = await adapter.requestDevice();
    this.context = canvas.getContext("webgpu") as GPUCanvasContext;
    if (!this.context) throw new Error("Could not get WebGPU context");

    const format = gpu.getPreferredCanvasFormat();
    this.context.configure({ device: this.device, format, alphaMode: "opaque" });

    const shaderModule = this.device.createShaderModule({ code: CIRCLE_SHADER_WGSL });

    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [{
          arrayStride: 32, // 8 floats × 4 bytes
          stepMode: "instance",
          attributes: [
            { shaderLocation: 0, offset: 0,  format: "float32x2" }, // pos
            { shaderLocation: 1, offset: 8,  format: "float32"   }, // radius
            // offset 12 = pad
            { shaderLocation: 2, offset: 16, format: "float32x4" }, // color
          ],
        }],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format, blend: { color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha", operation: "add" }, alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha", operation: "add" } } }],
      },
      primitive: { topology: "triangle-list" },
    });

    // Uniform buffer: resolution vec2 + padding
    this.uniformBuffer = this.device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    this.device.queue.writeBuffer(this.uniformBuffer, 0, new Float32Array([this.width, this.height, 0, 0]));

    this.instanceBuffer = this.device.createBuffer({
      size: this.instanceData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.bindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });

    this.ready = true;
  }

  clear(color = "#050818"): void {
    if (!this.ready) { this.fallback.clear(color); return; }
    this.instanceCount = 0;
  }

  drawCircle(opts: DrawCircleOptions): void {
    if (!this.ready) { this.fallback.drawCircle(opts); return; }
    if (this.instanceCount >= this.MAX_INSTANCES) return;

    const { x, y, radius, color, alpha = 1 } = opts;
    const [r, g, b] = WebGPURenderer.hexToRgb(color);
    const base = this.instanceCount * 8;
    this.instanceData[base]     = x;
    this.instanceData[base + 1] = y;
    this.instanceData[base + 2] = radius;
    this.instanceData[base + 3] = 0; // pad
    this.instanceData[base + 4] = r;
    this.instanceData[base + 5] = g;
    this.instanceData[base + 6] = b;
    this.instanceData[base + 7] = alpha;
    this.instanceCount++;
  }

  drawRect(opts: DrawRectOptions): void {
    if (!this.ready) { this.fallback.drawRect(opts); return; }
    // For now delegate rects to the fallback (quads need a separate pipeline)
    this.fallback.drawRect(opts);
  }

  drawText(opts: DrawTextOptions): void {
    // Text always uses Canvas 2D overlay
    this.fallback.drawText(opts);
  }

  present(): void {
    if (!this.ready || !this.device || !this.context || !this.pipeline || !this.instanceBuffer || !this.bindGroup) return;
    if (this.instanceCount === 0) return;

    this.device.queue.writeBuffer(this.instanceBuffer, 0, this.instanceData, 0, this.instanceCount * 8);

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: this.context.getCurrentTexture().createView(),
        clearValue: { r: 0.02, g: 0.03, b: 0.09, a: 1 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.bindGroup);
    pass.setVertexBuffer(0, this.instanceBuffer);
    pass.draw(6, this.instanceCount);
    pass.end();
    this.device.queue.submit([encoder.finish()]);
  }

  destroy(): void {
    this.device?.destroy();
    this.device = null;
  }

  private static hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16 & 0xff) / 255, (n >> 8 & 0xff) / 255, (n & 0xff) / 255];
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Create the best available renderer for the given canvas.
 * WebGPU is used when `navigator.gpu` is defined; otherwise Canvas 2D.
 */
export async function createRenderer(canvas: HTMLCanvasElement): Promise<IRenderer> {
  if ("gpu" in navigator && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return new WebGPURenderer(canvas);
    } catch {
      console.warn("[Renderer] WebGPU probe failed, falling back to Canvas2D");
    }
  }
  return new Canvas2DRenderer(canvas);
}
