import * as THREE from 'three';
import { FloatingText } from './FloatingText.js';

/**
 * Book — a floating 3D book representing one CV chapter.
 *
 * Behaviour:
 *  - Floats above a stone plinth, gently bobbing + rotating toward the player.
 *  - Cover shows chapter title + icon.
 *  - When the player enters `proximityRadius`, the cover opens (y-rotation)
 *    and a soft point-light brightens; pages become visible.
 *  - When the player leaves, it closes.
 *  - `userData.onClick` opens the BookReader UI (wired by main.js).
 *
 * The book is built from primitive geometries only (no external assets) so it
 * loads instantly and stays under the bundle budget.
 */
export class Book extends THREE.Group {
  constructor(options = {}) {
    super();

    // --- Chapter data -----------------------------------------------------
    this.chapter = options.chapter || { title: 'Untitled', icon: '📖', color: 0x4488ff };
    this.title = this.chapter.title;
    this.icon = this.chapter.icon || '📖';
    this.color = new THREE.Color(options.color ?? this.chapter.color ?? 0x4488ff);

    // --- Geometry params --------------------------------------------------
    this.width = options.width ?? 1.6;       // book width (cover x)
    this.height = options.height ?? 2.1;    // book height (cover y)
    this.thickness = options.thickness ?? 0.28; // closed book thickness (z)
    this.floatHeight = options.floatHeight ?? 2.4; // height above plinth

    // --- Interaction params ----------------------------------------------
    this.proximityRadius = options.proximityRadius ?? 5.5;
    this.isOpen = false;
    this.openAmount = 0;          // 0..1 lerped each frame
    this.targetOpen = 0;
    this.isHovered = false;

    // --- Animation state -------------------------------------------------
    this.bobPhase = Math.random() * Math.PI * 2;
    this.spinPhase = Math.random() * Math.PI * 2;

    // --- Shared text renderer (optional) --------------------------------
    this.textRenderer = options.textRenderer || null;

    // Build the meshes
    this.build();
    this.setupInteraction();
  }

