/**
 * AssetLoader - Gestionnaire de chargement des images et sons
 */
export class AssetLoader {
  private assets: Map<string, HTMLImageElement> = new Map();

  async load(path: string): Promise<HTMLImageElement> {
    if (this.assets.has(path)) return this.assets.get(path)!;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.assets.set(path, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load asset: ${path}`);
        reject();
      };
      img.src = path;
    });
  }

  get(path: string): HTMLImageElement | undefined {
    return this.assets.get(path);
  }
}

export async function preloadAssets(onProgress?: (loaded: number, total: number) => void): Promise<AssetLoader> {
  const loader = new AssetLoader();
  const assetsToLoad = [
    '/logo-skull-imposing.png',
    '/skins/cyan.png',
    '/skins/magenta.png',
    '/skins/vaporwave.png',
    '/skins/cyberpunk.png',
    '/skins/steampunk.png',
    '/skins/cyber_ninja.png',
    '/skins/pirate_spatial.png',
    '/skins/vaisseau_fantome.png',
    '/skins/entite_cosmique.png',
    '/skins/ange_dechu.png',
    '/skins/golem_lave.png'
  ];

  let loaded = 0;
  const total = assetsToLoad.length;

  const promises = assetsToLoad.map(async (path) => {
    try {
      await loader.load(path);
    } catch (e) {
      // Continue even if one fails
    }
    loaded++;
    if (onProgress) onProgress(loaded, total);
  });

  await Promise.all(promises);
  return loader;
}
