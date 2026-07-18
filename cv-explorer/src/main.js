import { sceneManager } from './scene/SceneManager.js';
import { lighting } from './scene/Lighting.js';
import { terrain } from './scene/Terrain.js';
import { sky } from './scene/Sky.js';
import { camera } from './scene/Camera.js';
import { createControls } from './controls/index.js';
import { WorldBuilder } from './world/WorldBuilder.js';
import { HUD } from './ui/HUD.js';
import { BookReader } from './ui/BookReader.js';
import { EntrySequence } from './animations/EntrySequence.js';
import { SectionReveal } from './animations/SectionReveal.js';

/**
 * CVExplorer — the magical 3D CV world.
 *
 * Flow:
 *   1. Init scene, camera, lighting, terrain, sky.
 *   2. Build the winding-path world with floating Books (one per CV chapter).
 *   3. Set up first-person controls + raycaster.
 *   4. Wire book proximity events → HUD updates.
 *   5. Wire book click → BookReader UI (releases pointer lock while open).
 *   6. Play cinematic entry sequence, then hand control to the player.
 */
class CVExplorer {
  constructor() {
    this.isInitialized = false;
    this.controls = null;
    this.raycaster = null;
    this.controlsType = null;
    this.worldBuilder = null;

    // UI Components
    this.loadingScreen = null;
    this.hud = null;
    this.bookReader = null;

    // Animation Systems
    this.entrySequence = null;
    this.sectionReveal = null;

    // Track the book the player is currently in range of (for HUD prompt)
    this.activeBook = null;
  }

  async init() {
    const canvas = document.getElementById('canvas');

    if (!canvas) {
      console.error('Canvas element not found');
      this.showError('Canvas element not found');
      return;
    }

    try {
      this.updateLoadingText('Awakening the world...');

      // Core scene systems
      sceneManager.init(canvas);
      camera.init();
      lighting.init();
      terrain.init();
      sky.init();

      sceneManager.add(lighting.getGroup());
      sceneManager.add(terrain.getGroup());
      sceneManager.add(sky.getGroup());

      this.updateLoadingText('Forging the path...');

      // First-person controls
      this.initControls(canvas);

      this.updateLoadingText('Summoning the books...');

      // Build the winding-path world with floating Books
      await this.initWorld();

      // UI components
      this.initUI();

      // Animation systems
      this.initAnimations();

      // Per-frame update hook
      sceneManager.onUpdate((delta, elapsed) => {
        try {
          if (this.controls) this.controls.update(delta);
          if (this.raycaster) this.raycaster.update();
          if (this.worldBuilder) this.worldBuilder.update(delta, camera.getCamera());
          if (this.sectionReveal) this.sectionReveal.update(delta);
          lighting.update(elapsed);
          terrain.update(elapsed);
          sky.update(elapsed);
        } catch (e) {
          console.warn('Update loop error:', e);
        }
      });

      sceneManager.start(camera.getCamera());
      this.isInitialized = true;

      this.hideLoading();
      this.playEntrySequence();

      console.log('CV Explorer initialized successfully');
      console.log(`Controls type: ${this.controlsType}`);
    } catch (error) {
      console.error('Failed to initialize CV Explorer:', error);
      this.showError(error.message);
    }
  }

  updateLoadingText(text) {
    const loadingText = document.querySelector('#loading p');
    if (loadingText) loadingText.textContent = text;
  }

  initUI() {
    this.hud = new HUD();
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.hud.setTouchMode(isTouch);

    // BookReader replaces DetailPanel as the primary content viewer
    this.bookReader = new BookReader();
  }

  initAnimations() {
    this.entrySequence = new EntrySequence(sceneManager, this.worldBuilder, this.controls, camera);
    this.sectionReveal = new SectionReveal(sceneManager, camera);
    this.registerSectionsForReveal();
  }

  registerSectionsForReveal() {
    if (!this.worldBuilder || !this.sectionReveal) return;
    for (const [sectionId, sectionData] of this.worldBuilder.sections) {
      if (sectionData.position && sectionData.objects) {
        this.sectionReveal.registerSection(sectionId, sectionData.position, sectionData.objects);
      }
    }
  }

  async playEntrySequence() {
    if (!this.entrySequence) return;
    if (this.controls?.setEnabled) this.controls.setEnabled(false);
    await this.entrySequence.play();
    if (this.controls?.setEnabled) this.controls.setEnabled(true);
  }

