/**
 * FeatureIntegration - Liaison entre le jeu et les systèmes externes
 */
export class IntegratedGameManager {
  onFail() {
    console.log("Player failed");
  }
  
  startRun() {
    console.log("Run started");
  }
  
  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // Rendu des effets globaux si besoin
  }
}

export function getIntegratedGameManager() {
  return new IntegratedGameManager();
}
