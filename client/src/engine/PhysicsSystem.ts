/**
 * FAIL FRENZY - Physics & Collision System
 * Optimized 2D physics with spatial partitioning
 */

import { Entity } from './GameEngine';

export interface Vector2D {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionResult {
  collided: boolean;
  entityA: Entity;
  entityB: Entity;
  normal: Vector2D;
  penetration: number;
}

export class PhysicsSystem {
  private gravity: Vector2D;
  private friction: number;
  private airResistance: number;
  
  // Spatial partitioning (grid-based)
  private gridSize: number;
  private grid: Map<string, Set<Entity>>;
  
  constructor(
    gravity: Vector2D = { x: 0, y: 981 },
    friction: number = 0.98,
    gridSize: number = 100
  ) {
    this.gravity = gravity;
    this.friction = friction;
    this.airResistance = 0.99;
    this.gridSize = gridSize;
    this.grid = new Map();
  }
  
  // Update physics for entity
  public updateEntity(entity: Entity, dt: number): void {
    // Apply gravity
    if (entity.components.has('gravity')) {
      entity.velocity.y += this.gravity.y * dt;
    }
    
    // Apply friction
    if (entity.components.has('friction')) {
      entity.velocity.x *= this.friction;
      entity.velocity.y *= this.friction;
    }
    
    // Apply air resistance
    entity.velocity.x *= this.airResistance;
    entity.velocity.y *= this.airResistance;
    
    // Cap velocity
    const maxSpeed = entity.components.get('maxSpeed') || 1000;
    const speed = Math.sqrt(entity.velocity.x ** 2 + entity.velocity.y ** 2);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      entity.velocity.x *= ratio;
      entity.velocity.y *= ratio;
    }
    
    // Update position
    entity.x += entity.velocity.x * dt;
    entity.y += entity.velocity.y * dt;
    
    // Update rotation based on velocity
    if (entity.components.has('autoRotate')) {
      entity.rotation = Math.atan2(entity.velocity.y, entity.velocity.x);
    }
  }
  
  // Check AABB collision
  public checkAABBCollision(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
  
  // Check circle collision
  public checkCircleCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }
  
  // Check collision between entities
  public checkEntityCollision(a: Entity, b: Entity): CollisionResult | null {
    // Get collision shapes
    const shapeA = a.components.get('collisionShape') || 'aabb';
    const shapeB = b.components.get('collisionShape') || 'aabb';
    
    if (shapeA === 'aabb' && shapeB === 'aabb') {
      return this.checkAABBEntityCollision(a, b);
    } else if (shapeA === 'circle' && shapeB === 'circle') {
      return this.checkCircleEntityCollision(a, b);
    } else {
      // Mixed collision (use AABB as fallback)
      return this.checkAABBEntityCollision(a, b);
    }
  }
  
  private checkAABBEntityCollision(a: Entity, b: Entity): CollisionResult | null {
    const aBox: AABB = {
      x: a.x - a.width / 2,
      y: a.y - a.height / 2,
      width: a.width,
      height: a.height,
    };
    
    const bBox: AABB = {
      x: b.x - b.width / 2,
      y: b.y - b.height / 2,
      width: b.width,
      height: b.height,
    };
    
    if (!this.checkAABBCollision(aBox, bBox)) {
      return null;
    }
    
    // Calculate collision normal and penetration
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    
    const overlapX = (a.width + b.width) / 2 - Math.abs(dx);
    const overlapY = (a.height + b.height) / 2 - Math.abs(dy);
    
    let normal: Vector2D;
    let penetration: number;
    
    if (overlapX < overlapY) {
      normal = { x: dx > 0 ? 1 : -1, y: 0 };
      penetration = overlapX;
    } else {
      normal = { x: 0, y: dy > 0 ? 1 : -1 };
      penetration = overlapY;
    }
    
    return {
      collided: true,
      entityA: a,
      entityB: b,
      normal,
      penetration,
    };
  }
  
  private checkCircleEntityCollision(a: Entity, b: Entity): CollisionResult | null {
    const radiusA = a.width / 2;
    const radiusB = b.width / 2;
    
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance >= radiusA + radiusB) {
      return null;
    }
    
    const penetration = radiusA + radiusB - distance;
    const normal: Vector2D = {
      x: dx / distance,
      y: dy / distance,
    };
    
