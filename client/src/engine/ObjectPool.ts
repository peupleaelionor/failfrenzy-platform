/**
 * FAIL FRENZY - Generic Object Pool
 * Eliminates GC pressure by reusing pre-allocated objects.
 *
 * Usage:
 *   const pool = new ObjectPool(
 *     () => ({ x: 0, y: 0, alive: false }),      // factory
 *     (obj) => { obj.x = 0; obj.y = 0; obj.alive = false; } // reset
 *   );
 *   const obj = pool.acquire();   // borrow
 *   pool.release(obj);            // return
 */

export class ObjectPool<T> {
  private pool: T[] = [];

  constructor(
    private readonly createFn: () => T,
    private readonly resetFn: (obj: T) => void,
    initialSize: number = 0
  ) {
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  /** Borrow an object from the pool (or create one if the pool is empty). */
  acquire(): T {
    return this.pool.pop() ?? this.createFn();
  }

  /** Return an object to the pool after resetting its state. */
  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  /** Number of objects currently idle in the pool. */
  get size(): number {
    return this.pool.length;
  }

  /** Discard all pooled objects (e.g. on scene reset). */
  clear(): void {
    this.pool.length = 0;
  }
}
