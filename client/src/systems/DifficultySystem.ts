export class DifficultySystem {
  constructor(private config: any) {}
  getObstacleSpeed() { return this.config.baseSpeed; }
  getSpawnRate() { return this.config.baseSpawnRate; }
}