  build() {
    // ===== Cover (the front face that opens like a door) =====
    // Pivot at the left edge (spine). We use a Group so rotation pivots there.
    this.coverPivot = new THREE.Group();
    this.coverPivot.position.set(-this.width / 2, 0, 0); // spine on left
    this.add(this.coverPivot);

    const coverGeom = new THREE.BoxGeometry(this.width, this.height, 0.04);
    const coverMat = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: 0.3,
      roughness: 0.45,
      emissive: this.color,
      emissiveIntensity: 0.15
    });
    this.cover = new THREE.Mesh(coverGeom, coverMat);
    // Offset so the cover's left edge is at the pivot (spine)
    this.cover.position.set(this.width / 2, 0, this.thickness / 2);
    this.cover.castShadow = true;
    this.cover.receiveShadow = true;
    this.coverPivot.add(this.cover);

    // Cover emblem (raised sphere with icon glyph drawn on a canvas texture)
    this.emblem = this.createEmblem();
    this.emblem.position.set(this.width / 2, this.height * 0.18, this.thickness / 2 + 0.03);
    this.coverPivot.add(this.emblem);

    // ===== Back cover (static) =====
    const backCoverMat = new THREE.MeshStandardMaterial({
      color: this.color.clone().multiplyScalar(0.6),
      metalness: 0.3,
      roughness: 0.5,
      emissive: this.color,
      emissiveIntensity: 0.05
    });
    this.backCover = new THREE.Mesh(coverGeom.clone(), backCoverMat);
    this.backCover.position.set(0, 0, -this.thickness / 2);
    this.backCover.castShadow = true;
    this.add(this.backCover);

    // ===== Spine (left edge) =====
    const spineGeom = new THREE.BoxGeometry(0.06, this.height, this.thickness);
    const spineMat = new THREE.MeshStandardMaterial({
      color: this.color.clone().multiplyScalar(0.7),
      metalness: 0.4,
      roughness: 0.4,
      emissive: this.color,
      emissiveIntensity: 0.1
    });
    this.spine = new THREE.Mesh(spineGeom, spineMat);
    this.spine.position.set(-this.width / 2 + 0.03, 0, 0);
    this.spine.castShadow = true;
    this.add(this.spine);

    // ===== Pages (visible when open) =====
    // A thin block representing the stacked pages, sitting between the covers.
    const pagesGeom = new THREE.BoxGeometry(this.width * 0.96, this.height * 0.95, this.thickness * 0.85);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e0,
      roughness: 0.85,
      metalness: 0.0,
      emissive: 0xfff8e0,
      emissiveIntensity: 0.0
    });
    this.pages = new THREE.Mesh(pagesGeom, pagesMat);
    this.pages.position.set(0, 0, 0);
    this.pages.castShadow = true;
    this.add(this.pages);

    // ===== Floating title text (billboard above the book) =====
    if (this.textRenderer) {
      this.titleLabel = new FloatingText(this.title, {
        style: 'label',
        textRenderer: this.textRenderer,
        glowColor: this.color,
        glowIntensity: 0.4,
        animate: true,
        billboard: true,
        fontSize: 16
      });
      this.titleLabel.position.set(0, this.height / 2 + 0.6, 0);
      this.add(this.titleLabel);
    }

    // ===== Glow point light (intensifies when open/hovered) =====
    this.glowLight = new THREE.PointLight(this.color, 0.6, 8, 1.5);
    this.glowLight.position.set(0, 0, this.thickness);
    this.add(this.glowLight);

    // ===== Plinth (stone pedestal the book floats above) =====
    const plinthGeom = new THREE.CylinderGeometry(0.9, 1.1, 0.5, 16);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a35,
      metalness: 0.2,
      roughness: 0.8,
      emissive: this.color,
      emissiveIntensity: 0.04
    });
    this.plinth = new THREE.Mesh(plinthGeom, plinthMat);
    this.plinth.position.y = -this.floatHeight - 0.25;
    this.plinth.castShadow = true;
    this.plinth.receiveShadow = true;
    this.add(this.plinth);

    // Glowing ring on the plinth top
    const ringGeom = new THREE.TorusGeometry(0.95, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.7
    });
    this.plinthRing = new THREE.Mesh(ringGeom, ringMat);
    this.plinthRing.rotation.x = -Math.PI / 2;
    this.plinthRing.position.y = -this.floatHeight;
    this.add(this.plinthRing);

    // Lift the book group to float height
    this.position.y += this.floatHeight;
  }

  /**
   * Create a small emblem on the cover: a glowing disc with the chapter icon.
   * Uses a CanvasTexture so we can draw an emoji glyph cheaply.
   */
  createEmblem() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Radial gradient disc
    const grad = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2 - 10);
    grad.addColorStop(0, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Draw the emoji icon centred
    ctx.font = `${Math.floor(size * 0.5)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1a1a2e';
    ctx.fillText(this.icon, size / 2, size / 2 + size * 0.04);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 4;

    const geom = new THREE.CircleGeometry(0.32, 32);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.userData.canvasTexture = texture; // keep ref for disposal
    return mesh;
  }

  setupInteraction() {
    this.userData.interactive = true;
    this.userData.type = 'book';
    this.userData.title = this.title;
    this.userData.chapter = this.chapter;
    this.userData.onClick = () => this.openReader();
    this.userData.onHover = (hovering) => this.setHovered(hovering);
  }

  /**
   * Toggle whether the book reports "in range" for the reader.
   * Called by the WorldBuilder proximity check each frame.
   */
  setPlayerNear(near) {
    this.targetOpen = near ? 1 : 0;
  }

  setHovered(hovered) {
    this.isHovered = hovered;
  }

  /**
   * Dispatch an event the main app listens for to open the BookReader UI.
   */
  openReader() {
    this.dispatchEvent({ type: 'openReader', book: this, chapter: this.chapter });
    // Also bubble via the canvas so main.js can catch it
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.dispatchEvent(new CustomEvent('openBookReader', {
        detail: { chapter: this.chapter, book: this }
      }));
    }
  }

  update(deltaTime, camera) {
    // ---- Bob + slow spin when closed ----
    this.bobPhase += deltaTime * 1.2;
    const bob = Math.sin(this.bobPhase) * 0.12;
    this.position.y = this.floatHeight + bob;

    // Subtle yaw drift so the book slowly turns, inviting the player
    this.spinPhase += deltaTime * 0.25;
    const baseYaw = Math.sin(this.spinPhase) * 0.15;

    // ---- Billboard-ish: face the player a little when open ----
    let targetYaw = baseYaw;
    if (this.openAmount > 0.01 && camera) {
      const dx = camera.position.x - this.position.x;
      const dz = camera.position.z - this.position.z;
      targetYaw = Math.atan2(dx, dz) - Math.PI / 2;
      // Smoothly blend from base yaw to player-facing yaw
      targetYaw = THREE.MathUtils.lerp(baseYaw, targetYaw, this.openAmount);
    }
    this.rotation.y = targetYaw;

    // ---- Lerp open amount toward target ----
    const speed = 6; // open/close speed
    this.openAmount = THREE.MathUtils.lerp(
      this.openAmount,
      this.targetOpen,
      1 - Math.exp(-speed * deltaTime)
    );

    // Cover rotation: 0 = closed, -Math.PI * 0.82 = wide open
    this.coverPivot.rotation.y = -this.openAmount * Math.PI * 0.82;

    // Page emissive ramps up when open (glowing pages)
    this.pages.material.emissiveIntensity = this.openAmount * 0.35;

    // Glow light intensifies when open or hovered
    const glowTarget = 0.4 + this.openAmount * 1.6 + (this.isHovered ? 0.8 : 0);
    this.glowLight.intensity = THREE.MathUtils.lerp(
      this.glowLight.intensity,
      glowTarget,
      1 - Math.exp(-8 * deltaTime)
    );

    // Plinth ring pulses
    const pulse = 0.6 + Math.sin(this.bobPhase * 1.5) * 0.2 + this.openAmount * 0.2;
    this.plinthRing.material.opacity = pulse;

    // Update floating title text
    if (this.titleLabel && this.titleLabel.update) {
      this.titleLabel.update(deltaTime, camera);
    }
  }

  dispose() {
    this.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
      if (child.userData?.canvasTexture) {
        child.userData.canvasTexture.dispose();
      }
    });
    this.clear();
  }
}

export default Book;
