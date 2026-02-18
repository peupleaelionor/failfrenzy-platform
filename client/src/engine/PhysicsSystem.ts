/**
 * PhysicsSystem - Gestion des mouvements et collisions de base
 */
export class PhysicsSystem {
  constructor(public gravity: { x: number; y: number } = { x: 0, y: 0 }, public friction: number = 0.98) {}

  applyForce(entity: any, force: { x: number; y: number }) {
    entity.vx += force.x;
    entity.vy += force.y;
  }

  update(entity: any, dt: number) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
    entity.vx *= this.friction;
    entity.vy *= this.friction;
  }
}
