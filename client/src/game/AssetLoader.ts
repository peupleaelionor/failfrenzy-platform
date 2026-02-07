/**
 * FAIL FRENZY PREMIUM - Asset Loader
 * Précharge toutes les images du jeu pour un rendu fluide
 * Supporte le déploiement sur GitHub Pages avec base path dynamique
 */

export interface AssetManifest {
  [key: string]: string;
}

// Resolve base path for GitHub Pages compatibility
const BASE = import.meta.env.BASE_URL || '/';

function assetPath(path: string): string {
  // path starts with / — make it relative to BASE
  return `${BASE}${path.startsWith('/') ? path.slice(1) : path}`;
}

export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: number = 0;
  private total: number = 0;
  private onProgress?: (loaded: number, total: number) => void;

  // Asset manifest - toutes les images du jeu (chemins relatifs)
  public static readonly MANIFEST: AssetManifest = {
    // Player
    player: assetPath('/images/assets/pulse_clicker_logo_512.png'),
    
    // Obstacles
    obstacle_fire: assetPath('/images/assets/target_fire_glow.png'),
    obstacle_classic: assetPath('/images/assets/target_classic_glow.png'),
    
    // Power-ups & Collectibles
    powerup_neon: assetPath('/images/assets/target_neon_glow.png'),
    
    // Effects
    hit_spark: assetPath('/images/assets/hit_fx_spark.png'),
    
    // UI
    logo: assetPath('/images/assets/pulse_clicker_logo_512.png'),
    button_play: assetPath('/images/assets/button_jouer_pulse_2.png'),
    logo_skull: assetPath('/images/assets/logo-skull.jpeg'),
    skull_icon: assetPath('/images/assets/logo-skull-256.png'),
    skull_logo: assetPath('/images/assets/logo-skull-512.png'),
    skull_cropped: assetPath('/images/assets/logo-skull-cropped.png'),
    
    // Backgrounds
    bg_arcade: assetPath('/images/assets/hero-arcade-room.jpeg'),
    banner_gameover: assetPath('/images/assets/banner-game-over.jpeg'),
    promo_banner: assetPath('/images/assets/promo-banner.jpeg'),
    ui_pattern: assetPath('/images/assets/ui-pattern-arcade.jpeg'),
  };

  constructor(onProgress?: (loaded: number, total: number) => void) {
    this.onProgress = onProgress;
  }

  public async loadAll(): Promise<void> {
    const entries = Object.entries(AssetLoader.MANIFEST);
    this.total = entries.length;
    this.loaded = 0;

    const promises = entries.map(([key, src]) => this.loadImage(key, src));
    await Promise.all(promises);
  }

  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        this.images.set(key, img);
        this.loaded++;
        this.onProgress?.(this.loaded, this.total);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`Failed to load asset: ${key} (${src})`);
        // Create a fallback colored canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(key, 32, 36);
        
        const fallbackImg = new Image();
        fallbackImg.src = canvas.toDataURL();
        fallbackImg.onload = () => {
          this.images.set(key, fallbackImg);
          this.loaded++;
          this.onProgress?.(this.loaded, this.total);
          resolve();
        };
      };
      
      img.src = src;
    });
  }

  public get(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }

  public getProgress(): number {
    return this.total > 0 ? this.loaded / this.total : 0;
  }

  public isLoaded(): boolean {
    return this.loaded >= this.total && this.total > 0;
  }
}

// Singleton instance
let globalAssets: AssetLoader | null = null;

export function getAssetLoader(): AssetLoader {
  if (!globalAssets) {
    globalAssets = new AssetLoader();
  }
  return globalAssets;
}

export async function preloadAssets(onProgress?: (loaded: number, total: number) => void): Promise<AssetLoader> {
  const loader = new AssetLoader(onProgress);
  await loader.loadAll();
  globalAssets = loader;
  return loader;
}
