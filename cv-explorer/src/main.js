import { sceneManager } from './scene/SceneManager.js';
import { lighting } from './scene/Lighting.js';
import { terrain } from './scene/Terrain.js';
import { sky } from './scene/Sky.js';
import { camera } from './scene/Camera.js';
import { createControls } from './controls/index.js';
import { WorldBuilder } from './world/WorldBuilder.js';
import { LoadingScreen, HUD, DetailPanel } from './ui/index.js';
import { EntrySequence, SectionReveal } from './animations/index.js';

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
    this.detailPanel = null;
    
    // Animation Systems
    this.entrySequence = null;
    this.sectionReveal = null;
  }

  async init() {
    const canvas = document.getElementById('canvas');
    
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    try {
      // Create and show loading screen
      this.loadingScreen = new LoadingScreen();
      this.loadingScreen.setProgress(5);
      
      // Initialize core systems
      this.loadingScreen.setProgress(10);
      sceneManager.init(canvas);
      
      this.loadingScreen.setProgress(20);
      camera.init();
      
      this.loadingScreen.setProgress(30);
      lighting.init();
      
      this.loadingScreen.setProgress(40);
      terrain.init();
      
      this.loadingScreen.setProgress(50);
      sky.init();

      // Add all scene elements
      sceneManager.add(lighting.getGroup());
      sceneManager.add(terrain.getGroup());
      sceneManager.add(sky.getGroup());
      this.loadingScreen.setProgress(60);

      // Initialize first-person controls
      this.initControls(canvas);
      this.loadingScreen.setProgress(70);

      // Build the CV world
      this.initWorld();
      this.loadingScreen.setProgress(85);
      
      // Initialize UI components
      this.initUI();
      this.loadingScreen.setProgress(90);
      
      // Initialize animation systems
      this.initAnimations();
      this.loadingScreen.setProgress(95);

      // Register update callbacks
      sceneManager.onUpdate((delta, elapsed) => {
        // Update controls (handles movement and looking)
        if (this.controls) {
          this.controls.update(delta);
        }
        
        // Update raycaster for hover detection
        if (this.raycaster) {
          this.raycaster.update();
        }
        
        // Update world objects (terminals, monuments, etc.)
        if (this.worldBuilder) {
          this.worldBuilder.update(delta, camera.getCamera());
        }
        
        // Update section reveal animations
        if (this.sectionReveal) {
          this.sectionReveal.update(delta);
        }
        
        // Update HUD minimap
        if (this.hud && this.worldBuilder) {
          const cam = camera.getCamera();
          const waypoints = this.getWaypointPositions();
          this.hud.updateMinimap(cam.position, waypoints);
        }
        
        // Update other scene elements
        lighting.update(elapsed);
        terrain.update(elapsed);
        sky.update(elapsed);
      });

      // Start the animation loop
      sceneManager.start(camera.getCamera());
      this.loadingScreen.setProgress(100);

      this.isInitialized = true;

      // Hide loading screen and play entry sequence
      await this.loadingScreen.hide();
      
      // Remove old loading element if exists
      const oldLoading = document.getElementById('loading');
      if (oldLoading) oldLoading.remove();
      
      // Play cinematic entry sequence
      await this.playEntrySequence();
      
      // Show HUD after entry sequence
      await this.hud.show();

      console.log('CV Explorer initialized successfully');
      console.log(`Controls type: ${this.controlsType}`);
    } catch (error) {
      console.error('Failed to initialize CV Explorer:', error);
      this.showError(error.message);
    }
  }
  
  // Initialize UI components
  initUI() {
    // Create HUD
    this.hud = new HUD();
    
    // Detect touch mode
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.hud.setTouchMode(isTouch);
    
    // Create detail panel
    this.detailPanel = new DetailPanel();
  }
  
  // Initialize animation systems
  initAnimations() {
    // Create entry sequence
    this.entrySequence = new EntrySequence(
      sceneManager,
      this.worldBuilder,
      this.controls,
      camera
    );
    
    // Create section reveal system
    this.sectionReveal = new SectionReveal(sceneManager, camera);
    
    // Register sections for proximity-based reveal
    this.registerSectionsForReveal();
  }
  
  // Register world sections for proximity-based reveal animations
  registerSectionsForReveal() {
    if (!this.worldBuilder || !this.sectionReveal) return;
    
    // Get section groups from world builder
    const sections = this.worldBuilder.sections;
    if (!sections) return;
    
    sections.forEach((sectionData, sectionId) => {
      if (sectionData.position && sectionData.objects) {
        this.sectionReveal.registerSection(
          sectionId,
          sectionData.position,
          sectionData.objects
        );
      }
    });
  }
  
  // Get waypoint positions for minimap
  getWaypointPositions() {
    const positions = [];
    if (!this.worldBuilder) return positions;
    
    const interactables = this.worldBuilder.getInteractables();
    interactables.forEach(obj => {
      if (obj.userData?.type === 'waypoint') {
        positions.push({
          x: obj.position.x,
          z: obj.position.z
        });
      }
    });
    
    return positions;
  }
  
  // Play cinematic entry sequence
  async playEntrySequence() {
    if (!this.entrySequence) return;
    
    // Disable controls during sequence
    if (this.controls?.disable) {
      this.controls.disable();
    }
    
    await this.entrySequence.play();
    
    // Enable controls after sequence
    if (this.controls?.enable) {
      this.controls.enable();
    }
  }

  initControls(canvas) {
    const cam = camera.getCamera();
    const scene = sceneManager.scene;
    
    // Create controls using the factory (auto-detects touch vs desktop)
    const { controls, raycaster, type } = createControls(cam, canvas, scene);
    
    this.controls = controls;
    this.raycaster = raycaster;
    this.controlsType = type;
    
    // Set terrain height callback for ground following
    if (this.controls.setTerrainHeightCallback) {
      this.controls.setTerrainHeightCallback((x, z) => terrain.getTerrainHeight(x, z));
    }
    
    // Listen for interaction events
    canvas.addEventListener('objectSelected', (event) => {
      console.log('Object selected:', event.detail);
      // Show detail panel for selected object
      this.showDetailPanel(event.detail);
    });
    
    canvas.addEventListener('objectHoverStart', (event) => {
      // Show interaction prompt in HUD
      if (this.hud && event.detail) {
        const obj = event.detail;
        const label = obj.userData?.label || obj.userData?.title || 'Object';
        const type = obj.userData?.type || 'interactive';
        this.hud.showPrompt(`Click to view ${label}`, type);
      }
    });
    
    canvas.addEventListener('objectHoverEnd', () => {
      // Hide interaction prompt
      if (this.hud) {
        this.hud.hidePrompt();
      }
    });
    
    // Listen for control state changes
    canvas.addEventListener('controlsLocked', () => {
      console.log('Controls locked - first-person mode active');
    });
    
    canvas.addEventListener('controlsUnlocked', () => {
      console.log('Controls unlocked');
    });
  }

  // Initialize the CV world with all 3D objects
  initWorld() {
    this.worldBuilder = new WorldBuilder(sceneManager.scene);
    this.worldBuilder.build();
    
    // Register all interactable objects with the raycaster
    const interactables = this.worldBuilder.getInteractables();
    for (const obj of interactables) {
      this.addInteractable(obj, {
        onClick: obj.userData.onClick,
        onHoverStart: () => obj.userData.onHover?.(true),
        onHoverEnd: () => obj.userData.onHover?.(false)
      });
    }
    
    // Listen for portal teleport events
    interactables.forEach(obj => {
      if (obj.userData.type === 'portal') {
        obj.addEventListener('teleport', (event) => {
          this.teleportTo(event.targetPosition);
        });
      }
      if (obj.userData.type === 'waypoint') {
        obj.addEventListener('navigate', (event) => {
          this.navigateTo(event.position);
        });
      }
    });
    
    console.log(`World built with ${interactables.length} interactable objects`);
  }

  // Teleport the player to a position
  teleportTo(position) {
    const cam = camera.getCamera();
    if (cam && position) {
      cam.position.set(position.x, position.y + 2, position.z + 5);
      console.log('Teleported to:', position);
    }
  }

  // Smooth navigation to a position
  navigateTo(position) {
    // For now, just teleport - can be enhanced with smooth movement later
    this.teleportTo(position);
    
    // Update HUD section indicator if available
    if (this.hud && position.sectionId) {
      this.hud.setSection(position.sectionId);
    }
  }
  
  // Show detail panel for a selected object
  showDetailPanel(object) {
    if (!this.detailPanel || !object) return;
    
    const userData = object.userData || {};
    
    // Build panel data from object userData
    const panelData = {
      type: this.formatType(userData.type),
      title: userData.title || userData.label || 'Details',
      description: userData.description || userData.content || '',
      meta: [],
      details: [],
      tags: userData.tags || userData.technologies || [],
      links: []
    };
    
    // Add meta information
    if (userData.year) {
      panelData.meta.push({ text: userData.year });
    }
    if (userData.venue || userData.journal) {
      panelData.meta.push({ text: userData.venue || userData.journal });
    }
    if (userData.authors) {
      panelData.meta.push({ text: userData.authors });
    }
    if (userData.institution) {
      panelData.meta.push({ text: userData.institution });
    }
    
    // Add details sections
    if (userData.details && Array.isArray(userData.details)) {
      userData.details.forEach(detail => {
        if (typeof detail === 'string') {
          panelData.details.push({ title: 'Details', items: [detail] });
        } else if (detail.title && detail.items) {
          panelData.details.push(detail);
        }
      });
    }
    
    // Add highlights if available
    if (userData.highlights && Array.isArray(userData.highlights)) {
      panelData.details.push({ title: 'Highlights', items: userData.highlights });
    }
    
    // Add links
    if (userData.url) {
      panelData.links.push({ url: userData.url, text: 'Visit Website', icon: 'link' });
    }
    if (userData.github) {
      panelData.links.push({ url: userData.github, text: 'View on GitHub', icon: 'github' });
    }
    if (userData.arxiv) {
      panelData.links.push({ url: userData.arxiv, text: 'View on arXiv', icon: 'arxiv' });
    }
    if (userData.pdf) {
      panelData.links.push({ url: userData.pdf, text: 'Download PDF', icon: 'pdf' });
    }
    if (userData.demo) {
      panelData.links.push({ url: userData.demo, text: 'View Demo', icon: 'demo' });
    }
    if (userData.video) {
      panelData.links.push({ url: userData.video, text: 'Watch Video', icon: 'video' });
    }
    
    // Open the panel
    this.detailPanel.open(panelData, () => {
      // Callback when panel closes - re-enable controls if needed
      console.log('Detail panel closed');
    });
  }
  
  // Format object type for display
  formatType(type) {
    if (!type) return 'Information';
    
    const typeMap = {
      'terminal': 'Project',
      'monument': 'Publication',
      'orb': 'Skill',
      'infoOrb': 'Information',
      'waypoint': 'Navigation',
      'portal': 'Portal'
    };
    
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  // Get the world builder instance
  getWorldBuilder() {
    return this.worldBuilder;
  }

  // Add an interactable object to the scene
  addInteractable(object, options) {
    if (this.raycaster) {
      this.raycaster.addInteractable(object, options);
    }
    return this;
  }

  // Remove an interactable object
  removeInteractable(object) {
    if (this.raycaster) {
      this.raycaster.removeInteractable(object);
    }
    return this;
  }

  // Get the controls instance
  getControls() {
    return this.controls;
  }

  // Get the raycaster instance
  getRaycaster() {
    return this.raycaster;
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      // Fade out animation
      loading.style.transition = 'opacity 0.5s ease-out';
      loading.style.opacity = '0';
      
      setTimeout(() => {
        loading.classList.add('hidden');
      }, 500);
    }
  }

  showError(message) {
    // Hide loading screen if it exists
    if (this.loadingScreen) {
      this.loadingScreen.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'error-screen';
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <div style="color: #ff4444; text-align: center; max-width: 400px; padding: 2rem;">
        <h2 style="margin: 0 0 1rem; font-size: 1.5rem;">Failed to load CV Experience</h2>
        <p style="font-size: 0.9rem; opacity: 0.7; margin: 0;">${message}</p>
        <button onclick="location.reload()" style="
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(68, 170, 255, 0.2);
          border: 1px solid rgba(68, 170, 255, 0.5);
          color: #44aaff;
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 4px;
        ">Retry</button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
  
  // Cleanup method
  dispose() {
    if (this.loadingScreen) this.loadingScreen.remove();
    if (this.hud) this.hud.dispose();
    if (this.detailPanel) this.detailPanel.dispose();
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

// Export for debugging
window.cvExplorer = explorer;
export default explorer;
