/**
 * FAIL FRENZY – ECS Systems
 * Stateless system functions that operate on the World.
 *
 * Inspired by:
 *  • Excalibur.js – system separation and lifecycle
 *  • LittleJS – tight per-frame loops with no allocations
 *  • Phaser 3 – arcade physics collision style
 */

import { World } from "./World";

// ─── Movement System ──────────────────────────────────────────────────────────

/**
 * Integrates velocity into position each frame.
 * Entities must have both a PositionComponent and VelocityComponent.
 */
export class MovementSystem {
  update(world: World, deltaSec: number): void {
    world.positions.forEach((id, pos) => {
      const vel = world.velocities.get(id);
      if (!vel) return;
      pos.x += vel.vx * deltaSec;
      pos.y += vel.vy * deltaSec;
    });
  }
}

// ─── Boundary System ──────────────────────────────────────────────────────────

/**
 * Keeps entities within the canvas bounds.
 * Entities tagged "wrap" will warp to the opposite side.
 * Entities tagged "bounce" will reverse velocity.
 * Entities tagged "destroy-oob" will be destroyed.
 */
export class BoundarySystem {
  update(world: World, width: number, height: number): void {
    const movable = world.query(world.positions, world.velocities);
    for (const id of movable) {
      const pos = world.positions.get(id)!;
      const vel = world.velocities.get(id)!;
      const render = world.renderables.get(id);
      const r = render?.radius ?? 0;

      if (world.hasTag(id, "destroy-oob")) {
        if (pos.x + r < 0 || pos.x - r > width || pos.y + r < 0 || pos.y - r > height) {
          world.destroyEntity(id);
        }
      } else if (world.hasTag(id, "bounce")) {
        if (pos.x - r < 0 || pos.x + r > width) vel.vx = -vel.vx;
        if (pos.y - r < 0 || pos.y + r > height) vel.vy = -vel.vy;
      } else if (world.hasTag(id, "wrap")) {
        if (pos.x < -r) pos.x = width + r;
        else if (pos.x > width + r) pos.x = -r;
        if (pos.y < -r) pos.y = height + r;
        else if (pos.y > height + r) pos.y = -r;
      }
    }
  }
}

// ─── Collision System ─────────────────────────────────────────────────────────

export interface CollisionEvent {
  entityA: number;
  entityB: number;
  typeA: string;
  typeB: string;
}

/**
 * Circle-circle collision detection between entities that have
 * both a PositionComponent and a RenderableComponent (uses `radius`).
 *
 * Calls `onCollision` for each detected pair and destroys entityB
 * when `destroyOnHit` tag is present.
 */
export class CollisionSystem {
  detectPlayerCollisions(
    world: World,
    playerId: number,
    onCollision: (event: CollisionEvent) => void
  ): void {
    const playerPos = world.positions.get(playerId);
    const playerRender = world.renderables.get(playerId);
    if (!playerPos || !playerRender) return;

    const others = world.query(world.positions, world.renderables);
    for (const id of others) {
      if (id === playerId) continue;

      const pos = world.positions.get(id)!;
      const render = world.renderables.get(id)!;

      const dx = playerPos.x - pos.x;
      const dy = playerPos.y - pos.y;
      const sumR = playerRender.radius + render.radius;

      if (dx * dx + dy * dy < sumR * sumR) {
        onCollision({
          entityA: playerId,
          entityB: id,
          typeA: playerRender.type,
          typeB: render.type,
        });

        if (world.hasTag(id, "destroy-on-hit")) {
          world.destroyEntity(id);
        }
      }
    }
  }
}

// ─── Friction System ──────────────────────────────────────────────────────────

/**
 * Applies exponential friction (framerate-independent) to entities
 * tagged "friction". `friction` is 0–1 where 1 = no friction.
 */
export class FrictionSystem {
  update(world: World, deltaSec: number, friction = 0.88): void {
    const entities = world.queryByTags("friction");
    const factor = Math.pow(friction, deltaSec * 60);
    for (const id of entities) {
      const vel = world.velocities.get(id);
      if (!vel) continue;
      vel.vx *= factor;
      vel.vy *= factor;
    }
  }
}

// ─── Canvas 2D Render System ──────────────────────────────────────────────────

/**
 * Renders all entities that have both Position and Renderable components
 * using the existing Canvas 2D context. Supports neon glow via `glow`.
 */
export class RenderSystem {
  render(
    world: World,
    ctx: CanvasRenderingContext2D,
    highlightId?: number
  ): void {
    const entities = world.query(world.positions, world.renderables);

    for (const id of entities) {
      const pos = world.positions.get(id)!;
      const render = world.renderables.get(id)!;
      if (!render.visible) continue;

      ctx.save();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, render.radius, 0, Math.PI * 2);

      if (render.glow) {
        ctx.shadowBlur = 16;
        ctx.shadowColor = render.glow;
      }

      if (id === highlightId) {
        ctx.shadowBlur = 24;
        ctx.shadowColor = render.color;
      }

      ctx.fillStyle = render.color;
      ctx.fill();
      ctx.restore();
    }
  }
}