  initControls(canvas) {
    const cam = camera.getCamera();
    const scene = sceneManager.scene;
    const { controls, raycaster, type } = createControls(cam, canvas, scene);

    this.controls = controls;
    this.raycaster = raycaster;
    this.controlsType = type;

    // Terrain following callback
    if (this.controls.setTerrainHeightCallback) {
      this.controls.setTerrainHeightCallback((x, z) => terrain.getTerrainHeight(x, z));
    }

    // Collision callback (books are off the path; terrain collision still applies)
    if (this.controls.setCollisionCallback) {
      this.controls.setCollisionCallback((pos, radius) => terrain.checkCollision(pos, radius));
    }

    // ---- Book interaction: clicking a book opens the BookReader ----
    canvas.addEventListener('objectSelected', (event) => {
      const obj = event.detail?.object;
      if (!obj) return;
      if (obj.userData?.type === 'book') {
        this.openBookReader(obj.userData.chapter);
      }
    });

    // ---- Proximity events from WorldBuilder ----
    canvas.addEventListener('bookInRange', (event) => {
      const { chapter, book } = event.detail;
      this.activeBook = book;
      if (this.hud) {
        this.hud.showPrompt(`Press SPACE or click to read: ${chapter.title}`, chapter.subtitle || '');
      }
    });

    canvas.addEventListener('bookOutOfRange', () => {
      this.activeBook = null;
      if (this.hud) this.hud.hidePrompt();
    });

    // ---- Hover prompts ----
    canvas.addEventListener('objectHoverStart', (event) => {
      if (this.hud && event.detail) {
        const obj = event.detail;
        if (obj.userData?.type === 'book') {
          this.hud.showPrompt(`Read: ${obj.userData.title}`, 'Click or press SPACE');
        }
      }
    });

    canvas.addEventListener('objectHoverEnd', () => {
      if (this.hud && !this.activeBook) this.hud.hidePrompt();
    });

    canvas.addEventListener('controlsLocked', () => {
      console.log('Controls locked — first-person mode active');
    });

    canvas.addEventListener('controlsUnlocked', () => {
      console.log('Controls unlocked');
    });
  }

  /**
   * Open the BookReader for a chapter. Releases pointer lock so the player
   * can use the mouse to navigate the book pages, then re-locks on close.
   */
  openBookReader(chapter) {
    if (!this.bookReader || !chapter) return;
    if (this.bookReader.getIsOpen()) return;

    // Release pointer lock so the cursor is free for book navigation
    if (this.controls?.unlock) {
      this.controls.unlock();
    }
    // Disable movement while reading
    if (this.controls?.setEnabled) {
      this.controls.setEnabled(false);
    }

    this.bookReader.open(chapter, () => {
      // On close: re-enable movement (player clicks canvas to re-lock pointer)
      if (this.controls?.setEnabled) {
        this.controls.setEnabled(true);
      }
    });
  }

  async initWorld() {
    try {
      this.worldBuilder = new WorldBuilder(sceneManager.scene);
      this.worldBuilder.build();

      // Register all books as raycastable interactables
      const interactables = this.worldBuilder.getInteractables();
      for (const obj of interactables) {
        this.addInteractable(obj, {
          onClick: obj.userData.onClick,
          onSelect: () => obj.userData.onClick?.(),
          onHover: obj.userData.onHover
        });
      }
      console.log(`World built with ${interactables.length} books`);
    } catch (error) {
      console.error('Error building world:', error);
    }
  }

  addInteractable(object, options) {
    if (this.raycaster) this.raycaster.addInteractable(object, options);
    return this;
  }

  removeInteractable(object) {
    if (this.raycaster) this.raycaster.removeInteractable(object);
    return this;
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.transition = 'opacity 0.5s ease-out';
      loading.style.opacity = '0';
      setTimeout(() => loading.classList.add('hidden'), 500);
    }
  }

  showError(message) {
    if (this.loadingScreen) this.loadingScreen.remove();
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-screen';
    errorDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #000; display: flex; align-items: center; justify-content: center; z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <div style="color: #ff4444; text-align: center; max-width: 400px; padding: 2rem;">
        <h2 style="margin: 0 0 1rem; font-size: 1.5rem;">Failed to load CV Experience</h2>
        <p style="font-size: 0.9rem; opacity: 0.7; margin: 0;">${message}</p>
        <button onclick="location.reload()" style="
          margin-top: 1.5rem; padding: 0.75rem 1.5rem;
          background: rgba(68, 170, 255, 0.2); border: 1px solid rgba(68, 170, 255, 0.5);
          color: #44aaff; font-size: 0.9rem; cursor: pointer; border-radius: 4px;
        ">Retry</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }

  dispose() {
    if (this.loadingScreen) this.loadingScreen.remove();
    if (this.hud) this.hud.dispose();
    if (this.bookReader) this.bookReader.dispose();
    if (this.sectionReveal) this.sectionReveal.dispose();
    if (this.entrySequence) this.entrySequence.cleanup();
    sceneManager.dispose();
  }
}

// Initialize on DOM ready
const explorer = new CVExplorer();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => explorer.init());
} else {
  explorer.init();
}

window.cvExplorer = explorer;
export default explorer;
