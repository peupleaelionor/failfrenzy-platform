/**
 * FAIL FRENZY – ECS World
 * Entity-Component-System registry with typed ComponentStores and object pooling.
 *
 * Design goals (open-source patterns fused from Excalibur.js + EnTT concepts):
 *  • Zero allocations during steady state – entities reused from a free-list
 *  • Typed component stores – no Map<string, any>, full TypeScript inference
 *  • O(1) entity create/destroy
 *  • Simple archetype-free query that covers 95 % of game use-cases
 */

// ─── Component stores ─────────────────────────────────────────────────────────

export class ComponentStore<T> {
  private readonly data = new Map<number, T>();

  get(entityId: number): T | undefined {
    return this.data.get(entityId);
  }

  set(entityId: number, component: T): void {
    this.data.set(entityId, component);
  }

  remove(entityId: number): void {
    this.data.delete(entityId);
  }

  has(entityId: number): boolean {
    return this.data.has(entityId);
  }

  forEach(cb: (entityId: number, component: T) => void): void {
    this.data.forEach((comp, id) => cb(id, comp));
  }

  get size(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }
}

// ─── Built-in component types ─────────────────────────────────────────────────

export interface PositionComponent {
  x: number;
  y: number;
}

export interface VelocityComponent {
  vx: number;
  vy: number;
}

export type RenderableType = "player" | "obstacle" | "star" | "particle" | "projectile" | "powerup";

export interface RenderableComponent {
  type: RenderableType;
  radius: number;
  color: string;
  /** Optional secondary glow color for neon effects */
  glow?: string;
  visible: boolean;
}

export interface HealthComponent {
  hp: number;
  maxHp: number;
}

export interface TagComponent {
  tags: Set<string>;
}

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface Entity {
  id: number;
  active: boolean;
}

// ─── World ────────────────────────────────────────────────────────────────────

/**
 * The ECS World owns all entities and their components.
 *
 * @example
 *   const world = new World();
 *   const id = world.createEntity();
 *   world.positions.set(id, { x: 400, y: 300 });
 *   world.velocities.set(id, { vx: -200, vy: 0 });
 */
export class World {
  // ── Entity registry ──
  private nextId = 1;
  private readonly activeEntities = new Map<number, Entity>();
  /** Free-list for entity reuse */
  private readonly freeIds: number[] = [];

  // ── Typed component stores (extend here for new components) ──
  public readonly positions = new ComponentStore<PositionComponent>();
  public readonly velocities = new ComponentStore<VelocityComponent>();
  public readonly renderables = new ComponentStore<RenderableComponent>();
  public readonly health = new ComponentStore<HealthComponent>();
  public readonly tags = new ComponentStore<TagComponent>();

  // ─── Entity lifecycle ────────────────────────────────────────────────────────

  createEntity(): number {
    const id = this.freeIds.pop() ?? this.nextId++;
    this.activeEntities.set(id, { id, active: true });
    return id;
  }

  destroyEntity(id: number): void {
    if (!this.activeEntities.has(id)) return;
    this.activeEntities.delete(id);
    this.positions.remove(id);
    this.velocities.remove(id);
    this.renderables.remove(id);
    this.health.remove(id);
    this.tags.remove(id);
    this.freeIds.push(id);
  }

  isActive(id: number): boolean {
    return this.activeEntities.has(id);
  }

  get entityCount(): number {
    return this.activeEntities.size;
  }

  // ─── Query helpers ───────────────────────────────────────────────────────────

  /** Return all entity IDs that have all of the listed component stores populated. */
  query(...stores: Array<ComponentStore<unknown>>): number[] {
    const result: number[] = [];
    this.activeEntities.forEach((_, id) => {
      if (stores.every((s) => s.has(id))) result.push(id);
    });
    return result;
  }

  /** Return entity IDs whose TagComponent includes ALL of the requested tags. */
  queryByTags(...required: string[]): number[] {
    const result: number[] = [];
    this.tags.forEach((id, tag) => {
      if (required.every((t) => tag.tags.has(t))) result.push(id);
    });
    return result;
  }

  // ─── Tag helpers ─────────────────────────────────────────────────────────────

  addTag(id: number, tag: string): void {
    let comp = this.tags.get(id);
    if (!comp) {
      comp = { tags: new Set() };
      this.tags.set(id, comp);
    }
    comp.tags.add(tag);
  }

  hasTag(id: number, tag: string): boolean {
    return this.tags.get(id)?.tags.has(tag) ?? false;
  }

  removeTag(id: number, tag: string): void {
    this.tags.get(id)?.tags.delete(tag);
  }

  // ─── Bulk operations ─────────────────────────────────────────────────────────

  /** Destroy all entities – used on scene reset. */
  clear(): void {
    this.activeEntities.forEach((_, id) => this.destroyEntity(id));
    this.freeIds.length = 0;
    this.nextId = 1;
  }
}
