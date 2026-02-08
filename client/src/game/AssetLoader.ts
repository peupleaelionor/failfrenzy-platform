/**
 * FAIL FRENZY: ECHOES OF THE VOID - Asset Loader
 * Précharge toutes les images du jeu pour un rendu fluide.
 */

export interface AssetManifest {
  [key: string]: string;
}

const BASE = import.meta.env.BASE_URL || '/';

function assetPath(path: string): string {
  return `${BASE}${path.startsWith('/') ? path.slice(1) : path}`;
}

export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: number = 0;
  private total: number = 0;
  private onProgress?: (loaded: number, total: number) => void;

  public static readonly MANIFEST: AssetManifest = {
    // Branding
    logo: assetPath('logo-skull-glitch.png'),
    favicon: assetPath('01_BRANDING/Favicon_Simplifie.png'),
    
    // Legacy branding (backward compat)
    logo_skull: assetPath('images/assets/logo-skull-512.png'),
    skull_icon: assetPath('images/assets/logo-skull-256.png'),
    skull_cropped: assetPath('images/assets/logo-skull-cropped.png'),
    
    // Vaisseaux (Skins)
    vaisseau_cyan: assetPath('02_SKINS_VAISSEAUX/COMMUN_Vaisseau_Cyan.png'),
    vaisseau_magenta: assetPath('02_SKINS_VAISSEAUX/COMMUN_Vaisseau_Magenta.png'),
    vaisseau_cyberpunk: assetPath('02_SKINS_VAISSEAUX/RARE_Vaisseau_Cyberpunk.png'),
    vaisseau_steampunk: assetPath('02_SKINS_VAISSEAUX/RARE_Vaisseau_Steampunk.png'),
    vaisseau_vaporwave: assetPath('02_SKINS_VAISSEAUX/RARE_Vaisseau_Vaporwave.png'),
    vaisseau_cyber_ninja: assetPath('02_SKINS_VAISSEAUX/EPIQUE_Vaisseau_Cyber_Ninja.png'),
    vaisseau_fantome: assetPath('02_SKINS_VAISSEAUX/EPIQUE_Vaisseau_Fantome.png'),
    vaisseau_pirate: assetPath('02_SKINS_VAISSEAUX/EPIQUE_Vaisseau_Pirate_Spatial.png'),
    vaisseau_ange: assetPath('02_SKINS_VAISSEAUX/LEGENDAIRE_Ange_Dechu.png'),
    vaisseau_cosmique: assetPath('02_SKINS_VAISSEAUX/LEGENDAIRE_Entite_Cosmique.png'),
    vaisseau_golem: assetPath('02_SKINS_VAISSEAUX/LEGENDAIRE_Golem_Lave.png'),
    
    // Environnements
    bg_nebuleuse: assetPath('03_ENVIRONNEMENTS/BG_Nebuleuse_Spatiale.png'),
    bg_tunnel: assetPath('03_ENVIRONNEMENTS/BG_Tunnel_Donnees.png'),
    bg_ville: assetPath('03_ENVIRONNEMENTS/BG_Ville_Cyberpunk.png'),
    planete_x: assetPath('03_ENVIRONNEMENTS/Planete_X_Destination.png'),
    
    // UI Elements
    ui_buttons: assetPath('04_UI_UX/Boutons_UI_Kit.png'),
    ui_hud: assetPath('04_UI_UX/HUD_Interface_Jeu.png'),
    ui_gameover: assetPath('04_UI_UX/GameOver_Screen.png'),
    ui_loading: assetPath('04_UI_UX/Loading_Screen.png'),
    ui_shop: assetPath('04_UI_UX/Shop_Interface_Boutique.png'),
    ui_leaderboard: assetPath('04_UI_UX/Leaderboard_Classement.png'),
    
    // Game Elements
    item_etoile: assetPath('06_GAME_ELEMENTS/Etoile_Energie_Collectable.png'),
    item_obstacle: assetPath('06_GAME_ELEMENTS/Obstacle_Glitch_Neon.png'),
    item_trou_noir: assetPath('06_GAME_ELEMENTS/Trou_Noir_Obstacle.png'),
    item_badges: assetPath('06_GAME_ELEMENTS/Badges_Succes.png'),
    item_powerups: assetPath('06_GAME_ELEMENTS/PowerUps_Icon_Set.png'),
    
    // VFX
    vfx_explosion: assetPath('07_VFX_EFFECTS/Explosion_Echec_VFX.png'),
    
    // Legacy game assets (backward compat)
    player: assetPath('images/assets/pulse_clicker_logo_512.png'),
    obstacle_fire: assetPath('images/assets/target_fire_glow.png'),
    obstacle_classic: assetPath('images/assets/target_classic_glow.png'),
    powerup_neon: assetPath('images/assets/target_neon_glow.png'),
    hit_spark: assetPath('images/assets/hit_fx_spark.png'),
    button_play: assetPath('images/assets/button_jouer_pulse_2.png'),
    bg_arcade: assetPath('images/assets/hero-arcade-room.jpeg'),
    banner_gameover: assetPath('images/assets/banner-game-over.jpeg'),
    promo_banner: assetPath('images/assets/promo-banner.jpeg'),
    ui_pattern: assetPath('images/assets/ui-pattern-arcade.jpeg'),
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