    return {
      collided: true,
      entityA: a,
      entityB: b,
      normal,
      penetration,
    };
  }
  
  // Resolve collision (elastic collision)
  public resolveCollision(collision: CollisionResult, restitution: number = 0.8): void {
    const { entityA, entityB, normal, penetration } = collision;
    
    // Separate entities
    const separationA = {
      x: -normal.x * penetration * 0.5,
      y: -normal.y * penetration * 0.5,
    };
    const separationB = {
      x: normal.x * penetration * 0.5,
      y: normal.y * penetration * 0.5,
    };
    
    entityA.x += separationA.x;
    entityA.y += separationA.y;
    entityB.x += separationB.x;
    entityB.y += separationB.y;
    
    // Calculate relative velocity
    const relativeVelocity = {
      x: entityB.velocity.x - entityA.velocity.x,
      y: entityB.velocity.y - entityA.velocity.y,
    };
    
    // Calculate velocity along normal
    const velocityAlongNormal =
      relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
    
    // Don't resolve if velocities are separating
    if (velocityAlongNormal > 0) return;
    
    // Calculate impulse scalar
    const massA = entityA.components.get('mass') || 1;
    const massB = entityB.components.get('mass') || 1;
    
    const impulseScalar =
      (-(1 + restitution) * velocityAlongNormal) / (1 / massA + 1 / massB);
    
    // Apply impulse
    const impulse = {
      x: impulseScalar * normal.x,
      y: impulseScalar * normal.y,
    };
    
    entityA.velocity.x -= impulse.x / massA;
    entityA.velocity.y -= impulse.y / massA;
    entityB.velocity.x += impulse.x / massB;
    entityB.velocity.y += impulse.y / massB;
  }
  
  // Spatial partitioning: add entity to grid
  public addToGrid(entity: Entity): void {
    const cells = this.getEntityCells(entity);
    for (const cell of cells) {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, new Set());
      }
      this.grid.get(cell)!.add(entity);
    }
  }
  
  // Spatial partitioning: remove entity from grid
  public removeFromGrid(entity: Entity): void {
    const cells = this.getEntityCells(entity);
    for (const cell of cells) {
      const cellSet = this.grid.get(cell);
      if (cellSet) {
        cellSet.delete(entity);
        if (cellSet.size === 0) {
          this.grid.delete(cell);
        }
      }
    }
  }
  
  // Get nearby entities using spatial partitioning
  public getNearbyEntities(entity: Entity): Set<Entity> {
    const nearby = new Set<Entity>();
    const cells = this.getEntityCells(entity);
    
    for (const cell of cells) {
      const cellSet = this.grid.get(cell);
      if (cellSet) {
        for (const otherEntity of Array.from(cellSet)) {
          if (otherEntity !== entity) {
            nearby.add(otherEntity);
          }
        }
      }
    }
    
    return nearby;
  }
  
  // Get grid cells occupied by entity
  private getEntityCells(entity: Entity): string[] {
    const cells: string[] = [];
    
    const minX = Math.floor((entity.x - entity.width / 2) / this.gridSize);
    const maxX = Math.floor((entity.x + entity.width / 2) / this.gridSize);
    const minY = Math.floor((entity.y - entity.height / 2) / this.gridSize);
    const maxY = Math.floor((entity.y + entity.height / 2) / this.gridSize);
    
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        cells.push(`${x},${y}`);
      }
    }
    
    return cells;
  }
  
  // Clear grid
  public clearGrid(): void {
    this.grid.clear();
  }
  
  // Apply force to entity
  public applyForce(entity: Entity, force: Vector2D): void {
    const mass = entity.components.get('mass') || 1;
    entity.acceleration.x += force.x / mass;
    entity.acceleration.y += force.y / mass;
  }
  
  // Apply impulse to entity
  public applyImpulse(entity: Entity, impulse: Vector2D): void {
    const mass = entity.components.get('mass') || 1;
    entity.velocity.x += impulse.x / mass;
    entity.velocity.y += impulse.y / mass;
  }
  
  // Raycast
  public raycast(
    start: Vector2D,
    direction: Vector2D,
    maxDistance: number,
    entities: Entity[]
  ): { entity: Entity; distance: number; point: Vector2D } | null {
    let closestHit: { entity: Entity; distance: number; point: Vector2D } | null = null;
    let closestDistance = maxDistance;
    
    for (const entity of entities) {
      const hit = this.raycastEntity(start, direction, maxDistance, entity);
      if (hit && hit.distance < closestDistance) {
        closestHit = hit;
        closestDistance = hit.distance;
      }
    }
    
    return closestHit;
  }
  
  private raycastEntity(
    start: Vector2D,
    direction: Vector2D,
    maxDistance: number,
    entity: Entity
  ): { entity: Entity; distance: number; point: Vector2D } | null {
    // Simplified AABB raycast
    const box: AABB = {
      x: entity.x - entity.width / 2,
      y: entity.y - entity.height / 2,
      width: entity.width,
      height: entity.height,
    };
    
    const tMin = {
      x: (box.x - start.x) / direction.x,
      y: (box.y - start.y) / direction.y,
    };
    
    const tMax = {
      x: (box.x + box.width - start.x) / direction.x,
      y: (box.y + box.height - start.y) / direction.y,
    };
    
    const t1 = Math.min(tMin.x, tMax.x);
    const t2 = Math.max(tMin.x, tMax.x);
    const t3 = Math.min(tMin.y, tMax.y);
    const t4 = Math.max(tMin.y, tMax.y);
    
    const tNear = Math.max(t1, t3);
    const tFar = Math.min(t2, t4);
    
    if (tNear > tFar || tFar < 0 || tNear > maxDistance) {
      return null;
    }
    
    const distance = tNear;
    const point = {
      x: start.x + direction.x * distance,
      y: start.y + direction.y * distance,
    };
    
    return { entity, distance, point };
  }
  
  // Set gravity
  public setGravity(gravity: Vector2D): void {
    this.gravity = gravity;
  }
  
  // Get gravity
  public getGravity(): Vector2D {
    return { ...this.gravity };
  }
}
